"use client";

// Slide 3 — the sticky tour. Left: a meter for one program and the active hairline machine in a
// figure card, pinned mid-screen. Middle: a rail of three nodes. Right: three steps; the one that
// has crossed the middle of the screen is active.
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ComponentType } from "react";
import { CheckerFig, RouterFig, ScannerFig, type FigProps } from "./TourFigures";
import { useOnScreen, useReducedMotion, useReveal } from "./useSlideBits";

type Step = {
  title: string;
  body: string;
  fact: [string, string, string];
  fig: { n: string; name: string; hint: string; Comp: ComponentType<FigProps> };
};

// OpenPlan copy, flagged for the owner's sign-off. Fact figures describe the illustration.
const STEPS: Step[] = [
  {
    title: "Reads every spec.",
    body: "Requirement docs, fab notes and datasheets shrink to the lines that matter. The source file stays linked if anyone asks.",
    fact: ["42 → 4", "lines that matter", "illustrative: one enclosure spec, every kept line linked to its source"],
    fig: { n: "1.1", name: "Scanner", hint: "Hover to scrub", Comp: ScannerFig },
  },
  {
    title: "Flags the risk.",
    body: "Every change is checked against the BOM, the schedule and the next gate. What will slip comes back in one line, not a thread.",
    fact: ["9 wk", "warning before EVT", "illustrative: one ECO checked against lead times and the build plan"],
    fig: { n: "1.2", name: "Checker", hint: "Hover to feed faster", Comp: CheckerFig },
  },
  {
    title: "Routes every part.",
    body: "Each part goes to the shop that fits its cost, lead time and volume. Critical parts still go to the proven supplier.",
    fact: ["3", "routes per part", "prototype shop, contract manufacturer or tier-1, picked per part"],
    fig: { n: "1.3", name: "Router", hint: "Hover to slow time", Comp: RouterFig },
  },
];

// One program's effort, shrinking step by step (illustrative)
const BASE = [34, 22, 44];
const KEEP = [0.6, 0.4, 0.55];
const LABELS = ["Specs", "Changes", "Sourcing"];
const WORDS = ["SolidWorks", "Onshape", "Jira", "Arena"];

function Roulette({ words }: { words: string[] }) {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const [snap, setSnap] = useState(false);
  const [widths, setWidths] = useState<number[]>([]);
  const measure = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = measure.current;
    if (!el) return;
    const read = () => setWidths([...el.children].map((c) => (c as HTMLElement).getBoundingClientRect().width));
    read();
    document.fonts?.ready.then(read);
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setSnap(false);
      setI((v) => v + 1);
    }, 2400);
    return () => window.clearInterval(id);
  }, [reduced]);

  // after landing on the duplicate first word, jump back to the real one without motion
  useEffect(() => {
    if (i !== words.length) return;
    const id = window.setTimeout(() => {
      setSnap(true);
      setI(0);
    }, 600);
    return () => window.clearTimeout(id);
  }, [i, words.length]);

  const w = widths[i % words.length];
  return (
    <span className="ops-roulette" data-snap={snap ? "" : undefined} style={w ? { width: `${Math.ceil(w)}px` } : undefined}>
      <span className="sr-only">{words.join(", ")}</span>
      <span className="ops-reel" style={{ transform: `translateY(${-1.1 * i}em)` }} aria-hidden="true">
        {[...words, words[0]].map((x, k) => (
          <span key={k} className="ops-word">
            {x}
          </span>
        ))}
      </span>
      <span ref={measure} aria-hidden="true" style={{ position: "absolute", visibility: "hidden", whiteSpace: "nowrap", left: 0, top: 0 }}>
        {words.map((x) => (
          <span key={x} style={{ display: "inline-block" }}>
            {x}
          </span>
        ))}
      </span>
    </span>
  );
}

function FigCard({ step, run, still }: { step: Step; run: boolean; still: boolean }) {
  const [read, setRead] = useState("");
  const onRead = useCallback((s: string) => setRead(s), []);
  const { Comp } = step.fig;
  return (
    <figure className="ops-fig ops-figWrap">
      <div className="ops-figTop">
        <span>Fig {step.fig.n}</span>
        <span>{step.fig.name}</span>
      </div>
      <div className="ops-figStage">
        <Comp run={run} still={still} onRead={onRead} />
      </div>
      <figcaption className="ops-figFoot">
        <span>{step.fig.hint}</span>
        <span>{read}</span>
      </figcaption>
    </figure>
  );
}

