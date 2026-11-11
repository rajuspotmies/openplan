"use client";

import { useEffect, useRef } from "react";

/*
 * Luminous ASCII field for the hero background.
 *
 * Every cell of a dense monospace grid holds a glyph that keeps mutating.
 * A soft "light" field — a few large blobs drifting on slow, eased paths,
 * plus one that follows the cursor — decides how bright each cell is:
 * dim cells show faint grey punctuation, lit cells turn heavy and brand blue,
 * with a blurred blue haze painted underneath. Calmer behind the headline,
 * faded out toward the product image.
 *
 * Pauses when off-screen / tab hidden; one still frame for reduced motion.
 */

const LIGHT_GLYPHS = ".:-~'`,";
const MID_GLYPHS = "=+;/\\|()<>!?";
const HEAVY_GLYPHS = "#%&@$B8X*{}[]0S";

const CELL_W = 19;
const CELL_H = 24;
const FPS = 30;
const MUTATE_PER_FRAME = 0.018; // share of cells that change glyph each frame

const BRAND = [47, 91, 255] as const; // #2F5BFF
const BRAND_DEEP = [28, 52, 196] as const; // deeper blue for the brightest cores on white
const INK = [10, 10, 11] as const;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mix = (a: readonly number[], b: readonly number[], t: number) =>
  a.map((v, i) => Math.round(v + (b[i] - v) * t));

type Blob = { x: number; y: number; r: number; ax: number; ay: number; sx: number; sy: number; phase: number; power: number };

// Positions/radii are fractions of the field size; they drift on Lissajous paths
// (sine motion is naturally ease-in-out at the turning points).
const BLOBS: Blob[] = [
  { x: 0.84, y: 0.24, r: 0.22, ax: 0.05, ay: 0.07, sx: 0.11, sy: 0.08, phase: 0.0, power: 1.0 },
  { x: 0.14, y: 0.58, r: 0.24, ax: 0.05, ay: 0.08, sx: 0.07, sy: 0.1, phase: 1.7, power: 1.0 },
  { x: 0.8, y: 0.7, r: 0.18, ax: 0.06, ay: 0.04, sx: 0.09, sy: 0.12, phase: 3.1, power: 0.8 },
  { x: 0.2, y: 0.14, r: 0.15, ax: 0.05, ay: 0.04, sx: 0.13, sy: 0.09, phase: 4.4, power: 0.6 },
];

// Split layout (copy left, workbench right): the light gathers around the bench.
const BLOBS_SPLIT: Blob[] = [
  { x: 0.64, y: 0.2, r: 0.2, ax: 0.05, ay: 0.06, sx: 0.11, sy: 0.08, phase: 0.0, power: 1.0 },
  { x: 0.96, y: 0.48, r: 0.22, ax: 0.03, ay: 0.08, sx: 0.07, sy: 0.1, phase: 1.7, power: 1.0 },
  { x: 0.72, y: 0.9, r: 0.2, ax: 0.07, ay: 0.03, sx: 0.09, sy: 0.12, phase: 3.1, power: 0.85 },
  { x: 0.4, y: 0.95, r: 0.14, ax: 0.05, ay: 0.03, sx: 0.13, sy: 0.09, phase: 4.4, power: 0.5 },
];
const SPLIT_MIN = 1024; // matches the hero's lg breakpoint

