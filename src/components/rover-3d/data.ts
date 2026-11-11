// One source for the rover's dimensions, assemblies and the scroll schedule.
// World units are metres: x forward, y up, z toward the rover's right (the near side in the opening view).

export const DIM = {
  wheelR: 0.21,
  wheelW: 0.18,
  wheelX: [0.75, 0, -0.75] as const,
  wheelZ: 0.62,
  body: { l: 1.1, h: 0.32, w: 0.72, y: 0.62 },
  deck: { l: 1.25, t: 0.03, w: 0.95, y: 0.915 },
  mast: { x: 0.45, z: 0.3, top: 1.86 },
  camBase: 0.24,
  hgaR: 0.2,
  rtgFins: 8,
  grousers: 24,
  armReach: 0.9,
  solar: { cols: 12, rows: 9 },
} as const;

export type AssemblyId = "mast" | "antennas" | "deck" | "avionics" | "arm" | "rtg" | "wheelsNear" | "wheelsFar" | "suspNear" | "suspFar" | "body";

export interface Assembly {
  id: AssemblyId;
  name: string;
  short: string;
  move: [number, number, number];
  // where the camera looks when this assembly is focused (assembled position; the move is added)
  anchor: [number, number, number];
  about: string;
  specs: string[];
}

const solarCells = DIM.solar.cols * DIM.solar.rows;

export const ASSEMBLIES: Assembly[] = [
  {
    id: "mast",
    name: "Remote-sensing mast",
    short: "Mast",
    move: [0, 0.95, 0],
    anchor: [DIM.mast.x, 1.88, DIM.mast.z],
    about: "A pan-tilt head on a 0.9 m mast carries the rover's eyes: a stereo pair for navigation and a long telescope behind a sealed window for distant targets.",
    specs: [`Head ${DIM.mast.top.toFixed(2)} m above the ground`, `Stereo cameras ${(DIM.camBase * 100).toFixed(0)} cm apart`, "Two weather booms halfway up", "Pans ±35° while idle"],
  },
  {
    id: "antennas",
    name: "Antennas",
    short: "Antennas",
    move: [-0.15, 0.75, -0.2],
    anchor: [-0.4, 1.15, -0.28],
    about: "A flat hexagonal high-gain plate on a two-axis gimbal points straight at Earth; a helix low-gain antenna beside it talks in any direction at a slower rate.",
    specs: [`High-gain plate ${(DIM.hgaR * 200).toFixed(0)} cm across`, "Two gimbal motors: azimuth and elevation", "Helix low-gain antenna, 7 turns"],
  },
  {
    id: "deck",
    name: "Solar deck",
    short: "Deck",
    move: [0, 0.55, 0],
    anchor: [0, 0.94, 0],
    about: "The top deck is a solar array and the mounting table for the mast and antennas. A colour-calibration target with a gnomon sits at its front corner, so cameras can correct their colours against known chips.",
    specs: [`${solarCells} cells, ${DIM.solar.cols} × ${DIM.solar.rows}`, `${DIM.deck.l.toFixed(2)} × ${DIM.deck.w.toFixed(2)} m deck`, "6-chip calibration target and gnomon", "Four standoffs to the body"],
  },
  {
    id: "avionics",
    name: "Avionics bay",
    short: "Avionics",
    move: [0, 0.3, 0],
    anchor: [0, 0.84, 0],
    about: "Under the deck, out of the wind: the battery, the flight computer with its heat-sink fins and the radio, tied together by a Kapton-wrapped harness.",
    specs: ["Battery of 24 cells", "Flight computer with 10 heat-sink fins", "Radio with 3 RF connectors"],
  },
  {
    id: "arm",
    name: "Robotic arm",
    short: "Arm",
    move: [0.2, 0, 0],
    anchor: [1.0, 0.45, 0.0],
    about: "A five-joint arm folds across the front for driving and unfolds to reach the ground. Its turret carries five tools: a drill, a brush, a spectrometer, a close-up camera and a scoop.",
    specs: [`${DIM.armReach.toFixed(1)} m reach`, "5 joints: shoulder ×2, elbow, wrist, turret", "5 tools on the turret"],
  },
  {
    id: "rtg",
    name: "Radioisotope power unit",
    short: "Power",
    move: [-0.75, 0.15, 0],
    anchor: [-0.8, 0.72, 0],
    about: "A sealed cylinder of decaying radioisotope fuel makes heat day and night; thermocouples turn part of it into electricity and the fins shed the rest. The warm glow here stands in for that heat.",
    specs: [`${DIM.rtgFins} cooling fins`, "Works without sunlight", "Tilted 30° on a truss off the rear"],
  },
  {
    id: "wheelsNear",
    name: "Near-side wheels",
    short: "Wheels L",
    move: [0, 0.06, 0.62],
    anchor: [0, 0.21, 0.62],
    about: "Machined aluminium drums with chevron grousers for grip in sand. Each wheel has its own motor in the hub; the front and rear wheels also steer.",
    specs: [`${(DIM.wheelR * 200).toFixed(0)} cm diameter, ${(DIM.wheelW * 100).toFixed(0)} cm wide`, `${DIM.grousers} chevron grousers`, "6 curved titanium flexure spokes", "Corner wheels steer"],
  },
  {
    id: "wheelsFar",
    name: "Far-side wheels",
    short: "Wheels R",
    move: [0, 0.06, -0.62],
    anchor: [0, -0.02, -0.62],
    about: "The mirror set on the far side: three drive motors, two steering actuators.",
    specs: [`${(DIM.wheelR * 200).toFixed(0)} cm diameter`, `${DIM.grousers} chevron grousers`, "Corner wheels steer"],
  },
  {
    id: "suspNear",
    name: "Near rocker-bogie",
    short: "Rocker L",
    move: [0, 0, 0.32],
    anchor: [0, 0.4, 0.44],
    about: "A rocker and a bogie on free pivots, with no springs. Each wheel can rise over a rock while the others stay on the ground; a differential bar across the body keeps it at the average pitch of the two rockers.",
    specs: ["2 free pivots per side", "No springs", "Differential link to the bar on top of the body"],
  },
  {
    id: "suspFar",
    name: "Far rocker-bogie",
    short: "Rocker R",
    move: [0, 0, -0.32],
    anchor: [0, 0.62, -0.44],
    about: "The far-side rocker-bogie, joined to the near one through the differential bar.",
    specs: ["2 free pivots", "No springs"],
  },
  {
    id: "body",
    name: "Warm electronics box",
    short: "Body",
    move: [0, 0, 0],
    anchor: [0, 0.62, 0],
    about: "The insulated body everything else hangs from. Gold foil blankets keep the heat in at night; hazard cameras watch the ground in front and behind.",
    specs: [`${DIM.body.l.toFixed(2)} × ${DIM.body.w.toFixed(2)} × ${DIM.body.h.toFixed(2)} m`, "Gold multi-layer insulation", "4 hazard cameras", "Differential bar on top"],
  },
];

