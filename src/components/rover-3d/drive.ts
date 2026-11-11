import { DIM } from "./data";
import { ROAM, BLOCKERS, groundAt } from "./terrain";

// Game physics for drive mode. Speeds are game speeds: a real rover crawls at a few centimetres a second.
export const DRIVE = {
  max: 1.4, // m/s, cruising
  boostMax: 3.4, // m/s, while boosting
  reverseMax: 0.6,
  accel: 1.1,
  boostAccel: 2.8,
  brake: 2.6,
  coast: 0.7,
  steerMax: 0.5, // rad at the corner wheels
  steerRate: 2.4, // rad/s
  spin: 0.9, // rad/s when turning in place
  boostTime: 2.5, // s
  cooldown: 5, // s, after a boost ends
  gravity: 3.71, // m/s², Mars
  radius: 0.85, // collision circle against rocks too tall to climb
  rough: 0.75, // top speed scale while a wheel is climbing
  armMax: 0.4, // rad, rocker and bogie travel
} as const;

// Rocker-bogie geometry, in the rover's side plane (x forward, y up).
export const PIVOT_X = 0.05;
export const BOGIE_X = -0.38;
const WX = DIM.wheelX;
const HALF_BASE = WX[0]; // corner wheels steer opposite ways, so the turning centre sits at mid-wheelbase
const HALF_TRACK = DIM.wheelZ;

// Least squares for the rocker angle a and bogie angle b that best lift each wheel by its residual:
// front = a·(xf − px), middle = a·(xm − px) + b·(xm − bx), rear = a·(xr − px) + b·(xr − bx).
const ROWS = [
  [WX[0] - PIVOT_X, 0],
  [WX[1] - PIVOT_X, WX[1] - BOGIE_X],
  [WX[2] - PIVOT_X, WX[2] - BOGIE_X],
];
const NTN = [
  [ROWS.reduce((s, r) => s + r[0] * r[0], 0), ROWS.reduce((s, r) => s + r[0] * r[1], 0)],
  [ROWS.reduce((s, r) => s + r[0] * r[1], 0), ROWS.reduce((s, r) => s + r[1] * r[1], 0)],
];
const DET = NTN[0][0] * NTN[1][1] - NTN[0][1] * NTN[1][0];

export interface DriveState {
  x: number;
  z: number;
  y: number;
  heading: number; // rotation about y; forward is (cos, 0, -sin), the rover's right is (sin, 0, cos)
  pitch: number; // + nose up
  roll: number; // + right side up
  speed: number;
  steer: number; // + steers left
  yaw: number; // rad/s, + turns left
  boost: number; // seconds of boost left
  cooldown: number; // seconds until boost is ready again
  odometer: number;
  left: number; // distance rolled by each side's wheels
  right: number;
  impact: number; // seconds since the last knock
  // suspension, per side: [right (+z), left (−z)]
  rocker: [number, number];
  bogie: [number, number];
  lift: number[]; // per wheel, right side front/middle/rear then left side: height above the body's plane
  climbing: boolean;
}

export interface DriveInput {
  throttle: number; // -1..1
  steer: number; // -1..1, + left
  boost: boolean; // pressed this frame
}

export const freshDrive = (): DriveState => ({
  x: 0,
  z: 0,
  y: 0,
  heading: 0,
  pitch: 0,
  roll: 0,
  speed: 0,
  steer: 0,
  yaw: 0,
  boost: 0,
  cooldown: 0,
  odometer: 0,
  left: 0,
  right: 0,
  impact: 99,
  rocker: [0, 0],
  bogie: [0, 0],
  lift: [0, 0, 0, 0, 0, 0],
  climbing: false,
});

const toward = (value: number, target: number, step: number) => (value < target ? Math.min(target, value + step) : Math.max(target, value - step));
const clampArm = (v: number) => Math.max(-DRIVE.armMax, Math.min(DRIVE.armMax, v));

