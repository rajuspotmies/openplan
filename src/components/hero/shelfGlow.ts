/*
 * ShelfGlow: the hero background engine (canvas 2D).
 *
 * A perspective store room: shelves receding to a vanishing point, sparsely stocked with hairline
 * wireframe electronics (phones, tablets, monitors, routers, speakers, NAS boxes, meters, boards),
 * part tags on the shelf lips and a dotted back wall. Everything rests at ~8% white.
 *
 * A soft light follows the pointer (with a slower trailing light behind it); inside it the same
 * drawing is revealed glowing, with a brighter core near the centre, grid dots that twinkle and
 * dust that drifts up through the beam. On load the light sweeps once across the screen; on touch
 * screens it drifts on its own and keeps clear of the copy. A large industrial robot arm stands on
 * a shelf and reaches toward the pointer on springs (2-link IK), with a reticle where it reaches.
 * Clicking sends a ring of light across the shelves.
 */

type Layer = "grid" | "back" | "shelf" | "prod" | "detail";
type P3 = [number, number, number];
type Dot = { x: number; y: number; s: number; sp: boolean; ph: number; fq: number };

const LAYERS: Record<Layer, [base: number, lit: number]> = {
  grid: [0.45, 0.5],
  back: [0.38, 0.55],
  shelf: [1, 0.95],
  prod: [1, 1],
  detail: [0.85, 1],
};
const ORDER = Object.keys(LAYERS) as Layer[];

export const CONFIG = {
  bg: "#151516",
  glow: "#3D68FF", // brand blue (#2F5BFF), a touch lighter so it reads as light on the dark ground
  core: "#D8E1FF",
  baseRGB: "228,228,234",
  baseAlpha: 0.085,
  radius: 0.3,
  minRadius: 140,
  maxRadius: 340,
  follow: 6.5,
  trailFollow: 2.4,
  fadeIn: 5,
  fadeOut: 2.2,
  glowBlur: 14,
  seed: 11,
  maxDpr: 2,
  maxPixels: 5.5e6,
};

const AIM = { gaze: 4.5, spring: 6, topSpeed: 200, ambient: 0.32 };
const RIPPLE = { duration: 2.4, width: 110, alpha: 0.55, max: 6 };
const DEG = Math.PI / 180;
/** where the arm rests: turned toward the headline, reaching up and out */
const REST = { yaw: -62, phi: 38, reach: 1.55 };
/** the arm fades out this long after the pointer stops moving */
const IDLE_MS = 2200;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

