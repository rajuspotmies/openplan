import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { BY_ID, CAMERA_KEYS, shareOf, smooth, type AssemblyId } from "./data";
import { fbm, hash2, noise2, sandNormal, trackTexture } from "./materials";
import { GROUND_SIZE, ROCKS, groundAt, heightAt } from "./terrain";
import { DIM } from "./data";
import type { Live } from "./Rover";
import { LOOKS, type LightMode } from "./looks";

function Terrain() {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE, 240, 240);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const base = new THREE.Color("#b4623a");
    const dark = new THREE.Color("#7c3b22");
    const light = new THREE.Color("#d39466");
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, heightAt(x, z));
      const n = fbm(x * 0.25 + 3, z * 0.25, 3);
      c.copy(base).lerp(dark, smooth((n - 0.42) * 3)).lerp(light, smooth((0.5 - n) * 2.5) * 0.6);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0, normalMap: sandNormal(), normalScale: new THREE.Vector2(0.22, 0.22) }), []);
  return <mesh geometry={geometry} material={material} receiveShadow />;
}

function Rocks() {
  const mesh = useMemo(() => {
    const geometry = new THREE.DodecahedronGeometry(1, 1);
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i);
      const k = 0.75 + noise2(v.x * 2.3 + 5, v.y * 2.3 + v.z * 1.7) * 0.45;
      v.multiplyScalar(k);
      v.y *= 0.62;
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.9, flatShading: true });
    const m = new THREE.InstancedMesh(geometry, material, ROCKS.length);
    const dummy = new THREE.Object3D();
    const tones = ["#5d4134", "#4a3229", "#6e4a38", "#3a2a24"].map((t) => new THREE.Color(t));
    ROCKS.forEach((rock, i) => {
      dummy.position.set(rock.x, rock.y, rock.z);
      dummy.rotation.set(...rock.rot);
      dummy.scale.set(rock.sx, rock.s, rock.sz);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      m.setColorAt(i, tones[rock.tone]);
    });
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }, []);
  return <primitive object={mesh} />;
}

function Dust({ color }: { color: string }) {
  const points = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const count = 700;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) arr.set([(hash2(i, 1) - 0.5) * 16, hash2(i, 2) * 3.2, (hash2(i, 3) - 0.5) * 16], i * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);
  useFrame((_, delta) => {
    if (points.current) {
      points.current.rotation.y += delta * 0.012;
      points.current.position.x = (points.current.position.x + delta * 0.05) % 2;
    }
  });
  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial color={color} size={0.012} sizeAttenuation transparent opacity={0.55} depthWrite={false} />
    </points>
  );
}

function SkyDome({ horizon, zenith }: { horizon: string; zenith: string }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { uHorizon: { value: new THREE.Color() }, uZenith: { value: new THREE.Color() } },
        vertexShader: "varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader: `
uniform vec3 uHorizon;
uniform vec3 uZenith;
varying vec3 vDir;
void main() {
  float h = clamp(vDir.y, 0.0, 1.0);
  gl_FragColor = vec4(mix(uHorizon, uZenith, pow(h, 0.55)), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,
      }),
    [],
  );
  useEffect(() => {
    material.uniforms.uHorizon.value.set(horizon);
    material.uniforms.uZenith.value.set(zenith);
  }, [material, horizon, zenith]);
  return (
    <mesh material={material} scale={60} renderOrder={-1}>
      <sphereGeometry args={[1, 32, 16]} />
    </mesh>
  );
}

