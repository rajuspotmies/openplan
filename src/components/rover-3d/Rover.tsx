import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { ASSEMBLIES, DIM, shareOf, type AssemblyId } from "./data";
import { makeMaterials, rememberBase, type MaterialSet } from "./materials";
import { Beam, Box, Cable, Cyl, Instances } from "./parts";
import { BOGIE_X, PIVOT_X, type DriveState } from "./drive";
import { compose } from "./matrix";

type V3 = [number, number, number];

export interface Live {
  p: number;
  hovered: AssemblyId | null;
  selected: AssemblyId | null;
  animate: boolean;
  calm: boolean;
  // drive mode: the rover's pose and motion, or null while touring
  drive: DriveState | null;
  boosting: boolean;
  // the studio floor is flat and bare: no dunes, no rocks
  flat: boolean;
}

interface RoverProps {
  live: React.MutableRefObject<Live>;
  xray: boolean;
  onHover: (id: AssemblyId | null) => void;
  onSelect: (id: AssemblyId) => void;
}

const HIGHLIGHT = new THREE.Color("#6f9dff");
const { wheelR: R, wheelX, wheelZ, body: BODY, deck: DECK } = DIM;
const BODY_TOP = BODY.y + BODY.h / 2;
const DECK_TOP = DECK.y + DECK.t / 2;

// Rocker-bogie layout in the side plane (x, y).
const PIVOT: [number, number] = [PIVOT_X, 0.6];
const BOGIE: [number, number] = [BOGIE_X, 0.45];
const KNUCKLE: [number, number][] = [
  [wheelX[0], 0.5],
  [wheelX[1], 0.42],
  [wheelX[2], 0.48],
];
const ROCKER_Z = 0.43;
const BOGIE_Z = 0.48;
const BLOCK_Y = R + 0.095;

// Arm: stowed across the front, deployed reaching down in front of the rover.
const ARM = { shoulder: [0.7, 0.62, 0.3] as V3, upper: 0.5, fore: 0.32 };
const STOWED = [Math.PI / 2, 0.1, Math.PI + 0.2, 0.2];
const DEPLOYED = [0, -0.35, -0.5, -0.7];

// RTG: tilted 30° back and up off the rear.
const RTG_C: V3 = [-0.86, 0.76, 0];
const RTG_TILT = Math.PI / 3;

function Wheel({ x, side, m, spin, steer }: { x: number; side: 1 | -1; m: MaterialSet; spin: (el: THREE.Group | null) => void; steer: (el: THREE.Group | null) => void }) {
  const drum = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          [0.06, -0.09],
          [0.195, -0.09],
          [0.21, -0.078],
          [0.21, 0.078],
          [0.2, 0.09],
          [0.188, 0.09],
          [0.188, -0.075],
          [0.07, -0.075],
          [0.06, -0.08],
        ].map(([r, y]) => new THREE.Vector2(r, y)),
        64,
      ),
    [],
  );
  const grouser = useMemo(() => new THREE.BoxGeometry(0.014, 0.1, 0.007), []);
  const grousers = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    for (let i = 0; i < DIM.grousers; i++) {
      const t = (i / DIM.grousers) * Math.PI * 2;
      for (const half of [-1, 1]) {
        const rr = R + 0.006;
        list.push(compose([Math.cos(t) * rr, half * 0.042, Math.sin(t) * rr], [half * 0.5, -t, 0], [1, 1, 1], "YXZ"));
      }
    }
    return list;
  }, []);
  const spokes = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        const at = (r: number, da: number, y: number) => new THREE.Vector3(Math.cos(a + da) * r, y, Math.sin(a + da) * r);
        return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(at(0.055, 0, 0.07), at(0.13, 0.42, 0.075), at(0.188, 0.2, 0.072)), 14, 0.007, 6, false);
      }),
    [],
  );
  const bolt = useMemo(() => new THREE.CylinderGeometry(0.006, 0.006, 0.012, 8), []);
  const bolts = useMemo(() => Array.from({ length: 6 }, (_, i) => compose([Math.cos((i / 6) * Math.PI * 2) * 0.042, 0.092, Math.sin((i / 6) * Math.PI * 2) * 0.042])), []);
  return (
    <group ref={steer} position={[x, R, side * wheelZ]}>
      <group rotation={[side * (Math.PI / 2), 0, 0]}>
        {/* motor in the hub, on the inner side */}
        <Cyl at={[0, -0.125, 0]} r={0.075} h={0.07} material={m.anodized} />
        <Cyl at={[0, -0.125, 0]} r={0.077} h={0.012} material={m.gold} />
        <group ref={spin}>
          <mesh geometry={drum} material={m.alu} />
          <Instances geometry={grouser} material={m.alu} matrices={grousers} />
          {spokes.map((g, i) => (
            <mesh key={i} geometry={g} material={m.titanium} />
          ))}
          <Cyl at={[0, 0.06, 0]} r={0.056} h={0.05} material={m.alu} />
          <Cyl at={[0, 0.088, 0]} r={0.036} h={0.012} material={m.anodized} />
          <Instances geometry={bolt} material={m.titanium} matrices={bolts} />
        </group>
      </group>
    </group>
  );
}

