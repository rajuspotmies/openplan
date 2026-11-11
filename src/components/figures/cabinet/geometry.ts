import {
  boxCorners,
  corners,
  cylinder,
  depthOf,
  haloOf,
  insetPlan,
  knurl,
  lineOnTop,
  onTop,
  pathOf,
  planOutline,
  ring,
  sideRing,
  sideSeam,
  slabOf,
  topTicks,
  type Flat,
  type Plan,
  type Plane,
  type Point3,
  type SolidPaths,
  type Tone,
} from "@/components/iso/iso-kit";
import {
  BAR_H,
  CAB,
  CAB_TOP,
  CAB_Z,
  DRAWER_DEPTH,
  FOOT_H,
  FRONT_Y,
  HANDLE_H,
  HANDLE_X,
  LID,
  LID_H,
  LID_TOP,
  MAT,
  MAT_H,
  OPENINGS,
  P,
  PAD_H,
  PLINTH,
  PLINTH_H,
  PLINTH_Z,
  SIDE_X,
  TRAVEL,
  at,
  type Opening,
} from "./view";

/* ── helpers ─────────────────────────────────────────────────────────────── */

const slab = (plan: Plan, z: number, h: number, steps = 4, bevel = 0) => slabOf(plan, z, h, P, steps, bevel);
const cyl = (cx: number, cy: number, r: number, z: number, h: number, steps = 24) => cylinder(cx, cy, r, z, h, P, steps);
const face = (points: Point3[], closed = true) => pathOf(points.map(at), closed);
const join = (paths: string[]) => paths.filter(Boolean).join("");

/** Convex hull of screen points (monotone chain), as a closed path. */
function hullPath(points: Flat[]) {
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
  return pathOf([...lower.slice(0, -1), ...upper.slice(0, -1)], true);
}

/** A stadium (rounded slot) outline on the vertical face x = const, centred at (y, z). */
function slotOnSideFace(x: number, y0: number, y1: number, zc: number, r: number, steps = 8) {
  const pts: Point3[] = [];
  for (let s = 0; s <= steps; s++) {
    const a = Math.PI / 2 + (s / steps) * Math.PI; // left cap
    pts.push([x, y0 + r + Math.cos(a) * r, zc + Math.sin(a) * r]);
  }
  for (let s = 0; s <= steps; s++) {
    const a = -Math.PI / 2 + (s / steps) * Math.PI; // right cap
    pts.push([x, y1 - r + Math.cos(a) * r, zc + Math.sin(a) * r]);
  }
  return face(pts, true);
}

/* ── items: what the art layer paints, already in painter's order ─────────── */

export type Item =
  | { t: "solid"; paths: SolidPaths; tone: Tone; crease?: Tone | "none" }
  | { t: "line"; d: string; tone: Tone; free?: boolean }
  | { t: "dots"; points: Flat[]; size: number; tone?: Tone };

interface Group {
  at: Point3; // centre, used for depth sorting
  items: Item[];
}

const byDepth = (groups: Group[]) => [...groups].sort((a, b) => depthOf(a.at, P) - depthOf(b.at, P)).flatMap((g) => g.items);

/* ── bench mat ───────────────────────────────────────────────────────────── */

const MAT_FEET = corners(MAT, 18);
const MAT_SCREWS = corners(MAT, 9);
const RULER: Plan = { x: -82, y: MAT.y + MAT.d - 14, w: 164, d: 7, r: 1 };
const RULER_TICKS = topTicks(RULER.x + 4, RULER.x + RULER.w - 4, 4, 5, RULER.y + 0.6, 0.6, [2, 3.8], P);
const MAT_PLATE: Plan = { x: 64, y: 62, w: 34, d: 11, r: 1.5 };

