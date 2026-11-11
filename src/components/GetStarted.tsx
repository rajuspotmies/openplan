"use client";

import BlurReveal, { BlurWords } from "@/components/motion/BlurReveal";

/*
 * "How to get started": three steps (import → agent draft → review) on the dark
 * railed frame. Draft plate is dashed in brand blue; the finalised plate is solid.
 */

const FILES = ["bom.xlsx", "requirements.csv", "test-plan.docx", "design-review.pptx"];
const FORMATS = ["Excel", "Word", "PowerPoint", "CAD / PLM exports", "CSV", "PDF", "Markdown"];
const RECORDS = ["Architecture", "BOM", "Requirements", "Tests", "Risks"];
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

function Model({ draft }: { draft: boolean }) {
  const line = draft ? "dashed" : "solid";
  const border = draft ? `1px dashed ${DRAFT_RULE}` : `1px solid ${RULE}`;
  const HUB = 26;
  return (
    <div className="grid min-w-0 items-center" style={{ gridTemplateColumns: "minmax(0,.37fr) minmax(0,.63fr)", gap: HUB }}>
      <p className="relative m-0 min-h-[32px] bg-[#101010] px-2 py-[5px] text-center text-[15px]" style={{ border }}>
        {SYSTEM}
        <span
          aria-hidden
          className="absolute top-1/2"
          style={{ left: "calc(100% + 1px)", width: HUB / 2, borderTop: `1px ${line} ${BLUE}` }}
        />
      </p>
      <ul className="relative m-0 grid list-none gap-2 p-0" style={{ gridTemplateRows: "repeat(5,minmax(32px,1fr))" }}>
        <span
          aria-hidden
          className="absolute"
          style={{ top: "calc(10% - 3.2px)", bottom: "calc(10% - 3.2px)", left: -HUB / 2, borderLeft: `1px ${line} ${BLUE}` }}
        />
        {RECORDS.map((r) => (
          <li key={r} className="relative min-h-[32px] bg-[#101010] px-2 py-[5px] text-center text-[14px]" style={{ border }}>
            <span
              aria-hidden
              className="absolute top-1/2"
              style={{ left: -HUB / 2 - 1, width: HUB / 2, borderTop: `1px ${line} ${BLUE}` }}
            />
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}

const plate = "grid min-h-[316px] w-full min-w-0 grid-rows-[minmax(0,1fr)_auto] gap-2.5 bg-[#0d0d0e] p-4 text-[14px] leading-[1.4] text-white";
const plateFooter = "flex min-h-[52px] min-w-0 items-center border-t pt-2.5";

const steps = [
  {
    title: "Import existing files",
    body: "Import BOMs, requirements, tests and other programme information into OpenPlan, in the formats your team uses today.",
    visual: (
      <div className={plate} style={{ border: `1px solid ${RULE}` }}>
        <div className="flex min-w-0 flex-col justify-center gap-2.5">
          <ul className="m-0 grid list-none gap-1 p-0">
            {FILES.map((f) => (
              <li key={f} className="flex min-w-0 items-center gap-2.5 bg-[#101010] px-2 py-1 font-mono text-[14px]" style={{ border: `1px solid ${RULE}` }}>
                <span
                  aria-hidden
                  className="h-[17px] w-[13px] flex-none border border-white/40"
                  style={{
                    background:
                      "linear-gradient(rgba(255,255,255,.4),rgba(255,255,255,.4)) 3px 5px / 6px 1px no-repeat, linear-gradient(rgba(255,255,255,.4),rgba(255,255,255,.4)) 3px 10px / 6px 1px no-repeat",
                  }}
                />
                <span className="truncate">{f}</span>
              </li>
            ))}
          </ul>
          <span className="flex justify-center" style={{ color: BLUE }}>
            <Arrow down />
          </span>
          <p className="m-0 px-2.5 py-1.5 text-center text-[16px]" style={{ border: `1px solid ${DRAFT_RULE}`, background: "rgba(91,127,255,0.06)" }}>
            OpenPlan import
          </p>
        </div>
        <div className={plateFooter} style={{ borderColor: RULE }}>
          <p className="m-0 text-[14px] leading-[1.45] text-white/60">{FORMATS.join(" · ")}</p>
        </div>
      </div>
    ),
  },
  {
    title: "Agent prepares draft proposal",
    body: "The import agent carefully reads and connects the supplied information, then drafts your architecture and record mapping.",
    visual: (
      <div className={plate} style={{ border: `1px dashed ${DRAFT_RULE}` }}>
        <div className="flex min-w-0 flex-col justify-center">
          <Model draft />
        </div>
        <div className={plateFooter} style={{ borderColor: RULE }}>
          <p className="m-0 flex items-baseline gap-2 text-[14px]" style={{ color: BLUE }}>
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
        <div className="flex min-w-0 flex-col justify-center">
          <Model draft={false} />
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
