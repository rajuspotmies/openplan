"use client";

import { useEffect, useRef } from "react";

/*
 * Blue ASCII "horizon" for the hero (Canvas 2D, no WebGL).
 *
 * Field: a black horizon arch rises from the bottom (highest in the middle),
 * and above it a blue sky lit from just above the top centre, deep blue in the
 * middle and brightest in the top corners. The coordinates are gently
 * domain-warped by animated noise, so the edge breathes instead of sitting still.
 *
 * Glyphs: one per 0.6:1 monospace cell. The glyph follows the gradient strength
 * (" RSTPIDABFCVE": blank … E), each cell has a fixed chance of staying empty
 * (more gaps where the field is dim), and every cell re-rolls a small jitter
 * about 9 times a second on its own phase. That jitter is the soft "blink".
 * The glyphs are added on top of the field at ~55% of its colour.
 * The cursor scrambles glyphs around it, and an intro decodes the field outward from the horizon.
 *
 * Pauses off-screen and when the tab is hidden; reduced motion draws one still frame.
 */

const GLYPHS = " RSTPIDABFCVE";
const CELL_H = 18;
const CELL_W = CELL_H * 0.6;
const FPS = 30;
const INTRO_MS = 1800;
const DENSITY = 0.8;
const OPACITY = 0.85;
const FLICKER = 0.2;
const SCRAMBLE_RADIUS = 0.1; // in units of hero height

// Ramp: black → #0047FF, mixed in linear light.
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const encode = (c: number) => {
  c = Math.min(1, Math.max(0, c));
  return c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
};
const BLUE_G = toLinear(0x47 / 255);
// encode() is two pow() calls per cell per frame; a table is visually identical
const ENC_N = 4096;
const ENC_LUT = new Float32Array(ENC_N + 1).map((_, i) => encode(i / ENC_N));
const enc = (c: number) => ENC_LUT[Math.round(Math.min(1, Math.max(0, c)) * ENC_N)];
// the warp is low-frequency, so it is sampled every WARP_STEP cells and interpolated
const WARP_STEP = 4;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Stable pseudo-random 0..1 for a 2D point. */
function hash12(x: number, y: number) {
  let a = (x * 0.1031) % 1;
  let b = (y * 0.1031) % 1;
  let c = (x * 0.1031) % 1;
  if (a < 0) a += 1;
  if (b < 0) b += 1;
  if (c < 0) c += 1;
  const d = a * (b + 33.33) + b * (c + 33.33) + c * (a + 33.33);
  a += d;
  b += d;
  c += d;
  const r = ((a + b) * c) % 1;
  return r < 0 ? r + 1 : r;
}

/** Smooth 2D gradient noise, 0..1. */
function noise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const grad = (gx: number, gy: number, dx: number, dy: number) => {
    const ang = hash12(gx * 1.7 + 0.3, gy * 2.3 + 1.1) * Math.PI * 2;
    return Math.cos(ang) * dx + Math.sin(ang) * dy;
  };
  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
  const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
  const a = grad(ix, iy, fx, fy);
  const b = grad(ix + 1, iy, fx - 1, fy);
  const c = grad(ix, iy + 1, fx, fy - 1);
  const d = grad(ix + 1, iy + 1, fx - 1, fy - 1);
  return 0.5 + 0.5 * (a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy);
}

