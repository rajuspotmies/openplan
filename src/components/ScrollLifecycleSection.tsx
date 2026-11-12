import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, ListChecks, GitBranch, ArrowUpRight, Brain } from "lucide-react";

const feature1 = "/assets/featureImages/F1.png";
const feature2 = "/assets/featureImages/F2.png";
const fai = "/assets/featureImages/kk.png";
const requirementsImg = "/assets/featureImages/requirements.png";
import { useNavigate } from "@/lib/router";
import BlurReveal, { BlurWords, revealEase } from "@/components/motion/BlurReveal";
import WorkflowShowcase, { type WorkflowTip } from "@/components/WorkflowShowcase";

const stages = [
  {
    id: "ai-autonomous-planning",
    shortLabel: "AI Architect",
    title: "AI Product Architecture",
    icon: Brain,
    description:
      "Turn a raw PRD into modules, tasks and a timeline, instantly.",
    bullets: [
      "Instant PRD-to-Module mapping and analysis.",
      "AI-led interactive spec conflict resolution.",
      "One-click timeline and dependency generation.",
    ],
    cta: "Explore AI-native planning",
    image: fai, // Using an existing feature image as a placeholder
    tips: [
      { pin: [24.5, 15], at: [52, 10.5], anchor: [0, -50], w: 30, text: "Paste a PRD. Scope, team and certifications, in plain words." },
      { pin: [34.5, 41], at: [52, 52], anchor: [0, -50], w: 30, text: "It asks before it guesses: preferred suppliers, target timeline." },
      { pin: [44, 84], at: [56, 84], anchor: [0, -50], w: 30, text: "Modules, tasks, milestones and a 30-week plan come back." },
    ] as WorkflowTip[],
  },
  {
    id: "requirements",
    shortLabel: "Requirements",
    title: "Requirements",
    icon: ListChecks,
    description:
      "Five tiers, need to component, with coverage tracked live.",
    bullets: [
      "5-tier decomposition: Need → Stakeholder → System → Subsystem → Component",
      "Live coverage tracking surfaces gaps automatically",
      "Single source of truth for engineering, QA and program management",
    ],
    cta: "Explore requirements traceability",
    image: requirementsImg,
    tips: [
      { pin: [11, 23.5], at: [11, 31], anchor: [-8, 0], w: 28, text: "Verification coverage, tracked live across the project." },
      { pin: [13.5, 46.5], at: [26, 52], anchor: [0, -50], w: 32, text: "Five tiers: need → stakeholder → system → subsystem → component." },
      { pin: [82.5, 42], at: [82.5, 53], anchor: [-60, 0], w: 28, text: "Every requirement carries its verification status." },
    ] as WorkflowTip[],
  },
  {
    id: "bom-management",
    shortLabel: "BOM Management",
    title: "BOM Management",
    icon: ClipboardList,
    description:
      "Multi-level BOMs, every revision kept, every part traced.",
    bullets: [
      "Multi-level BOM structures with full revision history",
      "Requirement-to-component traceability",
      "Version control for every part-level change",
    ],
    cta: "Explore BOM workflows",
    image: feature1,
    tips: [
      { pin: [81, 22], at: [81, 33], anchor: [-55, 0], w: 26, text: "Cost rolls up across the whole assembly." },
      { pin: [8.5, 47], at: [14, 60], anchor: [0, 0], w: 30, text: "Multi-level structure. Every revision is kept." },
      { pin: [81.5, 47.5], at: [74, 62], anchor: [-40, 0], w: 30, text: "Each part links back to the requirement it meets." },
    ] as WorkflowTip[],
  },
  {
    id: "engineering-change-management",
    shortLabel: "Engineering Change",
    title: "Engineering Change Management",
    icon: GitBranch,
    description:
      "Role-based approvals and audit trails. No chasing sign-offs.",
    bullets: [
      "Role-based ECO approvals and stage gates",
      "Deviation tracking with decision history",
      "Audit trails for regulatory and internal reviews",
    ],
    cta: "Explore ECO workflows",
    image: feature2,
    tips: [
      { pin: [70, 31], at: [70, 45], anchor: [-50, 0], w: 30, text: "Approvals move stage by stage. Here, QA signs off next." },
      { pin: [41, 61], at: [41, 74], anchor: [-50, 0], w: 30, text: "Rev A against Rev B, parameter by parameter." },
    ] as WorkflowTip[],
  },
];

