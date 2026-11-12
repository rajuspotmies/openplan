"use client";

import * as React from "react";
import { Dots, Line, Solid } from "@/components/iso/react/draw";
import { useInView, useStillness } from "@/components/iso/react/live";
import { translateAlong, type Point3 } from "@/components/iso/iso-kit";
import { MAT_ART } from "../cabinet/geometry";
import { HEIGHT, P, WIDTH, at } from "../cabinet/view";
import { SCENES, type Channel, type Ease, type Item, type Key, type Scene } from "./scenes";
import "@/components/iso/iso.css";
import "./bench.css";

/* ── static art ───────────────────────────────────────────────────────────── */

export function Items({ items, uid }: { items: Item[]; uid: string }) {
  return (
    <>
      {items.map((it, k) => {
        const key = `${uid}-${k}`;
        switch (it.t) {
          case "solid": {
            const solid = (
              <Solid
                key={key}
                paths={it.paths}
                tone={it.tone}
                crease={it.crease ?? "faint"}
                lit={it.lit}
                flat={it.flat}
                inner={it.inner ? <Line d={it.inner} tone="faint" /> : undefined}
              />
            );
            return it.lk ? (
              <g key={key} data-lk="">
                {solid}
              </g>
            ) : (
              solid
            );
          }
          case "line":
            return <Line key={key} d={it.d} tone={it.tone} free={it.free} dashed={it.dashed} />;
          case "dots":
            return <Dots key={key} points={it.points.map(at)} size={it.size} tone={it.tone ?? "mid"} />;
          case "path":
            return <path key={key} className={it.cls} d={it.d} />;
          case "g": {
            const clipId = it.clip ? `${key}-clip` : undefined;
            return (
              <g key={key} data-id={it.id}>
                {clipId ? (
                  <clipPath id={clipId}>
                    <path d={it.clip} />
                  </clipPath>
                ) : null}
                <g clipPath={clipId ? `url(#${clipId})` : undefined}>
                  <Items items={it.items} uid={key} />
                </g>
              </g>
            );
          }
        }
      })}
    </>
  );
}

export const MAT = (
  <g>
    <path className="iso-halo" d={MAT_ART.halo} />
    {MAT_ART.feet.map((parts, i) => (
      <g key={i}>
        <Solid paths={parts[0]} tone="lo" />
        <Solid paths={parts[1]} tone="lo" />
      </g>
    ))}
    <Solid paths={MAT_ART.slab} tone="lo" crease="faint" />
    <Line d={MAT_ART.groove} tone="faint" />
    <Line d={MAT_ART.screwRings} tone="lo" />
    <Dots points={MAT_ART.screws} size={0.5} />
    <Solid paths={MAT_ART.ruler} tone="lo" crease="none" />
    <Line d={MAT_ART.ticksMinor} tone="lo" />
    <Line d={MAT_ART.ticksMajor} tone="mid" />
    <Solid paths={MAT_ART.plate} tone="lo" crease="none" />
    <Line d={MAT_ART.plateLine} tone="faint" />
    <Line d={MAT_ART.plateRules} tone="lo" free />
    <Dots points={MAT_ART.plateScrews} size={0.45} />
  </g>
);

/** the objects sit a little forward so they centre on the mat */
/** headroom the cabinet needed and these objects do not */
const TRIM = 60;
const CENTER = translateAlong(P, [0, 14, 0]);

const SceneArt = React.memo(function SceneArt({ scene, i }: { scene: Scene; i: number }) {
  return <Items items={scene.items} uid={`s${i}`} />;
});

/* ── motion ──────────────────────────────────────────────────────────────── */

export const curve = (f: number, e: Ease = "io") =>
  e === "step" ? 1 : e === "i" ? f * f : e === "o" ? 1 - (1 - f) * (1 - f) : f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;

/** fill in missing positions and opacities from the key before */
export function normalise(keys: Key[]) {
  let p: Point3 = [0, 0, 0];
  let o = 1;
  return keys.map((k) => {
    p = k.p ?? p;
    o = k.o ?? o;
    return { t: k.t, p, o, e: k.e };
  });
}

export function sample(keys: ReturnType<typeof normalise>, u: number) {
  let k = 0;
  while (k < keys.length - 2 && keys[k + 1].t <= u) k++;
  const a = keys[k];
  const b = keys[k + 1] ?? a;
  const span = b.t - a.t;
  const f = span > 0 ? curve(Math.min(1, Math.max(0, (u - a.t) / span)), b.e) : 1;
  return {
    p: [a.p[0] + (b.p[0] - a.p[0]) * f, a.p[1] + (b.p[1] - a.p[1]) * f, a.p[2] + (b.p[2] - a.p[2]) * f] as Point3,
    o: a.o + (b.o - a.o) * f,
  };
}

export type Prepared =
  | { kind: "move"; id: string; keys: ReturnType<typeof normalise> }
  | Extract<Channel, { kind: "lit" }>;

const PREPARED: Prepared[][] = SCENES.map((s) => s.channels.map((c) => (c.kind === "move" ? { kind: "move", id: c.id, keys: normalise(c.keys) } : c)));

export function apply(root: SVGGElement, channels: Prepared[], u: number) {
  for (const c of channels) {
    if (c.kind === "move") {
      const el = root.querySelector<SVGGElement>(`[data-id="${c.id}"]`);
      if (!el) continue;
      const { p, o } = sample(c.keys, u);
      el.setAttribute("transform", translateAlong(P, p));
      el.style.opacity = o >= 0.999 ? "" : o.toFixed(3);
    } else {
      let on: number[] = [];
      for (const [t, ids] of c.steps) if (t <= u) on = ids;
      c.ids.forEach((id, i) => {
        const lit = on.includes(i);
        root.querySelectorAll(`[data-id="${id}"] [data-lk] > .iso-solid`).forEach((s) => {
          if (lit) s.setAttribute("data-lit", "");
          else s.removeAttribute("data-lit");
        });
      });
    }
  }
}

/* ── figure ──────────────────────────────────────────────────────────────── */

export default function BenchFigure({ active }: { active: number }) {
  const wrap = React.useRef<HTMLDivElement>(null);
  const roots = React.useRef<Array<SVGGElement | null>>([]);
  const inView = useInView(wrap);
  const still = useStillness();

  React.useEffect(() => {
    const root = roots.current[active];
    const scene = SCENES[active];
    if (!root || !scene) return;
    const channels = PREPARED[active];
    if (still || !inView) {
      apply(root, channels, scene.rest);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      apply(root, channels, (((now - t0) / 1000 / scene.period) % 1 + 1) % 1);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [active, inView, still]);

  return (
    <div ref={wrap} className="iso bench" data-theme="light">
      <svg className="iso-svg bench-layer" viewBox={`0 ${TRIM} ${WIDTH} ${HEIGHT - TRIM}`} aria-hidden="true" focusable="false">
        {MAT}
      </svg>
      {SCENES.map((scene, i) => (
        <svg
          key={scene.name}
          className="iso-svg bench-layer bench-scene"
          data-on={i === active ? "" : undefined}
          viewBox={`0 ${TRIM} ${WIDTH} ${HEIGHT - TRIM}`}
          role={i === active ? "img" : undefined}
          aria-label={i === active ? scene.label : undefined}
          aria-hidden={i === active ? undefined : true}
          focusable="false"
        >
          <g ref={(el) => void (roots.current[i] = el)} transform={CENTER}>
            <SceneArt scene={scene} i={i} />
          </g>
        </svg>
      ))}
    </div>
  );
}