export function Lighting({ mode, live }: { mode: LightMode; live: React.MutableRefObject<Live> }) {
  const look = LOOKS[mode];
  const sun = useRef<THREE.DirectionalLight>(null);
  const { gl, scene } = useThree();
  useEffect(() => {
    gl.toneMappingExposure = look.exposure;
    scene.fog = mode === "studio" ? new THREE.Fog(look.horizon, 9, 26) : new THREE.Fog(look.fog, 14, 46);
    scene.background = new THREE.Color(look.horizon);
  }, [gl, scene, look, mode]);
  useEffect(() => {
    const light = sun.current;
    if (!light) return;
    scene.add(light.target);
    return () => {
      scene.remove(light.target);
    };
  }, [scene]);
  // the sun and its shadow box travel with the rover, so it keeps its shadow wherever it drives
  useFrame(() => {
    const light = sun.current;
    if (!light) return;
    const d = live.current.drive;
    const x = d ? d.x : 0;
    const z = d ? d.z : 0;
    const y = d ? d.y : 0;
    light.position.set(look.sun.position[0] + x, look.sun.position[1] + y, look.sun.position[2] + z);
    light.target.position.set(x, 0.5 + y, z);
  });
  return (
    <>
      <hemisphereLight args={[look.hemi.sky, look.hemi.ground, look.hemi.intensity]} />
      <directionalLight
        ref={sun}
        position={look.sun.position}
        color={look.sun.color}
        intensity={look.sun.intensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-3.4}
        shadow-camera-right={3.4}
        shadow-camera-top={3.4}
        shadow-camera-bottom={-3.4}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
      />
      {mode === "studio" && <directionalLight position={[-5, 3, -6]} color="#7fa2ff" intensity={1.6} />}
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} color={look.env[0]} position={[look.sun.position[0], Math.max(2, look.sun.position[1]), look.sun.position[2]]} scale={[6, 4, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.9} color={look.env[1]} position={[-6, 3, -4]} scale={[10, 4, 1]} target={[0, 0, 0]} />
        {/* the sky: a broad soft panel all round the horizon, so foil and aluminium have something to reflect */}
        <Lightformer form="ring" intensity={0.55} color={look.horizon} position={[0, 2.5, 0]} rotation-x={Math.PI / 2} scale={[14, 14, 1]} />
        <Lightformer form="rect" intensity={0.7} color={look.zenith} position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[14, 14, 1]} />
        {/* the ground bounce: dim and the colour of the floor, so metal undersides read dark, not white */}
        <Lightformer form="rect" intensity={0.12} color={look.env[2]} position={[0, -4, 0]} rotation-x={-Math.PI / 2} scale={[12, 12, 1]} />
      </Environment>
      {mode === "studio" ? (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[40, 96]} />
            <meshStandardMaterial color="#11151d" roughness={0.85} metalness={0.1} />
          </mesh>
          <ContactShadows position={[0, 0.002, 0]} scale={8} blur={2.4} opacity={0.65} far={2.5} resolution={512} />
          <Dust color="#8fa8d8" />
        </>
      ) : (
        <>
          <SkyDome horizon={look.horizon} zenith={look.zenith} />
          <Terrain />
          <Rocks />
          <Dust color={mode === "day" ? "#f3c9a2" : "#b9c4e8"} />
          <DustTrail live={live} color={mode === "day" ? "#c98a5e" : "#7d6a78"} />
          <WheelTracks live={live} color={mode === "day" ? "#3e170a" : "#1a0d0b"} />
        </>
      )}
    </>
  );
}

const DEG = Math.PI / 180;

