// The tool cabinet and the PCB test fixture for the hero workbench.
// Same camera (P) and bench as the rover. Each item is { asm, at, svg }, already in painter's order
// within its product; assemblies are listed bottom-up, the order they are put together.
import { k, P } from "./rover.mjs";

const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const Dots = (points, style) => k.dotsSvg(points, style);
const at = (p) => k.iso(p, P);
const face = (points, closed = true) => k.pathOf(points.map(at), closed);
const slab = (plan, z, h, steps = 4, bevel = 0) => k.slabOf(plan, z, h, P, steps, bevel);
const cyl = (cx, cy, r, z, h, steps = 22) => k.cylinder(cx, cy, r, z, h, P, steps);
const byDepth = (list, pick = (v) => v) => [...list].sort((a, b) => k.depthOf(pick(a), P) - k.depthOf(pick(b), P));

/* ══════════════════════════ TOOL CABINET ══════════════════════════ */

export function cabinet() {
  const items = [];
  const add = (asm, centre, svg) => items.push({ asm, at: centre, svg });

  const CAB = { x: -72, y: -40, w: 144, d: 80, r: 2 };
  const FRONT = 40;
  const SIDE = 72;
  const PLINTH = { x: -67, y: -35, w: 134, d: 72, r: 2 };
  const TOP = 104;
  const LID = { x: -74.5, y: -42.5, w: 149, d: 85, r: 3 };
  const LID_TOP = 109;
  const COLS = [[-66, -3], [3, 66]];
  const rowZ = (row) => 15 + (3 - row) * 20;
  const OPEN = 2; // the drawer pulled out: second row, left
  const PULL = 30;

  // base
  for (const [x, y] of byDepth(k.corners(PLINTH, 9), ([x, y]) => [x, y, 0])) add("base", [x, y, 1], S(cyl(x, y, 3.4, 0, 2, 18), { tone: "lo" }));
  add("base", [0, 0, 5], S(slab(PLINTH, 2, 6), { tone: "lo" }));

  // carcass, with its side details, the lock and the open drawer's cavity
  const seams = Ln(k.sideSeam(CAB, 12, P, 4), { tone: "faint" }) + Ln(k.sideSeam(CAB, TOP - 2.5, P, 4), { tone: "faint" });
  const slot = (x, y0, y1, zc, r, steps = 8) => {
    const pts = [];
    for (let s = 0; s <= steps; s++) {
      const a = Math.PI / 2 + (s / steps) * Math.PI;
      pts.push([x, y0 + r + Math.cos(a) * r, zc + Math.sin(a) * r]);
    }
    for (let s = 0; s <= steps; s++) {
      const a = -Math.PI / 2 + (s / steps) * Math.PI;
      pts.push([x, y1 - r + Math.cos(a) * r, zc + Math.sin(a) * r]);
    }
    return face(pts);
  };
  const plate = { y0: -24, y1: 8, z0: 64, z1: 79 };
  const [ox0, ox1] = COLS[OPEN % 2];
  const oz0 = rowZ(Math.floor(OPEN / 2));
  add(
    "carcass",
    [0, 0, 56],
    S(slab(CAB, 8, TOP - 8), { tone: "mid", inner: seams }) +
      Ln(slot(SIDE, -16, 16, 90, 2.8), { tone: "mid" }) +
      Ln([0, 1, 2, 3].map((i) => slot(SIDE, -30 + i * 15, -20 + i * 15, 22, 1.1, 6)).join(""), { tone: "lo" }) +
      S(slab({ x: SIDE, y: plate.y0, w: 0.8, d: plate.y1 - plate.y0, r: 0.4 }, plate.z0, plate.z1 - plate.z0, 2), { tone: "lo", crease: "none" }) +
      Ln(face([[SIDE + 0.8, plate.y0 + 1.5, plate.z0 + 1.5], [SIDE + 0.8, plate.y1 - 1.5, plate.z0 + 1.5], [SIDE + 0.8, plate.y1 - 1.5, plate.z1 - 1.5], [SIDE + 0.8, plate.y0 + 1.5, plate.z1 - 1.5]]), { tone: "faint" }) +
      Ln([0, 1, 2].map((r) => face([[SIDE + 0.8, plate.y0 + 5, plate.z1 - 4.5 - r * 2.6], [SIDE + 0.8, plate.y0 + (r === 1 ? 19 : 26), plate.z1 - 4.5 - r * 2.6]], false)).join(""), { tone: "lo", free: true }) +
      S(slab({ x: -5.5, y: FRONT, w: 11, d: 0.7, r: 0.5 }, 95.5, 7, 2), { tone: "lo", crease: "none" }) +
      Ln(k.sideRing([0, FRONT + 0.7, 99], 2.6, "y", P, 24), { tone: "mid" }) +
      Ln(k.sideRing([0, FRONT + 0.7, 99], 1.4, "y", P, 18), { tone: "lo" }) +
      `<path class="wb-cavity" d="${face([[ox0, FRONT, oz0], [ox1, FRONT, oz0], [ox1, FRONT, oz0 + 18], [ox0, FRONT, oz0 + 18]])}"/>`,
  );

  // drawer fronts (all but the open one)
  const front = (o, dy) => {
    const cx = (o.x0 + o.x1) / 2;
    const y = FRONT + dy;
    const F = y + 2.2;
    return (
      S(slab({ x: o.x0 + 0.7, y, w: o.x1 - o.x0 - 1.4, d: 2.2, r: 0.8 }, o.z0 + 0.7, 16.6, 3, 0.5), { tone: "mid", lit: o.lit }) +
      S(slab({ x: cx - 11, y: F, w: 22, d: 0.7, r: 0.5 }, o.z0 + 10.2, 5.4, 2), { tone: "lo", crease: "none" }) +
      S(slab({ x: cx - 9.4, y: F + 0.7, w: 18.8, d: 0.35, r: 0.2 }, o.z0 + 11, 3.8, 2), { tone: "hi", crease: "none" }) +
      Ln([0, 1].map((r) => face([[cx - 7.4, F + 1.05, o.z0 + 13.6 - r * 1.6], [cx + (r ? 2 : 6.4), F + 1.05, o.z0 + 13.6 - r * 1.6]], false)).join(""), { tone: "lo", free: true }) +
      Dots([at([cx - 10.2, F + 0.7, o.z0 + 12.9]), at([cx + 10.2, F + 0.7, o.z0 + 12.9])], { size: 0.4 }) +
      [cx - 13, cx + 13].map((x) => S(slab({ x: x - 1.3, y: F, w: 2.6, d: 3.4, r: 0.8 }, o.z0 + 3, 2.6, 3), { tone: "mid" })).join("") +
      S(slab({ x: cx - 15.5, y: F + 3.4, w: 31, d: 2.2, r: 1.1 }, o.z0 + 2.8, 3, 4, 0.4), { tone: "hi" })
    );
  };
  for (let i = 0; i < 8; i++) {
    if (i === OPEN) continue;
    const [x0, x1] = COLS[i % 2];
    const z0 = rowZ(Math.floor(i / 2));
    add("drawers", [(x0 + x1) / 2, FRONT, z0], front({ x0, x1, z0 }, 0));
  }

  // the open drawer: its box beyond the carcass face, parts bins inside, then its front
  {
    const bx0 = ox0 + 1.4;
    const bx1 = ox1 - 1.4;
    const fl = oz0 + 1.2;
    const wallTop = oz0 + 15;
    const y0 = FRONT;
    const d = PULL;
    let svg = S(slab({ x: bx0, y: y0, w: bx1 - bx0, d, r: 0.4 }, fl, 1, 2), { tone: "lo", crease: "none" });
    svg += S(slab({ x: bx0, y: y0, w: 1.2, d, r: 0.3 }, fl + 1, wallTop - fl - 1, 2), { tone: "mid" });
    const bins = [];
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 4; c++) {
        const w = (bx1 - bx0 - 4.4) / 4;
        const plan = { x: bx0 + 2 + c * w + 0.5, y: y0 + 1.5 + r * 13.5, w: w - 1, d: 12.5, r: 1 };
        bins.push(plan);
      }
    for (const plan of byDepth(bins, (p) => [p.x + p.w / 2, p.y + p.d / 2, fl + 1])) {
      svg += S(slab(plan, fl + 1, 3, 3), { tone: "mid" }) + Ln(k.planOutline(k.insetPlan(plan, 1.1), fl + 4, P, 3), { tone: "faint" });
      for (const [dx, dy] of [[3, plan.d / 2 - 1.5], [plan.w / 2, plan.d / 2 + 1.5], [plan.w - 3, plan.d / 2 - 1.5]]) svg += S(cyl(plan.x + dx, plan.y + dy, 1.15, fl + 3.8, 1, 12), { tone: "hi" });
    }
    svg += S(slab({ x: bx1 - 1.2, y: y0, w: 1.2, d, r: 0.3 }, fl + 1, wallTop - fl - 1, 2), { tone: "mid" });
    svg += front({ x0: ox0, x1: ox1, z0: oz0, lit: true }, d);
    add("open-drawer", [(ox0 + ox1) / 2, FRONT + d, oz0], svg);
  }

  // lid
  add(
    "lid",
    [0, 0, TOP + 2.5],
    S(slab(LID, TOP, 5, 4, 0.8), { tone: "mid" }) +
      Ln(k.planOutline(k.insetPlan(LID, 3.5), LID_TOP, P, 4), { tone: "faint" }) +
      Ln(k.corners(LID, 5).map(([x, y]) => k.ring(x, y, 1.7, LID_TOP, P, 14)).join(""), { tone: "lo" }) +
      Dots(k.corners(LID, 5).map(([x, y]) => at([x, y, LID_TOP])), { size: 0.45 }),
  );

  // carry handle
  {
    let svg = "";
    for (const x of [-34, 34]) svg += S(cyl(x, 0, 4.4, LID_TOP, 1.6), { tone: "mid" }) + S(cyl(x, 0, 2.8, LID_TOP + 1.6, 10.4, 20), { tone: "mid" });
    svg += S(slab({ x: -39, y: -3.2, w: 78, d: 6.4, r: 3.2 }, LID_TOP + 12, 4.5, 6, 0.6), { tone: "mid" });
    svg += Dots([-34, 34].map((x) => at([x, 0, LID_TOP + 16.5])), { size: 0.45 });
    add("handle", [0, 0, LID_TOP + 14], svg);
  }

  return {
    id: "cabinet",
    code: "TC-08",
    name: "Tool cabinet",
    asms: [
      { id: "base", name: "Plinth and pads" },
      { id: "carcass", name: "Carcass" },
      { id: "drawers", name: "Drawer fronts" },
      { id: "open-drawer", name: "BOM drawer" },
      { id: "lid", name: "Lid" },
      { id: "handle", name: "Carry handle" },
    ],
    items,
  };
}

