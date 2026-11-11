"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import AsciiMorph from "@/components/chaos/AsciiMorph";
import BlurReveal, { BlurWords } from "@/components/motion/BlurReveal";

const pairs = [
  {
    glyph: "{~}",
    problem: { title: "Scattered tools", description: "A different app for every task, and nothing talks to anything else." },
    solution: { title: "One connected platform", description: "Parts, BOMs, changes and tasks live in one place, linked." },
  },
  {
    glyph: "[?]",
    problem: { title: "Version confusion", description: "Lost files, outdated drawings, nobody sure which revision is live." },
    solution: { title: "Revision control built in", description: "Every part keeps its full history. The current state is never a guess." },
  },
  {
    glyph: "/!\\",
    problem: { title: "Compliance chaos", description: "Missing documents and scrambles before every audit." },
    solution: { title: "Compliance by default", description: "Standards and checks travel with the change, so the trail writes itself." },
  },
  {
    glyph: "<..>",
    problem: { title: "Slow handoffs", description: "Changes move through email and chat, and decisions stall." },
    solution: { title: "Work that follows the change", description: "Reviews and tasks attach to the ECO, so the right people move at once." },
  },
];

const ProblemSolution = () => {
  // live status under the ASCII panel, updated without re-rendering the section
  const statusRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const onProgress = useCallback((p: number) => {
    const pct = Math.round(Math.min(1, p) * 100);
    if (statusRef.current) statusRef.current.textContent = pct >= 99 ? "resolved ✓" : `resolving… ${pct}%`;
    if (barRef.current) barRef.current.style.transform = `scaleX(${Math.min(1, p)})`;
  }, []);

  return (
    <section
      id="use-cases"
      className="relative z-20 -mt-10 overflow-hidden rounded-t-[40px] bg-white text-brand-ink md:-mt-14 md:rounded-t-[56px]"
    >
      {/* soft accent wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[min(1000px,90%)] -translate-x-1/2 rounded-full bg-brand/[0.07] blur-[120px]"
      />

      <div className="relative mx-auto max-w-[1180px] px-6 pb-24 pt-24 sm:px-8 md:pb-32 md:pt-32">
        {/* Header */}
        <div className="mx-auto max-w-[760px] text-center">
          <BlurReveal>
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-neutral-400">
              the problem <span className="text-brand">→</span> the fix
            </p>
          </BlurReveal>
          <h2 className="mt-5 text-balance text-4xl font-medium leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-[4rem]">
            <BlurWords text="From chaos" delay={0.05} />{" "}
            <BlurWords text="to clarity" delay={0.2} className="text-brand" />
          </h2>
          <BlurReveal delay={0.3}>
            <p className="mx-auto mt-6 max-w-[560px] text-pretty text-[17px] leading-relaxed text-neutral-600">
              Hardware teams lose weeks to scattered tools and messy handoffs. OpenPlan turns the
              noise into one connected flow.
            </p>
          </BlurReveal>
        </div>

        {/* ASCII chaos → clarity panel */}
        <BlurReveal delay={0.1} y={28} blur={18} className="mt-16 md:mt-20">
          <div className="overflow-hidden rounded-[22px] border border-black/[0.07] bg-[#FAFAFA] shadow-[0_30px_80px_-50px_rgba(10,10,11,0.35)]">
            <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-3 font-mono text-[11px]">
              <span className="text-neutral-400">chaos.log</span>
              <span className="flex items-center gap-2 text-neutral-500">
                <span className="relative h-[3px] w-20 overflow-hidden rounded-full bg-black/[0.06]">
                  <span ref={barRef} className="absolute inset-0 origin-left scale-x-0 rounded-full bg-brand" />
                </span>
                <span ref={statusRef} className="tabular-nums">resolving… 0%</span>
              </span>
              <span className="text-brand">clarity</span>
            </div>
            <div className="px-3 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10">
              <AsciiMorph onProgress={onProgress} />
            </div>
          </div>
        </BlurReveal>

        {/* Problem → solution pairs */}
        <div className="mt-16 grid gap-4 md:mt-20 md:grid-cols-2 md:gap-5">
          {pairs.map((pair, i) => (
            <BlurReveal key={pair.problem.title} delay={0.08 * (i % 2) + 0.04 * Math.floor(i / 2)}>
              <article className="group h-full rounded-[20px] border border-black/[0.07] bg-white p-6 transition-[border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-black/[0.12] hover:shadow-[0_24px_60px_-40px_rgba(10,10,11,0.35)] sm:p-7">
                {/* before */}
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 w-11 shrink-0 font-mono text-[13px] text-neutral-400">{pair.glyph}</span>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">before</p>
                    <h3 className="mt-1 text-[15px] font-medium text-neutral-500 line-through decoration-neutral-300">
                      {pair.problem.title}
                    </h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-neutral-500">{pair.problem.description}</p>
                  </div>
                </div>

                <div aria-hidden className="my-5 ml-[60px] font-mono text-[12px] tracking-[0.3em] text-neutral-300 transition-colors duration-500 group-hover:text-brand">
                  ↓ · · · · · ·
                </div>

                {/* after */}
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 w-11 shrink-0 font-mono text-[13px] text-brand">[✓]</span>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand">with openplan</p>
                    <h3 className="mt-1 text-[18px] font-medium tracking-[-0.01em]">{pair.solution.title}</h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-neutral-600">{pair.solution.description}</p>
                  </div>
                </div>
              </article>
            </BlurReveal>
          ))}
        </div>

        {/* CTA */}
        <BlurReveal className="mt-14 flex justify-center md:mt-16">
          <Link
            href="/waitlist"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-brand-ink px-6 text-[15px] font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Ready to get started?
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </BlurReveal>
      </div>
    </section>
  );
};

export default ProblemSolution;
