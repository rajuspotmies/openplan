import { depthOf, extrude, insetPlan, iso, pathOf, planOutline, ring, sideRing, type Flat, type Plan, type Plane, type Point3, type SolidPaths } from "@/components/iso/iso-kit";
import { P } from "../cabinet/view";
import {
  D,
  F,
  G,
  L,
  S,
  box,
  cyl,
  frontRect,
  frontRule,
  halo,
  join,
  labelPlateFront,
  plateScrews,
  poly,
  slotX,
  topRule,
  tour,
  type Item,
  type Key,
  type Scene,
} from "../bench/scenes";

/*
 * One bench object per industry page, in the same camera and on the same mat as the
 * platform figures. World units are about 1 px; x/y on the floor, z up, +y faces the
 * viewer and +x is the lit right side.
 */

export interface IndScene extends Scene {
  /** what each lit stage stands for, in the order of the first lit channel's ids */
  stages: { label: string; t: number }[];
  /** top of the viewBox and its height, in projected px */
  view?: [number, number];
}

/* ── helpers ─────────────────────────────────────────────────────────────── */

function hull(points: Flat[]): Flat[] {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Flat, a: Flat, b: Flat) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Flat[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: Flat[] = [];
  for (const p of [...pts].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

/**
 * A round body lying along x or y: a wheel, a syringe barrel, a shaft.
 * `c` gives the two cross-axis coordinates (the axis one is ignored); it runs from a0 to a1.
 */
function drum(axis: "x" | "y", c: Point3, r: number, a0: number, a1: number, steps = 28): SolidPaths {
  const end = (a: number) =>
    Array.from({ length: steps }, (_, k): Point3 => {
      const t = (k / steps) * Math.PI * 2;
      const u = r * Math.cos(t);
      const v = r * Math.sin(t);
      return axis === "x" ? [a, c[1] + u, c[2] + v] : [c[0] + u, a, c[2] + v];
    });
  const A = end(a0);
  const B = end(a1);
  const mid = (a: number): Point3 => (axis === "x" ? [a, c[1], c[2]] : [c[0], a, c[2]]);
  const near = depthOf(mid(a1), P) >= depthOf(mid(a0), P) ? B : A;
  const fill = pathOf(hull([...A, ...B].map((p) => iso(p, P))), true);
  const face = pathOf(near.map((p) => iso(p, P)), true);
  return { fill, outline: fill + face, crease: "", top: face, shades: ["", fill, "", ""] };
}

/** an arc on a horizontal plane */
const arcTop = (cx: number, cy: number, r: number, z: number, a0: number, a1: number, n = 12) =>
  poly(Array.from({ length: n + 1 }, (_, k): Point3 => {
    const a = a0 + ((a1 - a0) * k) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a), z];
  }), false);

/** an arc on a vertical plane normal to x (around the x axis) */
const arcX = (x: number, cy: number, cz: number, r: number, a0: number, a1: number, n = 6) =>
  poly(Array.from({ length: n + 1 }, (_, k): Point3 => {
    const a = a0 + ((a1 - a0) * k) / n;
    return [x, cy + r * Math.cos(a), cz + r * Math.sin(a)];
  }), false);

/** a bar between two floor points, `hw` half wide */
function bar(ax: number, ay: number, bx: number, by: number, hw: number): Plane[] {
  const dx = bx - ax;
  const dy = by - ay;
  const l = Math.hypot(dx, dy) || 1;
  const nx = (-dy / l) * hw;
  const ny = (dx / l) * hw;
  return [
    [ax + nx, ay + ny],
    [bx + nx, by + ny],
    [bx - nx, by - ny],
    [ax - nx, ay - ny],
  ];
}

const sideRect = (x: number, y0: number, y1: number, z0: number, z1: number) =>
  poly([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]]);

const byDepth = (groups: { at: Point3; items: Item[] }[]) =>
  [...groups].sort((a, b) => depthOf(a.at, P) - depthOf(b.at, P)).flatMap((g) => g.items);

/* ── Drones: a quadcopter on a tethered test stand ───────────────────────── */

