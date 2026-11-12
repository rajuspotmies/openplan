import {
  circleRing,
  cylinder,
  depthOf,
  extrude,
  haloOf,
  insetPlan,
  lineOnTop,
  pathOf,
  planOutline,
  ring,
  sideRing,
  slabOf,
  topTicks,
  type Plan,
  type Plane,
  type Point3,
  type SolidPaths,
  type Tone,
} from "@/components/iso/iso-kit";
import { P, at } from "../cabinet/view";

/*
 * Eight bench objects, one per platform feature. They share the cabinet's camera and bench mat
 * so every object reads at the same scale. World units are about 1 px; x/y on the floor, z up,
 * +y faces the viewer, +x is the lit right side.
 */

/* ── items ───────────────────────────────────────────────────────────────── */

export type Item =
  | { t: "solid"; paths: SolidPaths; tone: Tone; crease?: Tone | "none"; lit?: boolean; lk?: boolean; flat?: boolean; inner?: string }
  | { t: "line"; d: string; tone: Tone | "lit"; free?: boolean; dashed?: boolean }
  | { t: "dots"; points: Point3[]; size: number; tone?: Tone }
  | { t: "path"; d: string; cls: string }
  | { t: "g"; id?: string; clip?: string; items: Item[] };

type SolidOpts = { crease?: Tone | "none"; lit?: boolean; lk?: boolean; flat?: boolean; inner?: string };

export const S = (paths: SolidPaths, tone: Tone = "mid", o: SolidOpts = {}): Item => ({ t: "solid", paths, tone, ...o });
export const L = (d: string, tone: Tone | "lit" = "lo", o: { free?: boolean; dashed?: boolean } = {}): Item => ({ t: "line", d, tone, ...o });
export const D = (points: Point3[], size = 0.45, tone?: Tone): Item => ({ t: "dots", points, size, tone });
export const G = (items: Item[], o: { id?: string; clip?: string } = {}): Item => ({ t: "g", items, ...o });
export const F = (d: string, cls: string): Item => ({ t: "path", d, cls });

export const box = (x: number, y: number, w: number, d: number, z: number, h: number, r = 0.8, steps = 4, bevel = 0) =>
  slabOf({ x, y, w, d, r }, z, h, P, steps, bevel);
export const cyl = (cx: number, cy: number, r: number, z: number, h: number, steps = 24) => cylinder(cx, cy, r, z, h, P, steps);
export const poly = (pts: Point3[], closed = true) => pathOf(pts.map(at), closed);
export const join = (paths: string[]) => paths.filter(Boolean).join("");
export const halo = (plan: Plan, h = 6) => F(haloOf(plan, 0, h, P), "iso-halo");
export const depth = (p: Point3) => depthOf(p, P);

/** a rule on the front (y) plane */
export const frontRule = (x0: number, x1: number, y: number, z: number) => poly([[x0, y, z], [x1, y, z]], false);
/** a rectangle on the front (y) plane */
export const frontRect = (x0: number, x1: number, y: number, z0: number, z1: number) =>
  poly([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]]);
/** a rule on the top plane */
export const topRule = (x0: number, y0: number, x1: number, y1: number, z: number) => lineOnTop([x0, y0], [x1, y1], z, P);
/** a stadium slot on a vertical x-plane */
export function slotX(x: number, y0: number, y1: number, zc: number, r: number, steps = 8) {
  const pts: Point3[] = [];
  for (let s = 0; s <= steps; s++) {
    const a = Math.PI / 2 + (s / steps) * Math.PI;
    pts.push([x, y0 + r + Math.cos(a) * r, zc + Math.sin(a) * r]);
  }
  for (let s = 0; s <= steps; s++) {
    const a = -Math.PI / 2 + (s / steps) * Math.PI;
    pts.push([x, y1 - r + Math.cos(a) * r, zc + Math.sin(a) * r]);
  }
  return poly(pts);
}
export const plateScrews = (p: Plan, z: number, inset = 3): Point3[] => [
  [p.x + inset, p.y + inset, z],
  [p.x + p.w - inset, p.y + inset, z],
  [p.x + inset, p.y + p.d - inset, z],
  [p.x + p.w - inset, p.y + p.d - inset, z],
];
export const byDepth = (groups: { at: Point3; items: Item[] }[]) =>
  [...groups].sort((a, b) => depth(a.at) - depth(b.at)).flatMap((g) => g.items);

/* ── motion ──────────────────────────────────────────────────────────────── */

export type Ease = "io" | "i" | "o" | "step";
export interface Key {
  t: number;
  p?: Point3;
  o?: number;
  e?: Ease; // easing of the segment that ends at this key
}
export type Channel =
  | { kind: "move"; id: string; keys: Key[] }
  | { kind: "lit"; ids: string[]; steps: [number, number[]][] };

export interface Scene {
  name: string;
  label: string;
  items: Item[];
  period: number; // seconds per loop
  rest: number; // loop phase shown under reduced motion
  channels: Channel[];
}

/** keys that walk a part through `stops`, holding at each, then fade out, jump home and fade in */
export function tour(stops: Point3[], { hold = 0.6, travel = 0.4, fade = 0.25 }: { hold?: number; travel?: number; fade?: number } = {}) {
  const span = stops.length * hold + (stops.length - 1) * travel + fade * 2;
  const keys: Key[] = [{ t: 0, p: stops[0], o: 1 }];
  let now = 0;
  stops.forEach((p, i) => {
    if (i > 0) {
      now += travel;
      keys.push({ t: now, p, o: 1 });
    }
    now += hold;
    keys.push({ t: now, p, o: 1 });
  });
  now += fade;
  keys.push({ t: now, p: stops[stops.length - 1], o: 0 });
  keys.push({ t: now + 0.001, p: stops[0], o: 0, e: "step" });
  keys.push({ t: span, p: stops[0], o: 1 });
  keys.forEach((k) => (k.t /= span));
  // the time each stop is reached, as loop fractions
  const arrivals: number[] = [];
  let a = 0;
  stops.forEach((_, i) => {
    if (i > 0) a += travel;
    arrivals.push(a / span);
    a += hold;
  });
  return { keys, arrivals, span };
}