export const MAT_ART = {
  halo: haloOf(MAT, -MAT_H - FOOT_H, MAT_H, P),
  feet: [...MAT_FEET]
    .sort((a, b) => depthOf([a[0], a[1], 0], P) - depthOf([b[0], b[1], 0], P))
    .map(([x, y]) => [cyl(x, y, 6.5, -MAT_H - FOOT_H, 1.4), cyl(x, y, 5, -MAT_H - FOOT_H + 1.4, FOOT_H - 1.4)]),
  slab: slab(MAT, -MAT_H, MAT_H, 8, 1.2),
  groove: planOutline(insetPlan(MAT, 4.5), 0, P),
  screws: MAT_SCREWS.map(([x, y]) => at([x, y, 0])),
  screwRings: join(MAT_SCREWS.map(([x, y]) => ring(x, y, 2.2, 0, P, 16))),
  ruler: slab(RULER, 0, 0.6, 3),
  ticksMinor: RULER_TICKS.minor,
  ticksMajor: RULER_TICKS.major,
  plate: slab(MAT_PLATE, 0, 0.8, 4),
  plateLine: planOutline(insetPlan(MAT_PLATE, 1.5), 0.8, P),
  plateRules: join(
    [0, 1, 2].map((row) =>
      lineOnTop([MAT_PLATE.x + 7, MAT_PLATE.y + 3.6 + row * 2.4], [MAT_PLATE.x + (row === 1 ? 24 : 31), MAT_PLATE.y + 3.6 + row * 2.4], 0.8, P),
    ),
  ),
  plateScrews: [at([MAT_PLATE.x + 3.2, MAT_PLATE.y + MAT_PLATE.d / 2, 0.8]), at([MAT_PLATE.x + MAT_PLATE.w - 3.2, MAT_PLATE.y + MAT_PLATE.d / 2, 0.8])],
};

/* ── cabinet body ────────────────────────────────────────────────────────── */

const PADS = corners(PLINTH, 9);
const LID_SCREWS = corners(LID, 5);
const SIDE_PLATE: Plan = { x: SIDE_X, y: -24, w: 0.8, d: 32, r: 0.4 };
const SIDE_PLATE_Z = 64;
const SIDE_PLATE_H = 15;
const LOCK_PLATE: Plan = { x: -5.5, y: FRONT_Y, w: 11, d: 0.7, r: 0.5 };

