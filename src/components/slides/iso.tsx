// Hairline isometric helpers shared by the three dark "stack" slides.
// The camera is the classic 2:1-ish iso used by caveman.so / hairline: a floor point (u, v) at
// height z lands at (cx + C·(u − v), cy + ½·(u + v) − z). Flat faces are drawn as plain SVG
// shapes under one of three affine matrices, so rx corners and text stay exact.
import type { ReactNode, SVGProps } from "react";

export const C = 0.8660254037844386;

export type O = { cx: number; cy: number };

/** Floor point → screen. */
export const P = (o: O, u: number, v: number, z = 0): [number, number] => [o.cx + C * (u - v), o.cy + 0.5 * (u + v) - z];

/** Matrix for the floor / a top face at height z. */
export const topM = (o: O, z = 0) => `matrix(${C} 0.5 ${-C} 0.5 ${o.cx} ${o.cy - z})`;
/** Front-left wall (runs along +u); origin is a screen point. */
export const leftM = (x: number, y: number) => `matrix(${C} 0.5 0 1 ${x} ${y})`;
/** Front-right wall (runs along −v); origin is a screen point. */
export const rightM = (x: number, y: number) => `matrix(${C} -0.5 0 1 ${x} ${y})`;

const f = (n: number) => Math.round(n * 100) / 100;

/** Points of an arc of a rounded-rect corner, in floor coordinates. */
function arc(cu: number, cv: number, r: number, a0: number, a1: number, steps = 8) {
  const out: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((a0 + ((a1 - a0) * i) / steps) * Math.PI) / 180;
    out.push([cu + r * Math.cos(a), cv + r * Math.sin(a)]);
  }
  return out;
}

/** The visible lower outline of a rounded floor rect: left silhouette → front corner → right silhouette. */
export function frontOutline(x: number, y: number, w: number, d: number, r: number) {
  return [
    ...arc(x + r, y + d - r, r, 135, 90),
    ...arc(x + w - r, y + d - r, r, 90, 0),
    ...arc(x + w - r, y + r, r, 0, -45),
  ];
}

export const poly = (o: O, pts: [number, number][], z = 0, close = false) =>
  pts.map(([u, v], i) => {
    const [sx, sy] = P(o, u, v, z);
    return `${i ? "L" : "M"} ${f(sx)} ${f(sy)}`;
  }).join(" ") + (close ? " Z" : "");

type SlabProps = {
  o: O;
  x: number;
  y: number;
  w: number;
  d: number;
  r?: number;
  /** Height of the bottom face. */
  z?: number;
  /** Thickness. */
  h: number;
  topFill?: string;
  className?: string;
  children?: ReactNode;
  /** Extra screen-space parts drawn after the walls, before the top (wall text, drawers…). */
  walls?: ReactNode;
} & Omit<SVGProps<SVGGElement>, "children" | "x" | "y" | "d" | "r" | "z" | "h" | "w">;

/**
 * A rounded slab: filled bottom + wall band, the lower outline and two silhouette lines,
 * then the top face. Children are drawn in the top face's plane (floor units).
 */
export function Slab({ o, x, y, w, d, r = 6, z = 0, h, topFill = "var(--iso-fill)", className, children, walls, ...rest }: SlabProps) {
  const L = [x + r - r * Math.SQRT1_2, y + d - r + r * Math.SQRT1_2] as const;
  const R = [x + w - r + r * Math.SQRT1_2, y + r - r * Math.SQRT1_2] as const;
  const [lx, ly0] = P(o, L[0], L[1], z);
  const [rx, ry0] = P(o, R[0], R[1], z);
  return (
    <g className={className} {...rest}>
      <g fill="var(--iso-fill)" stroke="none">
        <rect x={x} y={y} width={w} height={d} rx={r} transform={topM(o, z)} />
        <path d={`M ${f(lx)} ${f(ly0)} L ${f(lx)} ${f(ly0 - h)} L ${f(rx)} ${f(ry0 - h)} L ${f(rx)} ${f(ry0)} Z`} />
      </g>
      <path d={poly(o, frontOutline(x, y, w, d, r), z)} />
      <line x1={f(lx)} y1={f(ly0)} x2={f(lx)} y2={f(ly0 - h)} />
      <line x1={f(rx)} y1={f(ry0)} x2={f(rx)} y2={f(ry0 - h)} />
      {walls}
      <rect x={x} y={y} width={w} height={d} rx={r} transform={topM(o, z + h)} fill={topFill} vectorEffect="non-scaling-stroke" />
      {children ? <g transform={topM(o, z + h)}>{children}</g> : null}
    </g>
  );
}

/** A small iso cube (the packets travelling along traces), centred on its bottom vertex. */
export const CUBE =
  "M -11.26 0 L 0 6.5 L 11.26 0 L 11.26 -7 L 0 -13.5 L -11.26 -7 Z M -11.26 -7 L 0 -0.5 L 11.26 -7 M 0 6.5 V -0.5";

/** Floor grid, as one path in floor units (draw it under topM). */
export function gridPath(extent: number, step: number) {
  let d = "";
  for (let k = -extent; k <= extent; k += step) d += `M ${-extent} ${k} H ${extent} M ${k} ${-extent} V ${extent} `;
  return d;
}

/** OpenPlan mark, 259 × 258 units. */
export const OPENPLAN_MARK = {
  w: 259,
  h: 258,
};

export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
