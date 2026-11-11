import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ClipboardList, ListChecks, GitBranch, Milestone, Cable, ArrowUpRight, ChevronLeft, ChevronRight, Brain } from "lucide-react";

const feature1 = "/assets/featureImages/F1.png";
const feature2 = "/assets/featureImages/F2.png";
const feature4 = "/assets/featureImages/F4.png";
const F7 = "/assets/featureImages/F7.png";
const fai = "/assets/featureImages/kk.png";
const requirementsImg = "/assets/featureImages/requirements.png";
import { useNavigate } from "@/lib/router";
import GradientReveal from "@/components/motion/GradientReveal";
import WorkflowShowcase, { type WorkflowTip } from "@/components/WorkflowShowcase";

const stages = [
  {
    id: "ai-autonomous-planning",
    shortLabel: "AI Architect",
    title: "AI Product Architecture",
    icon: Brain,
    description:
      "Transform raw PRDs into fully structured projects instantly. Our AI analyzes requirements, resolves ambiguities, and auto-generates your module hierarchies and timelines.",
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
      "From stakeholder need to verified component — nothing gets lost. Requirements flow through five tiers of decomposition with coverage and readiness tracked live.",
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
      "Capture product requirements, manage multi-level BOMs, and maintain full traceability from spec to certification. Every change is versioned. Nothing gets lost in email.",
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
      "Structured ECO workflows with role-based approvals, deviation tracking, and audit trails. No more chasing sign-offs on Slack.",
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
  {
    id: "program-milestone-and-gate-reviews",
    shortLabel: "Milestones & Gates",
    title: "Program Milestone & Gate Reviews",
    icon: Milestone,
    description:
      "Define phase gates, assign owners, and track every milestone across workstreams in real time. PDR, CDR, MRR - all structured, all visible.",
    bullets: [
      "Phase gate templates for hardware lifecycles",
      "Owner-level milestone accountability",
      "Cross-team visibility for PDR/CDR/MRR readiness",
    ],
    cta: "Explore milestone reviews",
    image: feature4,
    tips: [
      { pin: [30, 18.7], at: [30, 29], anchor: [-40, 0], w: 30, text: "Current phase, days to the next gate and open issues at a glance." },
      { pin: [61.3, 52], at: [61.3, 63], anchor: [-50, 0], w: 30, text: "Every gate review on one program timeline." },
    ] as WorkflowTip[],
  },
  {
    id: "cad-and-plm-tools",
    shortLabel: "CAD & PLM",
    title: "CAD & PLM Tools",
    icon: Cable,
    description:
      "Sync directly with SolidWorks, Onshape, Autodesk Fusion 360, and PTC Creo. Design data stays current without manual uploads or version mismatches.",
    bullets: [
      "Direct sync across major CAD platforms",
      "PLM alignment with current design revisions",
      "No manual uploads or version drift",
    ],
    cta: "Explore CAD/PLM integrations",
    image: F7,
    tips: [
      { pin: [18.5, 32.5], at: [21, 46], anchor: [0, 0], w: 28, text: "Each CAD and PLM tool shows its connection status." },
      { pin: [92, 85], at: [88, 72], anchor: [-100, -50], w: 30, text: "A file out of step is flagged, never silently overwritten." },
    ] as WorkflowTip[],
  },
];

/** Smooth expo-out curve — reads “premium” without bounce */
const EASE_PREMIUM: [number, number, number, number] = [0.22, 1, 0.36, 1];

const ScrollLifecycleSection = () => {
  const prefersReducedMotion = useReducedMotion();
  /* ── Shared state ── */

  /* ── Desktop-specific state ── */

  /* ── Mobile-specific state ── */
  const [mobileIndex, setMobileIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 = prev, 1 = next

  /* ── Refs ── */
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const tocWrapperRef = useRef<HTMLDivElement | null>(null);
  const mobileTocLinkRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const navigate = useNavigate();

  /* ── Touch / swipe refs ── */
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);

  /* ── Mobile: auto-scroll the TOC strip to keep active tab visible ── */
  useEffect(() => {
    const wrapper = tocWrapperRef.current;
    const btn = mobileTocLinkRefs.current[mobileIndex];
    if (!wrapper || !btn) return;
    wrapper.scrollTo({
      left: Math.max(0, btn.offsetLeft - wrapper.offsetWidth / 2 + btn.offsetWidth / 2),
      behavior: "smooth",
    });
  }, [mobileIndex]);

  /* ── Mobile: navigate to a specific panel ── */
  const goTo = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= stages.length) return;
      setDirection(idx > mobileIndex ? 1 : -1);
      setMobileIndex(idx);
    },
    [mobileIndex]
  );

  const goPrev = () => goTo(mobileIndex - 1);
  const goNext = () => goTo(mobileIndex + 1);

  /* ── Mobile: swipe gesture handlers ── */
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only register as horizontal swipe if it's clearly horizontal
    if (Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 40) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  /* ── Framer Motion slide variants ── */
  /** Softer carousel motion so the screenshot crossfade stays the hero moment */
  const slideVariants = {
    enter: (d: number) => ({
      x: prefersReducedMotion ? 0 : d > 0 ? "22%" : "-22%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (d: number) => ({
      x: prefersReducedMotion ? 0 : d > 0 ? "-14%" : "14%",
      opacity: 0,
    }),
  };

  const stage = stages[mobileIndex];
  const MobileIcon = stage.icon;

  return (
    <section id="workflow-section" ref={sectionRef} className="relative bg-white text-brand-ink">

      {/* =====================  MOBILE EXPERIENCE  ===================== */}
      <div className="lg:hidden flex flex-col bg-white">

        {/* ── Sticky horizontal TOC tab strip ── */}
        <div
          ref={tocWrapperRef}
          className="sticky top-[64px] z-30 no-scrollbar overflow-x-auto bg-white/85 backdrop-blur-xl border-b border-black/[0.06]"
        >
          <div className="inline-flex items-end gap-0 min-w-max">
            {stages.map((s, idx) => {
              const TabIcon = s.icon;
              const isActive = idx === mobileIndex;
              return (
                <button
                  key={`mob-tab-${s.id}`}
                  ref={(el) => { mobileTocLinkRefs.current[idx] = el; }}
                  onClick={() => goTo(idx)}
                  className={`relative flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap transition-all duration-300 focus:outline-none ${
                    isActive
                      ? "text-brand-ink font-medium"
                      : "text-neutral-400 hover:text-neutral-600"
                  }`}
                >
                  <TabIcon className={`h-3.5 w-3.5 flex-shrink-0 transition-all duration-300 ${isActive ? "opacity-100" : "opacity-50"}`} />
                  <span>{s.shortLabel}</span>

                  {/* Active underline */}
                  {isActive && (
                    <motion.span
                      layoutId="mob-tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Animated panel body ── */}
        <div
          className="relative overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={mobileIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: prefersReducedMotion ? 0 : 0.36,
                ease: EASE_PREMIUM,
              }}
              className="px-4 pt-8 pb-6 space-y-6"
            >
              {/* ── Badge row ── */}
              <div className="inline-flex items-center gap-2.5 text-neutral-700">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 bg-black/[0.03] text-brand">
                  <MobileIcon className="h-4 w-4" />
                </span>
                <span className="font-mono text-[12px] uppercase tracking-[0.18em]">{stage.shortLabel}</span>
              </div>

              {/* ── Title ── */}
              <GradientReveal
                key={`m-title-${mobileIndex}`}
                as="h3"
                text={stage.title}
                className="text-2xl font-medium leading-[1.2] tracking-[-0.02em] text-brand-ink"
              />

              {/* ── Feature image (crossfade + lift — carousel slide stays softer) ── */}
              <div className="relative overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_24px_60px_-34px_rgba(10,10,11,0.35)]">
                <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_top_right,rgba(47,91,255,0.14),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(124,155,255,0.12),transparent_55%)] blur-2xl pointer-events-none" />
                <motion.div
                  key={`mobile-shot-${mobileIndex}`}
                  initial={
                    prefersReducedMotion
                      ? { opacity: 1, scale: 1, y: 0 }
                      : { opacity: 0, scale: 0.985, y: 14 }
                  }
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.52,
                    ease: EASE_PREMIUM,
                    delay: prefersReducedMotion ? 0 : 0.05,
                  }}
                  className="relative origin-center will-change-transform"
                >
                  <img
                    src={stage.image}
                    alt={stage.title}
                    className="relative w-full h-auto rounded-xl object-contain"
                  />
                </motion.div>
              </div>

              {/* ── Description ── */}
              <GradientReveal
                key={`m-desc-${mobileIndex}`}
                as="p"
                text={stage.description}
                className="text-[15px] leading-relaxed text-neutral-600"
              />

              {/* ── Bullets ── */}
              <ul className="space-y-2.5 text-neutral-700 text-[15px]">
                {stage.bullets.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-[9px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-brand" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              {/* ── CTA ── */}
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-black/15 text-sm text-brand-ink hover:border-black/30 hover:bg-black/[0.03] transition-all duration-300">
                {stage.cta}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Bottom navigation bar: prev / progress pills / next ── */}
        <div className="flex items-center justify-between px-4 pb-8 pt-0 gap-4">
          {/* Prev button */}
          <button
            onClick={goPrev}
            disabled={mobileIndex === 0}
            className="flex items-center justify-center h-9 w-9 rounded-full border border-black/15 text-brand-ink disabled:opacity-25 disabled:cursor-not-allowed hover:bg-black/[0.04] transition-all duration-200"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Progress pills */}
          <div className="flex items-center gap-2">
            {stages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                aria-label={`Go to ${stages[idx].shortLabel}`}
                className="relative h-[5px] rounded-full overflow-hidden bg-black/10 transition-all duration-300"
                style={{ width: idx === mobileIndex ? 28 : 12 }}
              >
                {idx === mobileIndex && (
                  <motion.span
                    layoutId="pill-fill"
                    className="absolute inset-0 bg-brand rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={goNext}
            disabled={mobileIndex === stages.length - 1}
            className="flex items-center justify-center h-9 w-9 rounded-full border border-black/15 text-brand-ink disabled:opacity-25 disabled:cursor-not-allowed hover:bg-black/[0.04] transition-all duration-200"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
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
