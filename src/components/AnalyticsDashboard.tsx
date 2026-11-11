"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Factory, Milestone, ShieldAlert } from "lucide-react";
import { useNavigate } from "@/lib/router";
import BlurReveal, { BlurWords, revealEase } from "@/components/motion/BlurReveal";
import GradientReveal from "@/components/motion/GradientReveal";

const FEATURE_IMAGE_WIDTH = 2160;
const FEATURE_IMAGE_HEIGHT = 1760;
const CYCLE_MS = 6500;

const features = [
  {
    icon: ShieldAlert,
    image: "/assets/featureImages/F5.png",
    file: "risk-tracker",
    title: "Risk & Issue Management",
    description:
      "Surface risks early, assign owners, and track resolution before they compound into schedule slips. Built for FMEA-style thinking.",
  },
  {
    icon: Factory,
    image: "/assets/featureImages/F6.png",
    file: "manufacturing-readiness",
    title: "Manufacturing Readiness",
    description:
      "DFM checklists, production readiness scoring and quality gate tracking, so your first production run isn't also your debugging run.",
  },
  {
    icon: Milestone,
    image: "/assets/featureImages/F4.png",
    file: "milestones-and-gates",
    title: "Program Milestone & Gate Reviews",
    description:
      "Define phase gates, assign owners and track every milestone across workstreams in real time. PDR, CDR, MRR: all structured, all visible.",
  },
];

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.3 });
  const reduce = useReducedMotion();
  const running = inView && !paused && !reduce;

  // Auto-advance through the three tools while the section is on screen.
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % features.length), CYCLE_MS);
    return () => window.clearTimeout(id);
  }, [running, active]);

  const current = features[active];

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-white py-24 text-brand-ink md:py-32">
      {/* soft accent wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-10%] top-1/3 h-[520px] w-[620px] rounded-full bg-brand/[0.07] blur-[140px]"
      />

      <div className="relative mx-auto max-w-[1240px] px-6 sm:px-8">
        {/* Header */}
        <div className="mx-auto max-w-[760px] text-center">
          <BlurReveal>
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-neutral-400">intelligence</p>
          </BlurReveal>
          <h2 className="mt-5 text-balance text-4xl font-medium leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-[4rem]">
            <BlurWords text="Intelligence" delay={0.05} /> <BlurWords text="unleashed" delay={0.18} className="text-brand" />
          </h2>
          <BlurReveal delay={0.3}>
            <p className="mx-auto mt-6 max-w-[580px] text-pretty text-[17px] leading-relaxed text-neutral-600">
              Turn raw program data into decisions: risks, readiness and gates, visible before they
              turn into late surprises.
            </p>
          </BlurReveal>
        </div>

        <div className="mt-16 grid items-center gap-12 md:mt-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
          {/* Product window */}
          <BlurReveal y={28} blur={18} className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-8 -z-10 rounded-[40px] bg-[radial-gradient(circle_at_30%_20%,rgba(47,91,255,0.16),transparent_60%),radial-gradient(circle_at_80%_90%,rgba(124,155,255,0.14),transparent_55%)] blur-2xl"
            />
            <div className="overflow-hidden rounded-[22px] border border-black/[0.08] bg-white shadow-[0_40px_100px_-50px_rgba(10,10,11,0.45)]">
              <div className="flex items-center gap-3 border-b border-black/[0.06] px-4 py-3">
                <span className="flex gap-1.5" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                </span>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={current.file}
                    className="font-mono text-[11px] text-neutral-400"
                    initial={{ opacity: 0, filter: "blur(6px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(6px)" }}
                    transition={{ duration: 0.35, ease: revealEase }}
                  >
                    openplan / {current.file}
                  </motion.span>
                </AnimatePresence>
                <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-neutral-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                  live
                </span>
              </div>
              <div className="relative bg-[#0A0A0B]" style={{ aspectRatio: `${FEATURE_IMAGE_WIDTH} / ${FEATURE_IMAGE_HEIGHT}` }}>
                <AnimatePresence initial={false}>
                  <motion.img
                    key={current.image}
                    src={current.image}
                    alt={current.title}
                    width={FEATURE_IMAGE_WIDTH}
                    height={FEATURE_IMAGE_HEIGHT}
                    className="absolute inset-0 block h-full w-full object-contain"
                    initial={{ opacity: 0, scale: 1.015, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.99, filter: "blur(10px)" }}
                    transition={{ duration: 0.7, ease: revealEase }}
                  />
                </AnimatePresence>
              </div>
            </div>
          </BlurReveal>

          {/* Copy + accordion */}
          <div onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
            <GradientReveal
              as="h3"
              text="From prototype to production without the chaos"
              className="text-balance text-3xl font-medium leading-[1.12] tracking-[-0.03em] sm:text-[2.4rem]"
            />
            <GradientReveal
              as="p"
              text="Replace spreadsheets, email chains and tribal knowledge with structured workflows built for hardware timelines."
              className="mt-4 max-w-[520px] text-[16px] leading-relaxed text-neutral-600 sm:text-[17px]"
            />

            <ol className="mt-10 border-t border-black/[0.07]">
              {features.map((f, i) => {
                const on = i === active;
                const Icon = f.icon;
                return (
                  <li key={f.title} className="relative border-b border-black/[0.07]">
                    {/* progress line for the auto-advance */}
                    <span aria-hidden className="absolute -top-px left-0 right-0 h-[2px] overflow-hidden">
                      {on && (
                        <motion.span
                          key={`${active}-${running}`}
                          className="block h-full origin-left bg-brand"
                          initial={{ scaleX: running ? 0 : 1 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: running ? CYCLE_MS / 1000 : 0, ease: "linear" }}
                        />
                      )}
                    </span>
                    <button
                      type="button"
                      aria-expanded={on}
                      onClick={() => setActive(i)}
                      className="group flex w-full items-start gap-4 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                    >
                      <span
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-500 ${
                          on ? "border-brand/30 bg-brand/[0.06] text-brand" : "border-black/10 bg-black/[0.02] text-neutral-500"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-3">
                          <span
                            className={`text-[17px] font-medium tracking-[-0.01em] transition-colors duration-500 sm:text-lg ${
                              on ? "text-brand-ink" : "text-neutral-500 group-hover:text-neutral-800"
                            }`}
                          >
                            {f.title}
                          </span>
                          <span className={`font-mono text-[11px] tabular-nums ${on ? "text-brand" : "text-neutral-400"}`}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </span>
                        <AnimatePresence initial={false}>
                          {on && (
                            <motion.span
                              key="body"
                              className="block overflow-hidden"
                              initial={{ height: 0, opacity: 0, filter: "blur(6px)" }}
                              animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }}
                              exit={{ height: 0, opacity: 0, filter: "blur(6px)" }}
                              transition={{ duration: 0.5, ease: revealEase }}
                            >
                              <span className="block pt-2 text-[15px] leading-relaxed text-neutral-600">{f.description}</span>
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.div
                          key="cta"
                          className="overflow-hidden pl-[52px]"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: revealEase }}
                        >
                          <button
                            type="button"
                            onClick={() => navigate("/waitlist")}
                            className="group/cta mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-ink transition-colors hover:text-brand"
                          >
                            Learn more
                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsDashboard;