function drone(): IndScene {
  const BASE: Plan = { x: -58, y: -44, w: 116, d: 88, r: 3 };
  const items: Item[] = [];

  // battery charger, back left
  const CH: Plan = { x: -94, y: -50, w: 30, d: 38, r: 2 };
  items.push(
    halo(CH, 4),
    S(box(CH.x, CH.y, CH.w, CH.d, 0, 7, 2, 4, 0.6), "lo"),
    L(planOutline(insetPlan(CH, 2.5), 7, P), "faint"),
    D([[-89, -12, 3.5], [-85, -12, 3.5]], 0.55),
  );
  for (const k of [0, 1]) {
    const x = -91 + k * 13;
    items.push(
      S(box(x, -47, 11, 27, 7, 8, 1, 4, 0.5), "mid"),
      L(topRule(x + 2.5, -43, x + 2.5, -27, 15), "lo", { free: true }),
      L(topRule(x + 5, -43, x + 5, -33, 15), "lo", { free: true }),
      D([[x + 5.5, -20, 11]], 0.5),
    );
  }

  // test stand base with a landing mark
  items.push(
    halo(BASE, 7),
    S(box(BASE.x, BASE.y, BASE.w, BASE.d, 0, 7, 3, 4, 1), "mid"),
    L(planOutline(insetPlan(BASE, 4), 7, P), "faint"),
    D(plateScrews(BASE, 7, 8), 0.45),
    L(ring(0, 0, 30, 7, P, 56), "lo"),
    L(ring(0, 0, 27, 7, P, 56), "faint"),
    L(join([topRule(-34, 0, -30, 0, 7), topRule(30, 0, 34, 0, 7), topRule(0, -34, 0, -30, 7), topRule(0, 30, 0, 34, 7)]), "mid"),
    ...labelPlateFront(24, 44, 1.6, 24, 4),
  );

  // the rod and back skid ride with the drone but sit behind the post
  items.push(
    G(
      [
        S(cyl(0, 0, 2, 20, 22, 16), "mid"),
        S(box(-11.8, -12.4, 1.6, 1.6, 36.2, 5.8, 0.3, 2), "lo"),
        S(box(10.2, -12.4, 1.6, 1.6, 36.2, 5.8, 0.3, 2), "lo"),
        S(box(-21, -13, 42, 2.4, 34, 2.2, 1.1, 4), "mid"),
      ],
      { id: "mv" },
    ),
  );

  // post
  items.push(
    S(cyl(0, 0, 9, 7, 2.5, 32), "lo"),
    D([[6.5, 0, 9.5], [-6.5, 0, 9.5], [0, 6.5, 9.5], [0, -6.5, 9.5]], 0.4),
    S(cyl(0, 0, 3.2, 9.5, 24, 24), "mid"),
    S(cyl(0, 0, 4.6, 33.5, 3, 24), "mid"),
    S(box(4.2, -1, 4, 2, 34, 1.6, 0.4, 2), "lo"),
  );

  // the drone
  const drone: Item[] = [
    S(box(-11.8, 10.8, 1.6, 1.6, 36.2, 5.8, 0.3, 2), "lo"),
    S(box(10.2, 10.8, 1.6, 1.6, 36.2, 5.8, 0.3, 2), "lo"),
    S(box(-21, 10.6, 42, 2.4, 34, 2.2, 1.1, 4), "mid"),
  ];
  const groups: { at: Point3; items: Item[] }[] = [];
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const x = 32 * sx;
    const y = 32 * sy;
    const a = Math.atan2(sy, sx);
    const blade = (t: number) => extrude(bar(x - 15 * Math.cos(t), y - 15 * Math.sin(t), x + 15 * Math.cos(t), y + 15 * Math.sin(t), 1.3), 58.6, 0.7, P);
    groups.push({
      at: [x, y, 48],
      items: [
        S(extrude(bar(12.5 * sx, 12.5 * sy, x, y, 2.2), 45, 3, P), "mid"),
        S(cyl(x, y, 5.6, 44, 4, 24), "lo"),
        D([[x - sx * 9, y - sy * 9, 48]], 0.6),
        S(cyl(x, y, 4.6, 48, 6, 24), "mid"),
        L(join([0, 1, 2].map((k) => ring(x, y, 4.6, 49.5 + k * 1.5, P, 24))), "faint"),
        G([S(cyl(x, y, 4.8, 54, 2.2, 24), "lo", { lk: true })], { id: "motors" }),
        S(cyl(x, y, 1, 56.2, 2.4, 10), "mid"),
        G([S(blade(a + 0.9), "mid")], { id: "blades" }),
        S(cyl(x, y, 2.2, 58.4, 1.6, 14), "mid"),
        G(
          [
            F(ring(x, y, 17, 59.4, P, 48), "rotor"),
            L(arcTop(x, y, 16, 59.4, a, a + 1.2), "mid"),
            L(arcTop(x, y, 12, 59.4, a + Math.PI, a + Math.PI + 1), "lo"),
            L(arcTop(x, y, 8, 59.4, a + 2, a + 2.8), "lo"),
          ],
          { id: "spin" },
        ),
      ],
    });
  }
  groups.push({
    at: [0, 0, 46],
    items: [
      S(box(-15, -12, 30, 24, 42, 9, 3, 4, 1), "mid"),
      L(slotX(15, -7, 7, 47.8, 1.1), "lo"),
      L(slotX(15, -7, 7, 45, 1.1), "lo"),
      D([[-7, 12, 47.5], [-3.5, 12, 47.5]], 0.5),
      S(box(-11, -9, 22, 18, 51, 2.5, 3, 4, 0.6), "hi"),
      G([S(box(-7, -7, 14, 14, 53.5, 5, 1, 2, 0.4), "mid", { lk: true })], { id: "batt" }),
      L(topRule(-7, 0, 7, 0, 58.5), "lo"),
      L(poly([[7, 3, 56.5], [9.5, 3, 56.5], [9.5, 3, 53.5]], false), "lo"),
      S(cyl(9, -7, 0.8, 53.5, 9, 10), "mid"),
      S(cyl(9, -7, 3, 62.5, 2, 20), "mid"),
    ],
  });
  groups.push({
    at: [0, 15, 36],
    items: [
      S(box(-4, 9, 8, 4, 40, 2, 0.6, 2), "lo"),
      S(box(-5.4, 11.5, 1.2, 5.5, 32.5, 7.5, 0.3, 2), "lo"),
      G([S(cyl(0, 14.5, 3.8, 32.5, 7, 20), "mid", { lk: true })], { id: "payload" }),
      S(drum("y", [0, 0, 36], 2, 18, 19.6, 20), "hi"),
      L(sideRing([0, 19.6, 36], 1.1, "y", P, 16), "lo"),
      S(box(4.2, 11.5, 1.2, 5.5, 32.5, 7.5, 0.3, 2), "lo"),
    ],
  });
  drone.push(...byDepth(groups));
  items.push(G(drone, { id: "mv2" }));

  // ground station, front right
  const GS: Plan = { x: 64, y: 8, w: 34, d: 34, r: 2 };
  items.push(
    halo(GS, 4),
    S(box(GS.x, GS.y, GS.w, GS.d, 0, 9, 2, 4, 0.8), "lo"),
    G([S(box(66.5, 10.5, 23, 21, 9, 0.6, 1.4, 2), "mid", { lk: true, flat: true })], { id: "station" }),
    F(planOutline({ x: 68, y: 12, w: 20, d: 18, r: 1 }, 9.6, P, 2), "bn-ink"),
    F(poly([[70, 26, 9.6], [73, 22, 9.6], [76, 24, 9.6], [79, 17, 9.6], [82, 20, 9.6], [86, 15, 9.6]], false), "sc-line"),
    F(topRule(70, 28, 86, 28, 9.6), "sc-dim"),
    S(cyl(95, 11, 1.6, 9, 4, 12), "lo"),
    S(cyl(95, 11, 0.7, 13, 26, 10), "mid"),
    D([[95, 11, 39]], 0.7),
  );
  for (const y of [19, 33]) {
    items.push(S(cyl(93, y, 3.2, 9, 1.6, 20), "lo"), S(cyl(93, y, 1.2, 10.6, 5, 10), "mid"), S(cyl(93, y, 2, 15.6, 1.8, 16), "mid"));
  }
  items.push(...labelPlateFront(68, 42, 2, 16, 5), D([[89, 42, 4.5], [93, 42, 4.5]], 0.55));

  const lift: Key[] = [
    { t: 0, p: [0, 0, 0] },
    { t: 0.12, p: [0, 0, 0] },
    { t: 0.3, p: [0, 0, 11], e: "io" },
    { t: 0.5, p: [0, 0, 8.5], e: "io" },
    { t: 0.7, p: [0, 0, 11], e: "io" },
    { t: 0.88, p: [0, 0, 0], e: "io" },
    { t: 1, p: [0, 0, 0] },
  ];
  const spin: Key[] = [
    { t: 0, p: [0, 0, 0], o: 0 },
    { t: 0.06, o: 0 },
    { t: 0.14, o: 1 },
    { t: 0.88, o: 1 },
    { t: 0.95, o: 0 },
    { t: 1, o: 0 },
  ];
  const blades: Key[] = spin.map((k) => ({ ...k, o: k.o === undefined ? undefined : 1 - k.o }));
  return {
    name: "drone",
    view: [117, 300],
    label: "A quadcopter on a tethered test stand beside a battery charger and a ground station. The drone lifts on its rod with the rotors spinning while its motors, battery, camera gimbal and the ground station light in turn.",
    items,
    period: 10,
    rest: 0.4,
    channels: [
      { kind: "lit", ids: ["motors", "batt", "payload", "station"], steps: [[0, [0]], [0.25, [1]], [0.5, [2]], [0.75, [3]]] },
      { kind: "move", id: "mv", keys: lift },
      { kind: "move", id: "mv2", keys: lift },
      { kind: "move", id: "spin", keys: spin },
      { kind: "move", id: "blades", keys: blades },
    ],
    stages: [
      { label: "Airframe & motors", t: 0.2 },
      { label: "Power system", t: 0.4 },
      { label: "Payload & gimbal", t: 0.6 },
      { label: "Telemetry link", t: 0.8 },
    ],
  };
}

