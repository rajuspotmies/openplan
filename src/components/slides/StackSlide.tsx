"use client";

// Slide 1 — "Get the full hardware program stack."
// Four hairline layers (requirements, BOM, program, AI Architect) float over a base plate that
// stands for the team's existing tools. Hover (or tap) explodes the stack; each layer's lead runs
// to a fixed tag, and hovering a layer or a tag lights both.
import { useState, type ReactNode } from "react";
import { C, Slab, clamp01, gridPath, topM, type O } from "./iso";
import { MARK_D } from "./mark";
import { useFollow, useReducedMotion, useReveal } from "./useSlideBits";

const W = 1040;
const H = 507;
const o: O = { cx: 520, cy: 353 };
const LAYER = 160;
const LH = 16;

type Tag = {
  name: string;
  side: "l" | "r";
  y: number;
  fig?: string;
  unit?: string;
  basis?: string;
  chip?: string;
};

// Copy is OpenPlan's own (flagged for the owner's sign-off).
const TAGS: Tag[] = [
  { name: "Captures requirements", side: "l", y: 329, fig: "1", unit: "source of truth", basis: "every spec versioned and traced" },
  { name: "Builds the BOM", side: "r", y: 263, fig: "Live", unit: "BOM + cost", basis: "parts, suppliers and lead times" },
  { name: "Plans the program", side: "l", y: 197, fig: "PDR→MRR", unit: "gates", basis: "every milestone on one timeline" },
  { name: "AI Architect", side: "r", y: 131, chip: "Always on" },
];

const f = (n: number) => Math.round(n * 100) / 100;

function Requirements() {
  const rows = [0.62, 0.48, 0.7, 0.55, 0.66, 0.4, 0.6, 0.52, 0.68];
  return (
    <>
      {rows.map((k, i) => {
        const v = -56 + i * 14;
        const end = -44 + k * 100;
        const on = i % 3 !== 2;
        return (
          <g key={i}>
            <rect x={-58} y={v - 3} width={6} height={6} rx={1} className={on ? "ops-cell" : "ops-ghost"} vectorEffect="non-scaling-stroke" />
            <path d={`M -46 ${v} H ${f(end)}`} className="ops-ink" vectorEffect="non-scaling-stroke" />
            <path d={`M ${f(end + 5)} ${v} H 58`} className="ops-ghost" strokeDasharray="1 3" vectorEffect="non-scaling-stroke" />
          </g>
        );
      })}
    </>
  );
}

function Bom() {
  // depth of each row in a small assembly tree; filled = sourced
  const rows: [number, boolean, number][] = [
    [0, true, 0.7],
    [1, true, 0.55],
    [2, true, 0.42],
    [2, false, 0.5],
    [1, true, 0.6],
    [2, true, 0.38],
    [2, false, 0.46],
    [2, true, 0.4],
    [1, false, 0.52],
  ];
  const lastAt: number[] = [];
  return (
    <>
      {rows.map(([dpt, on, len], i) => {
        const v = -56 + i * 14;
        const u = -56 + dpt * 14;
        const parentV = dpt > 0 ? lastAt[dpt - 1] : undefined;
        lastAt[dpt] = v;
        return (
          <g key={i}>
            {parentV !== undefined ? (
              <path d={`M ${u - 9} ${parentV + 5} V ${v} H ${u - 1}`} className="ops-ghost" vectorEffect="non-scaling-stroke" />
            ) : null}
            <rect x={u} y={v - 4.5} width={9} height={9} rx={1.5} className={on ? "ops-cell" : "ops-ghost"} vectorEffect="non-scaling-stroke" />
            <path d={`M ${u + 15} ${v} H ${f(u + 15 + len * 70)}`} className={on ? "ops-ink" : "ops-ghost"} vectorEffect="non-scaling-stroke" />
          </g>
        );
      })}
    </>
  );
}