// A group that turns about a point in the side plane (for the rocker and the bogie).
function Pivot({ at, turn, children }: { at: [number, number]; turn: (el: THREE.Group | null) => void; children: ReactNode }) {
  return (
    <group position={[at[0], at[1], 0]}>
      <group ref={turn}>
        <group position={[-at[0], -at[1], 0]}>{children}</group>
      </group>
    </group>
  );
}

function Knuckle({ i, side, m }: { i: number; side: 1 | -1; m: MaterialSet }) {
  const [x, y] = KNUCKLE[i];
  const z = side * (i === 0 ? ROCKER_Z : BOGIE_Z);
  const corner = i !== 1;
  return (
    <group>
      <Cyl at={[x, y, z]} r={0.038} h={0.07} axis="z" material={m.anodized} />
      <Beam a={[x, y, z]} b={[x, BLOCK_Y + 0.02, z]} r={0.024} material={m.titanium} />
      {corner && <Cyl at={[x, y - 0.075, z]} r={0.036} h={0.07} material={m.anodized} />}
      {corner && <Cyl at={[x, y - 0.075, z]} r={0.038} h={0.01} material={m.gold} />}
      <Box at={[x, BLOCK_Y, side * 0.485]} size={[0.09, 0.05, 0.12]} radius={0.01} material={m.anodized} />
      <Cable
        points={[
          [x + 0.03, y - 0.02, z + side * 0.03],
          [x + 0.035, (y + BLOCK_Y) / 2, z + side * 0.035],
          [x + 0.03, BLOCK_Y + 0.02, side * 0.5],
        ]}
        r={0.006}
        material={m.kapton}
      />
    </group>
  );
}

// The rocker turns about its pivot on the body; the bogie turns about its pivot on the rocker.
function Suspension({ side, m, rocker, bogie }: { side: 1 | -1; m: MaterialSet; rocker: (el: THREE.Group | null) => void; bogie: (el: THREE.Group | null) => void }) {
  const zr = side * ROCKER_Z;
  const zb = side * BOGIE_Z;
  const diffX = -0.1;
  const diffY = PIVOT[1] + ((BOGIE[1] - PIVOT[1]) * (PIVOT[0] - diffX)) / (PIVOT[0] - BOGIE[0]);
  return (
    <Pivot at={PIVOT} turn={rocker}>
      {/* rocker */}
      <Beam a={[PIVOT[0], PIVOT[1], zr]} b={[KNUCKLE[0][0], KNUCKLE[0][1], zr]} r={0.028} material={m.titanium} />
      <Beam a={[PIVOT[0], PIVOT[1], zr]} b={[BOGIE[0], BOGIE[1], zr]} r={0.028} material={m.titanium} />
      <Cyl at={[PIVOT[0], PIVOT[1], side * 0.41]} r={0.058} h={0.07} axis="z" material={m.anodized} />
      <Cyl at={[PIVOT[0], PIVOT[1], side * 0.452]} r={0.03} h={0.018} axis="z" material={m.alu} />
      <Knuckle i={0} side={side} m={m} />
      {/* differential link up to the bar on the body */}
      <Beam a={[diffX, diffY, zr]} b={[diffX, BODY_TOP + 0.04, zr]} r={0.012} material={m.titanium} />
      <mesh position={[diffX, diffY, zr]} material={m.alu}>
        <sphereGeometry args={[0.022, 16, 12]} />
      </mesh>
      {/* harness along the rocker */}
      <Cable
        points={[
          [PIVOT[0] - 0.02, PIVOT[1] + 0.04, zr + side * 0.03],
          [0.4, 0.57, zr + side * 0.032],
          [KNUCKLE[0][0] - 0.04, KNUCKLE[0][1] + 0.035, zr + side * 0.03],
        ]}
        r={0.007}
        material={m.kapton}
      />
      <Pivot at={BOGIE} turn={bogie}>
        {/* bogie, hung across both planes */}
        <Beam a={[BOGIE[0], BOGIE[1], zb]} b={[KNUCKLE[1][0], KNUCKLE[1][1], zb]} r={0.026} material={m.titanium} />
        <Beam a={[BOGIE[0], BOGIE[1], zb]} b={[KNUCKLE[2][0], KNUCKLE[2][1], zb]} r={0.026} material={m.titanium} />
        <Cyl at={[BOGIE[0], BOGIE[1], side * 0.455]} r={0.048} h={0.1} axis="z" material={m.anodized} />
        <Cyl at={[BOGIE[0], BOGIE[1], side * 0.51]} r={0.026} h={0.016} axis="z" material={m.alu} />
        <Knuckle i={1} side={side} m={m} />
        <Knuckle i={2} side={side} m={m} />
      </Pivot>
    </Pivot>
  );
}

