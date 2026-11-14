"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import type { ComponentType } from "react";
import type { ScreenProps } from "@/components/workflow/screen-kit";
import "./workflow-tour.css";

/*
 * Desktop workflow tour.
 *
 * Left: one step per stage. Each step is a tall list item whose copy is sticky
 * just above the middle of the screen, so a step's text holds still while you
 * scroll through it, then the next step slides up to replace it. Inactive steps
 * sit at 28% opacity.
 *
 * Right: a sticky product screen. A rail of tabs on top fills in notches, one per
 * callout. The screenshot cross-fades (with a hint of scale) between stages, and each
 * stage walks through its callouts as you scroll: pin, leader line, then the note.
 */

export interface WorkflowTip {
  /** where the pin sits, in % of the screen (x, y) */
  pin: [number, number];
  /** where the note is anchored, in % of the screen (x, y) */
  at: [number, number];
  /** note offset from its anchor, in % of its own size (x, y), e.g. [-50, 0] centres it below */
  anchor: [number, number];
  /** max note width, in % of the screen width */
  w: number;
  text: string;
}

export interface WorkflowStage {
  id: string;
  shortLabel: string;
  title: string;
  description: string;
  cta: string;
  image: string;
  /** live, self-playing product screen; falls back to `image` */
  screen?: ComponentType<ScreenProps>;
  tips: WorkflowTip[];
}

// short names so the tabs fit on one row
const TAB_LABEL: Record<string, string> = {
  "BOM Management": "BOM",
  "Engineering Change": "ECO",
  "Milestones & Gates": "Gates",
};

const EASE = "cubic-bezier(0.22,1,0.36,1)";

const SHOW_TIPS = false;