const ScrollLifecycleSection = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const stageRefs = useRef<Array<HTMLElement | null>>([]);

  /* ── Mobile: scroll-spy — the stage crossing the upper third of the screen is current ── */
  useEffect(() => {
    const els = stageRefs.current.filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setCurrent(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-30% 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const jumpTo = (i: number) => {
    const el = stageRefs.current[i];
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" });
  };

  return (
    <section id="workflow-section" className="surface-dark relative bg-[#0A0A0B] text-brand-ink">

      {/* =====================  MOBILE: stages stacked, revealed as you scroll  ===================== */}
      <div className="lg:hidden">
        {/* Sticky progress: current stage and a segment per stage */}
        <div className="sticky top-[64px] z-30 border-b border-black/[0.06] bg-white/90 px-4 pb-3 pt-3 backdrop-blur-xl">
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em]">
            <span className="text-neutral-400">
              <span className="text-brand">{String(current + 1).padStart(2, "0")}</span> / {String(stages.length).padStart(2, "0")}
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={current}
                className="text-brand-ink"
                initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: revealEase }}
              >
                {stages[current].shortLabel}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="mt-2.5 grid grid-cols-4 gap-1">
            {stages.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => jumpTo(i)}
                aria-label={`Go to ${s.shortLabel}`}
                className="h-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <span
                  className={`block h-[2px] w-full transition-colors duration-500 ease-out ${i <= current ? "bg-brand" : "bg-black/10"}`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-black/[0.06]">
          {stages.map((s, i) => {
            const Icon = s.icon;
            return (
              <article
                key={s.id}
                ref={(el) => {
                  stageRefs.current[i] = el;
                }}
                data-index={i}
                className="space-y-6 px-4 pb-14 pt-12"
              >
                <BlurReveal y={14} blur={10}>
                  <div className="flex items-center gap-3 text-neutral-700">
                    <span className="inline-flex h-9 w-9 items-center justify-center border border-black/10 bg-black/[0.03] text-brand">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-mono text-[12px] uppercase tracking-[0.18em]">
                      <span className="text-neutral-400">{String(i + 1).padStart(2, "0")}</span> {s.shortLabel}
                    </span>
                  </div>
                </BlurReveal>

                <h3 className="text-[1.65rem] font-medium leading-[1.15] tracking-[-0.03em] text-brand-ink">
                  <BlurWords text={s.title} />
                </h3>

                <BlurReveal y={24} blur={14} delay={0.05}>
                  <div className="relative overflow-hidden border border-black/[0.08] bg-white shadow-[0_24px_60px_-34px_rgba(10,10,11,0.35)]">
                    <img src={s.image} alt={s.title} loading="lazy" className="relative h-auto w-full object-contain" />
                  </div>
                </BlurReveal>

                <BlurReveal y={14} blur={10} delay={0.05}>
                  <p className="text-[15px] leading-relaxed text-neutral-600">{s.description}</p>
                </BlurReveal>

                <ul className="space-y-2.5 text-[15px] text-neutral-700">
                  {s.bullets.map((point, k) => (
                    <li key={point}>
                      <BlurReveal y={10} blur={8} delay={0.06 * k}>
                        <span className="flex items-start gap-3">
                          <span className="mt-[9px] h-[5px] w-[5px] flex-shrink-0 bg-brand" />
                          <span>{point}</span>
                        </span>
                      </BlurReveal>
                    </li>
                  ))}
                </ul>

                <BlurReveal y={10} blur={8}>
                  <button
                    type="button"
                    onClick={() => navigate("/waitlist")}
                    className="group inline-flex h-11 items-center gap-3 border border-black/15 px-5 font-mono text-[11.5px] uppercase tracking-[0.1em] text-brand-ink transition-colors duration-300 ease-out hover:border-brand-ink hover:bg-brand-ink hover:text-white"
                  >
                    {s.cta}
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </button>
                </BlurReveal>
              </article>
            );
          })}
        </div>
      </div>

      {/* =====================  DESKTOP: sticky product screen with stage tabs  ===================== */}
      <div className="hidden lg:block">
        <WorkflowShowcase stages={stages} onCta={() => navigate("/waitlist")} />
      </div>

    </section>
  );
};

export default ScrollLifecycleSection;