/* ── shared parts ────────────────────────────────────────────────────────── */

export function labelPlateFront(x: number, y: number, z: number, w: number, h: number): Item[] {
  return [
    S(box(x, y, w, 0.7, z, h, 0.3, 2), "lo", { crease: "none" }),
    L(frontRule(x + 3, x + w * 0.62, y + 0.7, z + h * 0.62), "lo", { free: true }),
    L(frontRule(x + 3, x + w * 0.42, y + 0.7, z + h * 0.34), "lo", { free: true }),
    D([[x + 1.4, y + 0.7, z + h / 2], [x + w - 1.4, y + 0.7, z + h / 2]], 0.4),
  ];
}

/* ── 01 Project management: a kanban board ───────────────────────────────── */

function kanban(): Scene {
  const COLS = [-46, 0, 46];
  const ROWS = [70, 52, 34, 16];
  const filled = [[0, 1, 2], [0, 1], [0, 1, 2]];
  const items: Item[] = [halo({ x: -76, y: -30, w: 152, d: 54, r: 4 })];

  for (const fx of [-64, 54]) {
    items.push(S(box(fx, -28, 10, 50, 0, 6, 1.6, 4, 0.6), "lo"), D([[fx + 5, 18, 6]], 0.45));
  }
  items.push(
    S(box(-72, -6, 144, 6, 6, 100, 1, 4, 0.8), "mid"),
    L(frontRect(-68, 68, 0, 11, 101), "faint"),
    D([[-70, 0, 9], [70, 0, 9], [-70, 0, 103], [70, 0, 103]], 0.45),
    S(box(-75, -7.5, 150, 9, 106, 4, 1.2, 4, 0.6), "mid"),
    D([[-71, 0.5, 110], [71, 0.5, 110]], 0.45),
  );
  for (const dx of [-23, 23]) items.push(S(box(dx - 0.6, 0, 1.2, 1, 14, 82, 0.2, 2), "lo", { crease: "none" }));
  COLS.forEach((cx, c) => {
    items.push(
      S(box(cx - 20, 0, 40, 1.5, 89, 8, 0.4, 2), "lo", { crease: "none" }),
      L(frontRule(cx - 15, cx + (c === 1 ? 0 : 5), 1.5, 93), "mid", { free: true }),
      D([[cx + 15, 1.5, 93]], 0.55),
    );
    filled[c].forEach((r) => items.push(...card(cx, ROWS[r], false)));
  });
  items.push(
    S(box(-60, 0, 120, 7, 6, 3, 0.6, 2), "lo"),
    S(box(-42, 1.6, 24, 3.4, 9, 3.4, 1.7, 6), "mid"),
    S(box(-18, 1.6, 6, 3.4, 9, 3.4, 1.7, 6), "lo"),
    S(box(12, 1.6, 24, 3.4, 9, 3.4, 1.7, 6), "mid"),
    S(box(36, 1.6, 6, 3.4, 9, 3.4, 1.7, 6), "lo"),
    G(card(COLS[0], ROWS[3], true), { id: "mv" }),
  );

  function card(cx: number, z: number, lit: boolean): Item[] {
    return [
      S(box(cx - 17, 0, 34, 2, z, 14, 0.4, 2), lit ? "hi" : "mid", { lit }),
      L(frontRule(cx - 12, cx + 9, 2, z + 9.5), lit ? "mid" : "lo", { free: true }),
      L(frontRule(cx - 12, cx + 3, 2, z + 6.5), "lo", { free: true }),
      L(frontRect(cx + 8, cx + 13, 2, z + 2.2, z + 5.2), lit ? "lit" : "lo"),
      D([[cx, 2, z + 12]], 0.55),
    ];
  }

  const lift = 6;
  const keys: Key[] = [
    { t: 0, p: [0, 0, 0], o: 1 },
    { t: 0.16, p: [0, 0, 0] },
    { t: 0.22, p: [0, lift, 0] },
    { t: 0.36, p: [46, lift, 18] },
    { t: 0.42, p: [46, 0, 18] },
    { t: 0.56, p: [46, 0, 18] },
    { t: 0.62, p: [46, lift, 18] },
    { t: 0.76, p: [92, lift, 0] },
    { t: 0.82, p: [92, 0, 0] },
    { t: 0.93, p: [92, 0, 0], o: 1 },
    { t: 0.97, p: [92, 0, 0], o: 0 },
    { t: 0.971, p: [0, 0, 0], o: 0, e: "step" },
    { t: 1, p: [0, 0, 0], o: 1 },
  ];
  return {
    name: "kanban",
    label: "A kanban board on two feet with three columns of cards. One card moves from the first column to the second and on to the third.",
    items,
    period: 9,
    rest: 0.5,
    channels: [{ kind: "move", id: "mv", keys }],
  };
}

/* ── 02 Bill of materials: a parts organiser and its BOM sheet ───────────── */