function Body({ m }: { m: MaterialSet }) {
  const fin = useMemo(() => new THREE.BoxGeometry(0.004, 0.2, 0.05), []);
  const fins = useMemo(() => Array.from({ length: 9 }, (_, i) => compose([-BODY.l / 2 - 0.022, BODY.y, -0.24 + i * 0.06])), []);
  return (
    <group>
      <Box at={[0, BODY.y, 0]} size={[BODY.l, BODY.h, BODY.w]} radius={0.025} material={m.paint} />
      {/* gold blankets on both sides and the rear */}
      {[1, -1].map((s) => (
        <Box key={s} at={[-0.03, BODY.y - 0.01, s * (BODY.w / 2 + 0.003)]} size={[0.96, 0.24, 0.006]} radius={0.002} material={m.gold} />
      ))}
      <Box at={[-BODY.l / 2 - 0.003, BODY.y, 0]} size={[0.006, 0.24, 0.6]} material={m.gold} />
      {/* rear radiator fins on a base plate */}
      <Box at={[-BODY.l / 2 - 0.009, BODY.y, 0]} size={[0.006, 0.22, 0.54]} material={m.panel} />
      <Instances geometry={fin} material={m.alu} matrices={fins} />
      {/* hazard cameras, front and rear */}
      {[1, -1].map((f) =>
        [-0.12, 0.12].map((z) => (
          <group key={`${f}${z}`}>
            <Box at={[f * (BODY.l / 2 + 0.02), BODY.y - 0.1, z]} size={[0.04, 0.05, 0.07]} radius={0.006} material={m.black} />
            <Cyl at={[f * (BODY.l / 2 + 0.042), BODY.y - 0.1, z]} r={0.014} h={0.008} axis="x" material={m.glass} />
          </group>
        )),
      )}
      {/* pivot bosses for the rockers */}
      {[1, -1].map((s) => (
        <Cyl key={s} at={[PIVOT[0], PIVOT[1], s * 0.37]} r={0.05} h={0.02} axis="z" material={m.alu} />
      ))}
      {/* deck standoffs */}
      {[
        [0.45, 0.28],
        [0.45, -0.28],
        [-0.45, 0.28],
        [-0.45, -0.28],
      ].map(([x, z]) => (
        <Cyl key={`${x}${z}`} at={[x, (BODY_TOP + DECK.y - DECK.t / 2) / 2, z]} r={0.018} h={DECK.y - DECK.t / 2 - BODY_TOP} material={m.alu} segments={12} />
      ))}
      {/* differential bar across the top */}
      <Beam a={[-0.1, BODY_TOP + 0.04, -ROCKER_Z]} b={[-0.1, BODY_TOP + 0.04, ROCKER_Z]} r={0.018} material={m.titanium} />
      <Box at={[-0.1, BODY_TOP + 0.02, 0]} size={[0.09, 0.04, 0.09]} radius={0.008} material={m.anodized} />
      <Cyl at={[-0.1, BODY_TOP + 0.04, 0]} r={0.03} h={0.1} axis="x" material={m.alu} />
      {/* arm shoulder mount on the front face */}
      <Box at={[BODY.l / 2 + 0.06, ARM.shoulder[1] - 0.06, ARM.shoulder[2]]} size={[0.12, 0.08, 0.12]} radius={0.01} material={m.anodized} />
      {/* name plate */}
      <Box at={[0.28, BODY.y + 0.09, BODY.w / 2 + 0.007]} size={[0.2, 0.05, 0.004]} radius={0.002} material={m.anodized} />
    </group>
  );
}