function mulberry(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function strokeLines(ctx: CanvasRenderingContext2D, lines: number[][]) {
  ctx.beginPath();
  for (const l of lines) {
    ctx.moveTo(l[0], l[1]);
    for (let i = 2; i < l.length; i += 2) ctx.lineTo(l[i], l[i + 1]);
  }
  ctx.stroke();
}
function fillDots(ctx: CanvasRenderingContext2D, dots: Dot[], k: number) {
  ctx.beginPath();
  for (const d of dots) {
    const s = d.s * k;
    ctx.rect(d.x - s / 2, d.y - s / 2, s, s);
  }
  ctx.fill();
}

/* ------------------------------------------------------------------ products */

/** Profile radius along a lathe's height: [t, r] pairs, t 0 (base) → 1 (top). */
type Profile = [number, number][];

const PROFILES: Record<string, Profile> = {
  // servo motor: body, collar, flange, shaft
  motor: [[0, 0.9], [0.04, 1], [0.66, 1], [0.665, 0.92], [0.7, 0.92], [0.705, 1], [0.8, 1], [0.82, 0.62], [0.88, 0.62], [0.885, 0.16], [1, 0.16]],
  // spark plug: threads, hex, insulator, terminal
  spark: [[0, 0.6], [0.05, 0.8], [0.3, 0.8], [0.32, 1.6], [0.42, 1.6], [0.44, 1.1], [0.88, 0.95], [0.92, 0.6], [1, 0.45]],
};

function profileAt(p: Profile, t: number) {
  if (t <= p[0][0]) return p[0][1];
  for (let i = 1; i < p.length; i++)
    if (t <= p[i][0]) {
      const [t0, r0] = p[i - 1];
      const [t1, r1] = p[i];
      return t1 === t0 ? r1 : lerp(r0, r1, (t - t0) / (t1 - t0));
    }
  return p[p.length - 1][1];
}

/** Label patterns, dotted onto a product's face. */
function pattern(kind: string, x: number, y: number, ph: number) {
  switch (kind) {
    case "emblem": {
      const r = Math.hypot(1.15 * x, y);
      return r < 0.62 ? (r > 0.46 ? 1.6 : 1) : +(Math.abs(y) > 0.86);
    }
    case "stripes":
      return 1.2 * +((((2.2 * x + 1.4 * y) % 1) + 1) % 1 < 0.42);
    case "wave":
      return 1.2 * +(y > 0.38 * Math.sin(3.6 * x + ph));
    case "band":
      return Math.abs(y) < 0.32 ? 1.5 : +(Math.abs(y) > 0.8);
    case "checker":
      return (Math.floor((x + 1) * 3) + Math.floor((y + 1) * 3)) % 2 ? 1.3 : 0;
    default:
      return 1;
  }
}
const PATTERNS = ["emblem", "stripes", "wave", "band", "checker", "full"];

const DIGITS: Record<string, string> = {
  0: "111101101101111", 1: "010110010010111", 2: "111001111100111", 3: "111001111001111", 4: "101101111001001",
  5: "111100111001111", 6: "111100111101111", 7: "111001010010010", 8: "111101111101111", 9: "111101111001111",
};

export type Scene = {
  lines: Record<Layer, number[][]>;
  dots: Dot[];
  P: (x: number, y: number, z: number) => [number, number];
  cam: { x: number; y: number; z: number; sc: number } | null;
};

function buildScene(W: number, H: number, seed: number, compact: boolean): Scene {
  const rnd = mulberry(seed);
  const rr = (a: number, b: number) => a + (b - a) * rnd();
  const u = 0.5 * W, f = 0.4 * H, m = 0.85 * Math.max(W, H);
  const P = (x: number, y: number, z: number): [number, number] => {
    const s = m / (m + z);
    return [u + (x - u) * s, f + (y - f) * s];
  };
  const lines: Record<Layer, number[][]> = { grid: [], back: [], shelf: [], prod: [], detail: [] };
  const dots: Dot[] = [];
  const poly = (layer: Layer, pts: P3[], close = false) => {
    const out: number[] = [];
    for (const p of pts) out.push(...P(p[0], p[1], p[2]));
    if (close) out.push(out[0], out[1]);
    lines[layer].push(out);
  };
  const seg = (layer: Layer, a: P3, b: P3) => poly(layer, [a, b]);
  const dot = (x: number, y: number, z: number, s: number, sp: boolean) => {
    const [px, py] = P(x, y, z);
    if (px < -4 || px > W + 4 || py < -4 || py > H + 4) return;
    dots.push({ x: px, y: py, s, sp, ph: 6.283 * rnd(), fq: rr(1.4, 3.6) });
  };

  const C = clamp(Math.round(H / 260), H < 480 ? 2 : 3, 4);
  const T = H / (C + 0.28);
  const k = clamp(0.075 * T, 7, 16);
  const I = 0.85 * T;
  const R = (t: number) => T * (t + 0.94);
  const A = -0.3 * W, S = 1.3 * W;
  const L = m / (m + I);
  const O = u - u / L - 30, Pr = u + (W - u) / L + 30, B = f - f / L - 30, F = f + (H - f) / L + 30;

  // dotted back wall
  const sp = clamp(0.09 * T, 14, 24);
  for (let t = 0; t <= C; t++) {
    const y0 = t === 0 ? B : R(t - 1) + k, y1 = t === C ? F : R(t);
    for (let y = y0 + 0.6 * sp; y < y1 - 4; y += sp)
      for (let x = Math.ceil(O / sp) * sp; x < Pr; x += sp) dot(x, y, I, 1.1, rnd() < 0.12);
  }
  // uprights: twin rails with a dashed run between
  const bay = 2.7 * T, rail = clamp(0.05 * T, 6, 12);
  for (let x = u - bay / 2 - Math.ceil((u - O) / bay) * bay; x < Pr; x += bay) {
    const z = I - 1;
    seg("shelf", [x - rail / 2, B, z], [x - rail / 2, F, z]);
    seg("shelf", [x + rail / 2, B, z], [x + rail / 2, F, z]);
    for (let y = B; y < F; y += 1.7 * rail) seg("detail", [x, y, z], [x, y + 0.7 * rail, z]);
  }
  // shelves
  const G = clamp(0.22 * T, 34, 60);
  for (let t = 0; t < C; t++) {
    const e = R(t);
    seg("shelf", [A, e, 0], [S, e, 0]);
    seg("shelf", [A, e + k, 0], [S, e + k, 0]);
    seg("grid", [O, e, I], [Pr, e, I]);
    seg("grid", [O, e + k, I], [Pr, e + k, I]);
    for (let x = Math.ceil(A / G) * G; x < S; x += G) seg("grid", [x, e, 0], [x, e, I]);
  }

  /* a turned part: rings at `rings`, meridians, optional dotted label band and lid rings */
  function lathe(
    cx: number, base: number, cz: number, h: number, rad: number, prof: Profile, rings: number[],
    o: { meridians: number; band?: [number, number]; pat?: string; ph?: number; step?: number; lid?: number[] },
  ) {
    const segs = clamp(Math.ceil((Math.PI * rad) / 2.5), 12, 44);
    const topSeen = base - h > f, bottomSeen = base < f;
    const front: number[] = [];
    for (const t of rings) {
      const r = rad * profileAt(prof, t), y = base - t * h;
      const a: P3[] = [], b: P3[] = [];
      for (let i = 0; i <= segs; i++) {
        const s = Math.PI + (Math.PI * i) / segs, q = (Math.PI * i) / segs;
        a.push([cx + Math.cos(s) * r, y, cz + Math.sin(s) * r]);
        b.push([cx + Math.cos(q) * r, y, cz + Math.sin(q) * r]);
      }
      poly("prod", a);
      poly((t > 0.98 && topSeen) || (t < 0.02 && bottomSeen) ? "prod" : "back", b);
      front.push(t);
    }
    if (o.lid)
      for (const l of o.lid) {
        const r = rad * profileAt(prof, 1) * l, y = base - h, a: P3[] = [];
        for (let i = 0; i <= segs; i++) {
          const s = (2 * Math.PI * i) / segs;
          a.push([cx + Math.cos(s) * r, y, cz + Math.sin(s) * r]);
        }
        poly(topSeen ? "detail" : "back", a);
      }
    const ts = new Set(prof.map((p) => p[0]));
    const steps = clamp(Math.ceil(h / 4), 12, 40);
    for (let i = 0; i <= steps; i++) ts.add(i / steps);
    const sorted = [...ts].sort((a, b) => a - b);
    for (let i = 0; i < o.meridians; i++) {
      const e = (i / o.meridians) * Math.PI * 2;
      poly(
        Math.sin(e) < 1e-6 ? "prod" : "back",
        sorted.map((t) => {
          const r = rad * profileAt(prof, t);
          return [cx + Math.cos(e) * r, base - t * h, cz + Math.sin(e) * r] as P3;
        }),
      );
    }
    if (o.band && o.pat) {
      const [t0, t1] = o.band, step = o.step ?? 5;
      for (let t = t0; t <= t1 + 1e-6; t += step / h) {
        const r = rad * profileAt(prof, t), y = base - t * h;
        const n = Math.max(4, Math.floor((Math.PI * r) / step));
        for (let i = 1; i < n; i++) {
          const a = Math.PI + (Math.PI * i) / n;
          const v = pattern(o.pat, (i / n) * 2 - 1, ((t - t0) / (t1 - t0)) * 2 - 1, o.ph ?? 0);
          if (v) dot(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r, v, rnd() < 0.28);
        }
      }
    }
  }

  /* a box: edges next to a face the eye can see are "prod", the rest "back" */
  function box(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) {
    const seen = { top: y0 > f, bottom: y1 < f, left: x0 > u, right: x1 < u, front: true, back: false };
    const xs = [x0, x1], ys = [y0, y1], zs = [z0, z1];
    const v = (a: boolean) => (a ? "prod" : "back") as Layer;
    for (let a = 0; a < 2; a++)
      for (let b = 0; b < 2; b++) {
        const ya = a ? seen.bottom : seen.top, zb = b ? seen.back : seen.front;
        const xa = a ? seen.right : seen.left, yb = b ? seen.bottom : seen.top;
        seg(v(ya || zb), [x0, ys[a], zs[b]], [x1, ys[a], zs[b]]);
        seg(v(xa || zb), [xs[a], y0, zs[b]], [xs[a], y1, zs[b]]);
        seg(v(xa || yb), [xs[a], ys[b], z0], [xs[a], ys[b], z1]);
      }
  }
  const rect = (layer: Layer, x0: number, x1: number, y0: number, y1: number, z: number) =>
    poly(layer, [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], true);
  function panelDots(x0: number, x1: number, y0: number, y1: number, z: number, pat: string, step: number, ph: number) {
    for (let y = y0 + 0.5 * step; y < y1; y += step)
      for (let x = x0 + 0.5 * step; x < x1; x += step) {
        const v = pattern(pat, ((x - x0) / (x1 - x0)) * 2 - 1, ((y - y0) / (y1 - y0)) * 2 - 1, ph);
        if (v) dot(x, y, z - 0.3, v, rnd() < 0.28);
      }
  }

  /** a circle facing the viewer */
  const ring = (layer: Layer, cx: number, cy: number, z: number, r: number, n = 18) =>
    poly(layer, Array.from({ length: n + 1 }, (_, i) => [cx + r * Math.cos((2 * Math.PI * i) / n), cy + r * Math.sin((2 * Math.PI * i) / n), z] as P3));
  /** a circle lying flat (horizontal) */
  const flat = (layer: Layer, cx: number, y: number, cz: number, r: number, n = 18) =>
    poly(layer, Array.from({ length: n + 1 }, (_, i) => [cx + r * Math.cos((2 * Math.PI * i) / n), y, cz + r * Math.sin((2 * Math.PI * i) / n)] as P3));
  /** a circle standing side-on (its axis along x) */
  const side = (layer: Layer, x: number, cy: number, cz: number, r: number, n = 16) =>
    poly(layer, Array.from({ length: n + 1 }, (_, i) => [x, cy + r * Math.cos((2 * Math.PI * i) / n), cz + r * Math.sin((2 * Math.PI * i) / n)] as P3));

  // the arm rises from the bottom edge in front of the shelves (like Theseus' robot)
  const mid = W < 1280; // 1024–1279: the copy column starts further left
  const camX = compact ? 0.8 * W : mid ? 0.82 * W : 0.8 * W;
  const camSc = compact ? 0.17 * H : 0.22 * H;

  /*
   * One of each, no repeats: parts from the industries OpenPlan serves (drones, medtech,
   * automotive, consumer electronics, industrial equipment). Each draws standing on the shelf at
   * (cx, b) with size unit u (the shelf's free height); WIDTH is its footprint in u. ORDER mixes the
   * industries so a short shelf (phones) still shows a bit of each.
   */
  type Kind =
    | "drone" | "rc" | "lipo" | "pmon" | "pump" | "bpmon" | "oximeter" | "inhaler" | "evplug" | "battery" | "ecu"
    | "spark" | "wallbox" | "dashcam" | "phone" | "watch" | "adapter" | "laptop" | "camera" | "vr" | "router"
    | "gear" | "plc" | "servo" | "valve" | "drill";
  const ORDER: Kind[] = [
    "evplug", "laptop", "drone", "pmon", "gear", "bpmon", "battery", "camera", "plc", "rc", "oximeter",
    "wallbox", "phone", "valve", "lipo", "pump", "ecu", "vr", "drill", "inhaler", "dashcam", "watch",
    "servo", "spark", "adapter", "router",
  ];
  const WIDTH: Record<Kind, number> = {
    drone: 1.0, rc: 0.62, lipo: 0.5, pmon: 0.72, pump: 0.38, bpmon: 0.62, oximeter: 0.3, inhaler: 0.28,
    evplug: 0.36, battery: 0.8, ecu: 0.6, spark: 0.16, wallbox: 0.5, dashcam: 0.36, phone: 0.26, watch: 0.26,
    adapter: 0.3, laptop: 0.92, camera: 0.54, vr: 0.6, router: 0.64, gear: 0.64, plc: 0.5, servo: 0.32,
    valve: 0.6, drill: 0.52,
  };
  /** per-part enlargement, so the small ones stand about as tall as the rest (heights stay under the shelf) */
  const SCALE: Partial<Record<Kind, number>> = {
    oximeter: 2.0, adapter: 1.8, dashcam: 1.8, lipo: 2.2, ecu: 2.2, battery: 1.7, phone: 1.4, watch: 1.3,
    inhaler: 1.3, spark: 1.3, rc: 1.3, router: 1.25, camera: 1.6, vr: 1.9, drill: 1.4, pump: 1.15, plc: 1.2,
    valve: 1.3, servo: 1.3, evplug: 1.15, drone: 1.3, pmon: 1.25, gear: 1.25, laptop: 1.1,
  };
  const z0 = 0.08 * I, zf = z0 - 0.2;

  const draw: Record<Kind, (cx: number, b: number, u: number, pat: string, ph: number, step: number) => void> = {
    /* drones */
    drone(cx, b, u) {
      const y = b - 0.3 * u, zc = z0 + 0.3 * u, aw = 0.38 * u, ad = 0.2 * u;
      box(cx - 0.12 * u, cx + 0.12 * u, y - 0.06 * u, y + 0.05 * u, zc - 0.09 * u, zc + 0.09 * u);
      for (const sx of [-1, 1])
        for (const sz of [-1, 1]) {
          const ex = cx + sx * aw, ez = zc + sz * ad, L: Layer = sz < 0 ? "prod" : "back";
          seg(L, [cx + sx * 0.1 * u, y, zc + sz * 0.06 * u], [ex, y, ez]);
          seg(L, [cx + sx * 0.1 * u, y - 0.025 * u, zc + sz * 0.06 * u], [ex, y - 0.025 * u, ez]);
          seg("prod", [ex, y, ez], [ex, y - 0.07 * u, ez]); // motor
          flat(L, ex, y - 0.07 * u, ez, 0.16 * u, 22); // rotor guard
          flat("detail", ex, y - 0.07 * u, ez, 0.03 * u, 8);
          seg("detail", [ex - 0.14 * u, y - 0.075 * u, ez], [ex + 0.14 * u, y - 0.075 * u, ez]); // blade
        }
      for (const sx of [-1, 1]) {
        seg("prod", [cx + sx * 0.08 * u, y + 0.05 * u, zc - 0.06 * u], [cx + sx * 0.15 * u, b, zc - 0.06 * u]);
        seg("back", [cx + sx * 0.08 * u, y + 0.05 * u, zc + 0.06 * u], [cx + sx * 0.15 * u, b, zc + 0.06 * u]);
        seg("prod", [cx + sx * 0.15 * u, b, zc - 0.12 * u], [cx + sx * 0.15 * u, b, zc + 0.12 * u]); // skid
      }
      ring("detail", cx, y + 0.1 * u, zc - 0.1 * u, 0.045 * u, 12); // gimbal camera
      ring("detail", cx, y + 0.1 * u, zc - 0.1 * u, 0.02 * u, 8);
    },
    rc(cx, b, u) {
      const w = 0.6 * u, h = 0.3 * u, x0 = cx - w / 2, x1 = cx + w / 2;
      box(x0, x1, b - h, b, z0, z0 + 0.22 * u);
      for (const sx of [-1, 1]) {
        ring("prod", cx + sx * 0.17 * w / 0.6, b - 0.14 * u, zf, 0.07 * u, 16); // gimbals
        ring("detail", cx + sx * 0.17 * w / 0.6, b - 0.14 * u, zf, 0.025 * u, 8); // sticks
      }
      rect("detail", cx - 0.07 * u, cx + 0.07 * u, b - 0.26 * u, b - 0.2 * u, zf); // display
      seg("prod", [x1 - 0.06 * u, b - h, z0 + 0.1 * u], [x1 + 0.03 * u, b - h - 0.34 * u, z0 + 0.1 * u]); // antenna
      seg("prod", [x0 + 0.06 * u, b - h, z0 + 0.1 * u], [x0 - 0.03 * u, b - h - 0.34 * u, z0 + 0.1 * u]);
    },
    /* medtech */
    pmon(cx, b, u, _p, ph, step) {
      const w = 0.72 * u, h = 0.56 * u, x0 = cx - w / 2, x1 = cx + w / 2, y0 = b - h;
      box(x0, x1, y0, b, z0, z0 + 0.34 * u);
      rect("detail", x0 + 0.05 * w, x1 - 0.28 * w, y0 + 0.08 * h, b - 0.2 * h, zf); // screen
      const ex0 = x0 + 0.08 * w, ex1 = x1 - 0.32 * w, ey = y0 + 0.32 * h, ecg: P3[] = [];
      for (let i = 0; i <= 48; i++) {
        const t = i / 48, c = (t * 3) % 1;
        const dy = c > 0.4 && c < 0.44 ? -0.18 * h : c >= 0.44 && c < 0.48 ? 0.08 * h : c > 0.62 && c < 0.72 ? -0.03 * h : 0;
        ecg.push([lerp(ex0, ex1, t), ey + dy, zf]);
      }
      poly("prod", ecg); // heartbeat trace
      poly("detail", Array.from({ length: 31 }, (_, i) => [lerp(ex0, ex1, i / 30), y0 + 0.58 * h + 0.04 * h * Math.sin(i * 0.9 + ph), zf] as P3));
      panelDots(x1 - 0.24 * w, x1 - 0.05 * w, y0 + 0.08 * h, b - 0.2 * h, z0, "band", step, ph);
      for (let j = 0; j < 4; j++) ring("detail", x0 + (0.12 + j * 0.1) * w, b - 0.1 * h, zf, 0.025 * w, 8);
    },
    pump(cx, b, u, _p, ph, step) {
      const w = 0.36 * u, h = 0.72 * u, x0 = cx - w / 2, x1 = cx + w / 2, y0 = b - h;
      box(x0, x1, y0, b, z0, z0 + 0.22 * u);
      rect("detail", x0 + 0.12 * w, x1 - 0.12 * w, y0 + 0.08 * h, y0 + 0.3 * h, zf); // display
      panelDots(x0 + 0.14 * w, x1 - 0.14 * w, y0 + 0.4 * h, b - 0.12 * h, z0, "checker", step * 1.3, ph); // keypad
      poly("detail", [[x1 - 0.2 * w, y0, z0 + 0.1 * u], [x1 - 0.2 * w, y0 - 0.12 * u, z0 + 0.1 * u], [x1 + 0.1 * w, y0 - 0.2 * u, z0 + 0.1 * u]]); // IV line
      seg("prod", [x0 + 0.2 * w, y0, z0 + 0.1 * u], [x0 + 0.2 * w, y0 - 0.06 * u, z0 + 0.1 * u]);
    },
    bpmon(cx, b, u, _p, ph, step) {
      const w = 0.3 * u, x0 = cx - 0.3 * u, x1 = x0 + w, y0 = b - 0.36 * u;
      box(x0, x1, y0, b, z0, z0 + 0.22 * u); // monitor
      rect("detail", x0 + 0.12 * w, x1 - 0.12 * w, y0 + 0.08 * u, y0 + 0.2 * u, zf); // display
      panelDots(x0 + 0.16 * w, x1 - 0.16 * w, y0 + 0.1 * u, y0 + 0.18 * u, z0, "band", step * 0.8, ph);
      ring("prod", cx - 0.15 * u, b - 0.08 * u, zf, 0.035 * u, 14); // start button
      // cuff: a wrapped band lying on the shelf, with its hook-and-loop seam
      const cx2 = cx + 0.16 * u, cz = z0 + 0.14 * u;
      for (const [y, L] of [[b, "prod"], [b - 0.2 * u, "prod"]] as const) flat(L, cx2, y, cz, 0.14 * u, 26);
      for (const a of [0, Math.PI / 2, Math.PI, 1.5 * Math.PI]) seg(a > 0.1 && a < 3.2 ? "back" : "prod", [cx2 + 0.14 * u * Math.cos(a), b, cz + 0.14 * u * Math.sin(a)], [cx2 + 0.14 * u * Math.cos(a), b - 0.2 * u, cz + 0.14 * u * Math.sin(a)]);
      seg("detail", [cx2 - 0.1 * u, b - 0.04 * u, cz - 0.1 * u], [cx2 - 0.1 * u, b - 0.16 * u, cz - 0.1 * u]);
      // air tube from the monitor to the cuff
      poly("detail", [[x1, y0 + 0.26 * u, zf], [x1 + 0.06 * u, y0 + 0.3 * u, zf], [cx2 - 0.08 * u, b - 0.16 * u, cz - 0.11 * u]]);
    },
    /* automotive */
    evplug(cx, b, u) {
      const cy = b - 0.6 * u, R0 = 0.13 * u;
      for (const [z, L] of [[zf, "prod"], [z0 + 0.12 * u, "back"]] as const) ring(L, cx, cy, z, R0, 24);
      for (const a of [0, Math.PI / 2, Math.PI, 1.5 * Math.PI])
        seg("prod", [cx + R0 * Math.cos(a), cy + R0 * Math.sin(a), zf], [cx + R0 * Math.cos(a), cy + R0 * Math.sin(a), z0 + 0.12 * u]);
      ring("detail", cx, cy, zf, 0.1 * u, 20);
      for (const [px, py] of [[-0.045, -0.03], [0.045, -0.03], [0, 0.045], [-0.05, 0.035], [0.05, 0.035]]) ring("detail", cx + px * u, cy + py * u, zf, 0.016 * u, 8); // pins
      box(cx - 0.06 * u, cx + 0.06 * u, cy + R0, b - 0.06 * u, z0 + 0.02 * u, z0 + 0.12 * u); // grip
      poly("detail", [[cx + 0.06 * u, cy + R0 + 0.06 * u, zf + 0.1], [cx + 0.1 * u, cy + R0 + 0.12 * u, zf + 0.1], [cx + 0.06 * u, cy + R0 + 0.2 * u, zf + 0.1]]); // trigger
      poly("prod", [[cx, b - 0.06 * u, z0 + 0.07 * u], [cx + 0.04 * u, b - 0.01 * u, z0 + 0.07 * u], [cx + 0.18 * u, b, z0 + 0.07 * u]]); // cable
    },
    battery(cx, b, u, pat, ph, step) {
      const w = 0.78 * u, h = 0.34 * u, d = 0.42 * u, x0 = cx - w / 2, x1 = cx + w / 2, y0 = b - h;
      box(x0, x1, y0, b, z0, z0 + d);
      for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) flat("detail", x0 + (0.12 + i * 0.152) * w, y0, z0 + (0.28 + j * 0.44) * d, 0.055 * u, 12); // cells
      for (const tx of [0.08, 0.86]) box(x0 + tx * w, x0 + (tx + 0.06) * w, y0 - 0.05 * u, y0, z0 + 0.4 * d, z0 + 0.6 * d); // terminals
      rect("detail", x0 + 0.06 * w, x0 + 0.5 * w, y0 + 0.25 * h, b - 0.2 * h, zf);
      panelDots(x0 + 0.56 * w, x1 - 0.06 * w, y0 + 0.25 * h, b - 0.2 * h, z0, pat, step, ph);
    },
    ecu(cx, b, u, _p, ph, step) {
      const w = 0.56 * u, h = 0.24 * u, x0 = cx - w / 2, x1 = cx + w / 2, y0 = b - h;
      box(x0, x1, y0, b, z0, z0 + 0.5 * u);
      for (let i = 1; i < 9; i++) seg("detail", [x0 + (i / 9) * w, y0 + 0.08 * h, zf], [x0 + (i / 9) * w, y0 + 0.45 * h, zf]); // heat fins
      rect("detail", x0 + 0.2 * w, x1 - 0.2 * w, y0 + 0.58 * h, b - 0.12 * h, zf); // connector
      panelDots(x0 + 0.22 * w, x1 - 0.22 * w, y0 + 0.6 * h, b - 0.14 * h, z0, "full", step * 0.9, ph);
      for (const sx of [-1, 1]) rect("detail", cx + sx * (w / 2 + 0.03 * u) - 0.03 * u, cx + sx * (w / 2 + 0.03 * u) + 0.03 * u, b - 0.05 * u, b, zf); // tabs
    },
    spark(cx, b, u) {
      const r = 0.045 * u;
      lathe(cx, b, z0 + 2 * r, 0.62 * u, r, PROFILES.spark, [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.32, 0.42, 0.44, 0.88, 0.92, 1], { meridians: 6 });
    },
    /* consumer electronics */
    phone(cx, b, u, _p, ph, step) {
      const w = 0.24 * u, h = 0.5 * u, x0 = cx - w / 2, x1 = cx + w / 2, y0 = b - h;
      box(x0, x1, y0, b, z0, z0 + 0.015 * u);
      rect("detail", x0 + 0.08 * w, x1 - 0.08 * w, y0 + 0.06 * h, b - 0.06 * h, zf);
      seg("detail", [x0 + 0.38 * w, y0 + 0.035 * h, zf], [x1 - 0.38 * w, y0 + 0.035 * h, zf]);
      panelDots(x0 + 0.16 * w, x1 - 0.16 * w, y0 + 0.14 * h, y0 + 0.6 * h, z0, "checker", step * 1.2, ph);
    },
    watch(cx, b, u) {
      box(cx - 0.12 * u, cx + 0.12 * u, b - 0.05 * u, b, z0, z0 + 0.18 * u); // display stand
      rect("detail", cx - 0.055 * u, cx + 0.055 * u, b - 0.56 * u, b - 0.4 * u, zf); // strap
      rect("detail", cx - 0.055 * u, cx + 0.055 * u, b - 0.18 * u, b - 0.05 * u, zf);
      for (let i = 1; i < 4; i++) seg("detail", [cx - 0.055 * u, b - 0.18 * u + i * 0.032 * u, zf], [cx + 0.055 * u, b - 0.18 * u + i * 0.032 * u, zf]);
      box(cx - 0.1 * u, cx + 0.1 * u, b - 0.4 * u, b - 0.18 * u, z0, z0 + 0.05 * u); // case
      rect("detail", cx - 0.08 * u, cx + 0.08 * u, b - 0.38 * u, b - 0.2 * u, zf);
      box(cx + 0.1 * u, cx + 0.125 * u, b - 0.33 * u, b - 0.29 * u, z0 + 0.01 * u, z0 + 0.04 * u); // crown
      ring("detail", cx, b - 0.29 * u, zf, 0.05 * u, 16);
    },
    adapter(cx, b, u) {
      const s = 0.26 * u;
      box(cx - s / 2, cx + s / 2, b - s, b, z0, z0 + s); // charger brick
      for (const sx of [-0.05, 0.05]) {
        seg("prod", [cx + sx * u, b - s, z0 + s / 2], [cx + sx * u, b - s - 0.12 * u, z0 + s / 2]); // prongs
        seg("prod", [cx + sx * u + 0.015 * u, b - s, z0 + s / 2], [cx + sx * u + 0.015 * u, b - s - 0.12 * u, z0 + s / 2]);
      }
      rect("detail", cx - 0.05 * u, cx + 0.05 * u, b - 0.55 * s, b - 0.45 * s, zf); // USB-C port
      dot(cx, b - 0.25 * s, zf, 1.6, true);
    },
    laptop(cx, b, u, pat, ph, step) {
      const w = 0.9 * u, x0 = cx - w / 2, x1 = cx + w / 2, t = 0.035 * u, d = 0.55 * u, yt = b - t;
      box(x0, x1, yt, b, z0, z0 + d); // base
      box(x0, x1, b - 0.62 * u, yt, z0 + d - 0.03 * u, z0 + d); // screen, upright at the back
      rect("detail", x0 + 0.04 * w, x1 - 0.04 * w, b - 0.6 * u, yt - 0.04 * u, z0 + d - 0.03 * u - 0.2);
      panelDots(x0 + 0.1 * w, x1 - 0.1 * w, b - 0.52 * u, yt - 0.1 * u, z0 + d - 0.03 * u, pat, step * 1.5, ph);
      for (let i = 0; i < 4; i++) seg("detail", [x0 + 0.08 * w, yt, z0 + (0.12 + i * 0.07) * u], [x1 - 0.08 * w, yt, z0 + (0.12 + i * 0.07) * u]); // keys
    },
    router(cx, b, u) {
      const w = 0.62 * u, x0 = cx - w / 2, x1 = cx + w / 2, by = b - 0.16 * u, d = 0.34 * u;
      box(x0, x1, by, b, z0, z0 + d);
      for (let j = 0; j < 6; j++) dot(x0 + (0.16 + j * 0.07) * w, b - 0.08 * u, zf, 1.4, true);
      for (const [ax, lean] of [[0.1, -0.08], [0.37, -0.02], [0.63, 0.02], [0.9, 0.08]]) {
        const px = x0 + ax * w, pz = z0 + 0.8 * d;
        seg("prod", [px, by, pz], [px + lean * w, by - 0.42 * u, pz]);
        seg("detail", [px + 0.02 * w, by, pz], [px + lean * w + 0.02 * w, by - 0.42 * u, pz]);
      }
    },
    lipo(cx, b, u, _p, ph, step) {
      const w = 0.44 * u, x0 = cx - w / 2, x1 = cx + w / 2, y0 = b - 0.15 * u;
      box(x0, x1, y0, b, z0, z0 + 0.28 * u); // flight battery
      rect("detail", x0 + 0.06 * w, x0 + 0.62 * w, y0 + 0.2 * 0.15 * u, b - 0.03 * u, zf);
      panelDots(x0 + 0.08 * w, x0 + 0.6 * w, y0 + 0.04 * u, b - 0.04 * u, z0, "stripes", step, ph);
      for (const o of [0, 0.02, 0.04]) poly("detail", [[x1, y0 + 0.05 * u + o * u, z0 + 0.1 * u], [x1 + 0.06 * u, y0 + 0.02 * u + o * u, z0 + 0.1 * u], [x1 + 0.1 * u, y0 - 0.06 * u, z0 + 0.1 * u]]); // balance lead
      box(x1 + 0.08 * u, x1 + 0.13 * u, y0 - 0.1 * u, y0 - 0.05 * u, z0 + 0.08 * u, z0 + 0.12 * u);
      for (const o of [0, 0.03]) poly("prod", [[x1, b - 0.04 * u - o * u, z0 + 0.04 * u], [x1 + 0.08 * u, b - 0.02 * u - o * u, z0 + 0.04 * u], [x1 + 0.14 * u, b, z0 + 0.04 * u]]); // main lead
    },
    oximeter(cx, b, u, _p, ph, step) {
      const w = 0.26 * u;
      box(cx - w / 2, cx + w / 2, b - 0.15 * u, b, z0, z0 + 0.16 * u); // lower jaw
      box(cx - w / 2 + 0.01 * u, cx + w / 2 - 0.01 * u, b - 0.3 * u, b - 0.18 * u, z0 + 0.01 * u, z0 + 0.15 * u); // upper jaw
      seg("detail", [cx - w / 2, b - 0.165 * u, zf], [cx + w / 2, b - 0.165 * u, zf]); // finger slot
      side("detail", cx - w / 2 - 0.005 * u, b - 0.17 * u, z0 + 0.08 * u, 0.04 * u, 12); // hinge
      rect("detail", cx - 0.09 * u, cx + 0.09 * u, b - 0.13 * u, b - 0.03 * u, zf); // display
      panelDots(cx - 0.08 * u, cx + 0.08 * u, b - 0.12 * u, b - 0.04 * u, z0, "band", step * 0.8, ph);
      dot(cx + 0.08 * u, b - 0.24 * u, zf, 1.6, true);
    },
    inhaler(cx, b, u) {
      box(cx - 0.11 * u, cx + 0.06 * u, b - 0.12 * u, b, z0, z0 + 0.12 * u); // mouthpiece
      rect("detail", cx - 0.1 * u, cx - 0.02 * u, b - 0.1 * u, b - 0.03 * u, zf);
      box(cx - 0.02 * u, cx + 0.1 * u, b - 0.46 * u, b - 0.12 * u, z0 + 0.01 * u, z0 + 0.11 * u); // boot
      rect("detail", cx, cx + 0.08 * u, b - 0.4 * u, b - 0.2 * u, zf + 0.01 * u);
      flat("prod", cx + 0.04 * u, b - 0.46 * u, z0 + 0.06 * u, 0.045 * u, 14); // canister
      flat("prod", cx + 0.04 * u, b - 0.56 * u, z0 + 0.06 * u, 0.045 * u, 14);
      for (const sx of [-1, 1]) seg("prod", [cx + 0.04 * u + sx * 0.045 * u, b - 0.46 * u, z0 + 0.06 * u], [cx + 0.04 * u + sx * 0.045 * u, b - 0.56 * u, z0 + 0.06 * u]);
    },
    wallbox(cx, b, u) {
      const w = 0.36 * u, x0 = cx - w / 2, x1 = cx + w / 2, y0 = b - 0.62 * u, y1 = b - 0.06 * u;
      box(x0, x1, y0, y1, z0, z0 + 0.12 * u); // charger housing
      for (const sx of [-1, 1]) box(cx + sx * 0.12 * u - 0.02 * u, cx + sx * 0.12 * u + 0.02 * u, y1, b, z0 + 0.02 * u, z0 + 0.1 * u); // feet
      rect("detail", x0 + 0.14 * w, x1 - 0.14 * w, y0 + 0.08 * u, y0 + 0.18 * u, zf); // display
      ring("prod", cx, y0 + 0.3 * u, zf, 0.06 * u, 20); // status ring
      ring("detail", cx, y0 + 0.3 * u, zf, 0.035 * u, 14);
      rect("detail", x0 + 0.2 * w, x1 - 0.2 * w, y1 - 0.14 * u, y1 - 0.04 * u, zf); // holster
      for (const o of [0, 0.03]) ring("detail", x1 + 0.08 * u + o * u, b - 0.32 * u, zf, 0.08 * u, 18); // coiled cable
      poly("detail", [[x1, y1 - 0.08 * u, zf], [x1 + 0.06 * u, y1 - 0.12 * u, zf], [x1 + 0.08 * u, b - 0.24 * u, zf]]);
    },
    dashcam(cx, b, u) {
      box(cx - 0.08 * u, cx + 0.08 * u, b - 0.03 * u, b, z0, z0 + 0.14 * u); // mount foot
      seg("prod", [cx, b - 0.03 * u, z0 + 0.07 * u], [cx, b - 0.18 * u, z0 + 0.07 * u]); // stalk
      ring("detail", cx, b - 0.18 * u, z0 + 0.07 * u, 0.02 * u, 8); // ball joint
      box(cx - 0.15 * u, cx + 0.15 * u, b - 0.36 * u, b - 0.2 * u, z0, z0 + 0.1 * u); // body
      for (const r of [0.06, 0.045, 0.025]) ring(r === 0.06 ? "prod" : "detail", cx + 0.07 * u, b - 0.28 * u, zf, r * u, 18); // lens
      rect("detail", cx - 0.13 * u, cx - 0.01 * u, b - 0.34 * u, b - 0.22 * u, zf); // screen
      dot(cx + 0.13 * u, b - 0.34 * u, zf, 1.4, true); // rec LED
    },
    camera(cx, b, u) {
      const w = 0.5 * u, x0 = cx - w / 2, x1 = cx + w / 2, y0 = b - 0.3 * u;
      box(x0, x1, y0, b, z0 + 0.06 * u, z0 + 0.2 * u); // body
      box(x0, x0 + 0.12 * u, y0 + 0.02 * u, b, z0, z0 + 0.06 * u); // grip
      box(cx - 0.07 * u, cx + 0.07 * u, y0 - 0.08 * u, y0, z0 + 0.08 * u, z0 + 0.18 * u); // prism hump
      box(x0 + 0.03 * u, x0 + 0.09 * u, y0 - 0.025 * u, y0, z0 + 0.08 * u, z0 + 0.12 * u); // shutter
      const lx = cx + 0.04 * u, ly = b - 0.15 * u;
      for (const [z, r, L] of [[z0 + 0.06 * u, 0.12, "prod"], [z0 - 0.03 * u, 0.12, "prod"], [z0 - 0.08 * u, 0.11, "prod"], [z0 - 0.081 * u, 0.08, "detail"], [z0 - 0.081 * u, 0.05, "detail"], [z0 - 0.081 * u, 0.025, "detail"]] as const)
        ring(L, lx, ly, z, r * u, 24);
      for (const a of [0, Math.PI / 2, Math.PI, 1.5 * Math.PI]) seg("prod", [lx + 0.12 * u * Math.cos(a), ly + 0.12 * u * Math.sin(a), z0 + 0.06 * u], [lx + 0.11 * u * Math.cos(a), ly + 0.11 * u * Math.sin(a), z0 - 0.08 * u]);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        seg("detail", [lx + 0.12 * u * Math.cos(a), ly + 0.12 * u * Math.sin(a), z0 + 0.02 * u], [lx + 0.12 * u * Math.cos(a), ly + 0.12 * u * Math.sin(a), z0 - 0.02 * u]); // focus ring knurl
      }
    },
    vr(cx, b, u, _p, ph, step) {
      const w = 0.48 * u, x0 = cx - w / 2, x1 = cx + w / 2, y0 = b - 0.24 * u;
      box(x0, x1, y0, b, z0, z0 + 0.18 * u); // visor
      rect("detail", x0 + 0.05 * w, x1 - 0.05 * w, y0 + 0.04 * u, b - 0.04 * u, zf);
      for (const sx of [-1, 1]) ring("detail", cx + sx * 0.15 * u, y0 + 0.06 * u, zf, 0.02 * u, 10); // tracking cameras
      panelDots(x0 + 0.2 * w, x1 - 0.2 * w, y0 + 0.08 * u, b - 0.06 * u, z0, "emblem", step, ph);
      const strap: P3[] = [];
      for (let i = 0; i <= 20; i++) {
        const a = (i / 20) * Math.PI;
        strap.push([cx + (w / 2 + 0.02 * u) * Math.cos(a), b - 0.13 * u, z0 + 0.18 * u + 0.32 * u * Math.sin(a)]);
      }
      poly("back", strap); // head strap
      poly("back", strap.map(([x, y, z]) => [x, y - 0.05 * u, z] as P3));
    },
    drill(cx, b, u) {
      const x0 = cx - 0.2 * u, x1 = cx + 0.12 * u, zc = z0 + 0.08 * u;
      box(x0, x1, b - 0.5 * u, b - 0.34 * u, zc - 0.07 * u, zc + 0.07 * u); // motor body
      for (let i = 0; i < 4; i++) seg("detail", [x0 + 0.03 * u + i * 0.025 * u, b - 0.47 * u, zc - 0.07 * u - 0.2], [x0 + 0.03 * u + i * 0.025 * u, b - 0.37 * u, zc - 0.07 * u - 0.2]); // vents
      for (const x of [x1, x1 + 0.04 * u, x1 + 0.09 * u]) side("prod", x, b - 0.42 * u, zc, x === x1 + 0.09 * u ? 0.035 * u : 0.05 * u, 14); // chuck
      seg("prod", [x1 + 0.09 * u, b - 0.42 * u, zc], [x1 + 0.2 * u, b - 0.42 * u, zc]); // bit
      box(cx - 0.12 * u, cx - 0.03 * u, b - 0.34 * u, b - 0.12 * u, zc - 0.05 * u, zc + 0.05 * u); // handle
      poly("detail", [[cx - 0.03 * u, b - 0.32 * u, zc - 0.05 * u - 0.2], [cx + 0.01 * u, b - 0.3 * u, zc - 0.05 * u - 0.2], [cx - 0.03 * u, b - 0.25 * u, zc - 0.05 * u - 0.2]]); // trigger
      box(cx - 0.17 * u, cx + 0.02 * u, b - 0.12 * u, b, zc - 0.08 * u, zc + 0.08 * u); // battery
    },
    /* industrial equipment */
    gear(cx, b, u) {
      const R0 = 0.31 * u, cy = b - R0 - 0.01 * u, teeth = 16, zb = z0 + 0.1 * u;
      for (const [z, L] of [[zf, "prod"], [zb, "back"]] as const) {
        const pts: P3[] = [];
        for (let i = 0; i <= teeth * 4; i++) {
          const a = (i / (teeth * 4)) * Math.PI * 2, r = i % 4 < 2 ? R0 : R0 * 0.86;
          pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a), z]);
        }
        poly(L, pts);
      }
      for (const a of [0, Math.PI / 2, Math.PI, 1.5 * Math.PI]) seg("prod", [cx + R0 * Math.cos(a), cy + R0 * Math.sin(a), zf], [cx + R0 * Math.cos(a), cy + R0 * Math.sin(a), zb]);
      ring("detail", cx, cy, zf, 0.62 * R0, 28);
      ring("detail", cx, cy, zf, 0.2 * R0, 14);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ring("detail", cx + 0.42 * R0 * Math.cos(a), cy + 0.42 * R0 * Math.sin(a), zf, 0.09 * R0, 10); // lightening holes
      }
    },
    plc(cx, b, u, _p, ph, step) {
      const w = 0.48 * u, h = 0.6 * u, x0 = cx - w / 2, x1 = cx + w / 2, y0 = b - h;
      box(x0, x1, y0, b, z0, z0 + 0.4 * u);
      for (const ty of [y0 + 0.04 * h, b - 0.14 * h]) {
        rect("detail", x0 + 0.06 * w, x1 - 0.06 * w, ty, ty + 0.1 * h, zf); // terminal rows
        for (let i = 0; i < 8; i++) dot(x0 + (0.11 + i * 0.111) * w, ty + 0.05 * h, zf, 1.1, true);
      }
      for (let i = 0; i < 6; i++) dot(x0 + 0.14 * w, y0 + (0.26 + i * 0.08) * h, zf, 1.4, true); // status LEDs
      rect("detail", x0 + 0.28 * w, x1 - 0.08 * w, y0 + 0.24 * h, y0 + 0.4 * h, zf);
      panelDots(x0 + 0.28 * w, x1 - 0.08 * w, y0 + 0.46 * h, b - 0.22 * h, z0, "stripes", step, ph);
    },
    servo(cx, b, u, pat, ph, step) {
      const h = 0.54 * u, r = 0.15 * u;
      lathe(cx, b, z0 + r, h, r, PROFILES.motor, [0, 0.04, 0.2, 0.42, 0.66, 0.705, 0.8, 0.82, 0.885, 1], { meridians: 16, band: [0.1, 0.6], pat, ph, step, lid: [0.5] });
    },
    valve(cx, b, u) {
      const cy = b - 0.24 * u, zc = z0 + 0.14 * u;
      box(cx - 0.11 * u, cx + 0.11 * u, cy - 0.1 * u, cy + 0.1 * u, zc - 0.1 * u, zc + 0.1 * u); // body
      for (const sx of [-1, 1]) {
        for (const x of [sx * 0.22 * u, sx * 0.25 * u]) side(sx < 0 ? "prod" : "prod", cx + x, cy, zc, 0.12 * u, 20); // flanges
        for (const a of [0, Math.PI / 2, Math.PI, 1.5 * Math.PI]) seg("detail", [cx + sx * 0.11 * u, cy + 0.07 * u * Math.cos(a), zc + 0.07 * u * Math.sin(a)], [cx + sx * 0.22 * u, cy + 0.07 * u * Math.cos(a), zc + 0.07 * u * Math.sin(a)]); // pipe
      }
      box(cx - 0.05 * u, cx + 0.05 * u, cy + 0.1 * u, b, zc - 0.05 * u, zc + 0.05 * u); // foot
      seg("prod", [cx, cy - 0.1 * u, zc], [cx, b - 0.56 * u, zc]); // stem
      flat("prod", cx, b - 0.56 * u, zc, 0.16 * u, 26); // handwheel
      flat("detail", cx, b - 0.56 * u, zc, 0.03 * u, 10);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        seg("detail", [cx, b - 0.56 * u, zc], [cx + 0.16 * u * Math.cos(a), b - 0.56 * u, zc + 0.16 * u * Math.sin(a)]);
      }
    },
  };

  /* part tag on the shelf lip: frame, barcode, dot-matrix number */
  const tag = (cx: number, base: number) => {
    const s = clamp(1.45 * k, 12, 20), tw = 3.3 * s, tx = cx - tw / 2, ty = base + 0.25 * k;
    rect("detail", tx, tx + tw, ty, ty + s, -0.6);
    for (let bx = tx + 0.28 * s; bx < tx + 0.4 * tw; bx += rr(1.3, 3.2)) seg("detail", [bx, ty + 0.22 * s, -0.6], [bx, ty + 0.78 * s, -0.6]);
    const label = `${1 + Math.floor(9 * rnd())}.${String(Math.floor(100 * rnd())).padStart(2, "0")}`;
    const cell = s / 9;
    let dx = tx + 0.47 * tw;
    const dy = ty + 0.22 * s;
    for (const ch of label) {
      if (ch === ".") {
        dot(dx + 0.5 * cell, dy + 4.5 * cell, -0.6, 0.8 * cell, true);
        dx += 2 * cell;
        continue;
      }
      const g = DIGITS[ch];
      for (let a = 0; a < 5; a++)
        for (let c = 0; c < 3; c++) if (g[3 * a + c] === "1") dot(dx + c * cell + 0.5 * cell, dy + a * cell + 0.5 * cell, -0.6, 0.8 * cell, true);
      dx += 4 * cell;
    }
  };

  // lay them out on an even grid: same slots on every shelf, each part centred in its slot, fewer on narrow screens
  const room = (T - k) * 0.84;
  const fit = Math.max(2, Math.floor((0.94 * W) / (0.55 * room + 40)));
  // the same count on every shelf, so the parts line up in columns from shelf to shelf
  const perRow = Math.max(1, Math.min(fit, Math.floor(ORDER.length / C)));
  const span0 = 0.03 * W, span1 = 0.97 * W;
  let next = 0;
  for (let row = 0; row < C; row++) {
    const base = R(row);
    const count = perRow;
    const sw = (span1 - span0) / Math.max(1, count);
    for (let j = 0; j < count && next < ORDER.length; j++) {
      const kind = ORDER[next++];
      let u = room * (SCALE[kind] ?? 1);
      const fw = WIDTH[kind] * u;
      if (fw > 0.8 * sw) u *= (0.8 * sw) / fw;
      const cx = span0 + (j + 0.5) * sw;
      const pat = PATTERNS[Math.floor(rnd() * PATTERNS.length)];
      draw[kind](cx, base, u, pat, rr(0, 6.28), clamp(0.024 * u, 4, 6));
      tag(cx, base);
    }
  }

  return { lines, dots, P, cam: { x: camX, y: H + 0.04 * camSc, z: 0, sc: camSc } };
}