function bom(): Scene {
  const items: Item[] = [halo({ x: -94, y: -44, w: 110, d: 90, r: 3 }, 4), halo({ x: 26, y: -40, w: 70, d: 86, r: 2 }, 3)];
  items.push(S(box(-93, -43, 108, 88, 0, 4, 2, 4, 0.6), "lo"), L(planOutline(insetPlan({ x: -93, y: -43, w: 108, d: 88, r: 2 }, 1.6), 4, P), "faint"));

  const bins: { at: Point3; items: Item[] }[] = [];
  const Z0 = 4;
  const TOP = 22;
  const FLOOR = 13;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      const i = r * 4 + c;
      const x0 = -90 + c * 26;
      const y0 = -40 + r * 28;
      const w = 24;
      const dd = 26;
      const open = insetPlan({ x: x0, y: y0, w, d: dd, r: 1 }, 1.8);
      const openTop = planOutline(open, TOP, P, 2);
      const ox0 = open.x;
      const ox1 = open.x + open.w;
      const oy0 = open.y;
      const oy1 = open.y + open.d;
      const inside: Item[] = [
        F(openTop, "bn-floor"),
        F(poly([[ox0, oy0, FLOOR], [ox1, oy0, FLOOR], [ox1, oy0, TOP], [ox0, oy0, TOP]]), "bn-wall-a"),
        F(poly([[ox0, oy0, FLOOR], [ox0, oy1, FLOOR], [ox0, oy1, TOP], [ox0, oy0, TOP]]), "bn-wall-b"),
        L(poly([[ox0, oy1, FLOOR], [ox0, oy0, FLOOR], [ox1, oy0, FLOOR]], false), "faint"),
        ...contents(i % 6, x0 + w / 2, y0 + dd / 2),
      ];
      bins.push({
        at: [x0 + w / 2, y0 + dd / 2, Z0],
        items: [
          G(
            [
              S(box(x0, y0, w, dd, Z0, TOP - Z0, 1, 2, 0.5), "mid", { lk: true }),
              G(inside, { clip: openTop }),
              L(openTop, "mid"),
              ...labelPlateFront(x0 + w / 2 - 7, y0 + dd, 11, 14, 7),
            ],
            { id: `b${i}` },
          ),
        ],
      });
    }
  }
  items.push(...byDepth(bins));

  function contents(kind: number, cx: number, cy: number): Item[] {
    const z = FLOOR;
    const parts: { at: Point3; items: Item[] }[] = [];
    const put = (x: number, y: number, it: Item[]) => parts.push({ at: [x, y, z], items: it });
    if (kind === 0) {
      for (const [dx, dy] of [[-5, -5], [2, -6], [6, 1], [-3, 3], [3, 7], [-6, 8]]) {
        put(cx + dx, cy + dy, [S(cyl(cx + dx, cy + dy, 1.7, z, 1.3, 14), "mid"), L(topRule(cx + dx - 1, cy + dy, cx + dx + 1, cy + dy, z + 1.3), "lo")]);
      }
    } else if (kind === 1) {
      for (const dy of [-6, -1, 4, 9]) {
        put(cx, cy + dy, [
          S(box(cx - 5, cy + dy - 1.2, 10, 2.4, z, 2.2, 1.2, 4), "mid"),
          L(topRule(cx - 2, cy + dy - 1.2, cx - 2, cy + dy + 1.2, z + 2.2), "mid"),
          L(topRule(cx + 1, cy + dy - 1.2, cx + 1, cy + dy + 1.2, z + 2.2), "mid"),
        ]);
      }
    } else if (kind === 2) {
      for (const [dx, dy] of [[-4, -4], [4, -3], [-3, 5], [5, 6]]) {
        put(cx + dx, cy + dy, [S(cyl(cx + dx, cy + dy, 2.8, z, 5, 18), "mid"), L(ring(cx + dx, cy + dy, 1.6, z + 5, P, 14), "faint")]);
      }
    } else if (kind === 3) {
      for (const dy of [-5, 5]) {
        const ticks = join(
          [-3, -1, 1, 3].flatMap((dx) => [
            topRule(cx + dx, cy + dy - 3.5, cx + dx, cy + dy - 4.8, z + 0.2),
            topRule(cx + dx, cy + dy + 3.5, cx + dx, cy + dy + 4.8, z + 0.2),
          ]),
        );
        put(cx, cy + dy, [L(ticks, "mid"), S(box(cx - 5, cy + dy - 3.5, 10, 7, z, 1.6, 0.4, 2), "mid"), D([[cx - 3.4, cy + dy - 2, z + 1.6]], 0.35)]);
      }
    } else if (kind === 4) {
      for (const [dx, dy] of [[-4, -5], [4, -4], [-4, 4], [4, 5]]) {
        const hex: Plane[] = Array.from({ length: 6 }, (_, k) => [cx + dx + 3 * Math.cos((k * Math.PI) / 3), cy + dy + 3 * Math.sin((k * Math.PI) / 3)]);
        put(cx + dx, cy + dy, [S(extrude(hex, z, 1.8, P), "mid"), L(ring(cx + dx, cy + dy, 1.3, z + 1.8, P, 14), "lo")]);
      }
    } else {
      for (const [dx, dy] of [[-5, -5], [0, -2], [5, -6], [-4, 5], [4, 6]]) {
        put(cx + dx, cy + dy, [S(cyl(cx + dx, cy + dy, 2, z, 2.6, 14), "lo"), S(cyl(cx + dx, cy + dy, 1.5, z + 2.6, 1.8, 14), "mid")]);
      }
    }
    return byDepth(parts);
  }

  // clipboard with the BOM sheet
  const ROW0 = -22;
  const ROW = 7.4;
  items.push(
    S(box(26, -38, 70, 86, 0, 2.4, 2, 4), "lo"),
    S(box(30, -30, 62, 74, 2.4, 0.5, 0.4, 2), "hi", { crease: "none" }),
    L(planOutline({ x: 32, y: -28, w: 58, d: 70, r: 0 }, 2.9, P, 2), "faint"),
    L(topRule(36, -25, 62, -25, 2.9), "mid", { free: true }),
  );
  for (let k = 0; k < 9; k++) {
    const y = ROW0 + k * ROW;
    items.push(
      L(topRule(34, y + ROW, 88, y + ROW, 2.9), "faint"),
      L(planOutline({ x: 34.5, y: y + 2, w: 3.4, d: 3.4, r: 0 }, 2.9, P, 2), "lo"),
      L(topRule(41, y + 3.7, k % 3 === 1 ? 62 : 70, y + 3.7, 2.9), "lo", { free: true }),
      L(topRule(80, y + 3.7, 86, y + 3.7, 2.9), "lo", { free: true }),
    );
  }
  items.push(
    S(box(48, -41.5, 26, 9, 2.4, 4, 1.5, 4, 0.5), "mid"),
    S(cyl(61, -40.5, 2.6, 6.4, 2.4, 16), "mid"),
    D([[51, -37, 6.4], [71, -37, 6.4]], 0.45),
    G([S(box(32.5, ROW0 + 0.6, 57, ROW - 1.2, 2.9, 0.3, 0.4, 2), "mid", { lit: true, flat: true })], { id: "bar" }),
  );

  const order = [5, 2, 8, 11];
  const rows = [1, 3, 5, 7];
  const n = order.length;
  const keys: Key[] = [];
  const steps: [number, number[]][] = [];
  order.forEach((_, k) => {
    const t0 = k / n;
    keys.push({ t: t0 + 0.0001, p: [0, rows[(k + n - 1) % n] * ROW, 0] }, { t: t0 + 0.07, p: [0, rows[k] * ROW, 0] }, { t: t0 + 1 / n - 0.0002, p: [0, rows[k] * ROW, 0] });
    steps.push([t0 + 0.05, [order[k]]]);
  });
  keys[0].t = 0;
  keys.push({ t: 1, p: [0, rows[n - 1] * ROW, 0] });
  return {
    name: "bom",
    label: "A parts organiser with twelve bins of screws, resistors, capacitors, chips, nuts and LEDs, next to a clipboard with the bill of materials. One bin lights up with its row on the sheet.",
    items,
    period: 9,
    rest: 0.1,
    channels: [
      { kind: "move", id: "bar", keys },
      { kind: "lit", ids: Array.from({ length: 12 }, (_, i) => `b${i}`), steps },
    ],
  };
}