function Deck({ m }: { m: MaterialSet }) {
  const solarL = 0.98;
  const solarX = -DECK.l / 2 + 0.03 + solarL / 2;
  return (
    <group>
      <Box at={[0, DECK.y, 0]} size={[DECK.l, DECK.t, DECK.w]} radius={0.008} material={m.paint} />
      <mesh position={[solarX, DECK_TOP + 0.0015, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.solar}>
        <planeGeometry args={[solarL, DECK.w - 0.06]} />
      </mesh>
      {/* edge trim */}
      {[1, -1].map((s) => (
        <Box key={`z${s}`} at={[0, DECK_TOP + 0.004, s * (DECK.w / 2 - 0.006)]} size={[DECK.l - 0.02, 0.008, 0.012]} material={m.alu} />
      ))}
      {[1, -1].map((s) => (
        <Box key={`x${s}`} at={[s * (DECK.l / 2 - 0.006), DECK_TOP + 0.004, 0]} size={[0.012, 0.008, DECK.w - 0.02]} material={m.alu} />
      ))}
      {/* colour calibration target with a gnomon */}
      <group position={[0.53, DECK_TOP, -0.3]}>
        <Box at={[0, 0.012, 0]} size={[0.13, 0.024, 0.13]} radius={0.004} material={m.anodized} />
        {(["red", "green", "blue", "yellow", "chipWhite", "chipBlack"] as const).map((key, i) => (
          <Box key={key} at={[-0.035 + (i % 3) * 0.035, 0.026, -0.022 + Math.floor(i / 3) * 0.044]} size={[0.03, 0.004, 0.038]} material={m[key]} />
        ))}
        <Cyl at={[0.045, 0.06, 0.045]} r={0.004} h={0.07} material={m.black} segments={8} />
      </group>
      {/* mast hinge and antenna pads */}
      <Box at={[DIM.mast.x, DECK_TOP + 0.02, DIM.mast.z]} size={[0.12, 0.04, 0.12]} radius={0.008} material={m.anodized} />
      <Cyl at={[-0.4, DECK_TOP + 0.005, -0.28]} r={0.07} h={0.01} material={m.alu} />
      <Cyl at={[-0.5, DECK_TOP + 0.005, 0.35]} r={0.05} h={0.01} material={m.alu} />
    </group>
  );
}

function Mast({ m, head }: { m: MaterialSet; head: (el: THREE.Group | null) => void }) {
  const base = DECK_TOP + 0.04;
  const panTop = DIM.mast.top - 0.06;
  return (
    <group position={[DIM.mast.x, 0, DIM.mast.z]}>
      <Cyl at={[0, base + 0.02, 0]} r={0.06} h={0.04} material={m.alu} />
      <Cyl at={[0, (base + panTop - 0.06) / 2 + 0.02, 0]} r={0.045} h={panTop - 0.06 - base} material={m.paint} />
      {[1.2, 1.5].map((y) => (
        <Cyl key={y} at={[0, y, 0]} r={0.048} h={0.025} material={m.gold} />
      ))}
      <Cable
        points={[
          [-0.05, base + 0.02, 0],
          [-0.052, 1.3, 0.01],
          [-0.05, panTop - 0.08, 0],
        ]}
        r={0.007}
        material={m.black}
      />
      {/* weather booms */}
      {[1, -1].map((s) => (
        <group key={s} position={[0, 1.36, 0]} rotation={[0, s * 0.9 + (s > 0 ? 0 : Math.PI), 0]}>
          <Box at={[0.12, 0, 0]} size={[0.2, 0.014, 0.014]} material={m.alu} />
          <Box at={[0.23, 0, 0]} size={[0.04, 0.025, 0.025]} radius={0.004} material={m.paint} />
          <Cyl at={[0.23, 0.02, 0]} r={0.004} h={0.03} material={m.black} segments={8} />
        </group>
      ))}
      <Cyl at={[0, panTop - 0.03, 0]} r={0.06} h={0.06} material={m.anodized} />
      <group ref={head} position={[0, DIM.mast.top, 0]}>
        {/* tilt yoke */}
        {[1, -1].map((s) => (
          <Box key={s} at={[0, -0.03, s * 0.08]} size={[0.06, 0.08, 0.015]} material={m.anodized} />
        ))}
        <Box at={[0, 0.03, 0]} size={[0.14, 0.11, 0.38]} radius={0.015} material={m.paint} />
        <Box at={[0, 0.088, 0]} size={[0.12, 0.004, 0.3]} material={m.gold} />
        {[-1, 1].map((s) => (
          <group key={s}>
            <Cyl at={[0.085, 0.035, (s * DIM.camBase) / 2]} r={0.024} h={0.04} axis="x" material={m.black} />
            <Cyl at={[0.107, 0.035, (s * DIM.camBase) / 2]} r={0.017} h={0.006} axis="x" material={m.glass} />
          </group>
        ))}
        <Cyl at={[0.09, 0.03, 0]} r={0.05} h={0.06} axis="x" material={m.anodized} />
        <Cyl at={[0.122, 0.03, 0]} r={0.038} h={0.006} axis="x" material={m.glass} />
        <Box at={[-0.02, 0.1, 0.12]} size={[0.04, 0.02, 0.04]} radius={0.004} material={m.black} />
      </group>
    </group>
  );
}

function Antennas({ m, dish }: { m: MaterialSet; dish: (el: THREE.Group | null) => void }) {
  const helix = useMemo(() => {
    const turns = 7;
    const points = Array.from({ length: turns * 24 + 1 }, (_, i) => {
      const t = i / 24;
      return new THREE.Vector3(Math.cos(t * Math.PI * 2) * 0.03, 0.04 + (t / turns) * 0.26, Math.sin(t * Math.PI * 2) * 0.03);
    });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), turns * 32, 0.004, 6, false);
  }, []);
  return (
    <group>
      {/* high-gain antenna on a two-axis gimbal */}
      <group position={[-0.4, DECK_TOP + 0.01, -0.28]}>
        <Cyl at={[0, 0.07, 0]} r={0.025} h={0.14} material={m.alu} />
        <group ref={dish} position={[0, 0.16, 0]}>
          <Cyl at={[0, 0, 0]} r={0.04} h={0.05} material={m.anodized} />
          <Box at={[0, 0.05, 0]} size={[0.05, 0.06, 0.14]} radius={0.006} material={m.anodized} />
          <group position={[0, 0.1, 0]} rotation={[0, 0, -0.75]}>
            <Cyl at={[0, 0, 0]} r={0.03} h={0.16} axis="z" material={m.alu} />
            <Cyl at={[0.035, 0, 0]} r={DIM.hgaR * 0.94} h={0.012} axis="x" material={m.gold} segments={6} />
            <Cyl at={[0.05, 0, 0]} r={DIM.hgaR} h={0.02} axis="x" material={m.paint} segments={6} />
            <Cyl at={[0.08, 0, 0]} r={0.012} r2={0.026} h={0.04} axis="x" material={m.alu} segments={16} />
          </group>
        </group>
      </group>
      {/* low-gain helix */}
      <group position={[-0.5, DECK_TOP + 0.01, 0.35]}>
        <Cyl at={[0, 0.02, 0]} r={0.04} h={0.04} material={m.anodized} />
        <Cyl at={[0, 0.17, 0]} r={0.008} h={0.28} material={m.panel} segments={10} />
        <mesh geometry={helix} material={m.alu} />
        <Cyl at={[0, 0.315, 0]} r={0.02} h={0.02} material={m.paint} />
      </group>
    </group>
  );
}