export const CABINET_ART = {
  halo: haloOf(insetPlan(CAB, -2), 0, 6, P),
  pads: PADS.map(([x, y]) => cyl(x, y, 3.4, 0, PAD_H, 18)),
  plinth: slab(PLINTH, PLINTH_Z, PLINTH_H, 4),
  carcass: slab(CAB, CAB_Z, CAB_TOP - CAB_Z, 4, 0),
  // a kick band just above the plinth and a lid seam, wrapping the visible corners
  carcassSeams: join([sideSeam(CAB, CAB_Z + 4, P, 4), sideSeam(CAB, CAB_TOP - 2.5, P, 4)]),
  // right side face: label plate, carry grip, vents
  sidePlate: slab(SIDE_PLATE, SIDE_PLATE_Z, SIDE_PLATE_H, 2),
  sidePlateLine: face([
    [SIDE_X + 0.8, SIDE_PLATE.y + 1.5, SIDE_PLATE_Z + 1.5],
    [SIDE_X + 0.8, SIDE_PLATE.y + SIDE_PLATE.d - 1.5, SIDE_PLATE_Z + 1.5],
    [SIDE_X + 0.8, SIDE_PLATE.y + SIDE_PLATE.d - 1.5, SIDE_PLATE_Z + SIDE_PLATE_H - 1.5],
    [SIDE_X + 0.8, SIDE_PLATE.y + 1.5, SIDE_PLATE_Z + SIDE_PLATE_H - 1.5],
  ]),
  sidePlateRules: join(
    [0, 1, 2].map((row) =>
      face(
        [
          [SIDE_X + 0.8, SIDE_PLATE.y + 5, SIDE_PLATE_Z + SIDE_PLATE_H - 4.5 - row * 2.6],
          [SIDE_X + 0.8, SIDE_PLATE.y + (row === 1 ? 19 : 26), SIDE_PLATE_Z + SIDE_PLATE_H - 4.5 - row * 2.6],
        ],
        false,
      ),
    ),
  ),
  sidePlateScrews: [at([SIDE_X + 0.8, SIDE_PLATE.y + 2.6, SIDE_PLATE_Z + SIDE_PLATE_H / 2]), at([SIDE_X + 0.8, SIDE_PLATE.y + SIDE_PLATE.d - 2.6, SIDE_PLATE_Z + SIDE_PLATE_H / 2])],
  grip: slotOnSideFace(SIDE_X, -16, 16, 90, 2.8),
  gripInner: slotOnSideFace(SIDE_X, -14.6, 14.6, 89.6, 1.6),
  vents: join([0, 1, 2, 3].map((k) => slotOnSideFace(SIDE_X, -30 + k * 15, -20 + k * 15, 22, 1.1, 6))),
  // front top rail: lock escutcheon and barrel
  lockPlate: slab(LOCK_PLATE, 95.5, 7, 2),
  lockRing: sideRing([0, FRONT_Y + 0.7, 99], 2.6, "y", P, 24),
  lockCore: sideRing([0, FRONT_Y + 0.7, 99], 1.4, "y", P, 18),
  lockKey: face([[0, FRONT_Y + 0.7, 99.9], [0, FRONT_Y + 0.7, 97.9]], false),
  // lid and carry handle
  lid: slab(LID, CAB_TOP, LID_H, 4, 0.8),
  lidGroove: planOutline(insetPlan(LID, 3.5), LID_TOP, P, 4),
  lidScrews: LID_SCREWS.map(([x, y]) => at([x, y, LID_TOP])),
  lidScrewRings: join(LID_SCREWS.map(([x, y]) => ring(x, y, 1.7, LID_TOP, P, 14))),
  handlePosts: [-HANDLE_X, HANDLE_X].map((x) => [cyl(x, 0, 4.4, LID_TOP, 1.6, 22), cyl(x, 0, 2.8, LID_TOP + 1.6, HANDLE_H - 1.6, 20)]),
  handleCollarSeams: join([-HANDLE_X, HANDLE_X].map((x) => sideSeam({ x: x - 2.8, y: -2.8, w: 5.6, d: 5.6, r: 2.8 }, LID_TOP + 6, P, 6))),
  handleBar: slab({ x: -HANDLE_X - 5, y: -3.2, w: HANDLE_X * 2 + 10, d: 6.4, r: 3.2 }, LID_TOP + HANDLE_H, BAR_H, 6, 0.6),
  handleKnurl: join([-HANDLE_X + 12, -HANDLE_X + 20, -HANDLE_X + 28, HANDLE_X - 28, HANDLE_X - 20, HANDLE_X - 12].map((x) =>
    face([[x, 3.2, LID_TOP + HANDLE_H], [x, 3.2, LID_TOP + HANDLE_H + BAR_H]], false),
  )),
  handleScrews: [-HANDLE_X, HANDLE_X].map((x) => at([x, 0, LID_TOP + HANDLE_H + BAR_H])),
};

/* ── drawer openings (static) ────────────────────────────────────────────── */

export function cavityOf(o: Opening) {
  const back = FRONT_Y - DRAWER_DEPTH;
  return {
    clip: face([
      [o.x0, FRONT_Y, o.z0],
      [o.x1, FRONT_Y, o.z0],
      [o.x1, FRONT_Y, o.z1],
      [o.x0, FRONT_Y, o.z1],
    ]),
    // left inner wall (faces +x, toward the viewer) and the floor, seen through the opening
    wall: face([
      [o.x0, FRONT_Y, o.z0],
      [o.x0, back, o.z0],
      [o.x0, back, o.z1],
      [o.x0, FRONT_Y, o.z1],
    ]),
    floor: face([
      [o.x0, FRONT_Y, o.z0],
      [o.x1, FRONT_Y, o.z0],
      [o.x1, back, o.z0],
      [o.x0, back, o.z0],
    ]),
  };
}

/* ── drawers (built closed; the live layer slides them along +y) ─────────── */

export const FRONT_D = 2.2;
const FACE = FRONT_Y + FRONT_D; // the drawer front's outer face