/* ── 03 Version control: a stack of revision plates on posts ─────────────── */

function revisions(): Scene {
  const BASE: Plan = { x: -70, y: -46, w: 110, d: 84, r: 2 };
  const PLATE: Plan = { x: -62, y: -38, w: 94, d: 68, r: 2 };
  const LEVELS = [16, 30, 44, 58, 72];
  const PH = 2;
  const POSTS: Plane[] = [[-57, -33], [27, -33], [-57, 25], [27, 25]];
  const items: Item[] = [
    halo(BASE, 6),
    S(box(BASE.x, BASE.y, BASE.w, BASE.d, 0, 6, 2, 4, 1), "mid"),
    L(planOutline(insetPlan(BASE, 4), 6, P), "faint"),
    D([[-66, 34, 6], [36, 34, 6], [36, -42, 6]], 0.45),
  ];
  const segs = (z0: number, z1: number) =>
    byDepth(POSTS.map(([x, y]) => ({ at: [x, y, z0] as Point3, items: [S(cyl(x, y, 2.2, z0, z1 - z0, 16), "mid")] })));
  items.push(...byDepth(POSTS.map(([x, y]) => ({ at: [x, y, 6] as Point3, items: [S(cyl(x, y, 3.8, 6, 1.6, 18), "lo")] }))));

  let prev = 7.6;
  LEVELS.forEach((z, k) => {
    items.push(...segs(prev, z));
    const top = z + PH;
    const X = PLATE.x;
    const Y = PLATE.y;
    const notch = 6 + k * 4;
    const outline = poly(
      [
        [X + 12, Y + 10, top],
        [X + 58, Y + 10, top],
        [X + 58, Y + 30, top],
        [X + 58 - notch, Y + 30, top],
        [X + 58 - notch, Y + 44, top],
        [X + 12, Y + 44, top],
      ],
      true,
    );
    const holes = join(Array.from({ length: Math.min(k + 1, 4) }, (_, h) => ring(X + 20 + h * 9, Y + 18, 2.4, top, P, 16)));
    items.push(
      G(
        [
          S(box(X, Y, PLATE.w, PLATE.d, z, PH, 2, 4, 0.4), "mid", { lk: true }),
          S(box(-58 + k * 18, 28, 14, 7, z, PH, 1, 4), "mid", { lk: true }),
          L(topRule(-55 + k * 18, 32, -48 + k * 18, 32, top), "lo", { free: true }),
        ],
        { id: `p${k}` },
      ),
      L(outline, "lo"),
      L(holes, "lo"),
      L(planOutline({ x: X + 66, y: Y + 48, w: 22, d: 14, r: 0 }, top, P, 2), "faint"),
      L(topRule(X + 69, Y + 53, X + 84, Y + 53, top), "lo", { free: true }),
      L(topRule(X + 69, Y + 57.5, X + 79, Y + 57.5, top), "lo", { free: true }),
    );
    prev = top;
  });
  // nuts on the top plate and post ends
  items.push(
    ...byDepth(
      POSTS.map(([x, y]) => ({
        at: [x, y, prev] as Point3,
        items: [S(cyl(x, y, 3.4, prev, 2.4, 6), "mid"), S(cyl(x, y, 1.6, prev + 2.4, 2.2, 14), "lo")],
      })),
    ),
  );
  // revision selector: a slider on a ticked rail in front of the base
  const ticks = topTicks(-62, 30, 3, 6, 44.6, 3, [1.6, 3], P);
  items.push(
    S(box(-66, 44, 100, 6, 0, 3, 1, 4, 0.4), "lo"),
    L(ticks.minor, "lo"),
    L(ticks.major, "mid"),
    G(
      [
        S(box(-57, 42, 12, 10, 3, 4.5, 1, 4, 0.4), "hi", { lit: true }),
        L(topRule(-51, 43.4, -51, 50.6, 7.5), "lit"),
        D([[-51, 43.4, 7.5]], 0.5),
      ],
      { id: "mv" },
    ),
  );

  const order = [4, 3, 2, 1, 0];
  const n = order.length;
  const keys: Key[] = [];
  const steps: [number, number[]][] = [];
  order.forEach((k, s) => {
    const t0 = s / n;
    const prevK = order[(s + n - 1) % n];
    keys.push({ t: t0 + 0.0001, p: [prevK * 18, 0, 0] }, { t: t0 + 0.08, p: [k * 18, 0, 0] }, { t: t0 + 1 / n - 0.0002, p: [k * 18, 0, 0] });
    steps.push([t0 + 0.06, [k]]);
  });
  keys[0].t = 0;
  keys.push({ t: 1, p: [order[n - 1] * 18, 0, 0] });
  return {
    name: "revisions",
    label: "Five revision plates stacked on four posts, each with an index tab and a slightly different part drawing. A slider on a ticked rail picks a revision and its plate lights up.",
    items,
    period: 10,
    rest: 0.1,
    channels: [
      { kind: "move", id: "mv", keys },
      { kind: "lit", ids: LEVELS.map((_, k) => `p${k}`), steps },
    ],
  };
}