/* ------------------------------------------------------------------ robot arm */

type Pose = { lines: P3[][]; hulls: P3[][]; eye: P3 };

const circle = (r: number, at: (c: number, s: number) => P3, n = 22): P3[] =>
  Array.from({ length: n + 1 }, (_, i) => at(r * Math.cos((2 * Math.PI * i) / n), r * Math.sin((2 * Math.PI * i) / n)));

/**
 * The robot arm in model units (base on y = 0, up is -y). `yaw` turns the turret; in the arm's
 * plane (f = forward, u = up) the gripper reaches `reach` from the shoulder at elevation `phi`,
 * solved for the two links (elbow up). `grip` 0 → 1 closes the fingers.
 */
function armPose(yaw: number, phi: number, reach: number, grip: number): Pose {
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const Y = (p: P3): P3 => [p[0] * cy - p[2] * sy, p[1], p[0] * sy + p[2] * cy];
  /** a point of the arm plane, with a sideways offset x, into the model */
  const A = (f: number, u: number, x = 0): P3 => Y([x, -u, -f]);
  const lines: P3[][] = [];
  const hulls: P3[][] = [];

  // base plate + turret
  const base: P3[] = [];
  for (const [r, y] of [[0.42, 0], [0.42, -0.08], [0.32, -0.08], [0.32, -0.12]] as const) {
    const c = circle(r, (a, b) => [a, y, b], 30);
    lines.push(c);
    base.push(...c);
  }
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    lines.push([[0.42 * Math.cos(a), 0, 0.42 * Math.sin(a)], [0.42 * Math.cos(a), -0.08, 0.42 * Math.sin(a)]]);
  }
  hulls.push(base);
  const tur: P3[] = [];
  for (const [r, y] of [[0.24, -0.12], [0.24, -0.3], [0.2, -0.34]] as const) {
    const c = circle(r, (a, b) => Y([a, y, b]), 26);
    lines.push(c);
    tur.push(...c);
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    lines.push([Y([0.24 * Math.cos(a), -0.12, 0.24 * Math.sin(a)]), Y([0.24 * Math.cos(a), -0.3, 0.24 * Math.sin(a)])]);
  }
  hulls.push(tur);

  // kinematics in the arm plane
  const L1 = 0.95, L2 = 0.82, L3 = 0.3;
  const S: [number, number] = [0, 0.46];
  const dir: [number, number] = [Math.cos(phi), Math.sin(phi)];
  const tip: [number, number] = [S[0] + reach * dir[0], S[1] + reach * dir[1]];
  let wx = tip[0] - L3 * dir[0] - S[0], wy = tip[1] - L3 * dir[1] - S[1];
  const D0 = Math.hypot(wx, wy);
  const D = clamp(D0, Math.abs(L1 - L2) + 0.05, L1 + L2 - 0.02);
  wx *= D / (D0 || 1);
  wy *= D / (D0 || 1);
  const alpha = Math.atan2(wy, wx);
  const beta = Math.acos(clamp((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D), -1, 1));
  const E: [number, number] = [S[0] + L1 * Math.cos(alpha + beta), S[1] + L1 * Math.sin(alpha + beta)];
  const Wr: [number, number] = [S[0] + wx, S[1] + wy];
  const end: [number, number] = [Wr[0] + L3 * dir[0], Wr[1] + L3 * dir[1]];

  /** a link: a box from a to b in the arm plane, `w` wide sideways and `t` thick in-plane */
  const link = (a: number[], b: number[], w: number, t: number, x = 0, stripe = true) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const nx = (-dy / l) * (t / 2), ny = (dx / l) * (t / 2);
    const c = (p: number[], sN: number, sX: number) => A(p[0] + sN * nx, p[1] + sN * ny, x + (sX * w) / 2);
    const pts: P3[] = [];
    for (const sN of [-1, 1])
      for (const sX of [-1, 1]) {
        lines.push([c(a, sN, sX), c(b, sN, sX)]);
        pts.push(c(a, sN, sX), c(b, sN, sX));
      }
    for (const p of [a, b]) lines.push([c(p, -1, -1), c(p, 1, -1), c(p, 1, 1), c(p, -1, 1), c(p, -1, -1)]);
    if (stripe)
      for (const sX of [-1, 1]) {
        const k = 0.18;
        lines.push([A(a[0] + dx * k, a[1] + dy * k, x + (sX * w) / 2), A(b[0] - dx * k, b[1] - dy * k, x + (sX * w) / 2)]);
      }
    hulls.push(pts);
  };
  /** a joint: a drum across the arm at p */
  const joint = (p: number[], r: number, half: number) => {
    const pts: P3[] = [];
    for (const x of [-half, half]) {
      const c = circle(r, (a, b) => A(p[0] + a, p[1] + b, x), 22);
      lines.push(c);
      pts.push(...c);
      lines.push(circle(r * 0.45, (a, b) => A(p[0] + a, p[1] + b, x * 1.02), 14));
    }
    for (const a of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2])
      lines.push([A(p[0] + r * Math.cos(a), p[1] + r * Math.sin(a), -half), A(p[0] + r * Math.cos(a), p[1] + r * Math.sin(a), half)]);
    hulls.push(pts);
  };

  link([0, 0.3], S, 0.34, 0.22, 0, false); // shoulder bracket on the turret
  joint(S, 0.17, 0.22);
  link(S, E, 0.2, 0.17); // upper arm
  joint(E, 0.13, 0.16);
  link(E, Wr, 0.15, 0.13); // forearm
  joint(Wr, 0.09, 0.11);
  // palm, then two fingers that close sideways
  const palm: [number, number] = [Wr[0] + 0.14 * dir[0], Wr[1] + 0.14 * dir[1]];
  link(Wr, palm, 0.26, 0.12, 0, false);
  const open = lerp(0.1, 0.035, grip);
  for (const sgn of [-1, 1]) link(palm, end, 0.04, 0.07, sgn * open, false);
  // a cable sagging along the upper arm
  const cable: P3[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    cable.push(A(lerp(S[0], E[0], t), lerp(S[1], E[1], t) - 0.1 * Math.sin(Math.PI * t), 0.13));
  }
  lines.push(cable);

  return { lines, hulls, eye: A(end[0], end[1]) };
}

