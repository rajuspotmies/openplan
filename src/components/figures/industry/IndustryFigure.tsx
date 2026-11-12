"use client";

import * as React from "react";
import { useInView, useStillness } from "@/components/iso/react/live";
import { translateAlong } from "@/components/iso/iso-kit";
import { HEIGHT, P, WIDTH } from "../cabinet/view";
import { Items, MAT, normalise, sample } from "../bench/BenchFigure";
import { INDUSTRY_SCENES, type IndScene, type IndustryKey } from "./scenes";
import "@/components/iso/iso.css";
import "../bench/bench.css";
import "./industry.css";

/*
 * One industry figure in a hairline card: Fig number and title on top, the hint and a live
 * readout below, and a stage legend that holds the figure on a stage while it is hovered.
 */

const CENTER = translateAlong(P, [0, 14, 0]);
const TRIM = 60;

type Prepared =
  | { kind: "move"; id: string; keys: ReturnType<typeof normalise> }
  | { kind: "lit"; ids: string[]; steps: [number, number[]][] };

const cache = new Map<IndustryKey, { scene: IndScene; channels: Prepared[] }>();
function load(key: IndustryKey) {
  let hit = cache.get(key);
  if (!hit) {
    const scene = INDUSTRY_SCENES[key]();
    const channels = scene.channels.map((c): Prepared => (c.kind === "move" ? { kind: "move", id: c.id, keys: normalise(c.keys) } : c));
    hit = { scene, channels };
    cache.set(key, hit);
  }
  return hit;
}

/** writes the pose at loop phase u and returns the stage index of the first lit channel */
function apply(root: SVGGElement, channels: Prepared[], u: number) {
  let stage = 0;
  let first = true;
  for (const c of channels) {
    if (c.kind === "move") {
      const { p, o } = sample(c.keys, u);
      const t = translateAlong(P, p);
      const op = o >= 0.999 ? "" : o.toFixed(3);
      root.querySelectorAll<SVGGElement>(`[data-id="${c.id}"]`).forEach((el) => {
        el.setAttribute("transform", t);
        el.style.opacity = op;
      });
    } else {
      let on: number[] = [];
      for (const [t, ids] of c.steps) if (t <= u) on = ids;
      if (first) {
        stage = on[0] ?? 0;
        first = false;
      }
      c.ids.forEach((id, i) => {
        const lit = on.includes(i);
        root.querySelectorAll(`[data-id="${id}"] [data-lk] > .iso-solid`).forEach((s) => {
          if (lit) s.setAttribute("data-lit", "");
          else s.removeAttribute("data-lit");
        });
      });
    }
  }
  return stage;
}

export default function IndustryFigure({
  industry,
  fig = "Fig. 01",
  title,
  tone = "light",
}: {
  industry: IndustryKey;
  fig?: string;
  title: string;
  tone?: "light" | "dark";
}) {
  const { scene, channels } = load(industry);
  const wrap = React.useRef<HTMLDivElement>(null);
  const root = React.useRef<SVGGElement>(null);
  const inView = useInView(wrap);
  const still = useStillness();
  const [stage, setStage] = React.useState(0);
  const [held, setHeld] = React.useState<number | null>(null);
  const shown = React.useRef(-1);

  React.useEffect(() => {
    const g = root.current;
    if (!g) return;
    const show = (s: number) => {
      if (s !== shown.current) {
        shown.current = s;
        setStage(s);
      }
    };
    if (held !== null) {
      show(apply(g, channels, scene.stages[held].t));
      return;
    }
    if (still || !inView) {
      show(apply(g, channels, scene.rest));
      return;
    }
    let raf = 0;
    const t0 = performance.now() - scene.rest * scene.period * 1000;
    const frame = (now: number) => {
      show(apply(g, channels, ((((now - t0) / 1000 / scene.period) % 1) + 1) % 1));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [held, inView, still, channels, scene]);

  const [vy, vh] = scene.view ?? [TRIM, HEIGHT - TRIM];
  const dark = tone === "dark";

  return (
    <figure className={`ind-card relative m-0 border ${dark ? "border-white/[0.1] bg-[#0E0E10]" : "border-black/[0.1] bg-white"}`}>
      <figcaption className={`flex items-center justify-between border-b px-4 py-3 font-mono text-[11px] uppercase leading-none tracking-[0.1em] sm:px-5 ${dark ? "border-white/[0.08] text-white/50" : "border-black/[0.08] text-neutral-400"}`}>
        <span>{fig}</span>
        <span className={dark ? "text-white" : "text-brand-ink"}>{title}</span>
      </figcaption>

      <div ref={wrap} className="iso bench ind" data-theme={dark ? "dark" : "light"}>
        <svg className="iso-svg bench-layer" viewBox={`72 ${vy} ${WIDTH - 144} ${vh}`} role="img" aria-label={scene.label} focusable="false">
          {MAT}
          <g ref={root} transform={CENTER}>
            <Items items={scene.items} uid={industry} />
          </g>
        </svg>
      </div>

      <div className={`grid grid-cols-2 border-t sm:grid-cols-4 ${dark ? "border-white/[0.08]" : "border-black/[0.08]"}`}>
        {scene.stages.map((s, i) => {
          const on = i === stage;
          return (
            <button
              key={s.label}
              type="button"
              onMouseEnter={() => setHeld(i)}
              onMouseLeave={() => setHeld(null)}
              onFocus={() => setHeld(i)}
              onBlur={() => setHeld(null)}
              onClick={() => setHeld((h) => (h === i ? null : i))}
              aria-pressed={held === i}
              className={`group relative flex min-h-[52px] items-center gap-2.5 px-4 py-3 text-left font-mono text-[10.5px] uppercase leading-[1.3] tracking-[0.1em] transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/50 sm:px-5 ${
                i % 2 === 1 ? (dark ? "border-l border-white/[0.08]" : "border-l border-black/[0.08]") : ""
              } ${i >= 2 ? (dark ? "border-t border-white/[0.08] sm:border-t-0" : "border-t border-black/[0.08] sm:border-t-0") : ""} ${
                i === 2 ? (dark ? "sm:border-l sm:border-white/[0.08]" : "sm:border-l sm:border-black/[0.08]") : ""
              } ${on ? (dark ? "text-white" : "text-brand-ink") : dark ? "text-white/40 hover:text-white/70" : "text-neutral-400 hover:text-neutral-600"}`}
            >
              <span
                aria-hidden
                className={`absolute inset-x-0 top-[-1px] h-[2px] origin-left bg-brand transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${on ? "scale-x-100" : "scale-x-0"}`}
              />
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-300 ${on ? "bg-brand" : dark ? "bg-white/20" : "bg-black/15"}`} />
              {s.label}
            </button>
          );
        })}
      </div>
    </figure>
  );
}

