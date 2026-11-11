import * as THREE from "three";

type V3 = [number, number, number];

// One instance transform: position, Euler rotation and scale.
export const compose = (position: V3, euler: V3 = [0, 0, 0], scale: V3 = [1, 1, 1], order: THREE.EulerOrder = "XYZ") =>
  new THREE.Matrix4().compose(new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...euler, order)), new THREE.Vector3(...scale));
