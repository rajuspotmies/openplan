"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowDownToLine, Check, FileSpreadsheet, FileText, Presentation, Sheet, type LucideIcon } from "lucide-react";
import BlurReveal, { BlurWords, revealEase } from "@/components/motion/BlurReveal";

/*
 * "How to get started": three steps (import → agent draft → review) on the dark
 * railed frame. Each plate has a status header, a body and a footer. Step 01 reads
 * the source files one after another; steps 02/03 draw the product model as a
 * dependency graph (curved edges, ports, two-line record cards). Draft = dashed
 * brand blue with flowing edges; finalised = solid edges + checks.
 */

// COPY FOR APPROVAL: file sizes
const FILES: { name: string; size: string; Icon: LucideIcon; tint: string }[] = [
  { name: "bom.xlsx", size: "248 KB", Icon: FileSpreadsheet, tint: "#4FBF8A" },
  { name: "requirements.csv", size: "64 KB", Icon: Sheet, tint: "#45C4C9" },
  { name: "test-plan.docx", size: "1.2 MB", Icon: FileText, tint: "#6E8DFF" },
  { name: "design-review.pptx", size: "8.4 MB", Icon: Presentation, tint: "#F0A35B" },
];
const FORMATS = ["Excel", "Word", "PowerPoint", "CAD / PLM exports", "CSV", "PDF", "Markdown"];
// COPY FOR APPROVAL: second line on each record card
const RECORDS: { name: string; meta: string; tint: string }[] = [
  { name: "Architecture", meta: "4 subsystems", tint: "#7C9BFF" },
  { name: "BOM", meta: "248 parts", tint: "#7C9BFF" },
  { name: "Requirements", meta: "112 records", tint: "#7C9BFF" },
  { name: "Tests", meta: "36 cases", tint: "#45C4C9" },
  { name: "Risks", meta: "9 open", tint: "#F0B45B" },
];
const SYSTEM = "Rover";

const BLUE = "#5B7FFF";
const DRAFT_RULE = "rgba(91,127,255,0.48)";
const RULE = "rgba(255,255,255,0.1)";

function Arrow({ down = false }: { down?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden className={down ? "rotate-90" : ""}>
      <path d="M4 12h15M14 7l5 5-5 5" />
    </svg>
  );
}

function useInViewOnce<T extends Element>() {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  return [ref, inView] as const;
}

/* ---------- plate chrome ---------- */

// COPY FOR APPROVAL: plate header labels
function PlateHeader({ label, meta, tone, pulse = false }: { label: string; meta: string; tone: string; pulse?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 border-b pb-3 font-mono text-[11px] uppercase tracking-[0.08em]" style={{ borderColor: RULE }}>
      <span className="flex min-w-0 items-center gap-2 text-white/70">
        <span className="relative flex h-[6px] w-[6px] flex-none">
          {pulse && !reduce && <span className="absolute inset-0 animate-ping" style={{ background: tone, opacity: 0.6 }} />}
          <span className="relative h-[6px] w-[6px]" style={{ background: tone }} />
        </span>
        <span className="truncate">{label}</span>
      </span>
      <span className="flex-none text-white/40">{meta}</span>
    </div>
  );
}

/* ---------- 01 · import ---------- */