/* ══════════════════════════ PCB TEST FIXTURE ══════════════════════════ */

export function fixture() {
  const items = [];
  const add = (asm, centre, svg) => items.push({ asm, at: centre, svg });

  const BASE = { x: -80, y: -60, w: 160, d: 120, r: 4 };
  const BASE_Z = 2;
  const BASE_TOP = 16;
  const PIN_PLATE = { x: -64, y: -46, w: 128, d: 90, r: 2 };
  const PIN_TOP = BASE_TOP + 3;
  const PCB = { x: -58, y: -42, w: 116, d: 80, r: 2.5 };
  const PCB_Z = 30;
  const PCB_TOP = PCB_Z + 1.8;
  const REG = { x: 50, y: 8, w: 12, d: 10, r: 0.8 }; // the swapped part
  const GAUGE = [56, 13];
  const POST = [56, -48];

  // base block on rubber pads, with groove, screws and a label plate
  for (const [x, y] of byDepth(k.corners(BASE, 12), ([x, y]) => [x, y, 0])) add("base", [x, y, 1], S(cyl(x, y, 4, 0, BASE_Z, 18), { tone: "lo" }));
  {
    const screws = k.corners(BASE, 7);
    const label = { x: 18, y: 44, w: 32, d: 11, r: 1.5 };
    add(
      "base",
      [0, 0, 9],
      S(slab(BASE, BASE_Z, BASE_TOP - BASE_Z, 6, 1.2), { tone: "mid", inner: Ln(k.sideSeam(BASE, 8, P, 6), { tone: "faint" }) }) +
        Ln(k.planOutline(k.insetPlan(BASE, 4.5), BASE_TOP, P), { tone: "faint" }) +
        Ln(screws.map(([x, y]) => k.ring(x, y, 2.2, BASE_TOP, P, 16)).join(""), { tone: "lo" }) +
        Dots(screws.map(([x, y]) => at([x, y, BASE_TOP])), { size: 0.5 }) +
        S(slab(label, BASE_TOP, 0.8, 4), { tone: "lo", crease: "none" }) +
        Ln(k.planOutline(k.insetPlan(label, 1.5), BASE_TOP + 0.8, P), { tone: "faint" }) +
        Ln([0, 1, 2].map((r) => k.lineOnTop([label.x + 6, label.y + 3.4 + r * 2.2], [label.x + (r === 1 ? 20 : 27), label.y + 3.4 + r * 2.2], BASE_TOP + 0.8, P)).join(""), { tone: "lo", free: true }),
    );
  }

  // pin bed: plate, a grid of spring-loaded test pins, four board supports
  {
    let svg = S(slab(PIN_PLATE, BASE_TOP, 3, 3), { tone: "lo" }) + Ln(k.planOutline(k.insetPlan(PIN_PLATE, 2.5), PIN_TOP, P, 3), { tone: "faint" });
    const pins = [];
    for (let c = 0; c < 10; c++) for (let r = 0; r < 7; r++) pins.push([-54 + c * 12, -36 + r * 11]);
    for (const [x, y] of byDepth(pins, ([x, y]) => [x, y, 0])) {
      svg += S(cyl(x, y, 1.5, PIN_TOP, 1.2, 12), { tone: "mid", crease: "none" }) + S(cyl(x, y, 0.75, PIN_TOP + 1.2, PCB_Z - PIN_TOP - 1.2 - 0.6, 10), { tone: "hi", crease: "none" });
    }
    const supports = byDepth(k.corners(PCB, 5), ([x, y]) => [x, y, 0]);
    for (const [x, y] of supports) svg += S(cyl(x, y, 2.6, PIN_TOP, PCB_Z - PIN_TOP, 18), { tone: "mid" });
    add("pins", [0, 0, 24], svg);
  }

  // the board, with mounting holes and traces between pads
  {
    const holes = k.corners(PCB, 5);
    const pads = {
      mcu: [[-2, 16], [10, 16], [22, 16]],
      reg: [[REG.x + REG.w / 2, REG.y - 4]],
      cap: [[-38, 20], [-28, 20]],
      hdr: [[-42, -24], [-30, -24]],
    };
    const trace = (pts) => Ln(k.onTop(pts, PCB_TOP, P), { tone: "lo" });
    let svg = S(slab(PCB, PCB_Z, PCB_TOP - PCB_Z, 4, 0.5), { tone: "hi", crease: "lo" });
    svg += Ln(holes.map(([x, y]) => k.ring(x, y, 2.6, PCB_TOP, P, 18)).join(""), { tone: "mid" });
    svg += trace([pads.mcu[2], [34, 16], [34, 4], [REG.x + REG.w / 2, 4]]);
    svg += trace([pads.mcu[0], [-2, 24], [-28, 24], pads.cap[1]]);
    svg += trace([pads.cap[0], [-38, 30], [-48, 30], [-48, -24], pads.hdr[0]]);
    svg += trace([pads.hdr[1], [-20, -24], [-20, -16]]);
    svg += trace([[10, -16], [10, -30], [40, -30], [40, -18]]);
    const padDots = [...pads.mcu, ...pads.cap, ...pads.hdr, [-20, -16], [10, -16], [40, -18], [REG.x + REG.w / 2, 4], [34, 16], [34, 4]];
    svg += Dots(padDots.map(([x, y]) => at([x, y, PCB_TOP])), { size: 0.75, tone: "mid" });
    // test points along the near edge
    svg += Dots([-40, -30, -20, -10, 0, 10].map((x) => at([x, 32, PCB_TOP])), { size: 0.9, tone: "mid" });
    svg += Ln([-40, -30, -20, -10, 0, 10].map((x) => k.ring(x, 32, 1.6, PCB_TOP, P, 12)).join(""), { tone: "lo" });
    add("board", [0, 0, PCB_Z + 1], svg);
  }

  // components: MCU, header, capacitors, crystal, and the swapped regulator (lit)
  {
    const parts = [];
    const MCU = { x: -14, y: -14, w: 26, d: 26, r: 1 };
    parts.push({
      c: [MCU.x + 13, MCU.y + 13, PCB_TOP],
      svg:
        S(slab(MCU, PCB_TOP, 3, 3, 0.4), { tone: "mid" }) +
        Ln(k.ring(MCU.x + 4, MCU.y + 4, 1.4, PCB_TOP + 3, P, 12), { tone: "lo" }) +
        Ln(k.planOutline(k.insetPlan(MCU, 3), PCB_TOP + 3, P, 3), { tone: "faint" }),
    });
    const HDR = { x: -52, y: -38, w: 30, d: 7, r: 0.6 };
    parts.push({
      c: [HDR.x + 15, HDR.y + 3.5, PCB_TOP],
      svg: S(slab(HDR, PCB_TOP, 6, 2), { tone: "lo" }) + Dots([0, 1, 2, 3, 4].map((i) => at([HDR.x + 3 + i * 6, HDR.y + 3.5, PCB_TOP + 6])), { size: 0.7, tone: "hi" }),
    });
    for (const [x, y] of [[-38, 14], [-28, 14], [36, -22]])
      parts.push({ c: [x, y, PCB_TOP], svg: S(cyl(x, y, 3.2, PCB_TOP, 7, 22), { tone: "mid", inner: Ln(k.sideArc(x, y, 3.2, PCB_TOP + 5.6, P, 14), { tone: "faint" }) }) + Ln(k.ring(x, y, 1.6, PCB_TOP + 7, P, 14), { tone: "lo" }) });
    const XT = { x: 20, y: -10, w: 10, d: 5, r: 2.4 };
    parts.push({ c: [XT.x + 5, XT.y + 2.5, PCB_TOP], svg: S(slab(XT, PCB_TOP, 3, 6), { tone: "mid" }) });
    parts.push({
      c: [REG.x + REG.w / 2, REG.y + REG.d / 2, PCB_TOP],
      svg: S(slab(REG, PCB_TOP, 4, 2, 0.4), { tone: "hi", lit: true }) + S(slab({ x: REG.x + 2, y: REG.y - 4.5, w: REG.w - 4, d: 4.5, r: 0.3 }, PCB_TOP, 0.8, 2), { tone: "mid", crease: "none" }),
    });
    add("parts", [0, 0, PCB_TOP + 3], byDepth(parts, (p) => p.c).map((p) => p.svg).join(""));
  }

  // dial-gauge stand: post with collar, arm, gauge with needle, plunger down onto the regulator
  {
    const [px, py] = POST;
    const [gx, gy] = GAUGE;
    const ARM_Z = 64;
    const G_Z = 58;
    const G_TOP = 66;
    const R = 9;
    // post, clamp and thumb screw stand behind the board: drawn before the board and its parts
    const post =
      S(cyl(px, py, 6, BASE_TOP, 2, 26), { tone: "mid" }) +
      S(cyl(px, py, 3, BASE_TOP + 2, 70, 22), { tone: "mid", inner: Ln(k.sideArc(px, py, 3, BASE_TOP + 40, P, 14), { tone: "faint" }) }) +
      S(slab({ x: px - 6, y: py - 6, w: 12, d: 12, r: 2.5 }, ARM_Z - 2, 10, 4, 0.6), { tone: "mid" }) +
      S(cyl(px + 7.4, py, 2.4, ARM_Z + 1, 4, 16), { tone: "mid" }) +
      Ln(k.knurl(px + 7.4, py, 2.4, ARM_Z + 1, ARM_Z + 5, 14, P), { tone: "lo" });
    const firstBoard = items.findIndex((it) => it.asm === "board");
    items.splice(firstBoard, 0, { asm: "gauge", at: [px, py, 50], svg: post });
    // arm, plunger and gauge sit above everything: drawn last
    let svg = S(slab({ x: gx - 2.5, y: py + 6, w: 5, d: gy - py - 6 - R + 1, r: 1 }, ARM_Z, 4, 3, 0.4), { tone: "mid" });
    // plunger and stem, down to the regulator's top
    svg += S(cyl(gx, gy, 0.9, PCB_TOP + 4, G_Z - PCB_TOP - 4, 12), { tone: "hi", crease: "none" });
    svg += S(cyl(gx, gy, 2, G_Z - 4, 4, 14), { tone: "mid" });
    // gauge, face up
    svg += S(cyl(gx, gy, R, G_Z, G_TOP - G_Z, 56, 0.6), { tone: "hi", crease: "lo" });
    svg += Ln(k.knurl(gx, gy, R, G_TOP - 3, G_TOP, 64, P, 0.3), { tone: "lo" });
    svg += Ln(k.sideArc(gx, gy, R, G_TOP - 3, P, 32), { tone: "faint" });
    svg += Ln(k.ring(gx, gy, R - 1.6, G_TOP, P, 48), { tone: "lo" });
    const t = k.radialTicks(gx, gy, R - 2.2, 40, 5, G_TOP, [1, 2], P);
    svg += Ln(t.minor, { tone: "lo" }) + Ln(t.major, { tone: "mid" });
    svg += Ln(k.lineOnTop([gx, gy], [gx + 4.6, gy - 4.6], G_TOP + 0.2, P), { tone: "lit", free: "end" });
    svg += Ln(k.ring(gx, gy, 1, G_TOP, P, 12), { tone: "mid" });
    add("gauge", [px, py, 50], svg);
  }

  return {
    id: "fixture",
    code: "TF-02",
    name: "PCB test fixture",
    asms: [
      { id: "base", name: "Fixture base" },
      { id: "pins", name: "Pin bed" },
      { id: "board", name: "Main board" },
      { id: "parts", name: "Components" },
      { id: "gauge", name: "Dial gauge" },
    ],
    items,
  };
}