// Camera: follows the scroll keys, plus the reader's own drag (yaw, pitch) and the focus on a picked assembly.
export function CameraRig({ live, orbit }: { live: React.MutableRefObject<Live>; orbit: React.MutableRefObject<{ yaw: number; pitch: number; zoom: number }> }) {
  const { camera, size } = useThree();
  const target = useRef(new THREE.Vector3(0, 0.7, 0));
  const pos = useRef(new THREE.Vector3(3, 1.5, 3));
  const first = useRef(true);
  const want = useMemo(() => ({ target: new THREE.Vector3(), pos: new THREE.Vector3() }), []);
  useFrame((state, delta) => {
    const { p, selected, calm, drive } = live.current;
    const lens = camera as THREE.PerspectiveCamera;
    if (drive) {
      // chase camera: behind and above, looking ahead; wider as it speeds up, a knock on impact
      const h = drive.heading - orbit.current.yaw;
      const fx = Math.cos(h);
      const fz = -Math.sin(h);
      const fast = Math.min(1, Math.abs(drive.speed) / 3.4);
      const dist = (4.4 + fast * 1.2) * orbit.current.zoom;
      want.target.set(drive.x + fx * 1.4, drive.y + 0.75, drive.z + fz * 1.4);
      want.pos.set(drive.x - fx * dist, drive.y + 1.65 + orbit.current.pitch * 2, drive.z - fz * dist);
      const k = calm ? 1 : 1 - Math.exp(-delta / 0.16);
      target.current.lerp(want.target, k);
      pos.current.lerp(want.pos, k);
      camera.position.copy(pos.current);
      if (drive.impact < 0.35 && !calm) {
        const shake = (0.35 - drive.impact) * 0.12;
        camera.position.x += Math.sin(state.clock.elapsedTime * 90) * shake;
        camera.position.y += Math.cos(state.clock.elapsedTime * 77) * shake;
      }
      camera.lookAt(target.current);
      const fov = 34 + fast * 16 + (live.current.boosting ? 4 : 0);
      if (Math.abs(lens.fov - fov) > 0.01) {
        lens.fov += (fov - lens.fov) * (1 - Math.exp(-delta / 0.3));
        lens.updateProjectionMatrix();
      }
      return;
    }
    if (Math.abs(lens.fov - 34) > 0.01) {
      lens.fov += (34 - lens.fov) * (calm ? 1 : 1 - Math.exp(-delta / 0.3));
      lens.updateProjectionMatrix();
    }
    let i = 0;
    while (i < CAMERA_KEYS.length - 2 && p > CAMERA_KEYS[i + 1].p) i++;
    const a = CAMERA_KEYS[i];
    const b = CAMERA_KEYS[i + 1];
    const t = smooth((p - a.p) / (b.p - a.p));
    const yaw = (a.yaw + (b.yaw - a.yaw) * t) * DEG + orbit.current.yaw;
    let pitch = (a.pitch + (b.pitch - a.pitch) * t) * DEG + orbit.current.pitch;
    let dist = a.dist + (b.dist - a.dist) * t;
    want.target.set(a.target[0] + (b.target[0] - a.target[0]) * t, a.target[1] + (b.target[1] - a.target[1]) * t, a.target[2] + (b.target[2] - a.target[2]) * t);
    if (selected) {
      const asm = BY_ID[selected as AssemblyId];
      const share = shareOf(p, asm.id);
      want.target.set(asm.anchor[0] + asm.move[0] * share, asm.anchor[1] + asm.move[1] * share, asm.anchor[2] + asm.move[2] * share);
      dist = Math.min(dist, 2.6);
    }
    // narrow screens need more distance to fit the rover's width
    const aspect = size.width / Math.max(1, size.height);
    dist *= (aspect < 1.2 ? Math.min(2.3, 1.2 / aspect) : 1) * orbit.current.zoom;
    pitch = Math.max(2 * DEG, Math.min(80 * DEG, pitch));
    want.pos.set(Math.cos(pitch) * Math.cos(yaw), Math.sin(pitch), Math.cos(pitch) * Math.sin(yaw)).multiplyScalar(dist).add(want.target);
    const k = calm || first.current ? 1 : 1 - Math.exp(-delta / 0.35);
    first.current = false;
    target.current.lerp(want.target, k);
    pos.current.lerp(want.pos, k);
    camera.position.copy(pos.current);
    camera.lookAt(target.current);
  });
  return null;
}