export const BY_ID = Object.fromEntries(ASSEMBLIES.map((a) => [a.id, a])) as Record<AssemblyId, Assembly>;
export const ORDER = ASSEMBLIES.filter((a) => a.id !== "body").map((a) => a.id);

// Scroll progress p in [0, 1]: assembly i leaves over [start + i·step, start + i·step + length].
export const SCHEDULE = { start: 0.07, step: 0.064, length: 0.26 };
export const END = SCHEDULE.start + (ORDER.length - 1) * SCHEDULE.step + SCHEDULE.length;

export const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
export const windowOf = (p: number, index: number) => (p - SCHEDULE.start - index * SCHEDULE.step) / SCHEDULE.length;
export const shareOf = (p: number, id: AssemblyId) => {
  const index = ORDER.indexOf(id);
  return index < 0 ? 0 : smooth(windowOf(p, index));
};
export const outAt = (id: AssemblyId) => SCHEDULE.start + ORDER.indexOf(id) * SCHEDULE.step + SCHEDULE.length;

// The assembly moving fastest at p: the one whose own window is nearest its middle.
export function activeAt(p: number): AssemblyId | null {
  let pick: AssemblyId | null = null;
  let best = 0.5;
  ORDER.forEach((id, i) => {
    const t = windowOf(p, i);
    if (t > 0 && t < 1 && Math.abs(t - 0.5) <= best) {
      best = Math.abs(t - 0.5);
      pick = id;
    }
  });
  return pick;
}

// Camera keys over scroll progress: spherical around a target (yaw 0 looks from the front, 90 from the near side).
export interface CameraKey {
  p: number;
  yaw: number;
  pitch: number;
  dist: number;
  target: [number, number, number];
}
export const CAMERA_KEYS: CameraKey[] = [
  { p: 0, yaw: 36, pitch: 15, dist: 6.0, target: [0, 0.85, 0] },
  { p: 0.12, yaw: 22, pitch: 18, dist: 6.6, target: [0.05, 1.35, 0] },
  { p: 0.26, yaw: 48, pitch: 32, dist: 6.2, target: [0, 1.2, 0] },
  { p: 0.38, yaw: 28, pitch: 22, dist: 5.4, target: [0.4, 0.75, 0] },
  { p: 0.5, yaw: 140, pitch: 22, dist: 5.8, target: [-0.6, 0.8, 0] },
  { p: 0.66, yaw: 92, pitch: 13, dist: 6.4, target: [0, 0.55, 0] },
  { p: 0.82, yaw: 66, pitch: 19, dist: 7.0, target: [0, 0.7, 0] },
  { p: 1, yaw: 50, pitch: 26, dist: 7.6, target: [0, 0.95, 0] },
];