/* ── 04 Document storage: a file box of hanging folders ──────────────────── */

function filebox(): Scene {
  const X0 = -62;
  const X1 = 56;
  const Y0 = -36;
  const Y1 = 34;
  const T = 3;
  const ZB = 4;
  const ZT = 52;
  const items: Item[] = [
    halo({ x: X0, y: Y0, w: X1 - X0, d: Y1 - Y0, r: 2 }, 6),
    S(box(X0, Y0, X1 - X0, Y1 - Y0, 0, ZB, 1.5, 4, 0.5), "lo"),
    S(box(X0, Y0, X1 - X0, T, ZB, ZT - ZB, 0.6, 2), "mid"),
    S(box(X0, Y0, T, Y1 - Y0, ZB, ZT - ZB, 0.6, 2), "mid"),
    S(box(X0, Y0, T, Y1 - Y0, ZT, 1.6, 0.6, 2), "lo"),
  ];
  const TABS = [-52, -26, 0, 22, -40, -14, 10];
  const folder = (i: number, lit: boolean): Item[] => {
    const y = -30 + i * 8.4;
    const tx = TABS[i];
    return [
      S(box(-56, y, 106, 1.6, 6, 52, 0.3, 2), lit ? "hi" : "mid", { lit, lk: lit }),
      S(box(tx, y, 20, 1.6, 58, 7, 0.6, 2), lit ? "hi" : "mid", { lit, lk: lit }),
      L(frontRule(tx + 3, tx + 13, y + 1.6, 61.5), lit ? "lit" : "lo", { free: true }),
      L(frontRule(-53, 47, y + 1.6, 53), "faint"),
      S(box(-59.5, y, 4, 1.6, 53.6, 2.2, 0.3, 2), "lo"),
    ];
  };
  for (let i = 0; i < 7; i++) items.push(i === 3 ? G(folder(i, true), { id: "mv" }) : G(folder(i, false)));
  items.push(
    S(box(X0, Y1 - T, X1 - X0, T, ZB, ZT - ZB, 0.6, 2), "mid"),
    ...labelPlateFront(-22, Y1, 26, 40, 13),
    S(box(X1 - T, Y0, T, Y1 - Y0, ZB, ZT - ZB, 0.6, 2), "mid"),
    S(box(X1 - T, Y0, T, Y1 - Y0, ZT, 1.6, 0.6, 2), "lo"),
    L(slotX(X1, -12, 12, 42, 3.2), "mid"),
    L(slotX(X1, -10.4, 10.4, 41.6, 1.8), "faint"),
    D([[X1, Y0 + 4, 10], [X1, Y1 - 4, 10]], 0.45),
  );
  // loose documents beside the box
  [[0, 0], [2.5, -2.5], [-1, 1.5]].forEach(([dx, dy], k) => {
    items.push(S(box(66 + dx, -4 + dy, 34, 46, k * 0.6, 0.6, 0.3, 2), "hi", { crease: "none" }));
  });
  items.push(
    L(topRule(70, 3, 92, 3, 1.8), "mid", { free: true }),
    ...[9, 13, 17, 21, 25, 29].map((y, k) => L(topRule(70, y, k % 2 ? 88 : 94, y, 1.8), "lo", { free: true })),
    S(box(88, -3.5, 3, 10, 1.8, 0.8, 0.4, 2), "mid"),
  );
  const keys: Key[] = [
    { t: 0, p: [0, 0, 0] },
    { t: 0.12, p: [0, 0, 0] },
    { t: 0.32, p: [0, 0, 30], e: "io" },
    { t: 0.68, p: [0, 0, 30] },
    { t: 0.88, p: [0, 0, 0], e: "io" },
    { t: 1, p: [0, 0, 0] },
  ];
  return {
    name: "filebox",
    label: "An open file box holding seven hanging folders with staggered index tabs, beside a short stack of loose documents. The highlighted folder lifts out and drops back.",
    items,
    period: 6,
    rest: 0.5,
    channels: [{ kind: "move", id: "mv", keys }],
  };
}

/* ── 05 Workflow tracking: a carriage on a track through station gates ───── */