function Program() {
  const bars: [number, number, boolean][] = [
    [-58, 34, true],
    [-40, 30, true],
    [-26, 40, true],
    [-6, 30, false],
    [8, 36, false],
    [22, 36, false],
  ];
  return (
    <>
      {[-24, 4, 36].map((u, i) => (
        <g key={i}>
          <path d={`M ${u} -50 V 58`} className="ops-ghost" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
          <path d={`M ${u} -60 l 4 4 l -4 4 l -4 -4 Z`} className={i === 0 ? "ops-cell" : "ops-ink"} vectorEffect="non-scaling-stroke" />
        </g>
      ))}
      {bars.map(([u, w, on], i) => (
        <rect key={i} x={u} y={-42 + i * 16} width={w} height={8} rx={2} className={on ? "ops-ink" : "ops-ghost"} vectorEffect="non-scaling-stroke" />
      ))}
      <rect x={-58} y={-42} width={20} height={8} rx={2} className="ops-cell" />
      <rect x={-40} y={-26} width={14} height={8} rx={2} className="ops-cell" />
    </>
  );
}

function Mark() {
  const s = 62 / 259;
  return <path d={MARK_D} className="ops-mark" stroke="none" transform={`translate(${-31} ${-31}) scale(${f(s)})`} />;
}

const CONTENT: (() => ReactNode)[] = [Requirements, Bom, Program, Mark];