/** 2D convex hull (monotone chain). */
function hull(pts: number[][]) {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cross = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: number[][] = [], up: number[][] = [];
  for (const q of p) {
    while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
    up.push(q);
  }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

/* ------------------------------------------------------------------ engine */

const canvas = (w = 1, h = 1) => {
  const c = document.createElement("canvas");
  c.width = Math.max(1, w);
  c.height = Math.max(1, h);
  return c;
};

export class ShelfGlow {
  el: HTMLElement;
  cfg = CONFIG;
  reduced: boolean;
  touch: boolean;
  base = canvas();
  figEl = canvas();
  light = document.createElement("div");
  fx = canvas();
  cue = canvas(32, 32);
  auras: HTMLCanvasElement[];
  lit = canvas();
  core = canvas();
  scratch = canvas();
  figLit = canvas();
  sprite: HTMLCanvasElement;
  fxCtx: CanvasRenderingContext2D;
  sCtx: CanvasRenderingContext2D;
  hit = canvas(1, 1).getContext("2d")!;

  W = 0; H = 0; dpr = 1; R = 200;
  scene: Scene | null = null;
  target = { x: 0, y: 0 }; pos = { x: 0, y: 0 }; trail = { x: 0, y: 0 };
  I = 0; It = 0; time = 0; last = 0;
  pointer = false;
  /** last pointer movement (ms); the arm shows only while the pointer is moving */
  lastMove = -1e9;
  /** 0 → 1 the arm's visibility */
  awake = 0;
  intro: { t: number } | null;
  drift: { from: { x: number; y: number }; to: { x: number; y: number }; el: number; dur: number } | null = null;
  dust: { x: number; y: number; vy: number; sw: number; ph: number; s: number; a: number }[] = [];
  sparks: { d: Dot; t0: number; dur: number }[] = [];
  sparkleDots: Dot[] = [];
  ripples: { x: number; y: number; far: number; t: number }[] = [];
  // arm state: turret yaw (deg), elevation of the reach (deg), reach (model units), grip
  yaw = REST.yaw; pitch = REST.phi; reach = REST.reach; vYaw = 0; vPitch = 0; vReach = 0;
  aimYaw = REST.yaw; aimPitch = REST.phi; aimReach = REST.reach; shoulder: [number, number] = [0, 0];
  gaze: { x: number; y: number } | null = null; lock = 0; headA = 0; cueA = 0;
  pose: Pose | null = null; poseKey = ""; figMask: Path2D | null = null; eye: [number, number] = [0, 0];
  running = false; dead = false;
  private off: (() => void)[] = [];

  constructor(el: HTMLElement) {
    this.el = el;
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.touch = matchMedia("(hover: none), (pointer: coarse)").matches;
    this.intro = this.reduced ? null : { t: -0.7 };
    this.base.className = "sg-base";
    this.figEl.className = "sg-fig";
    this.figEl.style.opacity = "0";
    this.light.className = "sg-light";
    this.fx.className = "sg-fx";
    this.cue.className = "sg-cue";
    const [r, g, b] = rgb(this.cfg.glow);
    this.auras = [
      [[0, 0.35], [0.1604, 0.164], [0.35, 0.075], [0.4583, 0.0292], [1, 0]],
      [[0, 0.06], [0.35, 0.02], [1, 0]],
    ].map((stops) => {
      const c = canvas(128, 128), x = c.getContext("2d")!;
      const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
      for (const [t, a] of stops) gr.addColorStop(t, `rgba(${r},${g},${b},${a})`);
      x.fillStyle = gr;
      x.fillRect(0, 0, 128, 128);
      c.className = "sg-aura";
      return c;
    });
    this.light.append(this.fx, ...this.auras);
    el.append(this.base, this.figEl, this.light, this.cue);
    this.fxCtx = this.fx.getContext("2d")!;
    this.sCtx = this.scratch.getContext("2d")!;
    this.sprite = (() => {
      const c = canvas(48, 48), x = c.getContext("2d")!;
      x.shadowColor = this.cfg.glow;
      x.shadowBlur = 12;
      x.fillStyle = this.cfg.glow;
      x.fillRect(20, 20, 8, 8);
      x.shadowBlur = 4;
      x.fillStyle = this.cfg.core;
      x.fillRect(22, 22, 4, 4);
      return c;
    })();
    this.bind();
    this.resize();
    requestAnimationFrame(() => el.classList.add("is-ready"));
    this.loop = this.loop.bind(this);
    this.start();
  }

  /* ---- events ---- */
  private bind() {
    const local = (e: { clientX: number; clientY: number }) => {
      const r = this.el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top, inside: e.clientY >= r.top && e.clientY <= r.bottom };
    };
    const move = (e: PointerEvent) => {
      const p = local(e);
      if (this.touch && e.pointerType !== "mouse") {
        // touch: no cursor, so a finger on the hero wakes the arm and it reaches there
        if (!p.inside || this.paused()) return;
        this.lastMove = performance.now();
        this.target.x = p.x;
        this.target.y = p.y;
        this.start();
        return;
      }
      if (!p.inside || this.paused()) return this.leave();
      this.lastMove = performance.now();
      this.pointer = true;
      this.drift = null;
      this.intro = null;
      this.target.x = p.x;
      this.target.y = p.y;
      this.It = 1;
      this.start();
    };
    const leave = () => this.leave();
    const down = (e: PointerEvent) => {
      if (this.reduced || e.button !== 0 || this.paused()) return;
      if (e.target instanceof Element && e.target.closest("a,button,input,select,textarea,label,[role=button]")) return;
      const p = local(e);
      if (!p.inside) return;
      this.lastMove = performance.now();
      const far = Math.max(...[[0, 0], [this.W, 0], [0, this.H], [this.W, this.H]].map(([x, y]) => Math.hypot(x - p.x, y - p.y)));
      this.ripples = [...this.ripples.slice(1 - RIPPLE.max), { x: p.x, y: p.y, far, t: 0 }];
      this.start();
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    let t = 0, raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => this.resize());
      clearTimeout(t);
      t = window.setTimeout(() => this.resize(), 150); // and once more when it settles
    };
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(this.el);
    const io = new IntersectionObserver((es) => (es[es.length - 1].isIntersecting ? this.start() : this.stop()));
    io.observe(this.el);
    const vis = () => (document.hidden ? this.stop() : this.start());
    document.addEventListener("visibilitychange", vis);
    this.off.push(() => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
      document.removeEventListener("visibilitychange", vis);
      ro.disconnect();
      io.disconnect();
    });
  }
  private leave() {
    this.pointer = false;
    this.It = 0;
  }
  /** PanelReveal marks the pinned hero layer while the next section covers it. */
  private paused() {
    return !!this.el.closest("[data-paused]");
  }

  destroy() {
    this.dead = true;
    this.stop();
    this.off.forEach((f) => f());
    for (const c of [this.base, this.figEl, this.light, this.cue]) c.remove();
    for (const c of [this.base, this.figEl, this.fx, this.lit, this.core, this.scratch, this.figLit]) c.width = c.height = 0;
    this.el.classList.remove("is-ready");
  }
  start() {
    if (this.running || this.dead) return;
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame(this.loop);
  }
  stop() {
    this.running = false;
  }

  /* ---- build ---- */
  resize() {
    const box = this.el.getBoundingClientRect();
    const W = Math.max(1, Math.round(box.width)), H = Math.max(1, Math.round(box.height));
    let dpr = Math.min(window.devicePixelRatio || 1, this.cfg.maxDpr);
    if (W * H * dpr * dpr > this.cfg.maxPixels) dpr = Math.sqrt(this.cfg.maxPixels / (W * H));
    if (W === this.W && H === this.H && dpr === this.dpr) return;
    this.W = W; this.H = H; this.dpr = dpr;
    for (const c of [this.base, this.figEl, this.fx, this.lit, this.core, this.scratch, this.figLit]) {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
    }
    this.R = clamp(Math.min(W, H) * this.cfg.radius, this.cfg.minRadius, this.cfg.maxRadius);
    this.scene = buildScene(W, H, this.cfg.seed, W < 1024);
    this.sparkleDots = this.scene.dots.filter((d) => d.sp);
    this.paintBase();
    this.paintLit();
    this.paintCore();
    this.seedDust();
    this.poseKey = "";
    this.drawFigure(true);
    this.draw();
  }
  private ctx(c: HTMLCanvasElement) {
    const x = c.getContext("2d")!;
    x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    x.globalAlpha = 1;
    x.globalCompositeOperation = "source-over";
    x.shadowBlur = 0;
    x.clearRect(0, 0, this.W, this.H);
    x.lineJoin = x.lineCap = "round";
    return x;
  }
  private paintBase() {
    const x = this.ctx(this.base), { baseRGB, baseAlpha } = this.cfg, s = this.scene!;
    x.lineWidth = 1;
    for (const l of ORDER) {
      x.strokeStyle = `rgba(${baseRGB},${baseAlpha * LAYERS[l][0]})`;
      strokeLines(x, s.lines[l]);
    }
    x.fillStyle = `rgba(${baseRGB},${1.25 * baseAlpha})`;
    fillDots(x, s.dots, 1);
  }
  private paintLit() {
    const x = this.ctx(this.lit), s = this.scene!, { glow, glowBlur } = this.cfg;
    x.shadowColor = x.strokeStyle = x.fillStyle = glow;
    for (const [blur, lw] of [[glowBlur, 1.4], [3, 1]]) {
      x.shadowBlur = blur * this.dpr;
      x.lineWidth = lw;
      for (const l of ORDER) {
        x.globalAlpha = LAYERS[l][1];
        strokeLines(x, s.lines[l]);
      }
    }
    x.globalAlpha = 1;
    x.shadowBlur = 7 * this.dpr;
    fillDots(x, s.dots, 1.25);
  }
  private paintCore() {
    const x = this.ctx(this.core), s = this.scene!;
    x.shadowColor = this.cfg.glow;
    x.shadowBlur = 5 * this.dpr;
    x.strokeStyle = x.fillStyle = this.cfg.core;
    x.lineWidth = 0.9;
    for (const l of ["prod", "shelf", "detail"] as Layer[]) strokeLines(x, s.lines[l]);
    fillDots(x, s.dots, 1);
  }
  private seedDust() {
    const n = this.reduced ? 0 : Math.round(clamp((this.W * this.H) / 22e3, 30, 90));
    this.dust = Array.from({ length: n }, () => ({
      x: Math.random() * this.W, y: Math.random() * this.H, vy: -(4 + 10 * Math.random()),
      sw: 6 + 14 * Math.random(), ph: 6.28 * Math.random(), s: 2 + 3.5 * Math.random(), a: 0.25 + 0.5 * Math.random(),
    }));
  }

  /* ---- arm ---- */
  private camProject() {
    const s = this.scene!, c = s.cam!;
    return (p: P3) => s.P(c.x + p[0] * c.sc, c.y + p[1] * c.sc, c.z + p[2] * c.sc);
  }
  /** Re-pose and redraw the arm (its resting layer and its lit copy) when the pose changed. */
  private drawFigure(force = false) {
    const s = this.scene;
    if (!s?.cam) return;
    const key = `${this.yaw.toFixed(1)},${this.pitch.toFixed(1)},${this.reach.toFixed(3)},${this.lock.toFixed(2)},${(this.headA * this.ambient()).toFixed(3)}`;
    if (!force && key === this.poseKey) return;
    this.poseKey = key;
    const pose = (this.pose = armPose(this.yaw * DEG, this.pitch * DEG, this.reach, this.lock));
    const pr = this.camProject();
    this.shoulder = pr([0, -0.46, 0]);
    const lines = pose.lines.map((l) => l.flatMap((p) => pr(p)));
    const mask = new Path2D();
    for (const h of pose.hulls) {
      const pts = hull(h.map(pr));
      pts.forEach((p, i) => (i ? mask.lineTo(p[0], p[1]) : mask.moveTo(p[0], p[1])));
      mask.closePath();
    }
    this.figMask = mask;
    this.eye = pr(pose.eye);

    // resting layer: knock the shelves out behind it, faint strokes, an ambient glow while it is "awake"
    const x = this.ctx(this.figEl);
    x.fillStyle = this.cfg.bg;
    x.fill(mask, "nonzero");
    x.lineWidth = 1;
    x.strokeStyle = `rgba(${this.cfg.baseRGB},0.42)`;
    strokeLines(x, lines);
    const amb = this.headA * this.ambient();
    if (amb > 0.004) {
      x.globalAlpha = amb;
      x.shadowColor = x.strokeStyle = this.cfg.glow;
      x.shadowBlur = this.cfg.glowBlur * this.dpr;
      x.lineWidth = 1.2;
      strokeLines(x, lines);
    }
    // lit copy, revealed by the light like the shelves
    const l = this.ctx(this.figLit);
    l.shadowColor = l.strokeStyle = this.cfg.glow;
    for (const [blur, lw] of [[this.cfg.glowBlur, 1.4], [3, 1]]) {
      l.shadowBlur = blur * this.dpr;
      l.lineWidth = lw;
      strokeLines(l, lines);
    }
  }
  private awakeTarget() {
    return !this.reduced && performance.now() - this.lastMove < IDLE_MS ? 1 : 0;
  }
  private inFig(x: number, y: number) {
    return this.awake > 0.5 && !!this.figMask && this.hit.isPointInPath(this.figMask, x, y);
  }
  private ambient() {
    return AIM.ambient * (1 - this.lightAt(this.eye[0], this.eye[1]));
  }
  lightAt(x: number, y: number) {
    const f = (t: number) => (t < 0.3 ? lerp(1, 0.85, t / 0.3) : t < 0.62 ? lerp(0.85, 0.32, (t - 0.3) / 0.32) : t < 1 ? lerp(0.32, 0, (t - 0.62) / 0.38) : 0);
    return Math.min(1, f(Math.hypot(x - this.pos.x, y - this.pos.y) / this.R) * this.I + f(Math.hypot(x - this.trail.x, y - this.trail.y) / (0.8 * this.R)) * this.I * 0.45);
  }

  /* ---- copy avoidance (touch drift) ---- */
  private copyRects() {
    const r = this.el.getBoundingClientRect();
    return [...document.querySelectorAll("[data-shelf-copy]")].map((e) => {
      const b = e.getBoundingClientRect();
      return [b.left - r.left, b.top - r.top, b.right - r.left, b.bottom - r.top];
    });
  }
  private toCopy(x: number, y: number, rects: number[][]) {
    let d = Infinity;
    for (const [l, t, r, b] of rects) d = Math.min(d, Math.hypot(Math.max(l - x, 0, x - r), Math.max(t - y, 0, y - b)));
    return d;
  }
  private driftStep(dt: number) {
    const ox = Math.min(0.75 * this.R, 0.23 * this.W), oy = Math.min(0.75 * this.R, 0.23 * this.H);
    const a = { left: ox, right: this.W - ox, top: oy, bottom: this.H - oy };
    const pw = Math.max(1, a.right - a.left), ph = Math.max(1, a.bottom - a.top);
    const rects = this.copyRects();
    if (!this.drift || this.drift.el >= this.drift.dur) {
      const from = this.drift?.to ?? { x: 0.5, y: 0.45 };
      let to = { x: Math.random(), y: Math.random() };
      for (let i = 0; i < 8 && this.toCopy(a.left + to.x * pw, a.top + to.y * ph, rects) < 0.6 * this.R; i++) to = { x: Math.random(), y: Math.random() };
      const dist = Math.hypot((to.x - from.x) * pw, (to.y - from.y) * ph);
      this.drift = { from, to, el: 0, dur: Math.max(3.5 + 2 * Math.random(), (1.875 * dist) / 96) };
    }
    const d = this.drift;
    d.el += dt;
    const m = clamp(d.el / d.dur, 0, 1), e = m * m * m * (m * (6 * m - 15) + 10);
    this.target.x = a.left + lerp(d.from.x, d.to.x, e) * pw;
    this.target.y = a.top + lerp(d.from.y, d.to.y, e) * ph;
    this.It = 0.85 * clamp(this.toCopy(this.target.x, this.target.y, rects) / (0.6 * this.R), 0.2, 1);
  }

  /* ---- loop ---- */
  private still() {
    return this.I === 0 && this.It === 0 && !this.ripples.length && !this.intro && this.cueA < 0.01 &&
      Math.abs(this.vYaw) + Math.abs(this.vPitch) + Math.abs(this.vReach) < 0.05 && (this.headA < 0.005 || this.headA > 0.995) &&
      Math.abs(this.awake - this.awakeTarget()) < 0.005;
  }
  loop(t: number) {
    if (!this.running) return;
    const dt = Math.min(0.05, Math.max(0, (t - this.last) / 1000));
    if (this.paused() || (this.still() && dt < 1 / 30 - 0.004) || (this.reduced && this.still())) {
      if (this.paused() || this.reduced) this.last = t;
      requestAnimationFrame(this.loop);
      return;
    }
    this.last = t;
    this.update(dt);
    this.draw();
    requestAnimationFrame(this.loop);
  }

  update(dt: number) {
    const { cfg, W, H } = this;
    this.time += dt;
    const drifting = this.touch && !this.reduced && !this.pointer;
    if (drifting) {
      this.intro = null;
      this.driftStep(dt);
    }
    if (this.intro && !drifting) {
      const r = this.intro;
      r.t += dt;
      if (r.t > 0) {
        const s = clamp(r.t / 3.2, 0, 1), l = smooth(s);
        this.target.x = lerp(-0.08 * W, 1.08 * W, l);
        this.target.y = H * (0.5 + 0.16 * Math.sin(l * Math.PI * 1.6));
        this.It = 0.9 * Math.sin(Math.PI * s);
        if (s >= 1) {
          this.intro = null;
          this.It = 0;
        }
      }
    }
    if (this.I < 0.02) {
      this.pos.x = this.trail.x = this.target.x;
      this.pos.y = this.trail.y = this.target.y;
    }
    const n = 1 - Math.exp(-dt * cfg.follow), d = 1 - Math.exp(-dt * cfg.trailFollow);
    this.pos.x += (this.target.x - this.pos.x) * n;
    this.pos.y += (this.target.y - this.pos.y) * n;
    this.trail.x += (this.pos.x - this.trail.x) * d;
    this.trail.y += (this.pos.y - this.trail.y) * d;
    const p = 1 - Math.exp(-dt * (this.It > this.I ? cfg.fadeIn : cfg.fadeOut));
    this.I += (this.It - this.I) * p;
    if (this.I < 0.001 && this.It === 0) this.I = 0;
    for (const q of this.dust) {
      q.y += q.vy * dt;
      if (q.y < -10) {
        q.y = H + 10;
        q.x = Math.random() * W;
      }
    }

    // arm: reach toward the light's target while something is driving it
    const woke = this.awakeTarget();
    this.awake += (woke - this.awake) * (1 - Math.exp(-dt * (woke ? 4 : 1.6)));
    if (Math.abs(woke - this.awake) < 0.003) this.awake = woke;
    this.figEl.style.opacity = this.awake.toFixed(3);
    const tracking = !this.reduced && (this.pointer || drifting || !!this.intro || woke > 0) && (this.It > 0 || woke > 0);
    if (tracking) {
      const tg = this.target;
      if (!this.gaze) this.gaze = { ...tg };
      const g = 1 - Math.exp(-dt * AIM.gaze);
      this.gaze.x += (tg.x - this.gaze.x) * g;
      this.gaze.y += (tg.y - this.gaze.y) * g;
      // swing the turret toward the side the target is on (mostly side-on, so the arm reads in profile),
      // raise the reach toward it and stretch toward it
      const [sx, sy] = this.shoulder, dx = tg.x - sx, dy = sy - tg.y;
      const unit = this.scene?.cam?.sc ?? 100;
      this.aimYaw = clamp(Math.atan2(dx, 0.12 * Math.max(W, 900)) / DEG, -80, 80);
      this.aimPitch = clamp(Math.atan2(dy, Math.max(1, Math.abs(dx))) / DEG, 45, 84);
      this.aimReach = clamp(Math.hypot(dx, dy) / unit, 1.0, 2.05);
      const near = Math.hypot(tg.x - this.gaze.x, tg.y - this.gaze.y) < 3 ? 1 : 0;
      this.lock += clamp(near - this.lock, -6 * dt, 6 * dt);
    } else if (!this.pointer) {
      this.aimYaw = REST.yaw;
      this.aimPitch = REST.phi;
      this.aimReach = REST.reach;
    }
    const k = AIM.spring, top = AIM.topSpeed;
    this.vYaw = clamp(this.vYaw + (k * k * (this.aimYaw - this.yaw) - 2 * k * this.vYaw) * dt, -top, top);
    this.vPitch = clamp(this.vPitch + (k * k * (this.aimPitch - this.pitch) - 2 * k * this.vPitch) * dt, -top, top);
    this.vReach = clamp(this.vReach + (k * k * (this.aimReach - this.reach) - 2 * k * this.vReach) * dt, -6, 6);
    this.yaw += this.vYaw * dt;
    this.pitch += this.vPitch * dt;
    this.reach += this.vReach * dt;
    this.headA += (1 - this.headA) * (1 - Math.exp(-dt * (tracking ? 3 : 1.2)));
    const showCue = !this.reduced && this.pointer && !this.touch;
    this.cueA += (+showCue - this.cueA) * (1 - Math.exp(-4 * dt));

    for (const r of this.ripples) r.t += dt;
    this.ripples = this.ripples.filter((r) => r.t < RIPPLE.duration);
    if (!this.reduced && this.sparkleDots.length) {
      this.sparks = this.sparks.filter((s) => this.time - s.t0 < s.dur);
      if (this.sparks.length < 7 && Math.random() < 4 * dt) {
        const dd = this.sparkleDots[Math.floor(Math.random() * this.sparkleDots.length)];
        if (!this.inFig(dd.x, dd.y))
          this.sparks.push({ d: dd, t0: this.time, dur: 0.6 + 1.2 * Math.random() });
      }
    }
  }

  /** Paint `src` through soft masks drawn by `mask` into the fx layer, inside rect (device px). */
  private pass(src: HTMLCanvasElement, rect: number[], mask: (c: CanvasRenderingContext2D) => void, cutFigure: boolean) {
    const [x0, y0, x1, y1] = rect, w = x1 - x0, h = y1 - y0;
    if (w <= 0 || h <= 0) return;
    const s = this.sCtx;
    s.save();
    s.setTransform(1, 0, 0, 1, 0, 0);
    s.beginPath();
    s.rect(x0, y0, w, h);
    s.clip();
    s.clearRect(x0, y0, w, h);
    s.globalCompositeOperation = "lighter";
    s.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    mask(s);
    s.setTransform(1, 0, 0, 1, 0, 0);
    s.globalCompositeOperation = "source-in";
    s.drawImage(src, x0, y0, w, h, x0, y0, w, h);
    if (cutFigure && this.figMask && this.awake > 0.002) {
      s.globalCompositeOperation = "destination-out";
      s.globalAlpha = this.awake;
      s.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      s.fill(this.figMask);
    }
    s.restore();
    const f = this.fxCtx;
    f.save();
    f.setTransform(1, 0, 0, 1, 0, 0);
    f.globalCompositeOperation = "lighter";
    f.drawImage(this.scratch, x0, y0, w, h, x0, y0, w, h);
    f.restore();
  }
  private reveal(src: HTMLCanvasElement, spots: number[][], cut: boolean) {
    let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
    for (const [x, y, rad] of spots) {
      l = Math.min(l, x - rad); t = Math.min(t, y - rad); r = Math.max(r, x + rad); b = Math.max(b, y + rad);
    }
    const d = this.dpr;
    const rect = [Math.max(0, Math.floor(l * d)), Math.max(0, Math.floor(t * d)), Math.min(Math.round(this.W * d), Math.ceil(r * d)), Math.min(Math.round(this.H * d), Math.ceil(b * d))];
    this.pass(src, rect, (c) => {
      for (const [x, y, rad, a] of spots) {
        if (a <= 0.002) continue;
        const g = c.createRadialGradient(x, y, 0, x, y, rad);
        g.addColorStop(0, `rgba(0,0,0,${a})`);
        g.addColorStop(0.3, `rgba(0,0,0,${0.85 * a})`);
        g.addColorStop(0.62, `rgba(0,0,0,${0.32 * a})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = g;
        c.fillRect(x - rad, y - rad, 2 * rad, 2 * rad);
      }
    }, cut);
  }

  draw() {
    if (!this.scene) return;
    const f = this.fxCtx, d = this.dpr, h = this.I, R = this.R;
    this.drawFigure();
    f.setTransform(1, 0, 0, 1, 0, 0);
    f.globalCompositeOperation = "source-over";
    f.clearRect(0, 0, this.fx.width, this.fx.height);
    f.globalCompositeOperation = "lighter";
    const spr = (x: number, y: number, s: number, a: number) => {
      f.globalAlpha = a;
      f.drawImage(this.sprite, x - s / 2, y - s / 2, s, s);
    };

    if (h > 0.002) {
      const { pos: s, trail: t } = this;
      const spots = [[s.x, s.y, R, h], [t.x, t.y, 0.8 * R, 0.45 * h]];
      this.reveal(this.lit, spots, true);
      if (this.awake > 0.002) this.reveal(this.figLit, spots.map(([x, y, r, a]) => [x, y, r, a * this.awake]), false);
      this.reveal(this.core, [[s.x, s.y, 0.5 * R, 0.9 * h]], true);
      f.setTransform(d, 0, 0, d, 0, 0);
      const r2 = R * R;
      for (const dot of this.sparkleDots) {
        const dx = dot.x - s.x, dy = dot.y - s.y, q = dx * dx + dy * dy;
        if (q > r2) continue;
        if (this.inFig(dot.x, dot.y)) continue;
        let l = 1 - Math.sqrt(q) / R;
        l = l * l * h;
        const w = 0.5 + 0.5 * Math.sin(this.time * dot.fq + dot.ph);
        const a = l * (0.15 + 0.85 * w * w * w);
        if (a > 0.03) spr(dot.x, dot.y, 7 * dot.s, a);
      }
      for (const q of this.dust) {
        const x = q.x + Math.sin(0.6 * this.time + q.ph) * q.sw;
        const dist = Math.hypot(x - s.x, q.y - s.y);
        if (dist > 1.2 * R) continue;
        const a = 1 - dist / (1.2 * R);
        spr(x, q.y, 3 * q.s, a * a * q.a * h);
      }
    }
    f.setTransform(d, 0, 0, d, 0, 0);
    for (const sp of this.sparks) {
      const e = (this.time - sp.t0) / sp.dur;
      spr(sp.d.x, sp.d.y, 6 * sp.d.s, 0.32 * Math.sin(Math.PI * e));
    }
    f.globalAlpha = 1;

    if (this.ripples.length) this.drawRipples();
    this.moveAuras(h > 0.002 ? h : 0);
    this.moveReticle();
  }

  private drawRipples() {
    const d = this.dpr;
    const rings = this.ripples.map((r) => {
      const e = r.t / RIPPLE.duration;
      const rad = (r.far + RIPPLE.width) * (1 - Math.pow(1 - e, 1.7));
      const a = RIPPLE.alpha * Math.min(1, e / 0.04) * Math.pow(1 - e, 0.8);
      return { ...r, rad, inner: Math.max(0, rad - RIPPLE.width), a };
    }).filter((r) => r.rad > 2 && r.a > 0.005);
    if (!rings.length) return;
    const rect = [0, 0, Math.round(this.W * d), Math.round(this.H * d)];
    const paint = (c: CanvasRenderingContext2D) => {
      for (const r of rings) {
        const g = c.createRadialGradient(r.x, r.y, r.inner, r.x, r.y, r.rad);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(0.75, `rgba(0,0,0,${0.6 * r.a})`);
        g.addColorStop(0.95, `rgba(0,0,0,${r.a})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = g;
        c.beginPath();
        c.arc(r.x, r.y, r.rad, 0, 2 * Math.PI);
        if (r.inner > 0) c.arc(r.x, r.y, r.inner, 0, 2 * Math.PI, true);
        c.fill("evenodd");
      }
    };
    this.pass(this.lit, rect, paint, true);
    if (this.awake > 0.002) this.pass(this.figLit, rect, paint, false);
  }

  private moveAuras(a: number) {
    const sizes = [2.4, 0.9];
    this.auras.forEach((el, i) => {
      const p = i ? this.trail : this.pos, r = this.R * sizes[i];
      el.style.width = el.style.height = `${2 * r}px`;
      el.style.opacity = a.toFixed(3);
      if (a) el.style.transform = `translate3d(${(p.x - r).toFixed(1)}px,${(p.y - r).toFixed(1)}px,0)`;
    });
  }

  private moveReticle() {
    const c = this.cue, g = this.gaze, a = this.cueA * Math.min(1, 1.4 * this.I) * this.awake;
    if (a <= 0.01 || !g) {
      if (c.style.opacity !== "0") c.style.opacity = "0";
      return;
    }
    const d = this.dpr, half = lerp(10, 6.5, this.lock);
    if (c.width !== Math.round(32 * d) || c.style.width !== "32px") {
      c.width = c.height = Math.round(32 * d);
      c.style.width = c.style.height = "32px";
    }
    const x = c.getContext("2d")!;
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.clearRect(0, 0, c.width, c.height);
    x.setTransform(d, 0, 0, d, 0, 0);
    x.strokeStyle = this.cfg.core;
    x.lineWidth = 1;
    x.lineCap = "square";
    x.beginPath();
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const ex = 16 + sx * half, ey = 16 + sy * half;
      x.moveTo(ex, ey - 3.5 * sy);
      x.lineTo(ex, ey);
      x.lineTo(ex - 3.5 * sx, ey);
    }
    x.stroke();
    c.style.transform = `translate(${Math.round(g.x * d) / d - 16}px,${Math.round(g.y * d) / d - 16}px)`;
    c.style.opacity = a.toFixed(3);
  }
}