/* ── MedTech: a syringe pump on a validation bench beside its design history file ── */

function medtech(): IndScene {
  const BODY: Plan = { x: -96, y: -34, w: 96, d: 40, r: 3 };
  const FY = BODY.y + BODY.d; // front face, 6
  const items: Item[] = [halo(BODY, 6)];
  for (const [x, y] of [[-90, -28], [-6, -28], [-90, 0], [-6, 0]]) items.push(S(cyl(x, y, 2.6, 0, 4, 16), "lo"));
  items.push(
    S(box(BODY.x, BODY.y, BODY.w, BODY.d, 4, 34, 3, 4, 1), "mid"),
    L(frontRule(-93, -3, FY, 36), "faint"),
    // screen
    L(frontRect(-89.5, -54.5, FY, 18.5, 34.5), "mid"),
    F(frontRect(-88, -56, FY, 20, 33), "bn-ink"),
    F(poly([[-86, FY, 25], [-81, FY, 25], [-79.5, FY, 30], [-77.5, FY, 22], [-75.5, FY, 27], [-73.5, FY, 25], [-58, FY, 25]], false), "sc-line"),
    F(frontRule(-86, -74, FY, 31), "sc-dim"),
    F(frontRule(-66, -58, FY, 31), "sc-dim"),
    F(frontRule(-86, -78, FY, 22), "sc-dim"),
  );
  for (let k = 0; k < 4; k++) {
    const x = -88 + k * 8.2;
    items.push(G([S(box(x, FY, 7, 0.8, 13.5, 2.6, 0.3, 2), "lo", { lk: true })], { id: `seg${k}` }));
  }
  for (let c = 0; c < 2; c++) for (let r = 0; r < 3; r++) items.push(S(box(-46 + c * 8, FY, 6, 1.2, 15 + r * 6.5, 4, 0.5, 2), "mid"));
  items.push(
    S(drum("y", [-18, 0, 24], 5.5, FY, FY + 1.8, 28), "lo"),
    L(sideRing([-18, FY + 1.8, 24], 3.4, "y", P, 24), "faint"),
    D([[-7, FY, 33]], 0.7),
    ...labelPlateFront(-30, FY, 7.5, 22, 5.5),
    L(slotX(0, -28, -10, 30, 1.2), "lo"),
    L(slotX(0, -28, -10, 25.5, 1.2), "lo"),
    L(slotX(0, -28, -10, 21, 1.2), "lo"),
    // the pusher's guide slot
    F(planOutline({ x: -93, y: -6, w: 64, d: 3, r: 1.5 }, 38, P, 3), "bn-ink"),
    L(planOutline({ x: -93, y: -6, w: 64, d: 3, r: 1.5 }, 38, P, 3), "lo"),
  );
  // plunger, thumb plate and pusher block: they advance one dose per stage
  items.push(
    G(
      [
        S(box(-93, -25, 6, 22, 38, 20, 1.2, 4, 0.6), "mid"),
        D([[-90, -3, 52], [-90, -3, 42]], 0.45),
        S(box(-92, -9, 4, 4, 58, 3, 0.8, 2), "lo"),
        S(drum("x", [0, -16, 50], 5.5, -87, -85.4, 28), "mid"),
        S(drum("x", [0, -16, 50], 1.8, -85.4, -64, 16), "lo"),
      ],
      { id: "mv" },
    ),
  );
  // cradle, barrel, graduations, nozzle and line
  const gradu: string[] = [];
  for (let k = 0; k <= 14; k++) {
    const x = -60 + k * 3;
    const major = k % 5 === 0;
    gradu.push(arcX(x, -16, 50, 6, major ? 0.25 : 0.55, major ? 1.25 : 1.05, 4));
  }
  items.push(
    S(box(-58, -24, 6, 16, 38, 6.5, 1, 4, 0.4), "lo"),
    S(box(-24, -24, 6, 16, 38, 6.5, 1, 4, 0.4), "lo"),
    S(drum("x", [0, -16, 50], 9, -66, -64.4, 32), "mid"),
    S(drum("x", [0, -16, 50], 6, -64.4, -14, 32), "hi"),
    L(join(gradu), "lo", { free: true }),
    S(drum("x", [0, -16, 50], 2.4, -14, -9, 16), "mid"),
    S(drum("x", [0, -16, 50], 3.4, -9, -5, 20), "lo"),
  );
  // beaker and line
  items.push(
    halo({ x: 12, y: -31, w: 18, d: 18, r: 9 }, 3),
    S(cyl(21, -22, 8, 0, 24, 36), "mid"),
    L(ring(21, -22, 6.8, 24, P, 36), "faint"),
    L(join([0, 1, 2, 3].map((k) => arcTop(21, -22, 8.01, 6 + k * 4, 0.6, 2.4, 8))), "faint", { free: true }),
    L(poly([[-5, -16, 50], [4, -16, 50], [12, -17, 46], [18, -19.5, 38], [21, -22, 30], [21, -22, 24]], false), "mid"),
  );
  // design history file: four binders in a tray
  const TRAY: Plan = { x: 42, y: -18, w: 62, d: 48, r: 2 };
  items.push(halo(TRAY, 4), S(box(TRAY.x, TRAY.y, TRAY.w, TRAY.d, 0, 4, 2, 4, 0.6), "lo"));
  for (let k = 0; k < 4; k++) {
    const x = 45 + k * 14.5;
    items.push(
      G(
        [
          S(box(x, -14, 12, 40, 4, 44, 1.2, 4, 0.5), "mid", { lk: true }),
          L(planOutline({ x: x + 2, y: -12, w: 8, d: 36, r: 0.6 }, 48, P, 2), "faint"),
          ...labelPlateFront(x + 2, 26, 30, 8, 10),
          L(sideRing([x + 6, 26, 15], 2.2, "y", P, 18), "lo"),
          D([[x + 6, 26, 9]], 0.45),
        ],
        { id: `b${k}` },
      ),
    );
  }

  const dose = (n: number): Point3 => [n * 4, 0, 0];
  const keys: Key[] = [
    { t: 0, p: dose(0) },
    { t: 0.2, p: dose(0) },
    { t: 0.25, p: dose(1), e: "io" },
    { t: 0.45, p: dose(1) },
    { t: 0.5, p: dose(2), e: "io" },
    { t: 0.7, p: dose(2) },
    { t: 0.75, p: dose(3), e: "io" },
    { t: 0.9, p: dose(3) },
    { t: 0.985, p: dose(0), e: "io" },
    { t: 1, p: dose(0) },
  ];
  return {
    name: "medtech",
    view: [128, 289],
    label: "A syringe pump on a bench with a beaker and a tray of four binders for the design history file. The pusher advances the plunger one dose at a time while each binder lights in turn and a progress bar fills on the pump.",
    items,
    period: 10,
    rest: 0.6,
    channels: [
      { kind: "lit", ids: ["b0", "b1", "b2", "b3"], steps: [[0, [0]], [0.25, [1]], [0.5, [2]], [0.75, [3]]] },
      { kind: "lit", ids: ["seg0", "seg1", "seg2", "seg3"], steps: [[0, [0]], [0.25, [0, 1]], [0.5, [0, 1, 2]], [0.75, [0, 1, 2, 3]]] },
      { kind: "move", id: "mv", keys },
    ],
    stages: [
      { label: "Design inputs", t: 0.1 },
      { label: "Design outputs", t: 0.35 },
      { label: "Verification", t: 0.6 },
      { label: "Validation", t: 0.85 },
    ],
  };
}