function workflow(): Scene {
  const GATES = [-42, 6, 54];
  const items: Item[] = [halo({ x: -92, y: -22, w: 184, d: 44, r: 3 }, 4)];
  const ticks = topTicks(-84, 84, 4, 5, 26.6, 0.6, [2, 3.8], P);
  items.push(S(box(-88, 26, 176, 7, 0, 0.6, 1, 3), "lo", { crease: "none" }), L(ticks.minor, "lo"), L(ticks.major, "mid"));

  const back: { at: Point3; items: Item[] }[] = [];
  const front: { at: Point3; items: Item[] }[] = [];
  const tops: { at: Point3; items: Item[] }[] = [];
  GATES.forEach((gx, g) => {
    back.push({ at: [gx, -17, 0], items: [S(box(gx - 3, -19, 6, 5, 0, 46, 0.8, 4, 0.4), "mid"), S(box(gx - 5, -21, 10, 9, 0, 2, 1, 4), "lo")] });
    front.push({
      at: [gx, 17, 0],
      items: [S(box(gx - 5, 12, 10, 9, 0, 2, 1, 4), "lo"), S(box(gx - 3, 14, 6, 5, 0, 46, 0.8, 4, 0.4), "mid"), D([[gx, 19, 6]], 0.4)],
    });
    tops.push({
      at: [gx, 0, 46],
      items: [
        S(box(gx - 4, -20, 8, 40, 46, 7, 1, 4, 0.5), "mid"),
        ...labelPlateFront(gx - 3.4, 20, 47.4, 6.8, 4.2).slice(0, 1),
        G([S(cyl(gx, 0, 3.4, 53, 1.4, 18), "lo"), S(cyl(gx, 0, 2.4, 54.4, 3, 18), "mid", { lk: true })], { id: `l${g}` }),
        D([[gx, -17, 53], [gx, 17, 53]], 0.45),
      ],
    });
  });
  items.push(
    ...byDepth(back),
    S(box(-90, -10, 180, 20, 0, 5, 1.5, 4, 0.5), "lo"),
    S(box(-88, -7, 176, 3, 5, 2, 0.6, 2), "mid"),
    S(box(-88, 4, 176, 3, 5, 2, 0.6, 2), "mid"),
    S(box(-90, -10, 4, 20, 5, 6, 0.8, 2), "mid"),
    S(box(86, -10, 4, 20, 5, 6, 0.8, 2), "mid"),
    G(
      [
        S(box(-86, -9, 16, 18, 7, 5, 1, 4, 0.4), "mid"),
        L(sideRing([-82, 9, 9.5], 1.8, "y", P, 16), "lo"),
        L(sideRing([-74, 9, 9.5], 1.8, "y", P, 16), "lo"),
        S(box(-84, -7, 12, 14, 12, 8, 1, 4, 0.4), "hi", { lit: true }),
        L(topRule(-82, -3, -75, -3, 20), "mid", { free: true }),
        L(topRule(-82, 0.5, -77, 0.5, 20), "lo", { free: true }),
        L(frontRule(-81, -75, 7, 16), "lo", { free: true }),
      ],
      { id: "mv" },
    ),
    ...byDepth(front),
    ...byDepth(tops),
  );
  const stops: Point3[] = [[0, 0, 0], [36, 0, 0], [84, 0, 0], [132, 0, 0], [160, 0, 0]];
  const { keys, arrivals } = tour(stops, { hold: 0.55, travel: 0.45, fade: 0.25 });
  const steps: [number, number[]][] = [
    [0, []],
    [arrivals[1], [0]],
    [arrivals[2], [0, 1]],
    [arrivals[3], [0, 1, 2]],
    [keys[keys.length - 3].t, []],
  ];
  return {
    name: "workflow",
    label: "A carriage runs on a ticked track through three station gates. Each gate's lamp lights as the work item passes its stage.",
    items,
    period: 9,
    rest: 0.55,
    channels: [
      { kind: "move", id: "mv", keys },
      { kind: "lit", ids: GATES.map((_, g) => `l${g}`), steps },
    ],
  };
}

/* ── 06 Lifecycle management: four stage steps and a token that climbs ───── */

function lifecycle(): Scene {
  const STEPS = [
    { y0: 22, y1: 46, h: 12 },
    { y0: -2, y1: 22, h: 26 },
    { y0: -26, y1: -2, h: 40 },
    { y0: -50, y1: -26, h: 54 },
  ];
  const items: Item[] = [halo({ x: -58, y: -52, w: 116, d: 100, r: 3 }, 8)];
  for (let k = 3; k >= 0; k--) {
    const s = STEPS[k];
    const pips: Point3[] = Array.from({ length: k + 1 }, (_, j) => [-8 + j * 4, s.y1, s.h - 6]);
    items.push(
      S(box(-56, s.y0, 112, s.y1 - s.y0, 0, s.h, 1, 4, 0.6), "mid"),
      L(topRule(-53, s.y1 - 3, 53, s.y1 - 3, s.h), "faint"),
      L(topRule(-53, s.y1 - 5, 53, s.y1 - 5, s.h), "faint"),
      G(labelPlateFront(-46, s.y1, s.h - 9, 30, 6).map((it, j) => (j === 0 && it.t === "solid" ? { ...it, lk: true } : it)), { id: `s${k}` }),
      D(pips, 0.55, "mid"),
      L(frontRule(36, 52, s.y1, s.h - 3), "faint"),
      S(cyl(-50, (s.y0 + s.y1) / 2, 2.6, s.h, 1.4, 14), "lo"),
      S(cyl(-50, (s.y0 + s.y1) / 2, 1.3, s.h + 1.4, 16.6, 12), "mid"),
    );
    if (k === 3) {
      items.push(
        S(cyl(40, -38, 3, 54, 1.6, 16), "lo"),
        S(cyl(40, -38, 1.1, 55.6, 30, 10), "mid"),
        S(box(41, -38.5, 18, 1, 74, 11, 0.2, 2), "hi"),
        L(frontRule(44, 54, -37.5, 79.5), "lo", { free: true }),
      );
    }
  }
  const rail: Point3[] = STEPS.map((s) => [-50, (s.y0 + s.y1) / 2, s.h + 18]);
  items.push(L(poly(rail, false), "mid"), D(rail, 0.6));

  const pos = STEPS.map((s) => [0, (s.y0 + s.y1) / 2 - 34, s.h - 12] as Point3);
  items.push(
    G(
      [
        S(cyl(12, 34, 6, 12, 3, 24), "mid"),
        S(cyl(12, 34, 4.4, 15, 4.6, 24), "hi", { lit: true }),
        L(ring(12, 34, 2.4, 19.6, P, 16), "lit"),
      ],
      { id: "mv" },
    ),
  );
  const keys: Key[] = [{ t: 0, p: pos[0], o: 1 }];
  const steps: [number, number[]][] = [[0, [0]]];
  const hop = 0.21;
  for (let k = 1; k < 4; k++) {
    const t0 = 0.08 + (k - 1) * hop;
    const a = pos[k - 1];
    const b = pos[k];
    keys.push(
      { t: t0, p: a },
      { t: t0 + 0.04, p: [0, (a[1] + b[1]) / 2, b[2] + 9], e: "o" },
      { t: t0 + 0.08, p: b, e: "i" },
    );
    steps.push([t0 + 0.08, [k]]);
  }
  keys.push({ t: 0.9, p: pos[3], o: 1 }, { t: 0.95, p: pos[3], o: 0 }, { t: 0.951, p: pos[0], o: 0, e: "step" }, { t: 1, p: pos[0], o: 1 });
  steps.push([0.951, [0]]);
  return {
    name: "lifecycle",
    label: "Four steps for concept, prototype, production and release, with a handrail and a flag on the top step. A token climbs one stage at a time.",
    items,
    period: 8,
    rest: 0.5,
    channels: [
      { kind: "move", id: "mv", keys },
      { kind: "lit", ids: STEPS.map((_, k) => `s${k}`), steps },
    ],
  };
}