// flat: the studio floor, with no dunes and no rocks
export function stepDrive(s: DriveState, input: DriveInput, dt: number, flat = false) {
  // boost: a timed burst, then a cooldown before the next one
  if (input.boost && s.boost <= 0 && s.cooldown <= 0) s.boost = DRIVE.boostTime;
  if (s.boost > 0) {
    s.boost = Math.max(0, s.boost - dt);
    if (s.boost === 0) s.cooldown = DRIVE.cooldown;
  } else s.cooldown = Math.max(0, s.cooldown - dt);
  const boosting = s.boost > 0;

  // throttle, brake and coasting; a climbing wheel costs traction
  const top = (boosting ? DRIVE.boostMax : DRIVE.max) * (s.climbing ? DRIVE.rough : 1);
  let a = 0;
  if (input.throttle > 0) a = s.speed < 0 ? DRIVE.brake : s.speed < top ? (boosting ? DRIVE.boostAccel : DRIVE.accel) : -DRIVE.coast;
  else if (input.throttle < 0) a = s.speed > 0 ? -DRIVE.brake : s.speed > -DRIVE.reverseMax ? -DRIVE.accel : DRIVE.coast;
  else a = s.speed > 0 ? -DRIVE.coast : s.speed < 0 ? DRIVE.coast : 0;
  if (boosting && input.throttle >= 0 && s.speed < top) a = Math.max(a, DRIVE.boostAccel);
  a -= DRIVE.gravity * Math.sin(s.pitch);
  const before = s.speed;
  s.speed += a * dt;
  if (input.throttle === 0 && !boosting && Math.sign(before) !== Math.sign(s.speed) && Math.abs(s.pitch) < 0.05) s.speed = 0;
  s.speed = Math.max(-DRIVE.reverseMax * 1.5, Math.min(DRIVE.boostMax, s.speed));
  if (s.speed > top) s.speed = toward(s.speed, top, DRIVE.coast * 1.5 * dt);

  // four-wheel steering; at a standstill the wheels counter-rotate and it turns in place
  s.steer = toward(s.steer, input.steer * DRIVE.steerMax, DRIVE.steerRate * dt);
  const inPlace = Math.abs(s.speed) < 0.05 && input.throttle === 0 && input.steer !== 0;
  s.yaw = inPlace ? input.steer * DRIVE.spin : (s.speed * Math.tan(s.steer)) / HALF_BASE;
  s.heading += s.yaw * dt;

  // move
  const fx = Math.cos(s.heading);
  const fz = -Math.sin(s.heading);
  s.x += fx * s.speed * dt;
  s.z += fz * s.speed * dt;
  s.odometer += Math.abs(s.speed) * dt;
  s.left += (s.speed - s.yaw * HALF_TRACK) * dt;
  s.right += (s.speed + s.yaw * HALF_TRACK) * dt;

  // rocks too tall to climb: push out and bounce back
  s.impact += dt;
  if (!flat)
    for (const o of BLOCKERS) {
      const dx = s.x - o.x;
      const dz = s.z - o.z;
      const d = Math.hypot(dx, dz);
      const min = o.r + DRIVE.radius;
      if (d < min && d > 1e-6) {
        s.x = o.x + (dx / d) * min;
        s.z = o.z + (dz / d) * min;
        const into = -(fx * dx + fz * dz) / d; // > 0 when driving into the rock
        if (into * Math.sign(s.speed) > 0.2) {
          if (Math.abs(s.speed) > 0.3) s.impact = 0;
          s.speed *= -0.25;
        }
      }
    }
  // the edge of the world
  const r = Math.hypot(s.x, s.z);
  if (r > ROAM) {
    s.x *= ROAM / r;
    s.z *= ROAM / r;
    s.speed *= 0.5;
  }

  settle(s, dt, flat);
  return boosting;
}

// Sit on the ground: each wheel finds the surface under it (dune or rock); the body takes the best-fit plane
// of the six contacts, and the rocker and bogie on each side pivot to lift their wheels onto what is left over.
function settle(s: DriveState, dt: number, flat: boolean) {
  const fx = Math.cos(s.heading);
  const fz = -Math.sin(s.heading);
  const rx = Math.sin(s.heading);
  const rz = Math.cos(s.heading);
  const h: number[] = [];
  const side = [1, -1];
  for (const sgn of side) for (const x of WX) h.push(flat ? 0 : groundAt(s.x + fx * x + rx * sgn * HALF_TRACK, s.z + fz * x + rz * sgn * HALF_TRACK));
  const mean = h.reduce((t, v) => t + v, 0) / 6;
  let sxh = 0;
  let szh = 0;
  let sxx = 0;
  let szz = 0;
  h.forEach((v, i) => {
    const x = WX[i % 3];
    const z = i < 3 ? HALF_TRACK : -HALF_TRACK;
    sxh += x * (v - mean);
    szh += z * (v - mean);
    sxx += x * x;
    szz += z * z;
  });
  const slopeX = sxh / sxx;
  const slopeZ = szh / szz;
  const k = 1 - Math.exp(-dt / 0.1);
  s.y += (mean - s.y) * k;
  s.pitch += (Math.atan(slopeX) - s.pitch) * k;
  s.roll += (Math.atan(slopeZ) - s.roll) * k;

  let climbing = false;
  side.forEach((sgn, sideIndex) => {
    const res = WX.map((x, j) => h[sideIndex * 3 + j] - (mean + slopeX * x + slopeZ * sgn * HALF_TRACK));
    if (res.some((v) => Math.abs(v) > 0.04)) climbing = true;
    const b0 = ROWS.reduce((t, row, j) => t + row[0] * res[j], 0);
    const b1 = ROWS.reduce((t, row, j) => t + row[1] * res[j], 0);
    const a = clampArm((NTN[1][1] * b0 - NTN[0][1] * b1) / DET);
    const b = clampArm((NTN[0][0] * b1 - NTN[1][0] * b0) / DET);
    s.rocker[sideIndex] += (a - s.rocker[sideIndex]) * k;
    s.bogie[sideIndex] += (b - s.bogie[sideIndex]) * k;
    const ra = s.rocker[sideIndex];
    const rb = s.bogie[sideIndex];
    ROWS.forEach((row, j) => (s.lift[sideIndex * 3 + j] = ra * row[0] + rb * row[1]));
  });
  s.climbing = climbing;
}