/* ── Automotive: an EV skateboard on stands, its ECUs on one bus ─────────── */

function automotive(): IndScene {
  const WZ = 17;
  const WR = 14;
  const items: Item[] = [halo({ x: -84, y: -46, w: 168, d: 92, r: 8 }, 4)];

  function wheel(x: number, y0: number, y1: number, outer: boolean): Item[] {
    const fy = outer ? y1 : y1;
    const out: Item[] = [
      F(planOutline({ x: x - 12, y: y0 - 1, w: 24, d: y1 - y0 + 2, r: 4 }, 0, P, 4), "iso-halo"),
      S(drum("y", [x, 0, WZ], WR, y0, y1, 40), "mid"),
      L(sideRing([x, fy, WZ], 9.5, "y", P, 36), "mid"),
      L(sideRing([x, fy, WZ], 12, "y", P, 36), "faint"),
    ];
    if (outer) {
      const spokes: string[] = [];
      const lugs: Point3[] = [];
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 + 0.3;
        spokes.push(poly([[x + 4 * Math.cos(a), fy, WZ + 4 * Math.sin(a)], [x + 9.5 * Math.cos(a), fy, WZ + 9.5 * Math.sin(a)]], false));
        lugs.push([x + 2.6 * Math.cos(a + 0.6), fy + 1.4, WZ + 2.6 * Math.sin(a + 0.6)]);
      }
      out.push(L(join(spokes), "lo"), S(drum("y", [x, 0, WZ], 4, fy, fy + 1.4, 20), "lo"), D(lugs, 0.4));
    }
    return out;
  }

  // back wheels, back stands, back rail
  items.push(...wheel(-64, -44, -34, false), ...wheel(64, -44, -34, false));
  const stand = (x: number, y: number): Item[] => [
    S(cyl(x, y, 6, 0, 2, 24), "lo"),
    S(cyl(x, y, 2.4, 2, 18, 14), "mid"),
    S(box(x - 4, y - 3, 8, 6, 20, 2, 0.6, 2), "lo"),
  ];
  items.push(...stand(-40, -27), ...stand(40, -27));
  items.push(S(box(-84, -30, 168, 6, 22, 6, 1, 4, 0.6), "mid"), D([[-70, -24, 25], [-30, -24, 25], [30, -24, 25], [70, -24, 25]], 0.4));

  // axles and drive units
  items.push(
    S(drum("y", [-64, 0, WZ], 2.2, -34, 34, 14), "lo"),
    S(drum("y", [64, 0, WZ], 2.2, -34, 34, 14), "lo"),
    S(drum("y", [-64, 0, WZ], 7.5, -15, 13, 28), "mid"),
    L(join([-9, -3, 3, 9].map((y) => sideRing([-64, y, WZ], 7.52, "y", P, 28))), "faint"),
    S(box(-58, -11, 10, 22, 9, 14, 1.2, 4, 0.5), "mid"),
    S(drum("y", [64, 0, WZ], 6.5, -13, 11, 28), "mid"),
    L(join([-7, -1, 5].map((y) => sideRing([64, y, WZ], 6.52, "y", P, 28))), "faint"),
    S(box(48, -10, 10, 20, 10, 12, 1.2, 4, 0.5), "mid"),
  );

  // battery pack and its modules
  items.push(S(box(-54, -24, 108, 46, 13, 10, 2, 4, 0.8), "mid"), L(frontRule(-52, 52, 22, 15.5), "faint"));
  const mods: Item[] = [];
  for (let c = 0; c < 4; c++) {
    for (const y of [-21, 0]) {
      const x = -50 + c * 17.6;
      mods.push(S(box(x, y, 15.6, 19, 23, 3, 0.8, 2), "lo", { lk: true }), L(topRule(x + 3, y + 4, x + 12.6, y + 4, 26), "faint", { free: true }));
    }
  }
  items.push(G(mods, { id: "pack" }));

  // crossmembers and decks
  items.push(
    S(box(-82, -24, 6, 46, 22, 6, 0.8, 4), "mid"),
    S(box(76, -24, 6, 46, 22, 6, 0.8, 4), "mid"),
    S(box(-86, -30, 24, 58, 28, 1.4, 1, 4), "lo"),
    D(plateScrews({ x: -86, y: -30, w: 24, d: 58, r: 1 }, 29.4, 2.6), 0.4),
    S(box(62, -30, 24, 58, 28, 1.4, 1, 4), "lo"),
    D(plateScrews({ x: 62, y: -30, w: 24, d: 58, r: 1 }, 29.4, 2.6), 0.4),
  );

  const ecu = (x: number, y: number, w: number, d: number, z: number, id: string): Item =>
    G(
      [
        S(box(x, y, w, d, z, 5, 0.8, 4, 0.4), "mid", { lk: true }),
        L(join([0.25, 0.5, 0.75].map((f) => topRule(x + w * f, y + 2, x + w * f, y + d - 2, z + 5))), "faint"),
        S(box(x + w - 1, y + d / 2 - 3, 2.2, 6, z + 1, 3, 0.4, 2), "lo"),
        D([[x + 2, y + d, z + 3.4]], 0.5),
      ],
      { id },
    );
  items.push(ecu(-80, -12, 14, 14, 29.4, "e0"), ecu(24, -20, 12, 14, 26, "e1"));
  // the bus and its taps
  items.push(
    L(poly([[-64.8, -5, 32], [-58, -1, 27], [-50, -1, 26], [52, -1, 26], [60, -1, 29.4], [70, -1, 32]], false), "lo", { dashed: true }),
    L(join([poly([[30, -1, 26], [30, -6, 26]], false), poly([[46, -1, 26], [46, 2, 26]], false)]), "lo"),
    D([[-64.8, -5, 32], [30, -6, 26], [46, 2, 26], [70, -1, 32]], 0.55),
  );
  const stops: Point3[] = [[-56, -1, 26.8], [30, -1, 26.8], [46, -1, 26.8], [68, -1, 31.6]];
  const { keys, arrivals } = tour(stops, { hold: 0.7, travel: 0.6, fade: 0.25 });
  items.push(G([S(cyl(0, 0, 1.6, 0, 1.2, 14), "hi", { lit: true })], { id: "q" }));
  items.push(ecu(40, 2, 12, 14, 26, "e2"));
  // ADAS: a radar and camera block on the front deck
  items.push(
    G(
      [
        S(box(68, -9, 11, 18, 29.4, 9, 1, 4, 0.5), "mid", { lk: true }),
        L(sideRect(79, -6, 6, 31.5, 36.5), "lo"),
        S(drum("x", [0, 3, 34], 2.4, 79, 80.6, 18), "hi"),
        L(sideRing([80.6, 3, 34], 1.2, "x", P, 14), "lo"),
        D([[79, -3, 34]], 0.5),
      ],
      { id: "e3" },
    ),
  );
  // front stands, front rail, front wheels
  items.push(...stand(-40, 25), ...stand(40, 25));
  items.push(S(box(-84, 22, 168, 6, 22, 6, 1, 4, 0.6), "mid"), D([[-70, 28, 25], [-30, 28, 25], [30, 28, 25], [70, 28, 25]], 0.4));
  items.push(...wheel(-64, 34, 44, true), ...wheel(64, 34, 44, true));
  items.push(...labelPlateFront(-20, 28, 23, 18, 4));

  return {
    name: "automotive",
    view: [165, 252],
    label: "An electric skateboard chassis on four jack stands, with a battery pack, two drive units and four control units on one bus. A pulse runs along the bus to the powertrain, body, infotainment and driver-assist units, lighting each in turn.",
    items,
    period: 9,
    rest: arrivals[0] + 0.02,
    channels: [
      { kind: "lit", ids: ["e0", "e1", "e2", "e3", "pack"], steps: [[0, [0, 4]], [arrivals[1], [1]], [arrivals[2], [2]], [arrivals[3], [3]]] },
      { kind: "move", id: "q", keys },
    ],
    stages: [
      { label: "Powertrain", t: arrivals[0] + 0.03 },
      { label: "Body control", t: arrivals[1] + 0.03 },
      { label: "Infotainment", t: arrivals[2] + 0.03 },
      { label: "ADAS", t: arrivals[3] + 0.03 },
    ],

  };
}

