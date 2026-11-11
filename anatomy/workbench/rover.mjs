// The rover for the hero workbench (adapted from anatomy/rover/build.mjs).
// It owns the shared camera P and the test bed every product stands on, and exports its parts;
// anatomy/workbench/build.mjs assembles the bench, the rover, the cabinet and the test fixture.
// The rover keeps its own recorder, so its depth order is settled and audited on its own.
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";
import * as A from "../kit/audit.mjs";

// World units are centimetres: x forward, y to the rover's left (toward the viewer), z up.
export const W = 880;
export const H = 500;
const AZIMUTH = 55;
const ELEVATION = 30;
const FADE = [0.04, 0.42];

const WHEEL_R = 15;
const WHEEL_W = 11;
const AXLE = WHEEL_R;
const WHEEL_IN = 44;
const WHEEL_X = [58, 0, -58];
const ROCKER_Y = [30, 35];
const BOGIE_Y = [35, 40];
const LINK_H = 5;
const PIVOT = [8, 46];
const BOGIE = [-29, 31];
const TOPS = [34, 27, 27];
const BODY = { x: -40, y: -28, w: 80, d: 56, r: 4 };
const BODY_Z = [30, 58];
const DECK = { x: -50, y: -36, w: 100, d: 72, r: 3 };
const DECK_Z = 72;
const DECK_H = 3;
const DECK_TOP = DECK_Z + DECK_H;
const MAST_AT = [34, 22];
const HEAD_Z = [128, 138];
const PLATE = { x: -104, y: -92, w: 208, d: 184, r: 8 };

const PIECES = {
  mast: { name: "Remote-sensing mast", say: "stereo cameras on a pan-tilt head", move: [0, 0, 76] },
  antenna: { name: "Antennas", say: "hex high-gain plate on a gimbal", move: [0, 0, 60] },
  deck: { name: "Solar deck", say: "", move: [0, 0, 44] },
  avionics: { name: "Avionics bay", say: "battery, flight computer, radio", move: [0, 0, 20] },
  rtg: { name: "Radioisotope power unit", say: "", move: [-44, 0, 8] },
  "wheels.near": { name: "Near-side wheels", say: "", move: [0, 40, 4] },
  "wheels.far": { name: "Far-side wheels", say: "", move: [0, -40, 4] },
  "susp.near": { name: "Near rocker-bogie", say: "rocker and bogie on two free pivots", move: [0, 18, 0] },
  "susp.far": { name: "Far rocker-bogie", say: "rocker and bogie on two free pivots", move: [0, -18, 0] },
  body: { name: "Warm electronics box", say: "", move: [0, 0, 0] },
  stand: { name: "Test bed", say: "", move: [0, 0, 0] },
};
const ORDER = ["mast", "antenna", "deck", "avionics", "rtg", "wheels.near", "wheels.far", "susp.near", "susp.far"];
// Scroll progress p in [0, 1] drives every assembly: assembly i leaves over [start + i·step, start + i·step + length].
const SCHEDULE = { start: 0.04, step: 0.075, length: 0.3 };
const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const sharesAt = (p) => Object.fromEntries(ORDER.map((id, i) => [id, smooth((p - SCHEDULE.start - i * SCHEDULE.step) / SCHEDULE.length)]));
const statesOver = (step) => Array.from({ length: Math.round(1 / step) + 1 }, (_, i) => ({ label: `scroll ${(i * step).toFixed(3)}`, shares: sharesAt(i * step) }));

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -17, 0),
    [MAST_AT[0], MAST_AT[1], HEAD_Z[1] + 4],
    // the tallest and widest of the other products on the same bench
    ...k.boxCorners({ x: -76, y: -44, w: 152, d: 88, r: 0 }, 0, 132),
  ],
  W,
  H,
  { pad: 4, azimuth: AZIMUTH, elevation: ELEVATION },
);
const V = G.viewOf(P);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const Dots = (points, style) => k.dotsSvg(points, style);
const loop = (points) => `M${points.map((p) => k.iso(p, P).map((v) => v.toFixed(1)).join(" ")).join("L")}Z`;