export function drawerOf(o: Opening) {
  const w = o.x1 - o.x0;
  const back = FRONT_Y - DRAWER_DEPTH;
  const bx0 = o.x0 + 1.4;
  const bx1 = o.x1 - 1.4;
  const bz0 = o.z0 + 1.2;
  const floorTop = bz0 + 1;
  const wallTop = o.z1 - 3;
  const wallH = wallTop - floorTop;

  // the region a drawer can occupy outside the carcass: everything of it beyond the
  // front face is drawn, everything behind it only through the opening
  const clip = hullPath(boxCorners({ x: o.x0, y: FRONT_Y, w, d: TRAVEL + 60, r: 0 }, o.z0, o.z1).map(at));

  const box: Item[] = [
    { t: "solid", paths: slab({ x: bx0, y: back, w: bx1 - bx0, d: DRAWER_DEPTH, r: 0.6 }, bz0, 1, 2), tone: "lo", crease: "none" },
    { t: "solid", paths: slab({ x: bx0, y: back, w: bx1 - bx0, d: 1.2, r: 0.3 }, floorTop, wallH, 2), tone: "mid" },
    { t: "solid", paths: slab({ x: bx0, y: back, w: 1.2, d: DRAWER_DEPTH, r: 0.3 }, floorTop, wallH, 2), tone: "mid" },
  ];
  const nearWall: Item[] = [
    { t: "solid", paths: slab({ x: bx1 - 1.2, y: back, w: 1.2, d: DRAWER_DEPTH, r: 0.3 }, floorTop, wallH, 2), tone: "mid" },
  ];

  const contents = contentsOf(o.index, { x0: bx0 + 3.2, x1: bx1 - 3.4, y0: -2, y1: 36.5, z: floorTop, top: wallTop });

  // front panel, label holder and pull (outside the clip; they never pass behind the carcass)
  const front: Plan = { x: o.x0 + 0.7, y: FRONT_Y, w: w - 1.4, d: FRONT_D, r: 0.8 };
  const fz0 = o.z0 + 0.7;
  const fh = o.z1 - o.z0 - 1.4;
  const holderZ = o.z0 + 10.2;
  const holderH = 5.4;
  const holder: Plan = { x: o.cx - 11, y: FACE, w: 22, d: 0.7, r: 0.5 };
  const card: Plan = { x: o.cx - 9.4, y: FACE + 0.7, w: 18.8, d: 0.35, r: 0.2 };
  const cardFace = FACE + 1.05;
  const pullZ = o.z0 + 3;
  const pull = {
    posts: [o.cx - 13, o.cx + 13].map((x) => slab({ x: x - 1.3, y: FACE, w: 2.6, d: 3.4, r: 0.8 }, pullZ, 2.6, 3)),
    bar: slab({ x: o.cx - 15.5, y: FACE + 3.4, w: 31, d: 2.2, r: 1.1 }, pullZ - 0.2, 3, 4, 0.4),
  };

  return {
    clip,
    box,
    contents,
    nearWall,
    front: slab(front, fz0, fh, 3, 0.5),
    holder: slab(holder, holderZ, holderH, 2),
    card: slab(card, holderZ + 0.8, holderH - 1.6, 2),
    cardRules: join(
      [0, 1].map((row) => face([[o.cx - 7.4, cardFace, holderZ + 3.4 - row * 1.6], [o.cx + (row ? 2 : 6.4), cardFace, holderZ + 3.4 - row * 1.6]], false)),
    ),
    holderRivets: [at([o.cx - 10.2, FACE + 0.7, holderZ + holderH / 2]), at([o.cx + 10.2, FACE + 0.7, holderZ + holderH / 2])],
    pullPosts: pull.posts,
    pullBar: pull.bar,
  };
}

/* ── contents: one small, true-to-life set of things per tool ────────────── */

interface Area {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  z: number;
  top: number;
}

