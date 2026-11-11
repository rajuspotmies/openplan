import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

type V3 = [number, number, number];
const UP = new THREE.Vector3(0, 1, 0);

// A round bar between two points.
export function Beam({ a, b, r, material, segments = 12 }: { a: V3; b: V3; r: number; material: THREE.Material; segments?: number }) {
  const { position, quaternion, length } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const dir = vb.clone().sub(va);
    return {
      position: va.clone().add(vb).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()),
      length: dir.length(),
    };
  }, [a, b]);
  return (
    <mesh position={position} quaternion={quaternion} material={material}>
      <cylinderGeometry args={[r, r, length, segments]} />
    </mesh>
  );
}

// A cylinder whose axis lies along x, y or z.
export function Cyl({ at, r, h, axis = "y", material, segments = 24, r2 }: { at: V3; r: number; h: number; axis?: "x" | "y" | "z"; material: THREE.Material; segments?: number; r2?: number }) {
  const rotation: V3 = axis === "x" ? [0, 0, Math.PI / 2] : axis === "z" ? [Math.PI / 2, 0, 0] : [0, 0, 0];
  return (
    <mesh position={at} rotation={rotation} material={material}>
      <cylinderGeometry args={[r2 ?? r, r, h, segments]} />
    </mesh>
  );
}

export function Box({ at, size, material, radius = 0, rotation }: { at: V3; size: V3; material: THREE.Material; radius?: number; rotation?: V3 }) {
  if (radius > 0)
    return (
      <RoundedBox args={size} radius={radius} smoothness={3} position={at} rotation={rotation} material={material} />
    );
  return (
    <mesh position={at} rotation={rotation} material={material}>
      <boxGeometry args={size} />
    </mesh>
  );
}

// A flexible cable or harness through control points.
export function Cable({ points, r, material }: { points: V3[]; r: number; material: THREE.Material }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    return new THREE.TubeGeometry(curve, Math.max(16, points.length * 10), r, 8, false);
  }, [points, r]);
  return <mesh geometry={geometry} material={material} />;
}

// Small identical parts (bolts, cell caps, fins, grousers) as one instanced draw.
export function Instances({ geometry, material, matrices }: { geometry: THREE.BufferGeometry; material: THREE.Material; matrices: THREE.Matrix4[] }) {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(geometry, material, matrices.length);
    matrices.forEach((matrix, i) => m.setMatrixAt(i, matrix));
    m.instanceMatrix.needsUpdate = true;
    return m;
  }, [geometry, material, matrices]);
  return <primitive object={mesh} />;
}