export default function StackSlide() {
  const reveal = useReveal<HTMLDivElement>();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [hot, setHot] = useState<number | null>(null);
  const t = useFollow(open ? 1 : 0, 6, reduced);

  // bottom height of layer k: resting pitch 23, exploded pitch 56, top layers lift first
  const zb = (k: number) => {
    const tk = clamp01(t * 1.25 - (3 - k) * 0.08);
    const e = 1 - Math.pow(1 - tk, 3);
    return 59 + 23 * k + (5 + 33 * k) * e;
  };
  const r = 10;
  const lu = -(LAYER / 2 - r + r * Math.SQRT1_2);
  const sideX = { l: o.cx + C * (lu - -lu), r: o.cx - C * (lu - -lu) };

  return (
    <section className="ops-sec" id="openplan-stack" aria-label="The OpenPlan stack">
      <div ref={reveal} className="ops-reveal ops-cta" data-reveal="pending">
        <p className="ops-label">The OpenPlan stack</p>
        <h2 className="ops-cta-title">Get the full hardware program stack.</h2>
        <p className="ops-cta-lede">
          <span>Captures requirements. Builds the BOM. Plans the program. Thinks ahead.</span>
          <span>One workspace, on top of the tools your team already runs.</span>
        </p>
        <div
          className="ops-stage"
          data-open={open ? "" : undefined}
          onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") {
              setOpen(false);
              setHot(null);
            }
          }}
          onClick={(e) => {
            if ((e.nativeEvent as PointerEvent).pointerType !== "mouse") setOpen((v) => !v);
          }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="The OpenPlan stack: four layers, requirements, bill of materials, program plan and the AI Architect, standing on the tools your team already runs."
            style={{ overflow: "visible", width: "100%", height: "auto" }}
            fill="none"
            stroke="var(--iso-ink)"
            strokeWidth={1}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <defs>
              <radialGradient id="ops-st-fg" cx="50%" cy="72%" r="50%">
                <stop offset="0" stopColor="#fff" />
                <stop offset="0.5" stopColor="#fff" stopOpacity="0.7" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
              <mask id="ops-st-fm" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
                <rect width={W} height={H} fill="url(#ops-st-fg)" />
              </mask>
              <linearGradient id="ops-st-top" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#18181a" />
                <stop offset="1" stopColor="#0b0b0c" />
              </linearGradient>
              <linearGradient id="ops-st-hot" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#232326" />
                <stop offset="1" stopColor="#101012" />
              </linearGradient>
              <radialGradient id="ops-st-glow">
                <stop offset="0" stopColor="#fff" stopOpacity="0.09" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
            </defs>

            <g mask="url(#ops-st-fm)">
              <path d={gridPath(480, 24)} transform={topM(o)} className="ops-floor" vectorEffect="non-scaling-stroke" />
            </g>

            {/* base plate: the team's tools */}
            <Slab o={o} x={-120} y={-120} w={240} d={240} r={22} h={10} topFill="url(#ops-st-top)" className="ops-plate">
              <rect x={-100} y={-100} width={200} height={200} fill="url(#ops-st-glow)" stroke="none" />
              <rect x={-86} y={-86} width={172} height={172} rx={14} className="ops-footprint" vectorEffect="non-scaling-stroke" />
              <g stroke="none" fontFamily="var(--font-mono)" fontSize={7.2} letterSpacing={1.1}>
                {["SOLIDWORKS", "ONSHAPE", "JIRA", "ARENA"].map((n, i) => (
                  <text key={n} x={[-92, -30, 16, 46][i]} y={106} className={i === 0 ? "ops-tool ops-tool-a" : "ops-tool"}>
                    {n}
                  </text>
                ))}
                <text x={0} y={0} transform="translate(106 74) rotate(-90)" className="ops-tool">
                  YOUR TEAM
                </text>
              </g>
            </Slab>

            {/* guides from the base to the stack */}
            {[-1, 1].map((s) => {
              const x = o.cx + s * C * (LAYER - 2 * (r - r * Math.SQRT1_2));
              return (
                <path
                  key={s}
                  d={`M ${f(x)} ${f(o.cy - 10)} V ${f(o.cy - zb(0))}`}
                  stroke="rgba(255,255,255,0.18)"
                  strokeDasharray="2 4"
                  fill="none"
                />
              );
            })}

            {CONTENT.map((Content, k) => {
              const z = zb(k);
              return (
                <g
                  key={k}
                  className="ops-layer"
                  data-hot={hot === k ? "" : undefined}
                  data-veil={hot !== null && k > hot ? "" : undefined}
                  onPointerEnter={() => setHot(k)}
                  onPointerLeave={() => setHot((h) => (h === k ? null : h))}
                >
                  <Slab
                    o={o}
                    x={-LAYER / 2}
                    y={-LAYER / 2}
                    w={LAYER}
                    d={LAYER}
                    r={r}
                    z={z}
                    h={LH}
                    topFill={hot === k ? "url(#ops-st-hot)" : "url(#ops-st-top)"}
                  >
                    <rect x={-72} y={-72} width={144} height={144} rx={6} className="ops-inset" vectorEffect="non-scaling-stroke" />
                    <Content />
                    <text x={66} y={68} fontSize={8} textAnchor="end" className="ops-idx" stroke="none" fontFamily="var(--font-mono)">
                      {`0${k + 1}`}
                    </text>
                  </Slab>
                </g>
              );
            })}

            {TAGS.map((tg, k) => {
              const sx = tg.side === "l" ? sideX.l : sideX.r;
              const sy = o.cy - zb(k) - LH / 2;
              const knee = tg.side === "l" ? 288 : 752;
              const end = tg.side === "l" ? 220 : 820;
              return (
                <g key={k} className="ops-lead" data-hot={hot === k ? "" : undefined}>
                  <path d={`M ${f(sx)} ${f(sy)} L ${knee} ${tg.y} H ${end}`} />
                  <circle cx={f(sx)} cy={f(sy)} r={2.2} />
                </g>
              );
            })}
          </svg>

          <ul className="ops-tags" data-dim={hot !== null ? "" : undefined}>
            {TAGS.map((tg, k) => (
              <li
                key={k}
                className="ops-tag"
                data-side={tg.side}
                data-hot={hot === k ? "" : undefined}
                style={{ left: tg.side === "l" ? "20%" : "80%", top: `${(tg.y / H) * 100}%` }}
                onPointerEnter={() => setHot(k)}
                onPointerLeave={() => setHot((h) => (h === k ? null : h))}
              >
                <span className="ops-tagName">
                  <b>{`0${k + 1}`}</b>
                  {tg.name}
                </span>
                {tg.fig ? (
                  <span className="ops-tagFig">
                    {tg.fig}
                    <small>{tg.unit}</small>
                  </span>
                ) : null}
                {tg.chip ? <span className="ops-tagChip">{tg.chip}</span> : null}
                {tg.basis ? <span className="ops-tagBasis">{tg.basis}</span> : null}
              </li>
            ))}
          </ul>
          <p className="ops-hint" aria-hidden="true">
            <span className="ops-hover">Hover to explode</span>
            <span className="ops-touch">Tap to explode</span>
          </p>
        </div>
      </div>
    </section>
  );
}