function Avionics({ m }: { m: MaterialSet }) {
  const cap = useMemo(() => new THREE.CylinderGeometry(0.016, 0.016, 0.01, 14), []);
  const caps = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) list.push(compose([-0.38 + i * 0.06, BODY_TOP + 0.085, -0.165 + j * 0.066]));
    return list;
  }, []);
  const finGeometry = useMemo(() => new THREE.BoxGeometry(0.27, 0.03, 0.006), []);
  const fins = useMemo(() => Array.from({ length: 10 }, (_, i) => compose([0.13, BODY_TOP + 0.105, -0.25 + i * 0.026])), []);
  const sma = useMemo(() => new THREE.CylinderGeometry(0.008, 0.008, 0.024, 10), []);
  const smas = useMemo(() => [-0.04, 0, 0.04].map((dz) => compose([0.16, BODY_TOP + 0.072, 0.2 + dz])), []);
  return (
    <group>
      <Box at={[-0.29, BODY_TOP + 0.04, 0]} size={[0.26, 0.08, 0.42]} radius={0.01} material={m.anodized} />
      <Instances geometry={cap} material={m.copper} matrices={caps} />
      <Box at={[0.13, BODY_TOP + 0.045, -0.12]} size={[0.3, 0.09, 0.3]} radius={0.01} material={m.black} />
      <Instances geometry={finGeometry} material={m.alu} matrices={fins} />
      <Box at={[0.14, BODY_TOP + 0.03, 0.2]} size={[0.16, 0.06, 0.16]} radius={0.008} material={m.paint} />
      <Instances geometry={sma} material={m.copper} matrices={smas} />
      <Cable
        points={[
          [-0.16, BODY_TOP + 0.05, 0.1],
          [-0.05, BODY_TOP + 0.03, 0.12],
          [0.06, BODY_TOP + 0.045, 0.2],
        ]}
        r={0.009}
        material={m.kapton}
      />
      <Cable
        points={[
          [-0.16, BODY_TOP + 0.05, -0.1],
          [-0.05, BODY_TOP + 0.03, -0.12],
          [-0.02, BODY_TOP + 0.05, -0.12],
        ]}
        r={0.009}
        material={m.kapton}
      />
      <Cable
        points={[
          [0.2, BODY_TOP + 0.09, 0.02],
          [0.24, BODY_TOP + 0.075, 0.1],
          [0.2, BODY_TOP + 0.06, 0.15],
        ]}
        r={0.006}
        material={m.black}
      />
    </group>
  );
}