/* ── 07 ISO standards: a stamp press sealing a certificate ───────────────── */

function stamp(): Scene {
  const BASE: Plan = { x: -60, y: -50, w: 116, d: 96, r: 2 };
  const AX = 4;
  const AY = 12;
  const items: Item[] = [
    halo(BASE, 8),
    S(box(BASE.x, BASE.y, BASE.w, BASE.d, 0, 8, 2, 4, 1), "mid"),
    L(planOutline(insetPlan(BASE, 4), 8, P), "faint"),
    D(plateScrews(BASE, 8, 7.5), 0.45),
  ];
  // spare certificates and an ink pad
  [0, 1, 2].forEach((k) => items.push(S(box(26 + k, -36 + k * 1.5, 24, 30, 8 + k * 0.6, 0.6, 0.3, 2), "hi", { crease: "none" })));
  items.push(
    L(topRule(30, -26, 44, -26, 9.8), "lo", { free: true }),
    L(topRule(30, -22, 40, -22, 9.8), "lo", { free: true }),
    S(box(26, 18, 24, 18, 8, 4, 1.5, 4, 0.5), "lo"),
    F(planOutline({ x: 28.5, y: 20.5, w: 19, d: 13, r: 1 }, 12, P, 3), "bn-ink"),
    // column
    S(box(-6, -44, 20, 18, 8, 100, 1.5, 4, 0.8), "mid", { inner: frontRule(-6, 14, -26, 20) + frontRule(-6, 14, -26, 96) }),
    ...labelPlateFront(-3, -26, 60, 14, 9),
    // certificate
    S(box(-40, -20, 62, 48, 8, 0.6, 0.4, 2), "hi", { crease: "none" }),
    L(planOutline({ x: -37, y: -17, w: 56, d: 42, r: 0 }, 8.6, P, 2), "faint"),
    L(topRule(-30, -11, -4, -11, 8.6), "mid", { free: true }),
    ...[-5, -1, 3, 7].map((y, k) => L(topRule(-33, y, k === 3 ? -14 : -9, y, 8.6), "lo", { free: true })),
    L(topRule(-33, 20, -16, 20, 8.6), "mid", { free: true }),
  );
  const seal = ring(AX, AY, 7, 8.6, P, 32) + ring(AX, AY, 5, 8.6, P, 28);
  const star = join(
    Array.from({ length: 5 }, (_, k) => {
      const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
      return topRule(AX, AY, AX + 3.6 * Math.cos(a), AY + 3.6 * Math.sin(a), 8.6);
    }),
  );
  items.push(G([L(seal, "lit"), L(star, "lit"), D([[AX, AY, 8.6]], 0.6)], { id: "seal" }));
  // plunger (moves) then the collar and arm that hold it
  const knurlLines = join(
    circleRing(AX, AY, 9, 36)
      .map(([x, y], k): string => {
        const nx = x - AX;
        const ny = y - AY;
        const facing = (nx * Math.cos((58 * Math.PI) / 180) + ny * Math.sin((58 * Math.PI) / 180)) / 9;
        return facing > 0.15 && k % 2 === 0 ? poly([[x, y, 37.5], [x, y, 42.5]], false) : "";
      }),
  );
  items.push(
    G(
      [
        S(cyl(AX, AY, 2.4, 44, 58, 16), "mid"),
        S(cyl(AX, AY, 10, 34, 2, 32), "lo", { lk: true, lit: true }),
        S(cyl(AX, AY, 9, 36, 8, 32), "mid"),
        L(knurlLines, "faint"),
      ],
      { id: "mv" },
    ),
    S(cyl(AX, AY, 5.5, 100, 8, 24), "mid"),
    S(box(-8, -46, 24, 70, 108, 12, 2, 4, 0.8), "mid"),
    L(topRule(-4, -40, -4, 18, 120), "faint"),
    L(topRule(12, -40, 12, 18, 120), "faint"),
    D([[-4, -42, 120], [12, -42, 120], [-4, 20, 120], [12, 20, 120]], 0.45),
    S(box(16, 9, 22, 6, 111, 5, 1.5, 4), "mid"),
    S(cyl(41, 12, 4.4, 108.5, 8, 20), "lo"),
  );
  const keys: Key[] = [
    { t: 0, p: [0, 0, 0] },
    { t: 0.2, p: [0, 0, 0] },
    { t: 0.36, p: [0, 0, -25.4], e: "i" },
    { t: 0.46, p: [0, 0, -25.4] },
    { t: 0.66, p: [0, 0, 0], e: "io" },
    { t: 1, p: [0, 0, 0] },
  ];
  const sealKeys: Key[] = [
    { t: 0, p: [0, 0, 0], o: 0 },
    { t: 0.359, o: 0, p: [0, 0, 0] },
    { t: 0.37, o: 1, p: [0, 0, 0] },
    { t: 0.9, o: 1, p: [0, 0, 0] },
    { t: 0.98, o: 0, p: [0, 0, 0] },
    { t: 1, o: 0, p: [0, 0, 0] },
  ];
  return {
    name: "stamp",
    label: "A bench stamp press over a certificate, with spare certificates and an ink pad. The plunger presses down and leaves a seal on the certificate.",
    items,
    period: 6,
    rest: 0.75,
    channels: [
      { kind: "move", id: "mv", keys },
      { kind: "move", id: "seal", keys: sealKeys },
    ],
  };
}