function contentsOf(index: number, a: Area): Item[] {
  const W = a.x1 - a.x0;
  const D = a.y1 - a.y0;
  const groups: Group[] = [];
  const add = (center: Point3, items: Item[]) => groups.push({ at: center, items });

  switch (index) {
    case 0: {
      // Project management: a kanban board, three lanes of cards
      const lw = W / 3;
      [1, 2].forEach((k) => {
        const x = a.x0 + k * lw - 0.4;
        add([x, a.y0 + D / 2, a.z], [{ t: "solid", paths: slab({ x, y: a.y0, w: 0.8, d: D, r: 0.3 }, a.z, 2.2, 2), tone: "mid" }]);
      });
      [3, 2, 1].forEach((count, lane) => {
        for (let j = 0; j < count; j++) {
          const plan: Plan = { x: a.x0 + lane * lw + 2, y: a.y0 + 2 + j * 11.5, w: lw - 4, d: 8.5, r: 0.8 };
          add([plan.x + plan.w / 2, plan.y + plan.d / 2, a.z], [
            { t: "solid", paths: slab(plan, a.z, 0.8, 3), tone: "hi" },
            { t: "line", d: lineOnTop([plan.x + 2, plan.y + 3], [plan.x + plan.w - 4, plan.y + 3], a.z + 0.8, P), tone: "lo", free: true },
            { t: "dots", points: [at([plan.x + plan.w - 2.4, plan.y + plan.d - 2.4, a.z + 0.8])], size: 0.9, tone: "mid" },
          ]);
        }
      });
      break;
    }
    case 1: {
      // Bill of materials: parts bins, each holding its components
      const cols = 4;
      const rows = 3;
      const bw = W / cols;
      const bd = D / rows;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const plan: Plan = { x: a.x0 + c * bw + 0.6, y: a.y0 + r * bd + 0.6, w: bw - 1.2, d: bd - 1.2, r: 1 };
          const h = 3;
          const parts = [0, 1, 2].map((k) => [plan.x + 3 + k * ((plan.w - 6) / 2), plan.y + plan.d / 2 + (k % 2 ? 1.5 : -1.5)] as Plane);
          add([plan.x + plan.w / 2, plan.y + plan.d / 2, a.z], [
            { t: "solid", paths: slab(plan, a.z, h, 3), tone: "mid" },
            { t: "line", d: planOutline(insetPlan(plan, 1.1), a.z + h, P, 3), tone: "faint" },
            ...parts.map(([x, y]) => ({ t: "solid" as const, paths: cyl(x, y, 1.15, a.z + h - 0.2, 1, 12), tone: "hi" as Tone })),
          ]);
        }
      break;
    }
    case 2: {
      // Version control: a stack of revision cards, each with its own tab
      for (let k = 0; k < 5; k++) {
        const z = a.z + k * 0.8;
        const plan: Plan = { x: a.x0 + 3 + k * 1.2, y: a.y0 + 4 + k * 1.4, w: 34, d: 24, r: 0.8 };
        const tab: Plan = { x: plan.x + plan.w - 0.4, y: a.y0 + 5 + k * 5.2, w: 3.4, d: 4.4, r: 0.6 };
        add([plan.x + plan.w / 2, plan.y + plan.d / 2, z], [
          { t: "solid", paths: slab(tab, z, 0.8, 2), tone: k === 4 ? "hi" : "mid" },
          { t: "solid", paths: slab(plan, z, 0.8, 3), tone: k === 4 ? "hi" : "mid" },
          ...(k === 4
            ? [0, 1, 2].map((row) => ({
                t: "line" as const,
                d: lineOnTop([plan.x + 4, plan.y + 5 + row * 3], [plan.x + (row === 1 ? 20 : 27), plan.y + 5 + row * 3], z + 0.8, P),
                tone: "lo" as Tone,
                free: true,
              }))
            : []),
        ]);
      }
      break;
    }
    case 3: {
      // Document storage: upright hanging folders with tabs
      for (let k = 0; k < 6; k++) {
        const y = a.y0 + 2 + k * 6;
        const h = Math.min(10, a.top - a.z - 1.2);
        add([a.x0 + W / 2, y, a.z], [
          { t: "solid", paths: slab({ x: a.x0 + 1, y, w: W - 2, d: 1, r: 0.3 }, a.z, h, 2), tone: "hi" },
          { t: "solid", paths: slab({ x: a.x0 + 4 + k * 6.4, y, w: 8, d: 1, r: 0.3 }, a.z + h, 1.8, 2), tone: "mid" },
        ]);
      }
      break;
    }
    case 4: {
      // Workflow tracking: stage pucks joined by a routed groove
      const y = a.y0 + D / 2;
      const xs = [0, 1, 2, 3].map((k) => a.x0 + 6 + k * ((W - 12) / 3));
      add([a.x0, y, a.z - 1], [{ t: "line", d: lineOnTop([xs[0], y], [xs[3], y], a.z, P), tone: "mid" }]);
      xs.forEach((x, k) => {
        add([x, y, a.z], [
          { t: "solid", paths: cyl(x, y, 4.4, a.z, 2.4, 28), tone: k === 3 ? "hi" : "mid" },
          { t: "line", d: ring(x, y, 2.6, a.z + 2.4, P, 20), tone: "faint" },
          ...(k === 3 ? [{ t: "line" as const, d: onTop([[x - 1.6, y], [x - 0.3, y + 1.3], [x + 1.8, y - 1.4]], a.z + 2.4, P), tone: "hi" as Tone }] : []),
        ]);
      });
      break;
    }
    case 5: {
      // Product lifecycle: concept → release, blocks growing at each stage
      for (let k = 0; k < 5; k++) {
        const plan: Plan = { x: a.x0 + 2 + k * (W / 5), y: a.y0 + 11, w: W / 5 - 3, d: 14, r: 1 };
        const h = 1.6 + k * 1.7;
        add([plan.x + plan.w / 2, plan.y + plan.d / 2, a.z], [
          { t: "solid", paths: slab(plan, a.z, h, 3, 0.4), tone: k === 4 ? "hi" : "mid" },
        ]);
      }
      break;
    }
    case 6: {
      // ISO standards: certificates and a rubber stamp
      const c1: Plan = { x: a.x0 + 1, y: a.y0 + 3, w: 24, d: 30, r: 0.6 };
      const c2: Plan = { x: a.x0 + 5, y: a.y0 + 6, w: 24, d: 30, r: 0.6 };
      add([c1.x + 12, c1.y + 15, a.z], [{ t: "solid", paths: slab(c1, a.z, 0.6, 2), tone: "mid" }]);
      add([c2.x + 12, c2.y + 15, a.z + 0.6], [
        { t: "solid", paths: slab(c2, a.z + 0.6, 0.6, 2), tone: "hi" },
        { t: "line", d: ring(c2.x + 17, c2.y + 22, 3.4, a.z + 1.2, P, 24), tone: "mid" },
        { t: "line", d: ring(c2.x + 17, c2.y + 22, 2.2, a.z + 1.2, P, 20), tone: "lo" },
        ...[0, 1, 2].map((row) => ({
          t: "line" as const,
          d: lineOnTop([c2.x + 4, c2.y + 5 + row * 3], [c2.x + (row === 1 ? 14 : 19), c2.y + 5 + row * 3], a.z + 1.2, P),
          tone: "lo" as Tone,
          free: true,
        })),
      ]);
      const sx = a.x1 - 9;
      const sy = a.y0 + 21;
      add([sx, sy, a.z + 6], [
        { t: "solid", paths: cyl(sx, sy, 5.4, a.z, 2.4, 28), tone: "mid" },
        { t: "solid", paths: cyl(sx, sy, 1.8, a.z + 2.4, 4.8, 16), tone: "mid" },
        { t: "solid", paths: cyl(sx, sy, 3.2, a.z + 7.2, 3.4, 24), tone: "hi" },
        { t: "line", d: knurl(sx, sy, 3.2, a.z + 7.2, a.z + 10.6, 22, P), tone: "lo" },
      ]);
      break;
    }
    default: {
      // Team collaboration: people tokens around a shared table
      const cx = a.x0 + W / 2;
      const cy = a.y0 + D / 2;
      add([cx, cy, a.z], [
        { t: "solid", paths: cyl(cx, cy, 8.5, a.z, 2, 36), tone: "mid" },
        { t: "line", d: ring(cx, cy, 6.2, a.z + 2, P, 32), tone: "faint" },
      ]);
      for (let k = 0; k < 6; k++) {
        const ang = (k / 6) * Math.PI * 2 + 0.3;
        const x = cx + Math.cos(ang) * 14.5;
        const y = cy + Math.sin(ang) * 12.5;
        add([x, y, a.z], [
          { t: "solid", paths: cyl(x, y, 2.6, a.z, 1.2, 18), tone: "mid" },
          { t: "solid", paths: cyl(x, y, 1.7, a.z + 1.2, 3.4, 16), tone: "hi" },
        ]);
      }
    }
  }
  return byDepth(groups);
}

export const DRAWERS = OPENINGS.map(drawerOf);
export const CAVITIES = OPENINGS.map(cavityOf);
