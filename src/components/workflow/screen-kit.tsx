"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/*
 * Shared kit for the live workflow screens (AI Architect, Requirements, BOM, ECO).
 *
 * Each screen is drawn on a fixed design canvas and scaled to fit its box, so text
 * wraps the same at every viewport and callout pins (in % of the canvas) stay put.
 * A per-screen clock drives the "video": on desktop it plays up to the end of the
 * phase that matches the current scroll callout and holds there; on mobile (step =
 * null) it plays through, holds, then loops.
 */

export interface ScreenProps {
  /** stage is on screen */
  active: boolean;
  /** callout index on desktop (plays up to that phase); null = autoplay loop */
  step: number | null;
  /** narrow (mobile) canvas */
  compact?: boolean;
}

export const CANVAS = { w: 1200, h: 750 } as const;
export const CANVAS_COMPACT = { w: 560, h: 780 } as const;

export const C = {
  bg: "#0c0c0d",
  panel: "#121214",
  panel2: "#16161a",
  line: "rgba(255,255,255,0.08)",
  line2: "rgba(255,255,255,0.13)",
  text: "#ECECEE",
  dim: "rgba(255,255,255,0.55)",
  faint: "rgba(255,255,255,0.35)",
  blue: "#5B7FFF",
  blueSoft: "rgba(91,127,255,0.14)",
  green: "#4FBF8A",
  amber: "#F0B45B",
  red: "#F07272",
  purple: "#A98BFF",
  teal: "#45C4C9",
} as const;

export const ease = [0.22, 1, 0.36, 1] as const;

/** Clock in seconds. phaseEnds[k] = time at which callout k's part of the story is done. */
export function useStageClock(active: boolean, step: number | null, phaseEnds: number[], hold = 5) {
  const reduce = useReducedMotion();
  const [t, setT] = useState(0);
  const tRef = useRef(0);
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);
  const end = phaseEnds[phaseEnds.length - 1];

  useEffect(() => {
    if (!active) {
      // reset after the cross-fade has hidden the screen
      const id = window.setTimeout(() => {
        tRef.current = 0;
        setT(0);
      }, 700);
      return () => window.clearTimeout(id);
    }
    let raf = 0;
    let last = performance.now();
    let lastPaint = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const s = stepRef.current;
      const target = s === null ? Infinity : phaseEnds[Math.max(0, Math.min(phaseEnds.length - 1, s))];
      let v = tRef.current;
      if (reduce) {
        v = s === null ? end : target;
      } else if (v < target) {
        const speed = target - v > 6 && s !== null ? 3 : 1; // catch up when scrolled past quickly
        v = Math.min(target, v + dt * speed);
      } else if (s !== null && v > target + 0.01) {
        v = target; // scrolled back: snap to that phase's end state
      }
      if (s === null && v > end + hold) v = 0;
      tRef.current = v;
      if (now - lastPaint > 48) {
        lastPaint = now;
        setT(v);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // phaseEnds is a module constant per screen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduce, end, hold]);

  return t;
}

/** Scales a fixed design canvas to the width of its box. */
export function Scaled({ compact, children, className = "" }: { compact?: boolean; children: ReactNode; className?: string }) {
  const size = compact ? CANVAS_COMPACT : CANVAS;
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setS(e.contentRect.width / size.w));
    ro.observe(el);
    return () => ro.disconnect();
  }, [size.w]);
  return (
    <div ref={ref} className={`relative w-full overflow-hidden ${className}`} style={{ aspectRatio: `${size.w} / ${size.h}`, background: C.bg }}>
      <div
        className="app-screen absolute left-0 top-0 origin-top-left text-[13px] leading-[1.45] antialiased"
        style={{ width: size.w, height: size.h, transform: `scale(${s})`, color: C.text, visibility: s ? "visible" : "hidden" }}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------- timeline helpers ---------- */

export const prog = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (t - a) / (b - a)));
export const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);
export const typed = (text: string, t: number, start: number, cps = 42) => text.slice(0, Math.max(0, Math.floor((t - start) * cps)));
export const streamed = (text: string, t: number, start: number, wps = 16) => {
  const words = text.split(" ");
  const n = Math.max(0, Math.floor((t - start) * wps));
  return words.slice(0, n).join(" ");
};
export const countUp = (t: number, a: number, b: number, to: number) => to * easeOut(prog(t, a, b));

/** Fades/rises in once `show` turns true. */
export function Pop({ show, children, y = 8, x = 0, className = "", style, delay = 0 }: { show: boolean; children?: ReactNode; y?: number; x?: number; className?: string; style?: CSSProperties; delay?: number }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={false}
      animate={show ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y, x }}
      transition={{ duration: show ? 0.45 : 0.2, ease, delay: show ? delay : 0 }}
    >
      {children}
    </motion.div>
  );
}

export function Pill({ children, tone, className = "", style }: { children: ReactNode; tone: string; className?: string; style?: CSSProperties }) {
  return (
    <span
      className={`inline-flex h-[20px] items-center whitespace-nowrap rounded-[5px] border px-1.5 text-[11px] font-medium leading-none transition-colors duration-300 ${className}`}
      style={{ color: tone, borderColor: `${tone}40`, background: `${tone}14`, ...style }}
    >
      {children}
    </span>
  );
}

export function Caret() {
  return <span className="ml-px inline-block h-[14px] w-[1.5px] translate-y-[2px] animate-pulse" style={{ background: C.blue }} />;
}

export function Btn({ children, primary = false, className = "" }: { children: ReactNode; primary?: boolean; className?: string }) {
  return (
    <span
      className={`inline-flex h-[30px] items-center gap-1.5 whitespace-nowrap rounded-[6px] border px-3 text-[12.5px] ${className}`}
      style={primary ? { background: C.blue, borderColor: C.blue, color: "#fff" } : { borderColor: C.line2, background: C.panel, color: C.text }}
    >
      {children}
    </span>
  );
}