/* ── Consumer electronics: a phone, exploded on an assembly jig ──────────── */

function electronics(): IndScene {
  const PH: Plan = { x: -24, y: -40, w: 48, d: 96, r: 7 };
  const JIG: Plan = { x: -44, y: -52, w: 88, d: 120, r: 3 };
  const items: Item[] = [
    halo(JIG, 6),
    S(box(JIG.x, JIG.y, JIG.w, JIG.d, 0, 6, 3, 4, 1), "mid"),
    L(planOutline(insetPlan(JIG, 3.5), 6, P), "faint"),
    L(planOutline({ x: -27, y: -43, w: 54, d: 102, r: 9 }, 6, P, 8), "lo"),
    L(join(Array.from({ length: 19 }, (_, k) => topRule(-36 + k * 4, 64.5, -36 + k * 4, k % 5 === 0 ? 61.5 : 63, 6))), "lo"),
    ...labelPlateFront(18, 68, 1.4, 20, 3.4),
  ];
  const pin = (x: number, y: number): Item[] => [S(cyl(x, y, 2.4, 6, 16, 16), "mid"), S(cyl(x, y, 3.4, 22, 1.6, 18), "lo")];
  items.push(...pin(-38, -46), ...pin(38, -46));

  // parts tray, back right
  const TR: Plan = { x: 54, y: -40, w: 40, d: 56, r: 2 };
  items.push(halo(TR, 4), S(box(TR.x, TR.y, TR.w, TR.d, 0, 6, 2, 4, 0.6), "lo"));
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 2; c++) {
      const pl: Plan = { x: 57 + c * 18.5, y: -37 + r * 17.5, w: 15.5, d: 15, r: 1.5 };
      items.push(F(planOutline(pl, 6, P, 3), "bn-floor"), L(planOutline(pl, 6, P, 3), "lo"));
      const cx = pl.x + pl.w / 2;
      const cy = pl.y + pl.d / 2;
      const spots: Plane[] = [[-3, -3], [3, -2], [-2, 3], [3, 3.5]];
      items.push(...spots.slice(0, 2 + ((r + c) % 3)).flatMap(([dx, dy]) => [S(cyl(cx + dx, cy + dy, 1.4, 6, 1, 12), "mid"), L(topRule(cx + dx - 0.7, cy + dy, cx + dx + 0.7, cy + dy, 7), "lo")]));
    }
  }
  // screwdriver lying in front of the tray
  items.push(
    S(drum("x", [0, 34, 3.2], 3.2, 52, 76, 24), "mid"),
    L(join([0.5, 1.2, 1.9, 2.6].map((a) => poly([[54, 34 + 3.2 * Math.cos(a), 3.2 + 3.2 * Math.sin(a)], [74, 34 + 3.2 * Math.cos(a), 3.2 + 3.2 * Math.sin(a)]], false))), "faint"),
    S(drum("x", [0, 34, 3.2], 1.8, 76, 79, 16), "lo"),
    S(drum("x", [0, 34, 3.2], 0.7, 79, 98, 10), "mid"),
  );

  // the phone, bottom to top; each layer lifts by its own offset
  const layer = (id: string, its: Item[]) => G(its, { id });
  items.push(
    layer("L0", [
      G([S(box(PH.x, PH.y, PH.w, PH.d, 6, 4, PH.r, 8, 0.8), "mid", { lk: true })], { id: "shell" }),
      L(planOutline(insetPlan(PH, 1.8), 10, P, 8), "faint"),
      L(join([-20, 20].map((y) => topRule(-20, y, 20, y, 10))), "faint"),
    ]),
    layer("L1", [
      G([S(box(-18, -36, 36, 46, 10, 4, 2, 4, 0.5), "mid", { lk: true })], { id: "batt" }),
      L(topRule(-13, -26, 8, -26, 14), "lo", { free: true }),
      L(topRule(-13, -22, 2, -22, 14), "lo", { free: true }),
      L(planOutline({ x: -13, y: -12, w: 26, d: 16, r: 1 }, 14, P, 2), "faint"),
      S(box(-6, 10.5, 12, 4.4, 10, 1, 0.6, 2), "lo"),
    ]),
    layer("L2", [
      S(box(-21, 19, 42, 34, 10, 1.4, 2, 4), "lo"),
      S(box(-19, 23, 10, 12, 11.4, 2.4, 0.8, 2), "mid"),
      L(join([26, 29, 32].map((y) => topRule(-17, y, -11, y, 13.8))), "faint"),
      S(cyl(-14, 43, 3.6, 11.4, 3, 20), "mid"),
      L(ring(-14, 43, 2, 14.4, P, 16), "lo"),
      G([S(box(-4, 23, 12, 12, 11.4, 1.8, 0.8, 2), "mid", { lk: true })], { id: "soc" }),
      L(planOutline({ x: -1.5, y: 25.5, w: 7, d: 7, r: 0.4 }, 13.2, P, 2), "faint"),
      S(box(-4, 38, 12, 6, 11.4, 1.3, 0.5, 2), "mid"),
      S(box(11, 22, 7, 4, 11.4, 1.4, 0.4, 2), "lo"),
      S(box(11, 30, 7, 10, 11.4, 1.6, 0.4, 2), "mid"),
      S(box(-5, 47.5, 10, 4, 11.4, 2.6, 1.2, 4), "lo"),
      D([[-18.5, 21.5, 11.4], [18.5, 21.5, 11.4], [-18.5, 50.5, 11.4], [18.5, 50.5, 11.4]], 0.4),
    ]),
    layer("L3", [
      S(box(PH.x + 0.6, PH.y + 0.6, PH.w - 1.2, PH.d - 1.2, 14, 1.6, PH.r - 0.6, 8), "lo"),
      L(planOutline({ x: -17, y: -34, w: 34, d: 44, r: 2 }, 15.6, P, 3), "faint"),
      L(planOutline({ x: -17, y: 18, w: 34, d: 32, r: 2 }, 15.6, P, 3), "faint"),
      D(plateScrews({ x: PH.x, y: PH.y, w: PH.w, d: PH.d, r: 0 }, 15.6, 4), 0.4),
    ]),
    layer("L4", [
      G([S(box(PH.x, PH.y, PH.w, PH.d, 15.6, 1.6, PH.r, 8, 0.6), "hi", { lk: true })], { id: "disp" }),
      F(planOutline(insetPlan(PH, 2.2), 17.2, P, 8), "bn-ink"),
      D([[0, -34, 17.2]], 0.9, "faint"),
      F(join([topRule(-15, -27, -2, -27, 17.2), topRule(8, -27, 15, -27, 17.2)]), "sc-dim"),
      F(join([-14, -4, 6].flatMap((x) => [0, 1, 2].map((r) => planOutline({ x, y: -18 + r * 11, w: 7, d: 7, r: 1.5 }, 17.2, P, 2)))), "sc-line"),
      F(topRule(-8, 48, 8, 48, 17.2), "sc-line"),
    ]),
  );
  items.push(...pin(-38, 60), ...pin(38, 60));

  const lifts = [0, 14, 32, 52, 70];
  const channels: Scene["channels"] = [
    { kind: "lit", ids: ["shell", "batt", "soc", "disp"], steps: [[0, [0]], [0.38, [1]], [0.53, [2]], [0.68, [3]], [0.86, [0]]] },
  ];
  lifts.forEach((h, k) => {
    if (!h) return;
    channels.push({
      kind: "move",
      id: `L${k}`,
      keys: [
        { t: 0, p: [0, 0, 0] },
        { t: 0.1 + k * 0.012, p: [0, 0, 0] },
        { t: 0.32, p: [0, 0, h], e: "io" },
        { t: 0.8, p: [0, 0, h] },
        { t: 0.96 - k * 0.012, p: [0, 0, 0], e: "io" },
        { t: 1, p: [0, 0, 0] },
      ],
    });
  });
  return {
    name: "electronics",
    view: [107, 310],
    label: "A phone on an assembly jig beside a parts tray and a screwdriver. Its back shell, battery, logic board, midframe and display lift apart into an exploded stack, each lighting in turn, and settle back together.",
    items,
    period: 11,
    rest: 0.6,
    channels,
    stages: [
      { label: "Enclosure", t: 0.05 },
      { label: "Battery", t: 0.45 },
      { label: "Logic board", t: 0.6 },
      { label: "Display", t: 0.75 },
    ],
  };
}

