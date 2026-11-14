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
import { ArchitectScreen, BomScreen, EcoScreen, RequirementsScreen } from "@/components/workflow/AssistantScreens";

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
    screen: ArchitectScreen,
    tips: [
      // COPY FOR APPROVAL: callouts for the live Assistant screens
      { pin: [40, 90], at: [40, 74], anchor: [0, -50], w: 30, text: "Describe what you're building, in plain words." },
      { pin: [21, 30], at: [45, 30], anchor: [0, -50], w: 30, text: "Requirements, plan, BOM and change notice come back one by one." },
      { pin: [30, 60], at: [55, 74], anchor: [0, -50], w: 30, text: "Every document lands in your workspace, ready to share." },
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
    screen: RequirementsScreen,
    tips: [
      { pin: [20, 26], at: [40, 22], anchor: [0, -50], w: 28, text: "Counts update live as each requirement lands." },
      { pin: [30, 60], at: [55, 90], anchor: [0, -50], w: 30, text: "Need to component, every branch traced in one tree." },
      { pin: [46, 62], at: [62, 90], anchor: [0, -50], w: 30, text: "Each requirement carries its review and verification status." },
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
    screen: BomScreen,
    tips: [
      { pin: [86, 26], at: [70, 40], anchor: [-50, 0], w: 28, text: "Parts, approvals and cost roll up automatically." },
      { pin: [24, 45], at: [45, 90], anchor: [0, -50], w: 30, text: "Every part with its photo, supplier, price and lead time." },
      { pin: [30, 38], at: [55, 90], anchor: [0, -50], w: 28, text: "Draft or approved, every part is versioned." },
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
    screen: EcoScreen,
    tips: [
      { pin: [20, 55], at: [55, 90], anchor: [0, -50], w: 30, text: "Every change is logged with the reason behind it." },
      { pin: [70, 30], at: [70, 90], anchor: [-50, -50], w: 30, text: "Affected subsystems, tests and approval in one notice." },
    ] as WorkflowTip[],
  },
];

function useIsDesktop() {
  const [desktop, setDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

const ScrollLifecycleSection = () => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
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
                  <div className="relative overflow-hidden rounded-[8px] border border-white/[0.1] bg-[#0c0c0d] shadow-[0_24px_60px_-34px_rgba(0,0,0,0.7)]">
                    {isDesktop === false && Math.abs(current - i) <= 1 ? (
                      <s.screen active={current === i} step={null} compact />
                    ) : (
                      <div className="aspect-[560/780] w-full" />
                    )}
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
        <WorkflowShowcase stages={stages} onCta={() => navigate("/waitlist")} live={isDesktop === true} />
      </div>

    </section>
  );
};

export default ScrollLifecycleSection;
