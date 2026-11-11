"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/*
 * "Chaos → clarity" in ASCII.
 * A grid of flickering noise glyphs resolves, as you scroll, into a clean
 * diagram of the OpenPlan flow. A soft sweep travels left → right (with a
 * little randomness per cell), shaped by an ease-in-out curve and a spring.
 */

type Layout = {
  diagram: string[];
  padX: number;
  padY: number;
  /** cells drawn in brand blue, in diagram coordinates */
  accent: (r: number, c: number) => boolean;
};

// Wide: Part → Assembly → Rev, down into ECO-042, back through Review → Tasks.
const WIDE: Layout = {
  diagram: [
    "┌────────────┐     ┌────────────┐     ┌────────────┐",
    "│ PART 3312  │────▶│ ASSEMBLY   │────▶│ REV  B → C │",
    "└────────────┘     └────────────┘     └─────┬──────┘",
    "                                            │       ",
    "┌────────────┐     ┌────────────┐     ┌─────▼──────┐",
    "│ TASKS  3/3 │◀────│ REVIEW  ✓  │◀────│ ECO-042    │",
    "└────────────┘     └────────────┘     └────────────┘",
  ],
  padX: 5,
  padY: 2,
  accent: (r, c) => (r >= 4 && c >= 38) || ((r === 2 || r === 3) && c === 44) || (r === 5 && c >= 32 && c <= 37),
};

// Narrow (phones): the same flow as a two-column snake so text stays readable.
const NARROW: Layout = {
  diagram: [
    "┌──────────┐   ┌──────────┐",
    "│ PART     │──▶│ ASSEMBLY │",
    "└──────────┘   └────┬─────┘",
    "                    │      ",
    "┌──────────┐   ┌────▼─────┐",
    "│ ECO-042  │◀──│ REV  B→C │",
    "└────┬─────┘   └──────────┘",
    "     │                     ",
    "┌────▼─────┐   ┌──────────┐",
    "│ REVIEW ✓ │──▶│ TASKS 3/3│",
    "└──────────┘   └──────────┘",
  ],
  padX: 2,
  padY: 1,
  accent: (r, c) => (r >= 4 && r <= 6 && c <= 11) || (r === 5 && c >= 12 && c <= 14) || ((r === 7 || r === 8) && c === 5),
};

const NOISE = "#%&*+=-:;~/\\|()[]{}<>!?$@01";
const INK = "10, 10, 11";
const BRAND = "47, 91, 255";
const GREY = "120, 120, 128";