/* ── Industrial equipment: a press cell on a conveyor ────────────────────── */

function industrial(): IndScene {
  const BZ = 22; // belt top
  const items: Item[] = [];

  // control cabinet, back left
  const CAB: Plan = { x: -96, y: -50, w: 30, d: 22, r: 1 };
  items.push(
    halo(CAB, 4),
    G(
      [
        S(box(CAB.x, CAB.y, CAB.w, CAB.d, 0, 58, 1, 4, 0.6), "mid", { lk: true }),
        L(frontRect(-93, -69, -28, 6, 52), "faint"),
        L(frontRule(-93, -69, -28, 30), "faint"),
        F(frontRect(-90, -76, -28, 38, 48), "bn-ink"),
        D([[-72, -28, 44], [-72, -28, 40], [-72, -28, 36]], 0.6),
        L(join([-88, -84, -80, -76].map((x) => poly([[x, -28, 12], [x, -28, 24]], false))), "lo"),
      ],
      { id: "plc" },
    ),
  );

  // press: column behind the belt, arm over it
  items.push(
    halo({ x: -18, y: -34, w: 22, d: 14, r: 1 }, 4),
    S(box(-18, -34, 22, 14, 0, 70, 1, 4, 0.6), "mid"),
    L(frontRule(-15, 1, -20, 20), "faint"),
    L(frontRule(-15, 1, -20, 50), "faint"),
  );
  // inspection post, behind the belt
  items.push(S(box(38, -26, 8, 8, 0, 56, 1, 4, 0.4), "mid"));

  // conveyor legs, then the belt
  for (const x of [-60, -24, 26, 76]) {
    for (const y of [-10, 6]) items.push(S(box(x, y, 4, 4, 0, BZ - 4, 0.4, 2), "lo"));
  }
  items.push(
    halo({ x: -64, y: -11, w: 152, d: 22, r: 2 }, 3),
    S(box(-64, -11, 152, 22, BZ - 4, 4, 1.6, 4, 0.4), "mid"),
    L(join(Array.from({ length: 19 }, (_, k) => topRule(-60 + k * 8, -9, -60 + k * 8, 9, BZ))), "faint"),
    S(box(-64, -13, 152, 2, BZ - 4, 6, 0.4, 2), "lo"),
  );

  // the workpiece riding the belt
  const stops: Point3[] = [[-50, 0, BZ], [-7, 0, BZ], [42, 0, BZ], [78, 0, BZ]];
  const { keys, arrivals } = tour(stops, { hold: 0.8, travel: 0.7, fade: 0.25 });
  items.push(
    G(
      [
        S(box(-6, -6, 12, 12, 0, 6, 1, 4, 0.4), "hi", { lit: true }),
        S(cyl(0, 0, 2.4, 6, 1.4, 14), "mid"),
      ],
      { id: "q" },
    ),
  );

  // press arm and ram
  const hit = arrivals[1];
  items.push(
    S(box(-18, -20, 22, 30, 62, 10, 1, 4, 0.6), "mid"),
    L(topRule(-15, -16, -15, 6, 72), "faint"),
    G(
      [
        G([S(cyl(-7, 0, 5, 36, 26, 24), "mid", { lk: true })], { id: "ram" }),
        S(cyl(-7, 0, 7, 32, 4, 24), "lo"),
      ],
      { id: "rammv" },
    ),
  );
  // inspection arm and sensor head
  items.push(
    S(box(38, -26, 8, 30, 50, 6, 1, 4, 0.4), "mid"),
    G([S(box(37, -5, 10, 10, 40, 10, 1, 4, 0.4), "mid", { lk: true }), D([[42, 5, 43]], 0.7)], { id: "sensor" }),
    L(poly([[42, 0, 40], [42, 0, BZ + 7]], false), "lo", { dashed: true }),
  );
  // front belt rail and label
  items.push(S(box(-64, 11, 152, 2, BZ - 4, 6, 0.4, 2), "lo"), ...labelPlateFront(-40, 13, BZ - 3, 18, 4));

  // finished parts on a pallet, front right
  const PAL: Plan = { x: 50, y: 22, w: 40, d: 28, r: 1 };
  const out: Item[] = [S(box(PAL.x, PAL.y, PAL.w, PAL.d, 0, 4, 1, 4, 0.4), "lo"), L(join([30, 36, 42].map((y) => frontRule(50, 90, y, 4))), "faint")];
  for (let c = 0; c < 3; c++) {
    for (let r = 0; r < 2; r++) out.push(S(box(53 + c * 12.5, 25 + r * 12.5, 10, 10, 4, 6, 1, 4, 0.4), "mid"));
  }
  items.push(halo(PAL, 3), G(out, { id: "out" }));

  return {
    name: "industrial",
    view: [150, 270],
    label: "A press cell: a control cabinet, a conveyor, a press and an inspection head, with a pallet of finished parts. A workpiece rides the belt from release to the press, the inspection head and the pallet, lighting each in turn.",
    items,
    period: 10,
    rest: arrivals[0] + 0.02,
    channels: [
      { kind: "lit", ids: ["plc", "ram", "sensor", "out"], steps: [[0, [0]], [arrivals[1], [1]], [arrivals[2], [2]], [arrivals[3], [3]]] },
      { kind: "move", id: "q", keys },
      {
        kind: "move",
        id: "rammv",
        keys: [
          { t: 0, p: [0, 0, 0] },
          { t: hit + 0.01, p: [0, 0, 0] },
          { t: hit + 0.04, p: [0, 0, -4], e: "io" },
          { t: hit + 0.08, p: [0, 0, 0], e: "io" },
          { t: 1, p: [0, 0, 0] },
        ],
      },
    ],
    stages: [
      { label: "Design release", t: arrivals[0] + 0.03 },
      { label: "Machining", t: arrivals[1] + 0.03 },
      { label: "Inspection", t: arrivals[2] + 0.03 },
      { label: "Shop floor", t: arrivals[3] + 0.03 },
    ],
  };
}

export const INDUSTRY_SCENES = { drone, medtech, automotive, electronics, industrial } as const;
export type IndustryKey = keyof typeof INDUSTRY_SCENES;