function ImportList() {
  const reduce = useReducedMotion();
  const [ref, inView] = useInViewOnce<HTMLDivElement>();
  const on = inView || !!reduce;
  const step = 0.3;
  const done = 0.2 + FILES.length * step + 0.5;
  return (
    <div ref={ref} className="flex min-w-0 flex-col justify-center gap-3">
      <ul className="m-0 grid list-none gap-1.5 p-0">
        {FILES.map(({ name, size, Icon, tint }, i) => (
          <motion.li
            key={name}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={on ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, ease: revealEase, delay: 0.1 + i * step }}
            className="group/file relative flex h-[40px] min-w-0 cursor-default items-center gap-3 border border-white/[0.09] bg-[#111113] px-2.5 transition-[border-color,background-color] duration-200 hover:border-[rgba(91,127,255,0.5)] hover:bg-[#13151c]"
          >
            <span
              aria-hidden
              className="grid h-[24px] w-[24px] flex-none place-items-center border transition-transform duration-200 group-hover/file:scale-110"
              style={{ color: tint, borderColor: `${tint}50`, background: `${tint}12` }}
            >
              <Icon size={13} strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-white/90 transition-transform duration-200 group-hover/file:translate-x-0.5">
              {name}
            </span>
            <span className="flex-none font-mono text-[11px] text-white/35 transition-colors duration-200 group-hover/file:text-white/60">{size}</span>
            <motion.span
              aria-hidden
              className="grid h-[16px] w-[16px] flex-none place-items-center"
              style={{ color: BLUE }}
              initial={reduce ? false : { opacity: 0, scale: 0.4 }}
              animate={on ? { opacity: 1, scale: 1 } : undefined}
              transition={{ duration: 0.35, ease: revealEase, delay: 0.7 + i * step }}
            >
              <Check size={14} strokeWidth={2} />
            </motion.span>
            {/* read progress along the bottom edge */}
            <motion.span
              aria-hidden
              className="absolute inset-x-0 -bottom-px h-px origin-left"
              style={{ background: BLUE }}
              initial={reduce ? { scaleX: 1, opacity: 0 } : { scaleX: 0, opacity: 1 }}
              animate={on && !reduce ? { scaleX: 1, opacity: [1, 1, 0] } : undefined}
              transition={{ scaleX: { duration: 0.55, ease: "easeInOut", delay: 0.2 + i * step }, opacity: { duration: 1.1, delay: 0.2 + i * step, times: [0, 0.6, 1] } }}
            />
          </motion.li>
        ))}
      </ul>
      <span className="relative mx-auto block h-[18px] w-px" style={{ background: "rgba(91,127,255,0.35)" }}>
        {!reduce && on && (
          <motion.span
            aria-hidden
            className="absolute -left-[2px] top-0 h-[5px] w-[5px]"
            style={{ background: BLUE, boxShadow: `0 0 8px ${BLUE}` }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: [0, 14], opacity: [0, 1, 0] }}
            transition={{ duration: 0.9, ease: "easeIn", repeat: Infinity, repeatDelay: 1.6, delay: done }}
          />
        )}
      </span>
      <div
        className="relative flex h-[42px] items-center justify-center gap-2 overflow-hidden text-[15px] transition-colors duration-200 hover:bg-[rgba(91,127,255,0.1)]"
        style={{ border: `1px solid ${DRAFT_RULE}`, background: "rgba(91,127,255,0.04)" }}
      >
        <motion.span
          aria-hidden
          className="absolute inset-y-0 left-0 w-full origin-left"
          style={{ background: "linear-gradient(90deg, rgba(91,127,255,0.05), rgba(91,127,255,0.14))" }}
          initial={reduce ? false : { scaleX: 0 }}
          animate={on ? { scaleX: 1 } : undefined}
          transition={{ duration: 1, ease: revealEase, delay: done - 0.3 }}
        />
        <ArrowDownToLine size={15} strokeWidth={1.75} className="relative" style={{ color: BLUE }} aria-hidden />
        <span className="relative">OpenPlan import</span>
      </div>
    </div>
  );
}

/* ---------- 02 / 03 · product-model graph ---------- */