function Arm({ m, joints }: { m: MaterialSet; joints: (index: number) => (el: THREE.Group | null) => void }) {
  const tools = [
    // drill
    <group key="drill">
      <Cyl at={[0, 0.05, 0]} r={0.022} h={0.05} material={m.anodized} />
      <Cyl at={[0, 0.095, 0]} r={0.004} r2={0.009} h={0.05} material={m.alu} segments={10} />
    </group>,
    // brush
    <group key="brush">
      <Cyl at={[0, 0.05, 0]} r={0.018} h={0.04} material={m.paint} />
      <Cyl at={[0, 0.078, 0]} r={0.02} h={0.018} material={m.black} segments={16} />
    </group>,
    // spectrometer
    <group key="spec">
      <Box at={[0, 0.06, 0]} size={[0.05, 0.06, 0.04]} radius={0.006} material={m.gold} />
      <Cyl at={[0, 0.095, 0]} r={0.012} h={0.012} material={m.copper} />
    </group>,
    // close-up camera
    <group key="cam">
      <Cyl at={[0, 0.055, 0]} r={0.022} h={0.05} material={m.black} />
      <Cyl at={[0, 0.082, 0]} r={0.016} h={0.004} material={m.glass} />
    </group>,
    // scoop
    <group key="scoop">
      <Box at={[0, 0.06, 0]} size={[0.06, 0.05, 0.03]} radius={0.004} material={m.alu} />
    </group>,
  ];
  return (
    <group ref={joints(0)} position={ARM.shoulder}>
      <Cyl at={[0, 0, 0]} r={0.05} h={0.08} material={m.anodized} />
      <group ref={joints(1)}>
        <Cyl at={[0, 0, 0]} r={0.045} h={0.11} axis="z" material={m.anodized} />
        <Beam a={[0.03, 0, 0]} b={[ARM.upper - 0.03, 0, 0]} r={0.03} material={m.titanium} />
        <Box at={[0.18, 0.035, 0]} size={[0.16, 0.03, 0.05]} radius={0.008} material={m.paint} />
        <group ref={joints(2)} position={[ARM.upper, 0, 0]}>
          <Cyl at={[0, 0, 0]} r={0.042} h={0.1} axis="z" material={m.anodized} />
          <Beam a={[0.03, 0, 0]} b={[ARM.fore - 0.03, 0, 0]} r={0.026} material={m.titanium} />
          <Cable
            points={[
              [0.02, 0.03, 0.03],
              [0.16, 0.035, 0.032],
              [ARM.fore - 0.04, 0.03, 0.03],
            ]}
            r={0.005}
            material={m.kapton}
          />
          <group ref={joints(3)} position={[ARM.fore, 0, 0]}>
            <Cyl at={[0, 0, 0]} r={0.036} h={0.08} axis="z" material={m.anodized} />
            <group position={[0.06, 0, 0]}>
              <Cyl at={[0, 0, 0]} r={0.05} h={0.06} axis="x" material={m.alu} />
              {tools.map((tool, i) => (
                <group key={i} rotation={[(i / tools.length) * Math.PI * 2, 0, 0]}>
                  {tool}
                </group>
              ))}
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

function Rtg({ m, glow }: { m: MaterialSet; glow: (el: THREE.PointLight | null) => void }) {
  const fin = useMemo(() => new THREE.BoxGeometry(0.12, 0.44, 0.012), []);
  const fins = useMemo(
    () =>
      Array.from({ length: DIM.rtgFins }, (_, i) => {
        const t = (i / DIM.rtgFins) * Math.PI * 2 + Math.PI / DIM.rtgFins;
        return compose([Math.cos(t) * 0.175, 0, Math.sin(t) * 0.175], [0, -t, 0]);
      }),
    [],
  );
  // lower collar centre, in world space
  const collar: V3 = [RTG_C[0] + Math.sin(RTG_TILT) * 0.22, RTG_C[1] - Math.cos(RTG_TILT) * 0.22, 0];
  return (
    <group>
      {[0.1, -0.1].map((z) => [BODY.y - 0.08, BODY.y + 0.08].map((y) => <Beam key={`${z}${y}`} a={[-BODY.l / 2 - 0.01, y, z]} b={[collar[0], collar[1], z * 0.6]} r={0.012} material={m.titanium} />))}
      <group position={RTG_C} rotation={[0, 0, RTG_TILT]}>
        <Cyl at={[0, 0, 0]} r={0.12} h={0.5} material={m.rtgCore} segments={32} />
        {[0.25, -0.25].map((y) => (
          <Cyl key={y} at={[0, y, 0]} r={0.13} h={0.03} material={m.alu} segments={32} />
        ))}
        <Instances geometry={fin} material={m.rtgFin} matrices={fins} />
        <Cyl at={[0, 0.28, 0]} r={0.04} h={0.04} material={m.anodized} />
        <pointLight ref={glow} position={[0, 0, 0.3]} color="#ff7a3a" intensity={0} distance={1.6} decay={2} />
      </group>
    </group>
  );
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function Rover({ live, xray, onHover, onSelect }: RoverProps) {
  const mats = useMemo(() => {
    const out = {} as Record<AssemblyId, MaterialSet>;
    for (const a of ASSEMBLIES) {
      out[a.id] = makeMaterials();
      rememberBase(out[a.id]);
    }
    return out;
  }, []);
  const groups = useRef<Partial<Record<AssemblyId, THREE.Group>>>({});
  const wheels = useRef<THREE.Group[]>([]);
  const steers = useRef<THREE.Group[]>([]);
  // rocker and bogie per side: [right rocker, right bogie, left rocker, left bogie]
  const arms = useRef<(THREE.Group | null)[]>([]);
  const head = useRef<THREE.Group | null>(null);
  const dish = useRef<THREE.Group | null>(null);
  const joints = useRef<(THREE.Group | null)[]>([]);
  const glow = useRef<THREE.PointLight | null>(null);
  const levels = useRef<Record<string, number>>({});
  const root = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    root.current?.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
  }, []);

  // X-ray: every assembly but the one in focus turns to ghosted glass that casts no shadow.
  useLayoutEffect(() => {
    const focus = live.current.selected ?? live.current.hovered;
    for (const a of ASSEMBLIES) {
      const ghost = xray && a.id !== focus;
      for (const mat of Object.values(mats[a.id])) {
        if (mat.transparent === ghost) continue;
        mat.transparent = ghost;
        mat.opacity = ghost ? 0.16 : 1;
        mat.depthWrite = !ghost;
        mat.needsUpdate = true;
      }
      groups.current[a.id]?.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) o.castShadow = !ghost;
      });
    }
  });

  useFrame((state, delta) => {
    const { p, hovered, selected, animate, calm } = live.current;
    const t = state.clock.elapsedTime;
    const moving = animate && !calm;
    for (const a of ASSEMBLIES) {
      const g = groups.current[a.id];
      if (!g) continue;
      const share = shareOf(p, a.id);
      g.position.set(a.move[0] * share, a.move[1] * share, a.move[2] * share);
      // highlight: hovered strongest, selected steady, eased
      const target = hovered === a.id ? 1 : selected === a.id ? 0.3 : 0;
      const level = (levels.current[a.id] = lerp(levels.current[a.id] ?? 0, target, 1 - Math.exp(-delta / 0.12)));
      for (const [key, mat] of Object.entries(mats[a.id])) {
        if (key === "rtgCore") continue;
        mat.emissive.copy(mat.userData.baseEmissive).lerp(HIGHLIGHT, Math.min(1, level));
        mat.emissiveIntensity = level * 0.22;
      }
    }
    // the arm unfolds as its assembly leaves
    const armShare = shareOf(p, "arm");
    const [j0, j1, j2, j3] = joints.current;
    if (j0) j0.rotation.y = lerp(STOWED[0], DEPLOYED[0], armShare);
    if (j1) j1.rotation.z = lerp(STOWED[1], DEPLOYED[1], armShare);
    if (j2) j2.rotation.z = lerp(STOWED[2], DEPLOYED[2], armShare);
    if (j3) j3.rotation.z = lerp(STOWED[3], DEPLOYED[3], armShare) + (moving ? Math.sin(t * 0.7) * 0.08 * armShare : 0);
    // the mast head scans; the dish tracks; the wheels creep; the power unit glows
    if (head.current) head.current.rotation.y = moving ? Math.sin(t * 0.35) * 0.61 : 0;
    if (dish.current) dish.current.rotation.y = moving ? 0.4 + Math.sin(t * 0.12) * 0.25 : 0.4;
    const drive = live.current.drive;
    const rootGroup = root.current;
    if (drive) {
      // driving: every wheel rolls by the distance its side has covered; the corner wheels steer
      // the near wheels (+z) are the rover's right side
      wheels.current.forEach((w, i) => w && (w.rotation.y = i < 3 ? -drive.right / R : drive.left / R));
      steers.current.forEach((g, i) => {
        if (!g) return;
        const corner = i % 3;
        g.rotation.y = corner === 0 ? drive.steer : corner === 2 ? -drive.steer : 0;
        g.position.y = R + drive.lift[i];
      });
      arms.current.forEach((g, i) => g && (g.rotation.z = i % 2 === 0 ? drive.rocker[i >> 1] : drive.bogie[i >> 1]));
      rootGroup?.position.set(drive.x, drive.y + 0.013, drive.z);
      rootGroup?.rotation.set(-drive.roll, drive.heading, drive.pitch, "YZX");
    } else {
      // a wheel that is off its axle spins slowly, so the reader sees its tread
      const roll = moving ? t * 0.6 : 0;
      wheels.current.forEach((w, i) => w && (w.rotation.y = roll * shareOf(p, i < 3 ? "wheelsNear" : "wheelsFar")));
      steers.current.forEach((g) => {
        if (!g) return;
        g.rotation.y = 0;
        g.position.y = R;
      });
      arms.current.forEach((g) => g && (g.rotation.z = 0));
      rootGroup?.position.set(0, 0.013, 0);
      rootGroup?.rotation.set(0, 0, 0);
    }
    const heat = 0.55 + (moving ? Math.sin(t * 1.3) * 0.12 : 0);
    const core = mats.rtg.rtgCore;
    core.emissiveIntensity = heat * 0.35 + (levels.current.rtg ?? 0) * 0.2;
    if (glow.current) glow.current.intensity = heat * 0.8;
  });

  const assembly = (id: AssemblyId, children: ReactNode) => (
    <group
      key={id}
      ref={(el) => {
        if (el) groups.current[id] = el;
      }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        onHover(id);
      }}
      onPointerOut={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        onHover(null);
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (e.delta < 6) onSelect(id);
      }}
    >
      {children}
    </group>
  );
  const wheelRef = (i: number) => (el: THREE.Group | null) => {
    if (el) wheels.current[i] = el;
  };
  const steerRef = (i: number) => (el: THREE.Group | null) => {
    if (el) steers.current[i] = el;
  };
  const armRef = (i: number) => (el: THREE.Group | null) => {
    arms.current[i] = el;
  };
  const jointRef = (i: number) => (el: THREE.Group | null) => {
    joints.current[i] = el;
  };

  return (
    // lifted by the grouser height, so the chevrons stand on the sand instead of sinking into it
    <group ref={root} position={[0, 0.013, 0]}>
      {assembly("body", <Body m={mats.body} />)}
      {assembly("deck", <Deck m={mats.deck} />)}
      {assembly("avionics", <Avionics m={mats.avionics} />)}
      {assembly("mast", <Mast m={mats.mast} head={(el) => (head.current = el)} />)}
      {assembly("antennas", <Antennas m={mats.antennas} dish={(el) => (dish.current = el)} />)}
      {assembly("arm", <Arm m={mats.arm} joints={jointRef} />)}
      {assembly("rtg", <Rtg m={mats.rtg} glow={(el) => (glow.current = el)} />)}
      {assembly("suspNear", <Suspension side={1} m={mats.suspNear} rocker={armRef(0)} bogie={armRef(1)} />)}
      {assembly("suspFar", <Suspension side={-1} m={mats.suspFar} rocker={armRef(2)} bogie={armRef(3)} />)}
      {assembly(
        "wheelsNear",
        wheelX.map((x, i) => <Wheel key={x} x={x} side={1} m={mats.wheelsNear} spin={wheelRef(i)} steer={steerRef(i)} />),
      )}
      {assembly(
        "wheelsFar",
        wheelX.map((x, i) => <Wheel key={x} x={x} side={-1} m={mats.wheelsFar} spin={wheelRef(i + 3)} steer={steerRef(i + 3)} />),
      )}
    </group>
  );
}