const R = A.recorder(P, { order: ORDER, spring: {} });
const put = (piece, at, svg, shapes, { bias = 0, name } = {}) => R.put({ piece, at, bias, svg, move: PIECES[piece].move, shapes, name: name ?? R.nameFor(`${piece}.item`) });
const meta = (piece, name) => ({ name, owner: piece });
const yAxis = (o, side) => G.frameOf(o, [0, side, 0], [1, 0, 0], [0, 0, 1]);
const xAxis = (o, sign = 1) => G.frameOf(o, [sign, 0, 0], [0, 1, 0], [0, 0, sign]);

function slab(piece, name, plan, z, h, { tone = "hi", steps = 4, bevel = 0, inner = "", extra = "", bias = 0 } = {}) {
  const id = R.nameFor(`${piece}.${name}`);
  put(piece, [plan.x + plan.w / 2, plan.y + plan.d / 2, z + h / 2], S(k.slabOf(plan, z, h, P, steps, bevel), { tone, inner }) + extra, [R.solid(A.slab(plan, z, h, meta(piece, id), steps))], { bias, name: id });
}
function post(piece, name, cx, cy, r, z, h, { tone = "mid", steps = 24, bevel = 0, inner = "", extra = "", bias = 0 } = {}) {
  const id = R.nameFor(`${piece}.${name}`);
  put(piece, [cx, cy, z + h / 2], S(k.cylinder(cx, cy, r, z, h, P, steps, bevel), { tone, inner }) + extra, [R.solid(A.cylinder(cx, cy, r, z, h, meta(piece, id)))], { bias, name: id });
}
function disc(piece, name, F, s0, s1, r, { tone = "mid", inner = "", extra = "", bias = 0 } = {}) {
  const id = R.nameFor(`${piece}.${name}`);
  put(piece, G.pointOf(F, (s0 + s1) / 2, 0, 0), S(G.disc(s0, s1, r, F, P), { tone, inner }) + extra, [R.solid(A.disc(F, s0, s1, r, meta(piece, id)))], { bias, name: id });
}
function turned(piece, name, F, profile, { tone = "hi", inner = "", extra = "", bias = 0 } = {}) {
  const id = R.nameFor(`${piece}.${name}`);
  const mid = (profile[0][0] + profile[profile.length - 1][0]) / 2;
  put(piece, G.pointOf(F, mid, 0, 0), S(G.solidOf(profile, F, P), { tone, inner }) + extra, [R.solid(A.solid(F, profile, meta(piece, id)))], { bias, name: id });
}
function prism(piece, name, F, polygon, s0, s1, { tone = "mid", inner = "", extra = "", bias = 0 } = {}) {
  const id = R.nameFor(`${piece}.${name}`);
  put(piece, G.pointOf(F, (s0 + s1) / 2, 0, 0), S(G.prismOf(F, polygon, s0, s1, P), { tone, inner }) + extra, [R.solid(A.prism(F, polygon, s0, s1, meta(piece, id)))], { bias, name: id });
}
const rect = (hu, hv) => [[-hu, -hv], [hu, -hv], [hu, hv], [-hu, hv]];
// A bar of the rocker-bogie: a 5 × 5 section between two joint centres in one link plane (x, z), ending inside
// each joint's disc (trim) so no two bars ever pass through each other.
function bar(piece, name, [ax, az], [bx, bz], plane, side, [ta, tb]) {
  const y = (side * (plane[0] + plane[1])) / 2;
  const axis = G.unit3([bx - ax, 0, bz - az]);
  const F = G.frameOf([ax, y, az], axis, [0, 1, 0], G.cross3(axis, [0, 1, 0]));
  prism(piece, name, F, rect((plane[1] - plane[0]) / 2, LINK_H / 2), ta, Math.hypot(bx - ax, bz - az) - tb, { tone: "mid" });
}
// A joint disc across one or more link planes, drawn over the bar ends it holds.
// A bar ends where its corners meet the joint's rim: one-sided contact, no interlock.
const seat = (r) => Math.sqrt(r * r - (LINK_H / 2) ** 2);
function joint(piece, name, [x, z], [y0, y1], side, r, { tone = "mid", face = false, pin = 0 } = {}) {
  const F = yAxis([x, side * y0, z], side);
  disc(piece, name, F, 0, y1 - y0, r, { tone, extra: face ? Ln(G.circleOf(F, y1 - y0, r - 1.4, P), { tone: "lo" }) : "" });
  if (pin) disc(piece, `${name}-pin`, F, y1 - y0, y1 - y0 + 1.2, pin, { tone: "mid" });
}