export default function BlueAsciiField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const bg = document.createElement("canvas");
    const bgCtx = bg.getContext("2d");
    const atlas = document.createElement("canvas");
    const atlasCtx = atlas.getContext("2d");
    if (!bgCtx || !atlasCtx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let offX = 0;
    let offY = 0;
    let aspect = 1;
    let img: ImageData | null = null;
    // per-cell constants
    let pick = new Float32Array(0);
    let level = new Float32Array(0);
    let glyphIdx = new Int8Array(0);
    let glyphAlpha = new Float32Array(0);
    let warpX = new Float32Array(0);
    let warpY = new Float32Array(0);
    let wCols = 0;
    let wRows = 0;
    let raf = 0;
    let last = 0;
    let visible = true;
    const start = performance.now();
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false, s: 0 };

    const buildAtlas = () => {
      // One row of glyphs in a single blue tint; brightness comes from globalAlpha.
      const cw = Math.ceil(CELL_W * dpr);
      const ch = Math.ceil(CELL_H * dpr);
      atlas.width = cw * GLYPHS.length;
      atlas.height = ch;
      const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim();
      atlasCtx.clearRect(0, 0, atlas.width, atlas.height);
      atlasCtx.font = `300 ${Math.round(14 * dpr)}px ${mono ? `${mono}, ` : ""}ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      atlasCtx.textAlign = "center";
      atlasCtx.textBaseline = "middle";
      atlasCtx.fillStyle = "rgb(10, 70, 255)";
      [...GLYPHS].forEach((g, i) => atlasCtx.fillText(g, i * cw + cw / 2, ch * 0.53));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      aspect = width / height;
      cols = Math.ceil(width / CELL_W);
      rows = Math.ceil(height / CELL_H);
      offX = (width - cols * CELL_W) / 2;
      offY = (height - rows * CELL_H) / 2;
      pick = new Float32Array(cols * rows);
      level = new Float32Array(cols * rows);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          pick[r * cols + c] = hash12(c + 0.5, r + 0.5);
          level[r * cols + c] = hash12(c * 1.73 + 4.1, r * 1.73 + 4.1);
        }
      }
      glyphIdx = new Int8Array(cols * rows);
      glyphAlpha = new Float32Array(cols * rows);
      wCols = Math.ceil(cols / WARP_STEP) + 2;
      wRows = Math.ceil(rows / WARP_STEP) + 2;
      warpX = new Float32Array(wCols * wRows);
      warpY = new Float32Array(wCols * wRows);
      bg.width = cols;
      bg.height = rows;
      img = bgCtx.createImageData(cols, rows);
      buildAtlas();
    };

    /** Sample the field at a cell centre. Returns [premultiplied rgb (sRGB), alpha, glyph value]. */
    const out = { r: 0, g: 0, b: 0, a: 0, value: 0, order: 0, reveal: 1 };
    const field = (u: number, v: number, time: number, intro: number, wx: number, wy: number) => {
      // p: centred, height-normalised, y up
      let px = (u - 0.5) * aspect;
      let py = 0.5 - v;
      px += wx * 0.09;
      py += wy * 0.09;

      const span = 0.5 * Math.max(aspect, 1);
      const x = px / span;
      const arch = -0.17 - 0.2 * x * x + 0.02 * Math.sin(time * 0.6);
      const edge = py - arch;
      const rim = 0.38 * smoothstep(-0.135, 0.42, edge);
      const sunX = 0.08 * Math.sin(time * 0.31) * span;
      const sx = (px - sunX) / (0.95 * span);
      const sy = (py - 0.58) / 0.75;
      const sky = 0.55 + 0.45 * smoothstep(0.2, 0.95, Math.hypot(sx, sy));
      const z = smoothstep(0.18, 0.62, edge);

      const order = clamp01(edge * 1.3);
      let reveal = clamp01((intro * 1.45 - order) / 0.45);
      reveal = reveal * reveal * (3 - 2 * reveal);
      const k = 0.7 + 0.3 * reveal;
      const t1 = clamp01(rim * k);
      const t2 = clamp01(sky * k);

      // tone(t): colour position and coverage, mixed between rim and sky
      const x1 = smoothstep(0.3, 1, t1);
      const x2 = smoothstep(0.3, 1, t2);
      const lin = x1 + (x2 - x1) * z; // amount of blue (linear)
      const a = (smoothstep(0, 0.38, t1) * (1 - z) + smoothstep(0, 0.38, t2) * z) * reveal;

      out.r = 0;
      out.g = enc(lin * BLUE_G) * a;
      out.b = enc(lin) * a;
      out.a = a;
      out.value = smoothstep(0.3, 1, t1 + (t2 - t1) * z);
      out.order = order;
      out.reveal = reveal;
      return out;
    };

    const draw = (now: number) => {
      if (!img) return;
      const elapsed = now - start;
      const seconds = elapsed / 1000;
      const time = seconds * 0.5;
      const introRaw = reduce ? 1 : clamp01(elapsed / INTRO_MS);
      const intro = 1 - (1 - introRaw) ** 3; // ease-out
      const flicker = reduce ? 0 : FLICKER;
      const tick20 = Math.floor(seconds * 20);

      // ease the cursor (exponential smoothing = ease-out)
      pointer.x += (pointer.tx - pointer.x) * 0.2;
      pointer.y += (pointer.ty - pointer.y) * 0.2;
      pointer.s += ((pointer.active ? 1 : 0) - pointer.s) * 0.15;

      const data = img.data;
      const cw = Math.ceil(CELL_W * dpr);
      const ch = Math.ceil(CELL_H * dpr);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // warp offsets on a coarse grid of cell centres
      for (let gr = 0; gr < wRows; gr++) {
        const cy = offY + (gr * WARP_STEP + 0.5) * CELL_H;
        const py = 0.5 - cy / height;
        for (let gc = 0; gc < wCols; gc++) {
          const cx = offX + (gc * WARP_STEP + 0.5) * CELL_W;
          const px = (cx / width - 0.5) * aspect;
          const k = gr * wCols + gc;
          warpX[k] = noise(px * 1.6, py * 1.6 + time * 0.3) - 0.5;
          warpY[k] = noise(px * 1.6 + 4.3, py * 1.6 - time * 0.24) - 0.5;
        }
      }

      // pass 1: field → backdrop pixels (and remember what each glyph needs)
      glyphIdx.fill(0);
      for (let r = 0; r < rows; r++) {
        const cy = offY + (r + 0.5) * CELL_H;
        const gr = Math.floor(r / WARP_STEP);
        const fr = (r % WARP_STEP) / WARP_STEP;
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const cx = offX + (c + 0.5) * CELL_W;
          const gc = Math.floor(c / WARP_STEP);
          const fc = (c % WARP_STEP) / WARP_STEP;
          const k = gr * wCols + gc;
          const wx =
            (warpX[k] * (1 - fc) + warpX[k + 1] * fc) * (1 - fr) + (warpX[k + wCols] * (1 - fc) + warpX[k + wCols + 1] * fc) * fr;
          const wy =
            (warpY[k] * (1 - fc) + warpY[k + 1] * fc) * (1 - fr) + (warpY[k + wCols] * (1 - fc) + warpY[k + wCols + 1] * fc) * fr;
          const f = field(cx / width, cy / height, time, intro, wx, wy);
          data[i * 4] = Math.round(255 * f.r * 0.9);
          data[i * 4 + 1] = Math.round(255 * f.g * 0.9);
          data[i * 4 + 2] = Math.round(255 * f.b * 0.9);
          data[i * 4 + 3] = 255; // premultiplied colour over the black section

          const value = f.value;
          if (value < 0.03) continue;
          const lv = level[i];
          const tick = Math.floor(seconds * 9 + lv * 9);
          const wobble = (hash12(c * 2.31 + tick * 17.7, r * 2.31 + tick * 17.7) - 0.5) * flicker * 0.4 + (lv - 0.5) * 0.1;
          const tone = clamp01(Math.sqrt(value * Math.sqrt(value)) + wobble); // value^0.75
          let index = Math.floor(tone * (GLYPHS.length - 1) + 0.5);

          // scramble: cursor trail and the intro decode
          let scramble = 0;
          if (pointer.s > 0.01) {
            const dx = ((cx - width / 2) / height) - pointer.x;
            const dy = ((height / 2 - cy) / height) - pointer.y;
            scramble = pointer.s * Math.exp(-(dx * dx + dy * dy) / (SCRAMBLE_RADIUS * SCRAMBLE_RADIUS));
          }
          const decode = Math.max(scramble, 1 - f.reveal);
          if (decode > 0.02 && hash12(c * 3.7 + tick20 * 5.3, r * 3.7 + tick20 * 5.3) < decode * 1.25) {
            index = 1 + Math.floor(hash12(c + tick20 * 1.37, r + tick20 * 1.37) * (GLYPHS.length - 1));
          }
          if (index <= 0) continue;

          const present = pick[i] <= DENSITY * (0.45 + 0.55 * (0.3 + tone * 1.1));
          if (!present) continue;
          const cutoff = smoothstep(0.03, 0.1, value);
          const alpha = OPACITY * cutoff * (0.45 + 0.55 * (0.35 + 0.65 * lv));
          // glyph light ≈ 55% of the field colour under it
          const light = (f.b * 0.55 + 0.03 * f.a) * alpha;
          if (light < 0.01) continue;
          glyphIdx[i] = index;
          glyphAlpha[i] = Math.min(1, light);
        }
      }
      bgCtx.putImageData(img, 0, 0);

      // backdrop, smoothly upscaled
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(bg, 0, 0, cols, rows, offX * dpr, offY * dpr, cols * CELL_W * dpr, rows * CELL_H * dpr);

      // pass 2: glyphs, added on top
      ctx.globalCompositeOperation = "lighter";
      for (let r = 0; r < rows; r++) {
        const y = (offY + r * CELL_H) * dpr;
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const g = glyphIdx[i];
          if (!g) continue;
          ctx.globalAlpha = glyphAlpha[i];
          ctx.drawImage(atlas, g * cw, 0, cw, ch, (offX + c * CELL_W) * dpr, y, cw, ch);
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden || canvas.closest("[data-paused]")) return;
      if (now - last < 1000 / FPS) return;
      last = now;
      draw(now);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      // same space as the field: centred, height-normalised, y up
      pointer.tx = (e.clientX - rect.left - rect.width / 2) / rect.height;
      pointer.ty = (rect.height / 2 - (e.clientY - rect.top)) / rect.height;
      if (!pointer.active) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
      pointer.active = true;
    };
    const onLeave = () => (pointer.active = false);
    // listen on the window: the hero copy may sit above the canvas
    const onWindowMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (e.clientY < rect.top || e.clientY > rect.bottom) return onLeave();
      onMove(e);
    };

    resize();
    draw(reduce ? start + INTRO_MS : performance.now());

    const ro = new ResizeObserver(() => {
      resize();
      draw(reduce ? start + INTRO_MS : performance.now());
    });
    ro.observe(canvas);

    if (reduce) return () => ro.disconnect();

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(canvas);
    window.addEventListener("pointermove", onWindowMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onWindowMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
