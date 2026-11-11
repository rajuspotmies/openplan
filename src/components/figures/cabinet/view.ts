import { boxCorners, fitProjection, iso, type Plan, type Point3 } from "@/components/iso/iso-kit";

/*
 * World layout for the tool cabinet. Units are about 1 px; x and y on the floor, z up.
 * The drawer fronts face +y, toward the viewer; drawers slide out along +y.
 */

export const WIDTH = 600;
export const HEIGHT = 440;
export const AZIMUTH = 58; // shows the long front with the drawers, and the right side face

// Bench mat the cabinet stands on
export const MAT: Plan = { x: -98, y: -56, w: 206, d: 160, r: 7 };
export const MAT_H = 5;
export const FOOT_H = 4;

// Cabinet carcass
export const CAB: Plan = { x: -72, y: -40, w: 144, d: 80, r: 2 };
export const FRONT_Y = CAB.y + CAB.d; // 40: the drawer face
export const SIDE_X = CAB.x + CAB.w; // 72: the right side face
export const PLINTH: Plan = { x: -67, y: -35, w: 134, d: 72, r: 2 };
export const PAD_H = 2;
export const PLINTH_Z = PAD_H;
export const PLINTH_H = 6;
export const CAB_Z = PLINTH_Z + PLINTH_H; // 8
export const CAB_TOP = 104;
export const LID: Plan = { x: -74.5, y: -42.5, w: 149, d: 85, r: 3 };
export const LID_H = 5;
export const LID_TOP = CAB_TOP + LID_H; // 109
export const HANDLE_X = 34;
export const HANDLE_H = 12;
export const BAR_H = 4.5;

// Drawer grid: two columns, four rows (row 0 at the top)
export const COLUMNS: [number, number][] = [
  [-66, -3],
  [3, 66],
];
export const ROW_H = 18;
export const ROW_Z = (row: number) => 15 + (3 - row) * 20;
export const DRAWER_DEPTH = 56;
export const TRAVEL = 50; // how far an open drawer slides out

export interface Opening {
  index: number;
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  cx: number;
}

export const OPENINGS: Opening[] = Array.from({ length: 8 }, (_, index) => {
  const [x0, x1] = COLUMNS[index % 2];
  const z0 = ROW_Z(Math.floor(index / 2));
  return { index, x0, x1, z0, z1: z0 + ROW_H, cx: (x0 + x1) / 2 };
});

export const P = fitProjection(
  [
    ...boxCorners(MAT, -MAT_H - FOOT_H, 0),
    ...boxCorners(LID, CAB_TOP, LID_TOP + HANDLE_H + BAR_H),
    ...boxCorners({ x: -66, y: FRONT_Y, w: 132, d: TRAVEL + 8, r: 0 }, 15, 93),
  ],
  WIDTH,
  HEIGHT,
  { pad: 28, azimuth: AZIMUTH },
);

export const at = (point: Point3) => iso(point, P);