/* ── 08 Team collaboration: a round table with team tokens around a hub ──── */

function team(): Scene {
  const CX = 4;
  const CY = 8;
  const TOP = 38;
  const N = 6;
  const R = 42;
  const angle = (i: number) => (-90 + i * 60 + 30) * (Math.PI / 180);
  const seat = (i: number): Plane => [CX + R * Math.cos(angle(i)), CY + R * Math.sin(angle(i))];
  const items: Item[] = [
    F(haloOf({ x: CX - 56, y: CY - 56, w: 112, d: 112, r: 56 }, 0, 6, P), "iso-halo"),
    S(cyl(CX, CY, 28, 0, 3, 40), "lo"),
    L(ring(CX, CY, 24, 3, P, 40), "faint"),
    S(cyl(CX, CY, 6, 3, 31, 24), "mid"),
    S(cyl(CX, CY, 56, 34, 4, 64), "mid"),
    L(ring(CX, CY, 52, TOP, P, 64), "faint"),
  ];
  const traces = join(
    Array.from({ length: N }, (_, i) => {
      const a = angle(i);
      return topRule(CX + 13 * Math.cos(a), CY + 13 * Math.sin(a), CX + (R - 7.5) * Math.cos(a), CY + (R - 7.5) * Math.sin(a), TOP);
    }),
  );
  items.push(L(traces, "lo", { dashed: true }));
  // the pulse: one dot that runs from the hub to each teammate in turn
  const start = (i: number): Point3 => [13 * Math.cos(angle(i)), 13 * Math.sin(angle(i)), 0];
  const end = (i: number): Point3 => [(R - 8) * Math.cos(angle(i)), (R - 8) * Math.sin(angle(i)), 0];
  items.push(G([S(cyl(CX, CY, 1.7, TOP, 1.2, 14), "hi", { lit: true })], { id: "q" }));

  const groups: { at: Point3; items: Item[] }[] = [
    {
      at: [CX, CY, TOP],
      items: [
        S(cyl(CX, CY, 12, TOP, 4, 36), "mid"),
        L(ring(CX, CY, 9, TOP + 4, P, 32), "faint"),
        S(cyl(CX, CY, 5.5, TOP + 4, 3, 24), "hi", { lit: true }),
        D([[CX - 9.5, CY, TOP + 4], [CX + 9.5, CY, TOP + 4], [CX, CY - 9.5, TOP + 4], [CX, CY + 9.5, TOP + 4]], 0.4),
      ],
    },
  ];
  for (let i = 0; i < N; i++) {
    const [x, y] = seat(i);
    groups.push({
      at: [x, y, TOP],
      items: [
        G(
          [
            S(cyl(x, y, 6.4, TOP, 2.2, 24), "lo", { lk: true }),
            S(cyl(x, y, 3.2, TOP + 2.2, 8, 18), "mid"),
            S(cyl(x, y, 4.8, TOP + 10.2, 5, 22), "mid", { lk: true }),
            L(ring(x, y, 2.6, TOP + 15.2, P, 16), "faint"),
          ],
          { id: `m${i}` },
        ),
      ],
    });
  }
  items.push(...byDepth(groups));

  const order = [0, 3, 1, 4, 2, 5];
  const n = order.length;
  const keys: Key[] = [];
  const steps: [number, number[]][] = [];
  order.forEach((i, k) => {
    const t0 = k / n;
    const seg = 1 / n;
    keys.push(
      { t: t0 + 0.0001, p: start(i), o: 0, e: "step" },
      { t: t0 + seg * 0.12, p: start(i), o: 1 },
      { t: t0 + seg * 0.62, p: end(i), o: 1, e: "io" },
      { t: t0 + seg * 0.72, p: end(i), o: 0 },
      { t: t0 + seg - 0.0002, p: end(i), o: 0 },
    );
    steps.push([t0 + seg * 0.6, [i]]);
  });
  keys[0].t = 0;
  keys.push({ t: 1, p: end(order[n - 1]), o: 0 });
  return {
    name: "team",
    label: "A round table with six team tokens around a central hub, joined by traces. A pulse runs from the hub to each teammate in turn and lights them up.",
    items,
    period: 9,
    rest: 0.1,
    channels: [
      { kind: "move", id: "q", keys },
      { kind: "lit", ids: Array.from({ length: N }, (_, i) => `m${i}`), steps },
    ],
  };
}

export const SCENES: Scene[] = [kanban(), bom(), revisions(), filebox(), workflow(), lifecycle(), stamp(), team()];