// Dust kicked up behind the rear wheels while driving: a small pool of soft points that rise, drift and fade.
export function DustTrail({ live, color }: { live: React.MutableRefObject<Live>; color: string }) {
  const COUNT = 260;
  const state = useMemo(() => ({ pos: new Float32Array(COUNT * 3), vel: new Float32Array(COUNT * 3), age: new Float32Array(COUNT).fill(99), next: 0, carry: 0 }), []);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(state.pos, 3));
    g.setAttribute("aLife", new THREE.BufferAttribute(new Float32Array(COUNT), 1));
    return g;
  }, [state]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uColor: { value: new THREE.Color() } },
        vertexShader: `
attribute float aLife;
varying float vLife;
void main() {
  vLife = aLife;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = (18.0 + (1.0 - aLife) * 46.0) * (1.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`,
        fragmentShader: `
uniform vec3 uColor;
varying float vLife;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * vLife * 0.42;
  if (a < 0.01) discard;
  gl_FragColor = vec4(uColor, a);
  #include <colorspace_fragment>
}`,
      }),
    [],
  );
  useEffect(() => {
    material.uniforms.uColor.value.set(color);
  }, [material, color]);
  const LIFE = 1.8;
  useFrame((_, delta) => {
    const d = live.current.drive;
    const dt = Math.min(delta, 1 / 20);
    if (d && Math.abs(d.speed) > 0.15 && !live.current.calm) {
      state.carry += dt * Math.abs(d.speed) * (live.current.boosting ? 70 : 38);
      const fx = Math.cos(d.heading);
      const fz = -Math.sin(d.heading);
      while (state.carry >= 1) {
        state.carry -= 1;
        const i = state.next;
        state.next = (state.next + 1) % COUNT;
        const side = Math.random() < 0.5 ? 1 : -1;
        const back = d.speed > 0 ? -1 : 1;
        state.pos.set([d.x + fx * back * 0.85 + Math.sin(d.heading) * side * 0.62, d.y + 0.05, d.z + fz * back * 0.85 + Math.cos(d.heading) * side * 0.62], i * 3);
        state.vel.set([fx * back * 0.3 + (Math.random() - 0.5) * 0.3, 0.25 + Math.random() * 0.35, fz * back * 0.3 + (Math.random() - 0.5) * 0.3], i * 3);
        state.age[i] = 0;
      }
    }
    const life = geometry.getAttribute("aLife") as THREE.BufferAttribute;
    for (let i = 0; i < COUNT; i++) {
      state.age[i] += dt;
      const t = state.age[i] / LIFE;
      life.setX(i, t < 1 ? 1 - t : 0);
      if (t < 1) {
        state.vel[i * 3 + 1] -= 0.18 * dt;
        state.pos[i * 3] += state.vel[i * 3] * dt;
        state.pos[i * 3 + 1] += state.vel[i * 3 + 1] * dt;
        state.pos[i * 3 + 2] += state.vel[i * 3 + 2] * dt;
      }
    }
    life.needsUpdate = true;
    (geometry.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
  });
  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

// Wheel trails: a ribbon per side pressed into the sand behind the wheels, chevron prints and all.
// Points are added every few centimetres of travel; the oldest fade out and drop off the end.
const TRACK_POINTS = 900;
const TRACK_STEP = 0.06; // m between points
const TRACK_HALF = DIM.wheelW / 2;
const TRACK_TILE = 0.17; // m of trail per texture tile: one grouser pitch per chevron

interface Track {
  count: number;
  cx: Float32Array;
  cz: Float32Array;
  cy: Float32Array;
  dist: Float32Array;
  lift: Uint8Array; // 1 where the wheel was up on a rock: no print there
  geometry: THREE.BufferGeometry;
}

function makeTrack(): Track {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(TRACK_POINTS * 2 * 3), 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(TRACK_POINTS * 2 * 2), 2));
  geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(TRACK_POINTS * 2 * 4), 4));
  // the trail lies on the ground, so its normals point up
  const normals = new Float32Array(TRACK_POINTS * 2 * 3);
  for (let i = 0; i < TRACK_POINTS * 2; i++) normals[i * 3 + 1] = 1;
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  // wound counter-clockwise seen from above, so the faces point up
  const index: number[] = [];
  for (let i = 0; i < TRACK_POINTS - 1; i++) {
    const a = i * 2;
    index.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  geometry.setIndex(index);
  geometry.setDrawRange(0, 0);
  return { count: 0, cx: new Float32Array(TRACK_POINTS), cz: new Float32Array(TRACK_POINTS), cy: new Float32Array(TRACK_POINTS), dist: new Float32Array(TRACK_POINTS), lift: new Uint8Array(TRACK_POINTS), geometry };
}