const GH = 236; // graph height (px)
const NH = 40; // record card height
const LEFT = 0.25; // system card width (fraction)
const RIGHT = 0.5; // record column starts at (fraction)
const GAP = (GH - RECORDS.length * NH) / (RECORDS.length - 1);
const yAt = (i: number) => NH / 2 + i * (NH + GAP);

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function Graph({ draft }: { draft: boolean }) {
  const reduce = useReducedMotion();
  const [boxRef, w] = useWidth<HTMLDivElement>();
  const [viewRef, inView] = useInViewOnce<HTMLDivElement>();
  const on = inView || !!reduce;
  const [hover, setHover] = useState<number | null>(null);
  const base = draft ? 0.35 : 0.9;
  const step = 0.16;

  const x0 = w * LEFT;
  const x1 = w * RIGHT;
  const cy = GH / 2;
  const trunk = x0 + (x1 - x0) * 0.22; // short straight run out of the system port before branching
  const span = x1 - trunk;
  const edge = (i: number) => `M${x0} ${cy} L${trunk} ${cy} C${trunk + span * 0.55} ${cy}, ${x1 - span * 0.55} ${yAt(i)}, ${x1} ${yAt(i)}`;
  const cardBorder = draft ? "border-dashed" : "border-solid";
  const idle = draft ? DRAFT_RULE : "rgba(255,255,255,0.14)";

  return (
    <div ref={viewRef} className="min-w-0">
      <div ref={boxRef} className="relative w-full" style={{ height: GH }} onMouseLeave={() => setHover(null)}>
        {w > 0 && (
          <svg className="pointer-events-none absolute inset-0 overflow-visible" width={w} height={GH} aria-hidden>
            {RECORDS.map((r, i) => {
              const lit = hover === null || hover === i;
              const strong = hover === i;
              return (
                <g key={r.name} style={{ opacity: lit ? 1 : 0.2, transition: "opacity .25s" }}>
                  {draft ? (
                    <motion.path
                      d={edge(i)}
                      fill="none"
                      stroke={BLUE}
                      strokeWidth={strong ? 1.5 : 1}
                      strokeDasharray="4 4"
                      initial={reduce ? false : { opacity: 0, strokeDashoffset: 0 }}
                      animate={on ? (reduce ? { opacity: 0.8 } : { opacity: 0.8, strokeDashoffset: [0, -16] }) : undefined}
                      transition={{
                        opacity: { duration: 0.6, delay: base + i * step },
                        strokeDashoffset: { duration: 1.1, ease: "linear", repeat: Infinity },
                      }}
                    />
                  ) : (
                    <>
                      <motion.path
                        d={edge(i)}
                        fill="none"
                        stroke={strong ? "#ffffff" : "rgba(255,255,255,0.38)"}
                        strokeWidth={strong ? 1.5 : 1}
                        initial={reduce ? false : { pathLength: 0 }}
                        animate={on ? { pathLength: 1 } : undefined}
                        transition={{ duration: 0.7, ease: revealEase, delay: base + i * step }}
                      />
                      {!reduce && on && (
                        <circle r="1.8" fill={BLUE} opacity="0" style={{ filter: `drop-shadow(0 0 3px ${BLUE})` }}>
                          <set attributeName="opacity" to="1" begin={`${base + 1.2 + i * 0.6}s`} />
                          <animateMotion dur="3s" repeatCount="indefinite" begin={`${base + 1.2 + i * 0.6}s`} path={edge(i)} />
                        </circle>
                      )}
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {/* system card */}
        <motion.div
          className={`absolute left-0 flex flex-col justify-center border bg-[#111113] px-2.5 ${cardBorder}`}
          style={{ width: `${LEFT * 100}%`, top: cy - NH / 2, height: NH, borderColor: draft ? DRAFT_RULE : "rgba(255,255,255,0.2)" }}
          initial={reduce ? false : { opacity: 0, x: -8 }}
          animate={on ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.5, ease: revealEase, delay: base - 0.2 }}
        >
          <span className="font-mono text-[10px] uppercase leading-none tracking-[0.08em] text-white/45">System</span>
          <span className="mt-1.5 truncate text-[14px] leading-none">{SYSTEM}</span>
        </motion.div>

        {/* ports */}
        <motion.span
          aria-hidden
          className="absolute -ml-[3px] -mt-[3px] h-[6px] w-[6px]"
          style={{ left: `${LEFT * 100}%`, top: cy, background: draft ? BLUE : "#fff" }}
          initial={reduce ? false : { opacity: 0 }}
          animate={on ? { opacity: 1 } : undefined}
          transition={{ duration: 0.3, delay: base }}
        />
        {RECORDS.map((r, i) => (
          <motion.span
            key={r.name}
            aria-hidden
            className="absolute -ml-[2.5px] -mt-[2.5px] h-[5px] w-[5px]"
            style={{ left: `${RIGHT * 100}%`, top: yAt(i), background: draft ? BLUE : "rgba(255,255,255,0.75)" }}
            initial={reduce ? false : { opacity: 0, scale: 1 }}
            animate={on ? { opacity: 1, scale: hover === i ? 1.6 : 1 } : undefined}
            transition={{ opacity: { duration: 0.3, delay: base + 0.4 + i * step }, scale: { duration: 0.2 } }}
          />
        ))}

        {/* record cards */}
        {RECORDS.map((r, i) => (
          <motion.div
            key={r.name}
            onMouseEnter={() => setHover(i)}
            className={`absolute right-0 flex cursor-default items-center gap-2 border px-2.5 transition-[border-color,background-color] duration-200 ${cardBorder}`}
            style={{
              left: `calc(${RIGHT * 100}% + 5px)`,
              top: yAt(i) - NH / 2,
              height: NH,
              borderColor: hover === i ? (draft ? BLUE : "rgba(255,255,255,0.5)") : idle,
              backgroundColor: hover === i ? "#14161d" : "#111113",
            }}
            initial={reduce ? false : { opacity: 0, x: 10 }}
            animate={on ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.5, ease: revealEase, delay: base + 0.15 + i * step }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-px bg-[#0d0d0e] transition-opacity duration-200"
              style={{ opacity: hover === null || hover === i ? 0 : 0.5 }}
            />
            <span className="flex min-w-0 flex-1 flex-col justify-center">
              <span className="truncate font-mono text-[10px] uppercase leading-none tracking-[0.06em]" style={{ color: r.tint }}>
                {r.name}
              </span>
              <span className="mt-1.5 truncate text-[13px] leading-none text-white/85">{r.meta}</span>
            </span>
            {draft ? (
              <motion.span
                aria-hidden
                className="h-[5px] w-[5px] flex-none"
                style={{ background: BLUE }}
                initial={reduce ? false : { opacity: 0.3 }}
                animate={on && !reduce ? { opacity: [0.3, 1, 0.3] } : undefined}
                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.25 }}
              />
            ) : (
              <motion.span
                aria-hidden
                className="flex-none"
                style={{ color: BLUE }}
                initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                animate={on ? { opacity: 1, scale: 1 } : undefined}
                transition={{ duration: 0.35, ease: revealEase, delay: base + 0.7 + i * step }}
              >
                <Check size={14} strokeWidth={2} />
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const plate = "grid w-full min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-4 bg-[#0d0d0e] p-4 text-[14px] leading-[1.4] text-white";
const plateFooter = "flex min-h-[44px] min-w-0 items-center border-t pt-3";

const steps: { title: string; body: string; visual: ReactNode }[] = [
  {
    title: "Import existing files",
    body: "Import BOMs, requirements, tests and other programme information into OpenPlan, in the formats your team uses today.",
    visual: (
      <div className={plate} style={{ border: `1px solid ${RULE}` }}>
        <PlateHeader label="Source files" meta="4 files" tone="rgba(255,255,255,0.55)" />
        <ImportList />
        <div className={plateFooter} style={{ borderColor: RULE }}>
          <p className="m-0 text-[13px] leading-[1.45] text-white/55">{FORMATS.join(" · ")}</p>
        </div>
      </div>
    ),
  },
  {
    title: "Agent prepares draft proposal",
    body: "The import agent carefully reads and connects the supplied information, then drafts your architecture and record mapping.",
    visual: (
      <div className={plate} style={{ border: `1px dashed ${DRAFT_RULE}` }}>
        <PlateHeader label="Agent drafting" meta="Proposal v0.1" tone={BLUE} pulse />
        <div className="flex min-w-0 flex-col justify-center">
          <Graph draft />
        </div>
        <div className={plateFooter} style={{ borderColor: RULE }}>
          <p className="m-0 flex items-center gap-2 text-[14px]" style={{ color: BLUE }}>
            <span aria-hidden className="h-[7px] w-[7px] flex-none border border-current" />
            Draft · Awaiting review
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Review and finalise",
    body: "Review the architecture and record mapping, refine the proposal and finalise your starting product model.",
    visual: (
      <div className={plate} style={{ border: `1px solid ${RULE}` }}>
        <PlateHeader label="Product model" meta="Baseline v1.0" tone="#4FBF8A" />
        <div className="flex min-w-0 flex-col justify-center">
          <Graph draft={false} />
        </div>
        <div className={plateFooter} style={{ borderColor: RULE }}>
          <p className="m-0 flex items-center gap-1.5 text-[14px] text-white">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke={BLUE} strokeWidth="1.6" aria-hidden>
              <path d="M4.5 10.5l3.5 3.5 7.5-8" />
            </svg>
            Reviewed · Finalised
          </p>
        </div>
      </div>
    ),
  },
];

export default function GetStarted() {
  return (
    <section id="getting-started" className="relative bg-[#0A0A0B] text-white">
      <div className="mx-auto w-[min(1600px,calc(100%-2*clamp(12px,2.4vw,36px)))] border-x border-white/[0.08] px-[clamp(16px,4vw,72px)] py-24 md:py-32">
        {/* eyebrow with end-ticked rule */}
        <BlurReveal y={10} blur={8}>
          <div className="mb-4 flex items-center gap-3 font-mono text-[14px] uppercase tracking-[0.04em] text-white/60">
            <span className="flex-none">How to get started</span>
            <span aria-hidden className="relative h-px min-w-5 flex-1 bg-white/[0.12]">
              <span className="absolute -top-[3px] left-0 h-[7px] w-px bg-white/[0.12]" />
              <span className="absolute -top-[3px] right-0 h-[7px] w-px bg-white/[0.12]" />
            </span>
          </div>
        </BlurReveal>
        <h2 className="text-balance text-4xl font-medium leading-[1.05] tracking-[-0.045em] sm:text-5xl">
          <BlurWords text="Start working in OpenPlan in 5 minutes." />
        </h2>
        <BlurReveal delay={0.2}>
          <p className="mt-5 max-w-[920px] text-pretty text-[16px] leading-relaxed text-white/60 sm:text-[17px]">
            Bring your existing BOMs, requirements, tests and supporting files. OpenPlan&rsquo;s import agent prepares a
            connected product model for your team to review and finalise.
          </p>
        </BlurReveal>

        <ol className="m-0 mt-7 grid list-none grid-cols-1 gap-x-10 gap-y-3 p-0 lg:grid-cols-3">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="grid min-w-0 gap-2.5 border-t border-white/[0.1] pt-3 max-lg:[&:not(:first-child)]:mt-4 lg:row-span-4 lg:grid-rows-subgrid lg:gap-3"
            >
              <BlurReveal delay={0.08 * i} y={10} blur={8}>
                <span className="font-mono text-[13px] tracking-[0.04em]" style={{ color: BLUE }}>
                  0{i + 1}
                </span>
              </BlurReveal>
              <BlurReveal delay={0.08 * i + 0.04} y={10} blur={8}>
                <h3 className="m-0 text-[24px] font-normal leading-[1.18] tracking-[-0.025em]">{s.title}</h3>
              </BlurReveal>
              <BlurReveal delay={0.08 * i + 0.08} y={10} blur={8}>
                <p className="m-0 text-[15px] leading-[1.5] text-white/60 sm:text-[16px]">{s.body}</p>
              </BlurReveal>
              <BlurReveal delay={0.08 * i + 0.14} y={22} blur={14} className="relative mt-0.5 flex min-w-0">
                {s.visual}
                {i < steps.length - 1 && (
                  <span aria-hidden className="absolute left-[calc(100%+9px)] top-1/2 hidden -translate-y-1/2 lg:block" style={{ color: BLUE }}>
                    <Arrow />
                  </span>
                )}
              </BlurReveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