// ---------- Test bed (fixed) ----------
const back = [];
back.push(`<path class="iso-halo" d="${k.haloOf(PLATE, -17, 17, P)}"/>`);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
  back.push(S(k.cylinder(x, y, 7, -17, 1.6, P, 28), { tone: "lo" }));
  back.push(S(k.cylinder(x, y, 5.4, -15.4, 3.4, P, 28), { tone: "mid" }));
  R.solid(A.cylinder(x, y, 7, -17, 1.6, { name: R.nameFor("stand.flange") }));
  R.solid(A.cylinder(x, y, 5.4, -15.4, 3.4, { name: R.nameFor("stand.foot") }));
}
R.solid(A.slab(PLATE, -12, 12, { name: "stand.plate" }));
const plateScrews = k.corners(PLATE, 10);
back.push(
  S(k.slabOf(PLATE, -12, 12, P, 8, 1.6), {
    tone: "mid",
    inner: Ln(k.sideSeam(PLATE, -5, P, 8), { tone: "faint" }),
  }) +
    Ln(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }) +
    plateScrews.map(([x, y]) => Ln(k.ring(x, y, 2.2, 0, P, 16), { tone: "lo" })).join("") +
    Dots(k.pointsAt(plateScrews.map(([x, y]) => [x, y, 0]), P), { size: 0.5 }),
);
back.push(`<path class="iso-halo" d="${k.haloOf({ x: -76, y: -56, w: 152, d: 112, r: 20 }, 0, 4, P)}"/>`);
const STRIP = { x: -84, y: PLATE.y + PLATE.d - 15, w: 168, d: 7, r: 1 };
R.solid(A.slab(STRIP, 0, 0.6, { name: "stand.ruler" }));
const ticks = k.topTicks(STRIP.x + 4, STRIP.x + STRIP.w - 4, 4, 5, STRIP.y, 0.6, [2, 3.6], P);
back.push(S(k.slabOf(STRIP, 0, 0.6, P, 3), { tone: "lo", crease: "none" }) + Ln(ticks.minor, { tone: "lo" }) + Ln(ticks.major, { tone: "mid" }));
const LABEL = { x: -96, y: 30, w: 26, d: 14, r: 1.5 };
R.solid(A.slab(LABEL, 0, 0.8, { name: "stand.label" }));
back.push(
  S(k.slabOf(LABEL, 0, 0.8, P, 4), { tone: "mid" }) +
    Ln(k.planOutline(k.insetPlan(LABEL, 1.6), 0.8, P), { tone: "faint" }) +
    [16, 11, 7].map((len, i) => Ln(k.lineOnTop([LABEL.x + 4, LABEL.y + 4.4 + i * 3.2], [LABEL.x + 4 + len, LABEL.y + 4.4 + i * 3.2], 0.8, P), { tone: "lo", free: true })).join("") +
    Dots(k.pointsAt([[LABEL.x + LABEL.w - 3, LABEL.y + 3, 0.8], [LABEL.x + LABEL.w - 3, LABEL.y + LABEL.d - 3, 0.8]], P), { size: 0.45 }),
);

// Rocks on the bed: irregular convex outlines, bevelled.
const ROCKS = [
  [86, 18, 8, 5.2, 0.3],
  [-86, -40, 7, 4.2, 1.4],
  [30, -78, 4, 3, 2.2],
  [96, 4, 3.6, 2.4, 0.9],
];
ROCKS.forEach(([cx, cy, r, h, seed], index) => {
  const ring = Array.from({ length: 9 }, (_, i) => {
    const t = (i / 9) * Math.PI * 2 + seed;
    const rr = r * (0.78 + 0.22 * Math.sin(i * 2.7 + seed * 3));
    return [cx + Math.cos(t) * rr, cy + Math.sin(t) * rr * 0.86];
  });
  const id = `stand.rock${index}`;
  put("stand", [cx, cy, h / 2], S(k.extrude(ring, 0, h, P, { bevel: 0.5 }), { tone: "mid" }), [R.solid(A.extruded(ring, 0, h, { name: id }))], { name: id });
});

