"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import BlurReveal, { BlurWords, revealEase } from "@/components/motion/BlurReveal";
import BenchFigure from "@/components/figures/bench/BenchFigure";

// Each feature has its own bench object in the figure.
const features = [
  {
    title: "Project Management",
    description: "Kanban boards, Gantt charts and milestone tracking built for hardware development cycles.",
  },
  {
    title: "Bill of Materials",
    description: "Create, organise and version complete BOMs with part-level details, quantities and suppliers.",
  },
  {
    title: "Version Control",
    description: "Track design revisions, manage CAD files and keep a full audit trail for every iteration.",
  },
  {
    title: "Document Storage",
    description: "One home for specifications, test results, compliance documents and technical drawings.",
  },
  {
    title: "Workflow Tracking",
    description: "Design reviews, test protocols and approvals that move through stages you define.",
  },
  {
    title: "Lifecycle Management",
    description: "Take product data from concept to release with revision control, approvals and visibility.",
  },
  {
    title: "ISO Standards",
    description: "Compliance templates and automated reporting for ISO 9001, ISO 13485 and more.",
  },
  {
    title: "Team Collaboration",
    description: "Comments, notifications and live updates that keep every discipline in sync.",
  },
];

const TOUR_MS = 3600;
const PIN_MS = 9000;

const Features = () => {
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const pinnedUntil = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.35 });
  const reduce = useReducedMotion();
  const figureRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [compact, setCompact] = useState(false);

  // Phones and tablets: the figure pins under the nav and scrolling the list picks the object.
  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const sync = () => setCompact(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!compact) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const fig = figureRef.current;
      if (!fig) return;
      const line = fig.getBoundingClientRect().bottom + 28;
      let next = 0;
      itemRefs.current.forEach((li, i) => {
        if (li && li.getBoundingClientRect().top <= line) next = i;
      });
      setActive((a) => (a === next ? a : next));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [compact]);

  // Idle tour (desktop): walk through the objects while the section is on screen and nobody is choosing.
  useEffect(() => {
    if (compact || !inView || hovering || reduce) return;
    const id = window.setInterval(() => {
      if (Date.now() < pinnedUntil.current) return;
      setActive((a) => (a + 1) % features.length);
    }, TOUR_MS);
    return () => window.clearInterval(id);
  }, [compact, inView, hovering, reduce]);

  const pick = useCallback(
    (i: number) => {
      if (compact) {
        // bring the tapped item up to the reading line under the pinned figure
        const li = itemRefs.current[i];
        const fig = figureRef.current;
        if (li && fig) {
          // where the figure's bottom sits once pinned (top-16 = 64px), not where it is now
          const line = 64 + fig.offsetHeight + 20;
          window.scrollTo({ top: li.getBoundingClientRect().top + window.scrollY - line, behavior: reduce ? "auto" : "smooth" });
        }
        return;
      }
      pinnedUntil.current = Date.now() + PIN_MS;
      setActive(i);
    },
    [compact, reduce],
  );

  return (
    <section id="features" ref={sectionRef} className="relative overflow-x-clip bg-white py-24 text-brand-ink md:py-32">
      <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
        {/* Header */}
        <div className="mx-auto max-w-[760px] text-center">
          <BlurReveal>
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-neutral-400">the platform</p>
          </BlurReveal>
          <h2 className="mt-5 text-balance text-4xl font-medium leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-[3.6rem]">
            <BlurWords text="Everything you need in" delay={0.05} />{" "}
            <BlurWords text="one platform" delay={0.3} className="text-brand" />
          </h2>
          <BlurReveal delay={0.35}>
            <p className="mx-auto mt-6 max-w-[580px] text-pretty text-[17px] leading-relaxed text-neutral-600">
              Eight tools, one bench. Stop juggling platforms: everything your hardware team reaches
              for lives in the same place.
            </p>
          </BlurReveal>
        </div>

        <div className="mt-16 grid items-start gap-10 md:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-14">
          {/* Figure */}
          <div
            ref={figureRef}
            className="sticky top-16 z-20 -mx-6 border-b border-black/[0.06] bg-white/95 px-6 backdrop-blur-sm sm:-mx-8 sm:px-8 lg:order-2 lg:top-28 lg:z-auto lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none"
          >
            <BlurReveal y={28} blur={18} className="mx-auto max-w-[460px] lg:max-w-none">
              <BenchFigure active={active} />
            </BlurReveal>
          </div>

          {/* Feature list: hover or focus opens the drawer, click pins it */}
          <ol className="divide-y divide-black/[0.07] border-y border-black/[0.07] lg:order-1" onPointerLeave={() => setHovering(false)}>
            {features.map((f, i) => {
              const on = i === active;
              return (
                <li
                  key={f.title}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                >
                  <BlurReveal delay={0.04 * i} y={12} blur={10}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onPointerEnter={(e) => {
                        if (compact || e.pointerType !== "mouse") return;
                        setHovering(true);
                        setActive(i);
                      }}
                      onFocus={() => {
                        if (!compact) setActive(i);
                      }}
                      onClick={() => pick(i)}
                      className="group flex w-full items-start gap-4 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 sm:gap-5 sm:py-5"
                    >
                      <span
                        className={`mt-1 w-7 shrink-0 font-mono text-[12px] tabular-nums transition-colors duration-500 ${
                          on ? "text-brand" : "text-neutral-400"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-[17px] font-medium tracking-[-0.01em] transition-colors duration-500 sm:text-lg ${
                            on ? "text-brand-ink" : "text-neutral-500 group-hover:text-neutral-800"
                          }`}
                        >
                          {f.title}
                        </span>
                        {compact ? (
                          <span
                            className={`block pt-2 text-[15px] leading-relaxed transition-colors duration-500 ${
                              on ? "text-neutral-600" : "text-neutral-400"
                            }`}
                          >
                            {f.description}
                          </span>
                        ) : null}
                        <AnimatePresence initial={false}>
                          {!compact && on && (
                            <motion.span
                              key="desc"
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
                      <span
                        aria-hidden
                        className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-500 ${
                          on ? "scale-100 bg-brand" : "scale-75 bg-neutral-300"
                        }`}
                      />
                    </button>
                  </BlurReveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default Features;