export default function TourSlide() {
  const reveal = useReveal<HTMLDivElement>();
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const howRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(howRef, "200px");

  useEffect(() => {
    const update = () => {
      const mid = window.innerHeight * 0.5;
      let a = 0;
      stepRefs.current.forEach((el, k) => {
        if (el && el.getBoundingClientRect().top < mid) a = k;
      });
      setActive(a);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const goTo = (k: number) => {
    const el = stepRefs.current[k];
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.5 + 40;
    window.scrollTo({ top: k === 0 ? top - 40 : top, behavior: reduced ? "auto" : "smooth" });
  };

  const slices = BASE.map((b, k) => (k <= active ? b * KEEP[k] : b));
  const saved = 100 - slices.reduce((s, x) => s + x, 0);

  return (
    <section className="ops-sec" id="ai-architect-tour" aria-label="OpenPlan with the tools you use">
      <div ref={reveal} className="ops-reveal" data-reveal="pending">
        <div className="ops-headGrid">
          <div>
            <p className="ops-label">
              <span>
                <span className="ops-prod">OpenPlan</span> <b>/</b> AI Architect
              </span>
            </p>
            <h2 className="ops-h2">
              <span className="ops-nowrap">
                <Roulette words={WORDS} />. Any tool.
              </span>
              <span className="ops-dim">One program.</span>
            </h2>
          </div>
          <div>
            <p className="ops-lede">
              Keep the tools you use. OpenPlan reads every spec, flags the risk in every change, and routes each part to the shop that fits.
            </p>
          </div>
        </div>
      </div>

      <div className="ops-how" ref={howRef} style={{ ["--active" as string]: active }}>
        <div className="ops-stageCol">
          <div className="ops-hstage">
            <div className="ops-meter" aria-hidden="true">
              <div className="ops-meterHead">
                <span>One program</span>
                <span>illustrative</span>
              </div>
              <div className="ops-bar">
                {slices.map((g, k) => (
                  <span key={k} className="ops-slice" data-on={k === active ? "" : undefined} style={{ flexGrow: g }} />
                ))}
                <span className="ops-saved" style={{ flexGrow: saved }} />
              </div>
              <div className="ops-sliceLabels">
                {slices.map((g, k) => (
                  <span key={k} data-on={k === active ? "" : undefined} style={{ flexGrow: g }}>
                    {LABELS[k]}
                  </span>
                ))}
                <span className="ops-savedLabel" style={{ flexGrow: saved }}>
                  Saved
                </span>
              </div>
            </div>
            <div className="ops-figs">
              {STEPS.map((s, k) => (
                <div key={k} className="ops-slot" data-on={k === active ? "" : undefined} aria-hidden={k !== active}>
                  <FigCard step={s} run={onScreen && k === active} still={reduced} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <nav className="ops-rail" aria-label="Steps">
          {STEPS.map((s, k) => (
            <button key={k} type="button" className="ops-node9" data-on={k <= active ? "" : undefined} aria-label={s.title} onClick={() => goTo(k)} />
          ))}
        </nav>

        <ol className="ops-steps">
          {STEPS.map((s, k) => (
            <li
              key={k}
              className="ops-step"
              data-on={k === active ? "" : undefined}
              ref={(el) => {
                stepRefs.current[k] = el;
              }}
            >
              <span className="ops-num">
                {`0${k + 1}`} <i>/ 03</i>
              </span>
              <h3 className="ops-stitle">{s.title}</h3>
              <p className="ops-body">{s.body}</p>
              <p className="ops-fact">
                <b>{s.fact[0]}</b> <span>{s.fact[1]}</span>
                <small>{s.fact[2]}</small>
              </p>
              <div className="ops-inlineFig">
                <MobileFig step={s} still={reduced} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Phones: each step carries its own figure, running while it is on screen. */
function MobileFig({ step, still }: { step: Step; still: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useOnScreen(ref);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(max-width: 960px)");
    const set = () => setNarrow(m.matches);
    set();
    m.addEventListener("change", set);
    return () => m.removeEventListener("change", set);
  }, []);
  return (
    <div ref={ref}>
      <FigCard step={step} run={on && narrow} still={still} />
    </div>
  );
}