export default function WorkflowShowcase({ stages, onCta, live = true }: { stages: WorkflowStage[]; onCta: () => void; live?: boolean }) {
  const [active, setActive] = useState(0);
  // Live screens are heavy: keep only the active one mounted, plus the one fading out.
  const [leaving, setLeaving] = useState<number | null>(null);
  const prevActive = useRef(0);
  useEffect(() => {
    if (prevActive.current === active) return;
    const from = prevActive.current;
    prevActive.current = active;
    const show = window.setTimeout(() => setLeaving(from), 0);
    const hide = window.setTimeout(() => setLeaving(null), 700);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [active]);
  const [tip, setTip] = useState(-1); // callout index within the active stage, -1 = none yet
  const steps = useRef<Array<HTMLLIElement | null>>([]);
  const fills = useRef<Array<HTMLSpanElement | null>>([]);
  const state = useRef({ active: 0, tip: -1 });

  // The reading line is the middle of the screen. The active step is the last one
  // whose top has crossed it; inside a step, each callout gets an equal slice.
  useEffect(() => {
    let frame = 0;
    // Step geometry is measured once and again on resize; scroll frames only read scrollY.
    let geo: { top: number; height: number; pad: number }[] = [];
    const measure = () => {
      geo = steps.current.map((el) => {
        if (!el) return { top: Infinity, height: 0, pad: 0 };
        const r = el.getBoundingClientRect();
        return { top: r.top + window.scrollY, height: r.height, pad: parseFloat(getComputedStyle(el).paddingBottom) || 0 };
      });
      schedule();
    };
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.5;
      let idx = 0;
      let k = -1;
      geo.forEach((g, i) => {
        const top = g.top - window.scrollY;
        if (top > line) return;
        idx = i;
        const n = stages[i].tips.length;
        const seg = (g.height - g.pad) / n;
        k = Math.min(n - 1, Math.floor((line - top) / seg));
      });
      fills.current.forEach((fill, i) => {
        if (!fill) return;
        const n = stages[i].tips.length;
        const p = i < idx ? 1 : i === idx ? (k + 1) / n : 0;
        fill.style.width = `${p * 100}%`;
      });
      if (idx !== state.current.active || k !== state.current.tip) {
        state.current = { active: idx, tip: k };
        setActive(idx);
        setTip(k);
      }
    };
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    measure();
    update();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
    };
  }, [stages]);

  // Tabs jump to the start of a stage (its first callout).
  const jump = useCallback((i: number) => {
    const el = steps.current[i];
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.5 + 2;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  return (
    <div className="relative mx-auto w-[min(1600px,calc(100%-2*clamp(12px,2.4vw,36px)))] border-x border-black/[0.08]">
      <div className="px-[clamp(20px,3vw,44px)] py-[clamp(88px,10vw,136px)]">
        <div className="grid grid-cols-[minmax(260px,0.3fr)_minmax(0,1fr)] gap-x-[clamp(32px,4vw,56px)]">
          {/* steps */}
          <ol className="col-start-1 row-start-1 m-0 list-none p-0">
            {stages.map((s, i) => {
              const on = i === active;
              return (
                <li
                  key={s.id}
                  id={s.id}
                  ref={(el) => {
                    steps.current[i] = el;
                  }}
                  data-on={on || undefined}
                  className="relative opacity-[0.28] transition-opacity duration-500 ease-out last:pb-[18vh] data-[on]:opacity-100 motion-reduce:transition-none"
                  style={{ minHeight: `calc(${s.tips.length} * 34vh + 12vh)` }}
                >
                  <div className="sticky top-[calc(50vh-130px)]">
                    <p className="m-0 flex items-baseline gap-3 font-mono text-[13px] uppercase leading-none tracking-[0.1em] text-neutral-600">
                      <span className={on ? "text-brand" : "text-neutral-400"}>{String(i + 1).padStart(2, "0")}</span>
                      {s.shortLabel}
                    </p>
                    <h3 className="mt-[22px] text-balance text-[clamp(1.75rem,2.3vw,2.4rem)] font-medium leading-[1.1] tracking-[-0.035em] text-brand-ink">
                      {s.title}
                    </h3>
                    <p className="mt-4 max-w-[34ch] text-pretty text-[16px] leading-[1.6] text-neutral-600">{s.description}</p>
                    <button
                      type="button"
                      tabIndex={on ? 0 : -1}
                      onClick={onCta}
                      className="group mt-6 inline-flex items-center gap-1.5 text-[14px] text-neutral-600 transition-colors duration-200 ease-out hover:text-brand-ink"
                    >
                      {s.cta}
                      <ArrowUpRight
                        className="h-4 w-4 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        strokeWidth={1.75}
                      />
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* sticky product screen */}
          <div className="col-start-2 row-start-1">
            <div className="sticky top-[max(84px,calc(50vh-min(22.5vw,370px)))] ml-auto w-[min(100%,calc(160vh-288px))]">
              {/* rail */}
              <div role="tablist" aria-label="Workflow stages" className="mb-[18px] grid grid-cols-4 gap-1.5">
                {stages.map((s, i) => {
                  const on = i === active;
                  const done = i < active;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => jump(i)}
                      className={`group relative flex min-w-0 items-center gap-2 border-t-[3px] px-2 pb-2.5 pt-3 text-left font-mono text-[11.5px] uppercase leading-none tracking-[0.08em] transition-[color,background-color,border-color] duration-300 ease-out ${
                        on
                          ? "border-brand/20 bg-brand/[0.06] text-brand-ink"
                          : done
                            ? "border-black/[0.14] text-neutral-700 hover:bg-black/[0.03]"
                            : "border-black/[0.08] text-neutral-500 hover:bg-black/[0.03] hover:text-neutral-800"
                      }`}
                    >
                      <span
                        ref={(el) => {
                          fills.current[i] = el;
                        }}
                        aria-hidden
                        className={`absolute left-0 top-[-3px] h-[3px] w-0 motion-reduce:transition-none ${on ? "bg-brand" : "bg-brand-ink"}`}
                        style={{ transition: `width .5s ${EASE}` }}
                      />
                      <span className={`shrink-0 tabular-nums ${on ? "text-brand" : "text-neutral-400"}`}>{String(i + 1).padStart(2, "0")}</span>
                      <span className={`truncate ${on ? "font-medium" : ""}`}>{TAB_LABEL[s.shortLabel] ?? s.shortLabel}</span>
                      {on && (
                        <span aria-hidden className="relative ml-auto flex h-1.5 w-1.5 shrink-0">
                          <span className="absolute inset-0 animate-ping rounded-full bg-brand/60 motion-reduce:animate-none" />
                          <span className="relative h-1.5 w-1.5 rounded-full bg-brand" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* screen */}
              <div className="relative isolate [container-type:inline-size]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-[-12%] inset-y-[-20%] -z-10 bg-[radial-gradient(50%_50%_at_50%_42%,rgba(47,91,255,0.14),transparent_100%)]"
                />
                <div className="relative aspect-[16/10] overflow-hidden rounded-[10px] bg-[#0d0d0e] shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_30px_80px_-20px_rgba(0,0,0,0.7)]">
                  {stages.map((s, i) => {
                    const on = i === active;
                    return (
                      <div
                        key={s.id}
                        aria-hidden={!on}
                        className="absolute inset-0 motion-reduce:transition-none"
                        style={{
                          opacity: on ? 1 : 0,
                          transform: on ? "none" : "scale(0.992)",
                          transition: `opacity .5s ${EASE}, transform .7s ${EASE}`,
                        }}
                      >
                        {s.screen ? (
                          live && (on || i === leaving) && <s.screen active={on && tip >= 0} step={null} />
                        ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.image}
                          alt={on ? s.title : ""}
                          loading={i === 0 ? "eager" : "lazy"}
                          decoding="async"
                          className="block h-full w-full object-cover object-left-top"
                        />
                        )}
                      </div>
                    );
                  })}

                  {/* callouts (hidden for now; the tips still pace the scroll steps) */}
                  {SHOW_TIPS && stages.map((s, i) =>
                    s.tips.map((t, k) => (
                      <div key={`${s.id}-${k}`} aria-hidden className="tour-tip" data-on={(i === active && k === tip) || undefined}>
                        <svg className="tour-leader">
                          <line x1={`${t.pin[0]}%`} y1={`${t.pin[1]}%`} x2={`${t.at[0]}%`} y2={`${t.at[1]}%`} pathLength={1} />
                        </svg>
                        <i className="tour-pin" style={{ left: `${t.pin[0]}%`, top: `${t.pin[1]}%` }} />
                        <span
                          className="tour-bubble"
                          style={
                            {
                              left: `${t.at[0]}%`,
                              top: `${t.at[1]}%`,
                              translate: `${t.anchor[0]}% ${t.anchor[1]}%`,
                              "--w": t.w,
                            } as CSSProperties
                          }
                        >
                          {t.text}
                        </span>
                      </div>
                    )),
                  )}
                </div>
              </div>
              <p className="mt-3.5 text-right font-mono text-[11.5px] leading-[1.4] text-neutral-400">
                OpenPlan workspace · sample data
              </p>

              {/* the current callout, for screen readers */}
              <p className="sr-only" aria-live="polite">
                {SHOW_TIPS && tip >= 0 ? stages[active].tips[tip]?.text : ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