// ---------- Body (fixed to the rocker pivots) ----------
const [Z0, Z1] = BODY_Z;
const bodySeams = Ln(k.sideSeam(BODY, 35, P, 4), { tone: "faint" }) + Ln(k.sideSeam(BODY, 55, P, 4), { tone: "faint" });
const bodyScrews = k.corners(BODY, 4.5);
slab("body", "box", BODY, Z0, Z1 - Z0, {
  tone: "hi",
  bevel: 1.2,
  inner: bodySeams,
  extra:
    // vents on the near face: closed slots
    Array.from({ length: 6 }, (_, i) => {
      const x = -35 + i * 3.4;
      const r = 1.2;
      const pts = [];
      for (let j = 0; j <= 8; j++) pts.push([x + r * Math.cos((j / 8) * Math.PI), BODY.y + BODY.d, 49 + r * Math.sin((j / 8) * Math.PI)]);
      for (let j = 0; j <= 8; j++) pts.push([x + r * Math.cos(Math.PI + (j / 8) * Math.PI), BODY.y + BODY.d, 41 + r * Math.sin(Math.PI + (j / 8) * Math.PI)]);
      return Ln(loop(pts), { tone: "lo" });
    }).join("") +
    Dots(k.pointsAt(bodyScrews.map(([x, y]) => [x, y, Z1]), P), { size: 0.5 }),
});
// Name plate on the near face, with the one engraved label.
const NAME_F = G.frameOf([25, BODY.y + BODY.d, 50.4], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
prism("body", "nameplate", NAME_F, rect(10, 3.2), 0, 0.8, {
  tone: "mid",
  extra:
    k.faceTextSvg(k.sideMatrix([25, BODY.y + BODY.d + 0.8], 49.5, P, "left"), "ROVER·01", { size: 2.6, tone: "lo", anchor: "middle" }) +
    Dots(k.pointsAt([[16.6, BODY.y + BODY.d + 0.8, 50.4], [33.4, BODY.y + BODY.d + 0.8, 50.4]], P), { size: 0.42 }),
});
// Hazard cameras on the front face.
const HAZ_F = xAxis([BODY.x + BODY.w, 0, 44]);
prism("body", "hazcam-pod", HAZ_F, rect(11, 3.5), 0, 4, { tone: "mid" });
for (const y of [-6, 6]) {
  const F = xAxis([BODY.x + BODY.w + 4, y, 44]);
  disc("body", "hazcam", F, 0, 1.4, 2.2, { tone: "hi", extra: Ln(G.circleOf(F, 1.4, 1.2, P), { tone: "lo" }) + Dots([k.iso([BODY.x + BODY.w + 5.4, y, 44], P)], { size: 0.45 }) });
}
// Pivot bosses on both sides, where the rockers hang.
for (const side of [1, -1]) disc("body", "pivot-boss", yAxis([PIVOT[0], side * 28, PIVOT[1]], side), 0, ROCKER_Y[0] - 28, 5, { tone: "mid" });
// Standoffs that carry the deck.
for (const [x, y] of [[-34, -22], [34, -22], [-34, 22], [34, 22]]) post("body", "standoff", x, y, 2.2, Z1, DECK_Z - Z1, { tone: "mid", steps: 16, inner: Ln(k.sideArc(x, y, 2.2, Z1 + 3, P, 12), { tone: "faint" }) });

// ---------- Avionics bay (sits on the body top, under the deck) ----------
const BATT = { x: -32, y: -20, w: 30, d: 40, r: 2 };
const battIn = k.insetPlan(BATT, 2);
slab("avionics", "battery", BATT, Z1, 10, {
  tone: "hi",
  bevel: 0.6,
  extra:
    Ln(k.planOutline(battIn, Z1 + 10, P, 4), { tone: "faint" }) +
    [-10, 0, 10].map((dy) => Ln(k.lineOnTop([battIn.x, dy], [battIn.x + battIn.w, dy], Z1 + 10, P), { tone: "lo" })).join("") +
    Dots(k.pointsAt([[BATT.x + 5, -15, Z1 + 10], [BATT.x + 5, 15, Z1 + 10]], P), { size: 0.7, tone: "mid" }),
});
const CPU = { x: 4, y: -20, w: 26, d: 22, r: 2 };
slab("avionics", "computer", CPU, Z1, 9, {
  tone: "hi",
  bevel: 0.5,
  extra: Array.from({ length: 7 }, (_, i) => Ln(k.lineOnTop([CPU.x + 4 + i * 3, CPU.y], [CPU.x + 4 + i * 3, CPU.y + CPU.d], Z1 + 9, P), { tone: "lo" })).join(""),
});
const RADIO = { x: 6, y: 6, w: 16, d: 14, r: 1.5 };
slab("avionics", "radio", RADIO, Z1, 6, { tone: "hi", bevel: 0.4, extra: Ln(k.planOutline(k.insetPlan(RADIO, 1.5), Z1 + 6, P, 3), { tone: "faint" }) });
post("avionics", "radio-port", 18, 13, 1.6, Z1 + 6, 2, { tone: "mid", steps: 14 });

// ---------- Solar deck ----------
const deckIn = k.insetPlan(DECK, 4);
const COLS = [-34, -22, -10, 2, 14, 26, 38];
const ROWS = [-20, -8, 4, 16];
const cells = (COLS.length + 1) * (ROWS.length + 1);
PIECES.deck.say = `${cells} cells in a ${COLS.length + 1} × ${ROWS.length + 1} grid`;
slab("deck", "panel", DECK, DECK_Z, DECK_H, {
  tone: "hi",
  steps: 4,
  bevel: 0.8,
  extra:
    Ln(k.planOutline(deckIn, DECK_TOP, P, 4), { tone: "lo" }) +
    COLS.map((x) => Ln(k.lineOnTop([x, deckIn.y], [x, deckIn.y + deckIn.d], DECK_TOP, P), { tone: "faint" })).join("") +
    ROWS.map((y) => Ln(k.lineOnTop([deckIn.x, y], [deckIn.x + deckIn.w, y], DECK_TOP, P), { tone: "faint" })).join("") +
    Dots(k.pointsAt(k.corners(DECK, 2).map(([x, y]) => [x, y, DECK_TOP]), P), { size: 0.45 }),
});

// ---------- Mast ----------
const [mx, my] = MAST_AT;
post("mast", "collar", mx, my, 5, DECK_TOP, 4, { tone: "mid", steps: 28, bevel: 0.4, extra: Dots(k.pointsAt([0, 1, 2, 3].map((i) => [mx + 3.6 * Math.cos(i * 1.57 + 0.4), my + 3.6 * Math.sin(i * 1.57 + 0.4), DECK_TOP + 4]), P), { size: 0.4 }) });
post("mast", "tube", mx, my, 2.6, DECK_TOP + 4, 121 - DECK_TOP - 4, { tone: "hi", steps: 20, inner: Ln(k.sideArc(mx, my, 2.6, 96, P, 14) + k.sideArc(mx, my, 2.6, 110, P, 14), { tone: "faint" }) });
post("mast", "pan", mx, my, 4.2, 121, 5, { tone: "mid", steps: 24, inner: Ln(k.knurl(mx, my, 4.2, 121.6, 125.4, 26, P, 0.3), { tone: "lo" }) });
slab("mast", "yoke", { x: mx - 4, y: my - 9, w: 8, d: 18, r: 1 }, 126, 2, { tone: "mid", steps: 3 });
const HEAD = { x: mx - 6, y: my - 10, w: 13, d: 20, r: 2 };
slab("mast", "head", HEAD, HEAD_Z[0], HEAD_Z[1] - HEAD_Z[0], { tone: "hi", bevel: 0.6, inner: Ln(k.sideSeam(HEAD, 131, P, 4), { tone: "faint" }), extra: Ln(k.planOutline(k.insetPlan(HEAD, 1.6), HEAD_Z[1], P, 4), { tone: "faint" }) });
for (const dy of [-5, 5]) {
  const F = xAxis([HEAD.x + HEAD.w, my + dy, 133.4]);
  disc("mast", "camera", F, 0, 1.6, 2.6, { tone: "mid", extra: Ln(G.circleOf(F, 1.6, 1.5, P), { tone: "lo" }) + Dots([k.iso([HEAD.x + HEAD.w + 1.6, my + dy, 133.4], P)], { size: 0.55, tone: "mid" }) });
}

// ---------- Antennas ----------
const ANT = [-30, -20];
post("antenna", "collar", ANT[0], ANT[1], 3.6, DECK_TOP, 2, { tone: "mid", steps: 22 });
post("antenna", "post", ANT[0], ANT[1], 2, DECK_TOP + 2, 13, { tone: "mid", steps: 16 });
const BALL = [ANT[0], ANT[1], DECK_TOP + 17];
{
  const id = "antenna.gimbal";
  put("antenna", BALL, S(G.sphereOf(BALL, 2.6, P), { tone: "mid" }), [R.solid(A.ball(BALL, 2.6, meta("antenna", id)))], { name: id });
}
const DISH_A = G.unit3([0.62, 0.28, 0.73]);
const DISH_F = G.frameAlong(BALL, DISH_A);
disc("antenna", "boss", DISH_F, 2, 7, 1.8, { tone: "mid" });
const HEX = Array.from({ length: 6 }, (_, i) => [12 * Math.cos((i * Math.PI) / 3), 12 * Math.sin((i * Math.PI) / 3)]);
const hexOn = (s, scale) => loop(HEX.map(([u, v]) => G.add3(G.add3(G.pointOf(DISH_F, s, 0, 0), G.mul3(DISH_F.u, u * scale)), G.mul3(DISH_F.v, v * scale))));
prism("antenna", "high-gain", DISH_F, HEX, 7, 8.6, {
  tone: "hi",
  extra: Ln(hexOn(8.6, 0.84), { tone: "lo" }) + Ln(hexOn(8.6, 0.5), { tone: "faint" }) + Dots([k.iso(G.pointOf(DISH_F, 8.6, 0, 0), P)], { size: 0.7, tone: "mid" }),
});
post("antenna", "low-gain-base", -42, 26, 2.6, DECK_TOP, 2, { tone: "mid", steps: 18 });
post("antenna", "low-gain", -42, 26, 1.4, DECK_TOP + 2, 15, { tone: "hi", steps: 14, inner: Ln(k.sideArc(-42, 26, 1.4, DECK_TOP + 9, P, 10), { tone: "faint" }) });
post("antenna", "low-gain-cap", -42, 26, 2.2, DECK_TOP + 17, 2.4, { tone: "mid", steps: 16, bevel: 0.3 });

// ---------- Radioisotope power unit ----------
prism("rtg", "bracket", xAxis([BODY.x, 0, 47], -1), rect(7, 5), 0, 6, { tone: "mid", extra: Dots(k.pointsAt([[-43, -5, 52], [-43, 5, 52]], P), { size: 0.42 }) });
const RTG_F = xAxis([BODY.x - 6, 0, 47], -1);
turned("rtg", "core", RTG_F, [[0, 9], [1.5, 9], [1.5, 7.4], [26, 7.4], [26, 9], [27.5, 9]], {
  tone: "hi",
  inner: Ln(G.arcOf(RTG_F, 9, 7.4, P) + G.arcOf(RTG_F, 18.5, 7.4, P), { tone: "faint" }),
});
const FINS = 8;
PIECES.rtg.say = `${FINS} cooling fins · heat to electricity, no sunlight needed`;
for (let i = 0; i < FINS; i++) {
  const t = (i / FINS) * Math.PI * 2 + Math.PI / FINS;
  const [c, s] = [Math.cos(t), Math.sin(t)];
  const fin = [[7.3 * c - 0.45 * -s, 7.3 * s - 0.45 * c], [13 * c - 0.45 * -s, 13 * s - 0.45 * c], [13 * c + 0.45 * -s, 13 * s + 0.45 * c], [7.3 * c + 0.45 * -s, 7.3 * s + 0.45 * c]];
  prism("rtg", "fin", RTG_F, fin, 3.5, 24, { tone: "mid" });
}

// ---------- Wheels and rocker-bogies ----------
const TIRE = [[0, 12.2], [0.7, 14.3, 1], [1.8, WHEEL_R], [WHEEL_W - 1.8, WHEEL_R], [WHEEL_W - 0.7, 14.3, 1], [WHEEL_W, 12.2]];
PIECES["wheels.near"].say = PIECES["wheels.far"].say = `3 drive wheels · ${WHEEL_R * 2} cm across, 24 grousers each`;
for (const side of [1, -1]) {
  const near = side === 1;
  const W_PIECE = near ? "wheels.near" : "wheels.far";
  const L_PIECE = near ? "susp.near" : "susp.far";
  WHEEL_X.forEach((x, i) => {
    const F = yAxis([x, side * WHEEL_IN, AXLE], side);
    disc(W_PIECE, "motor", F, -4, 0, 6.2, { tone: "mid", inner: Ln(G.arcOf(F, -2, 6.2, P), { tone: "faint" }) });
    turned(W_PIECE, "tire", F, TIRE, {
      tone: "hi",
      inner: k.fadedSvg(G.ribsOf(F, 1.8, WHEEL_W - 1.8, WHEEL_R, 24, P, { fade: FADE, phase: i * 0.4 }), { tone: "lo" }),
      extra: near ? Ln(G.circleOf(F, WHEEL_W, 10.4, P), { tone: "lo" }) + Ln(G.spokesOf(F, WHEEL_W, 5, 10.4, 6, P, { phase: 0.3 + i }), { tone: "faint" }) : "",
    });
    if (near) disc(W_PIECE, "hub", F, WHEEL_W, WHEEL_W + 1.2, 5, { tone: "mid", extra: Dots(G.dotsOf(F, WHEEL_W + 1.2, 3.4, 6, P, { all: true, phase: i }), { size: 0.42 }) + Ln(G.circleOf(F, WHEEL_W + 1.2, 1.6, P), { tone: "lo" }) });
    // The front wheel hangs on the rocker, the middle and rear wheels on the bogie.
    const plane = i === 0 ? ROCKER_Y : BOGIE_Y;
    joint(L_PIECE, "axle-boss", [x, AXLE], plane, side, 5, { face: near && i > 0 });
    if (i === 0) joint(L_PIECE, "axle-spacer", [x, AXLE], BOGIE_Y, side, 3.2, { face: near });
    bar(L_PIECE, "strut", [x, AXLE], [x, TOPS[i]], plane, side, [seat(5), seat(4.2)]);
    joint(L_PIECE, "knuckle", [x, TOPS[i]], plane, side, 4.2);
  });
  bar(L_PIECE, "rocker-front", PIVOT, [WHEEL_X[0], TOPS[0]], ROCKER_Y, side, [seat(6.5), seat(4.2)]);
  bar(L_PIECE, "rocker-rear", PIVOT, BOGIE, ROCKER_Y, side, [seat(6.5), seat(5.5)]);
  bar(L_PIECE, "bogie-front", BOGIE, [WHEEL_X[1], TOPS[1]], BOGIE_Y, side, [seat(5.5), seat(4.2)]);
  bar(L_PIECE, "bogie-rear", BOGIE, [WHEEL_X[2], TOPS[2]], BOGIE_Y, side, [seat(5.5), seat(4.2)]);
  joint(L_PIECE, "rocker-pivot", PIVOT, ROCKER_Y, side, 6.5, { tone: "hi", face: near, pin: 2.4 });
  joint(L_PIECE, "bogie-pivot-rocker", BOGIE, ROCKER_Y, side, 5.5, { tone: "hi" });
  joint(L_PIECE, "bogie-pivot", BOGIE, BOGIE_Y, side, 5.5, { tone: "hi", face: near, pin: 2.2 });
}

// ---------- Settle the depth order over every scroll position, then audit ----------
const DEPTH_STATES = statesOver(0.01);
const FRAMES = statesOver(0.004);
A.settle(R, P, { states: DEPTH_STATES });
R.items.sort((a, b) => a.key - b.key);
A.auditOrExit(R, P, { frames: FRAMES });

// ---------- Exports for the workbench build ----------
export { k, G, P, PLATE };
export const BENCH = back.join("");
export const ROVER_ITEMS = R.items.map((item) => ({ piece: item.piece, key: item.key, at: item.at, svg: item.svg }));
export const ROVER_SOLIDS = R.solids.filter((shape) => !String(shape.name).startsWith("stand.")).length;