export default function AsciiField({ className = "", calm = "center" }: { className?: string; calm?: "center" | "left" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let raf = 0;
    let last = 0;
    let visible = true;
    let seeds = new Uint16Array(0);
    const start = performance.now();
    const styleCache = new Map<string, string>();

    // Cursor light, eased toward its target (exponential smoothing = ease-out).
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, strength: 0, target: 0, seen: false };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / CELL_W) + 1;
      rows = Math.ceil(height / CELL_H) + 1;
      seeds = new Uint16Array(cols * rows).map(() => (Math.random() * 65535) | 0);
      if (reduce) draw(4);
    };

    const style = (rgb: number[], alpha: number) => {
      const a = Math.round(Math.min(1, alpha) * 40) / 40; // quantise so strings get reused
      const key = `${rgb[0]},${rgb[1]},${rgb[2]},${a}`;
      let s = styleCache.get(key);
      if (!s) {
        s = `rgba(${key})`;
        styleCache.set(key, s);
      }
      return s;
    };

    const split = () => calm === "left" && width >= SPLIT_MIN;
    const blobPositions = (t: number) =>
      (split() ? BLOBS_SPLIT : BLOBS).map((b) => ({
        x: (b.x + Math.sin(t * b.sx + b.phase) * b.ax) * width,
        y: (b.y + Math.cos(t * b.sy + b.phase * 1.3) * b.ay) * height,
        r: b.r * Math.max(width, 900),
        power: b.power * (0.85 + 0.15 * Math.sin(t * 0.4 + b.phase)), // slow breathing
      }));

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);

      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;
      pointer.strength += (pointer.target - pointer.strength) * 0.05;

      const lights = blobPositions(t);
      if (pointer.strength > 0.01) {
        lights.push({ x: pointer.x, y: pointer.y, r: 230, power: 0.9 * pointer.strength });
      }

      // 1) blurred haze underneath the glyphs
      for (const l of lights) {
        const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r * 1.1);
        g.addColorStop(0, `rgba(${BRAND.join(",")}, ${0.12 * l.power})`);
        g.addColorStop(0.45, `rgba(${BRAND.join(",")}, ${0.045 * l.power})`);
        g.addColorStop(1, `rgba(${BRAND.join(",")}, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(l.x - l.r * 1.1, l.y - l.r * 1.1, l.r * 2.2, l.r * 2.2);
      }

      // 2) mutate a share of glyphs
      if (!reduce) {
        const n = Math.floor(seeds.length * MUTATE_PER_FRAME);
        for (let k = 0; k < n; k++) seeds[(Math.random() * seeds.length) | 0] = (Math.random() * 65535) | 0;
      }

      // 3) glyph grid
      ctx.font = `500 13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // calm zone behind the copy; full-width on phones, on the left in the split layout
      const narrow = width < 768;
      const isSplit = split();
      const cx = isSplit ? width * 0.27 : width / 2;
      const cy = height * (isSplit ? 0.48 : 0.4);
      const rx = isSplit ? Math.min(width * 0.3, 540) : narrow ? width * 0.62 : Math.min(width * 0.36, 560);
      const ry = height * (isSplit ? 0.38 : narrow ? 0.42 : 0.33);
      // in the split layout, glyphs right under the workbench stay quieter
      const fx = width * 0.74;
      const fy = height * 0.55;
      const frx = width * 0.2;
      const fry = height * 0.28;
      const fadeFrom = isSplit ? 0.86 : 0.62;

      for (let j = 0; j < rows; j++) {
        const y = j * CELL_H + CELL_H / 2;
        const bottomFade = 1 - smoothstep(fadeFrom, 0.99, y / height);
        if (bottomFade <= 0.01) continue;
        const topFade = smoothstep(0, 0.08, y / height);

        for (let i = 0; i < cols; i++) {
          const x = i * CELL_W + CELL_W / 2;

          // light at this cell: soft gaussian blobs, broken up by a slow ripple texture
          let L = 0;
          for (const l of lights) {
            const d2 = ((x - l.x) ** 2 + (y - l.y) ** 2) / (l.r * l.r);
            L += Math.exp(-d2 * 2.2) * l.power;
          }
          const texture = 0.78 + 0.22 * Math.sin(i * 0.31 + Math.sin(j * 0.23 + t * 0.5) * 2.4);
          L = Math.min(1, L * texture);

          // keep the headline calm
          const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
          let textFactor = 0.18 + 0.82 * smoothstep(0.55, 1.5, d);
          if (isSplit) {
            const fd = ((x - fx) / frx) ** 2 + ((y - fy) / fry) ** 2;
            textFactor *= 0.35 + 0.65 * smoothstep(0.45, 1.4, fd);
          }

          const lit = L * textFactor;
          const seed = seeds[j * cols + i];
          const set = lit < 0.22 ? LIGHT_GLYPHS : lit < 0.6 ? MID_GLYPHS : HEAVY_GLYPHS;
          const ch = set[seed % set.length];

          const fade = bottomFade * topFade;
          const alpha = (0.035 + lit * 0.5) * fade;
          if (alpha < 0.02) continue;

          const blueAmount = smoothstep(0.08, 0.45, lit);
          const rgb = blueAmount <= 0 ? [...INK] : lit > 0.7 ? mix(BRAND, BRAND_DEEP, smoothstep(0.7, 1, lit)) : mix(INK, BRAND, blueAmount);
          ctx.fillStyle = style(rgb, blueAmount <= 0 ? alpha * 0.8 : alpha);
          ctx.fillText(ch, x, y);
        }
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < 1000 / FPS) return;
      last = now;
      draw((now - start) / 1000);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = e.clientX - rect.left;
      pointer.ty = e.clientY - rect.top;
      if (!pointer.seen) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
        pointer.seen = true;
      }
      pointer.target = pointer.ty >= 0 && pointer.ty <= rect.height ? 1 : 0;
    };
    const onLeave = () => (pointer.target = 0);
    const onVisibility = () => (visible = !document.hidden);

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    if (!reduce) {
      raf = requestAnimationFrame(loop);
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);
      document.addEventListener("visibilitychange", onVisibility);
    }

    canvas.style.opacity = "1";

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [calm]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none opacity-0 transition-opacity duration-[1600ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${className}`}
    />
  );
}