const HOLD_MS = 700; // a beat of pure chaos before it starts to resolve
const RESOLVE_MS = 2800;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export default function AsciiMorph({ onProgress }: { onProgress?: (p: number) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Grid state for the current layout: target glyph, sweep jitter, accent flag, current noise glyph.
    let layout: Layout = WIDE;
    let COLS = 0;
    let ROWS = 0;
    let target: string[][] = [];
    let jitter: number[][] = [];
    let accent: boolean[][] = [];
    let noise: string[][] = [];

    const build = (next: Layout) => {
      layout = next;
      COLS = next.diagram[0].length + next.padX * 2;
      ROWS = next.diagram.length + next.padY * 2;
      target = [];
      jitter = [];
      accent = [];
      for (let r = 0; r < ROWS; r++) {
        const dr = r - next.padY;
        target.push([]);
        jitter.push([]);
        accent.push([]);
        for (let c = 0; c < COLS; c++) {
          const dc = c - next.padX;
          const inside = dr >= 0 && dr < next.diagram.length && dc >= 0;
          target[r].push(inside ? next.diagram[dr][dc] ?? " " : " ");
          jitter[r].push(Math.random());
          accent[r].push(inside && next.accent(dr, dc));
        }
      }
      noise = target.map((row) => row.map(() => NOISE[(Math.random() * NOISE.length) | 0]));
    };

    let cellW = 0;
    let cellH = 0;
    let fontSize = 0;
    let raf = 0;
    let last = 0;
    let visible = true;
    let playStart: number | null = null;
    const progressAt = (now: number) =>
      playStart === null ? 0 : easeInOutCubic(Math.min(1, Math.max(0, (now - playStart) / RESOLVE_MS)));

    const resize = () => {
      const width = canvas.parentElement!.clientWidth;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const next = width < 560 ? NARROW : WIDE;
      if (next !== layout || COLS === 0) build(next);
      cellW = width / COLS;
      ctx.font = `500 100px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      const advance = ctx.measureText("M").width / 100; // monospace advance per 1px of font size
      fontSize = cellW / advance;
      cellH = fontSize * 1.5;
      const height = cellH * ROWS;
      canvas.style.height = `${height}px`;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(reduce ? 1 : progressAt(performance.now()), 0);
    };

    // Box-drawing glyphs are drawn as real strokes so lines join cleanly across
    // cells (font glyphs leave gaps with this line height). Everything else is text.
    const BOX = "─│┌┐└┘┬▼▶◀";
    const drawGlyph = (ch: string, x: number, y: number) => {
      if (!BOX.includes(ch)) {
        ctx.fillText(ch, x, y);
        return;
      }
      const l = x;
      const r = x + cellW;
      const cx = x + cellW / 2;
      const t = y - cellH / 2;
      const b = y + cellH / 2;
      const seg = (x1: number, y1: number, x2: number, y2: number) => {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      };
      ctx.strokeStyle = ctx.fillStyle as string;
      ctx.lineWidth = Math.max(1, fontSize * 0.09);
      ctx.beginPath();
      switch (ch) {
        case "─": seg(l, y, r, y); break;
        case "│": seg(cx, t, cx, b); break;
        case "┌": seg(cx, y, r, y); seg(cx, y, cx, b); break;
        case "┐": seg(l, y, cx, y); seg(cx, y, cx, b); break;
        case "└": seg(cx, t, cx, y); seg(cx, y, r, y); break;
        case "┘": seg(cx, t, cx, y); seg(l, y, cx, y); break;
        case "┬": seg(l, y, r, y); seg(cx, y, cx, b); break;
        case "▼": seg(l, y, r, y); seg(cx, t, cx, y); break;
        case "▶": seg(l, y, cx, y); break;
        case "◀": seg(cx, y, r, y); break;
      }
      ctx.stroke();
      // arrow heads
      const s = cellW * 0.42;
      ctx.beginPath();
      if (ch === "▼") { ctx.moveTo(cx - s, y - s * 0.9); ctx.lineTo(cx + s, y - s * 0.9); ctx.lineTo(cx, y + s * 0.4); }
      if (ch === "▶") { ctx.moveTo(r - s * 1.6, y - s); ctx.lineTo(r - s * 1.6, y + s); ctx.lineTo(r, y); }
      if (ch === "◀") { ctx.moveTo(l + s * 1.6, y - s); ctx.lineTo(l + s * 1.6, y + s); ctx.lineTo(l, y); }
      ctx.closePath();
      ctx.fill();
    };

    const draw = (p: number, t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `500 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      ctx.textBaseline = "middle";

      // sweep: cells resolve when the eased progress passes their threshold
      const sweep = p * 1.25;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const th = (c / COLS) * 0.9 + jitter[r][c] * 0.25;
          const local = Math.min(1, Math.max(0, (sweep - th) / 0.12)); // 0 = chaos, 1 = resolved
          const x = c * cellW;
          const y = r * cellH + cellH / 2;
          const tgt = target[r][c];

          if (local >= 1) {
            if (tgt === " ") continue;
            ctx.fillStyle = accent[r][c] ? `rgba(${BRAND}, 1)` : `rgba(${INK}, 0.88)`;
            drawGlyph(tgt, x, y);
            continue;
          }

          // chaos (or mid-resolve): flickering noise, fading as the cell resolves
          if (Math.random() < 0.06) noise[r][c] = NOISE[(Math.random() * NOISE.length) | 0];
          const shimmer = 0.5 + 0.5 * Math.sin(t * 2 + jitter[r][c] * 30);
          const a = (0.14 + 0.22 * shimmer) * (1 - local);
          if (local > 0.5 && tgt !== " ") {
            // about to land: show the target glyph faintly in blue
            ctx.fillStyle = `rgba(${BRAND}, ${0.25 + local * 0.5})`;
            drawGlyph(tgt, x, y);
          } else if (a > 0.02) {
            ctx.fillStyle = `rgba(${GREY}, ${a})`;
            ctx.fillText(noise[r][c], x, y);
          }
        }
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < 1000 / 30) return;
      last = now;
      const p = progressAt(now);
      draw(p, now / 1000);
      onProgress?.(p);
    };

    // Plays on its own once the panel is well in view: a short beat of chaos, then the
    // sweep resolves on an ease-in-out curve. Leaving the screen resets it for the next visit.
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (e.intersectionRatio >= 0.45 && playStart === null) playStart = performance.now() + HOLD_MS;
        if (!e.isIntersecting) playStart = null;
      },
      { threshold: [0, 0.45] },
    );
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);
    resize();
    if (reduce) onProgress?.(1);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [reduce, onProgress]);

  return (
    <div ref={wrapRef} className="w-full">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Scattered noise resolving into the OpenPlan flow: part 3312 feeds an assembly, revision B to C opens ECO-042, which goes to review and links three tasks."
        className="block w-full"
      />
    </div>
  );
}