function rebuild(t: Track) {
  const pos = t.geometry.getAttribute("position") as THREE.BufferAttribute;
  const uv = t.geometry.getAttribute("uv") as THREE.BufferAttribute;
  const col = t.geometry.getAttribute("color") as THREE.BufferAttribute;
  for (let i = 0; i < t.count; i++) {
    const a = Math.max(0, i - 1);
    const b = Math.min(t.count - 1, i + 1);
    let dx = t.cx[b] - t.cx[a];
    let dz = t.cz[b] - t.cz[a];
    const len = Math.hypot(dx, dz) || 1;
    dx /= len;
    dz /= len;
    // across the trail, in the ground plane
    const px = -dz * TRACK_HALF;
    const pz = dx * TRACK_HALF;
    pos.setXYZ(i * 2, t.cx[i] + px, t.cy[i], t.cz[i] + pz);
    pos.setXYZ(i * 2 + 1, t.cx[i] - px, t.cy[i], t.cz[i] - pz);
    const v = t.dist[i] / TRACK_TILE;
    uv.setXY(i * 2, 0, v);
    uv.setXY(i * 2 + 1, 1, v);
    // fresh prints are crisp; the oldest third fades away; none on rocks
    const age = i / Math.max(1, TRACK_POINTS - 1);
    const fade = (t.lift[i] ? 0 : 1) * Math.min(1, age * 3 + (TRACK_POINTS - t.count) / TRACK_POINTS);
    col.setXYZW(i * 2, 1, 1, 1, fade);
    col.setXYZW(i * 2 + 1, 1, 1, 1, fade);
  }
  pos.needsUpdate = true;
  uv.needsUpdate = true;
  col.needsUpdate = true;
  t.geometry.setDrawRange(0, Math.max(0, t.count - 1) * 6);
  t.geometry.computeBoundingSphere();
}

export function WheelTracks({ live, color }: { live: React.MutableRefObject<Live>; color: string }) {
  const tracks = useMemo(() => [makeTrack(), makeTrack()], []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: trackTexture(),
        color: new THREE.Color(),
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        roughness: 1,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      }),
    [],
  );
  useEffect(() => {
    material.color.set(color);
  }, [material, color]);
  useFrame(() => {
    const d = live.current.drive;
    if (!d) {
      // back on the tour: the slate is wiped
      for (const t of tracks)
        if (t.count) {
          t.count = 0;
          t.geometry.setDrawRange(0, 0);
        }
      return;
    }
    const rx = Math.sin(d.heading);
    const rz = Math.cos(d.heading);
    // the middle wheel of each side: right (+z), then left
    [1, -1].forEach((sgn, side) => {
      const t = tracks[side];
      const x = d.x + rx * sgn * DIM.wheelZ;
      const z = d.z + rz * sgn * DIM.wheelZ;
      const last = t.count - 1;
      const moved = t.count ? Math.hypot(x - t.cx[last], z - t.cz[last]) : Infinity;
      if (moved < TRACK_STEP) return;
      if (t.count === TRACK_POINTS) {
        // drop the oldest tenth in one go
        const drop = TRACK_POINTS / 10;
        for (const arr of [t.cx, t.cz, t.cy, t.dist, t.lift]) arr.copyWithin(0, drop);
        t.count -= drop;
      }
      const sand = heightAt(x, z);
      const i = t.count++;
      t.cx[i] = x;
      t.cz[i] = z;
      t.cy[i] = sand + 0.012;
      t.dist[i] = i ? t.dist[i - 1] + Math.min(moved, 1) : 0;
      t.lift[i] = groundAt(x, z) > sand + 0.03 || d.lift[side * 3 + 1] > 0.05 ? 1 : 0;
      rebuild(t);
    });
  });
  return (
    <>
      {tracks.map((t, i) => (
        <mesh key={i} geometry={t.geometry} material={material} receiveShadow frustumCulled={false} renderOrder={1} />
      ))}
    </>
  );
}
