"use client";

// FAQ as a ruled accordion inside the page's railed frame, in the same vocabulary as Pricing
// and Industries: mono crumb, two-tone head, hairlines, numbered rows, the house blue as accent.
// Answers only restate what the site already says (hero, Get started, workflow, Pricing, Security).
import { useId, useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { useNavigate } from "@/lib/router";
import BlurReveal, { BlurWords } from "@/components/motion/BlurReveal";

const faqs: { q: string; a: string }[] = [
  {
    q: "What is OpenPlan?",
    a: "OpenPlan is the AI planning layer for hardware teams. It connects your parts, BOMs, revisions and engineering changes in one place, so every team sees what a change touches before it ships.",
  },
  {
    q: "Does OpenPlan replace our PLM or CAD tools?",
    a: "No. OpenPlan works alongside your PLM. It syncs with SolidWorks, Onshape, Autodesk Fusion 360 and PTC Creo, so design data stays current without manual uploads or version mismatches.",
  },
  {
    q: "How long does it take to get started?",
    a: "About five minutes. Bring your existing BOMs, requirements, tests and supporting files (Excel, Word, PowerPoint, CAD and PLM exports, CSV, PDF or Markdown). The import agent drafts your architecture and record mapping, and your team reviews and finalises it.",
  },
  {
    q: "What does the AI Architect do?",
    a: "Paste a PRD and the AI Architect turns it into modules, tasks, milestones and a timeline. It asks before it guesses, for things like preferred suppliers and target dates, and then keeps watching every change to flag risk before it reaches the line.",
  },
  {
    q: "How are engineering changes handled?",
    a: "Through structured ECO workflows with role-based approvals and stage gates, deviation tracking and full audit trails. You can compare revisions parameter by parameter, and every part links back to the requirement it meets.",
  },
  {
    q: "Which industries is OpenPlan built for?",
    a: "Hardware teams in consumer electronics and IoT, robotics and drones, EV and clean energy, industrial equipment, medtech and automotive. If your industry is not listed, talk to us about your platform.",
  },
  {
    q: "How much does OpenPlan cost?",
    a: "There is a free plan for up to 5 users. Pro is $24 per user per month, or $20 when billed yearly, with unlimited users, BOMs and ECOs. Enterprise is priced on an annual agreement and adds advanced access controls, custom SLAs, private deployments and data residency.",
  },
  {
    q: "How does OpenPlan keep our product data secure?",
    a: "Role-based permissions let workspace owners decide who can view records, edit them, approve milestones or change settings. We use layered security practices, service monitoring and industry-standard safeguards for sensitive data, and Enterprise plans add private deployments and data residency.",
  },
  {
    q: "Can we see OpenPlan with our own product?",
    a: "Yes. Book a demo and we will walk you through OpenPlan using your own BOMs, requirements and programme.",
  },
];

/** A hairline "+" mark sitting on a ruled corner. */
function Cross({ className }: { className: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute h-[9px] w-[9px] ${className}`}>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-black/30" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-black/30" />
    </span>
  );
}

const FAQ = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(0);
  const uid = useId();

  return (
    <section id="faq" className="relative bg-white text-brand-ink">
      {/* FAQ rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }),
        }}
      />
      <div className="relative mx-auto w-[min(1600px,calc(100%-2*clamp(12px,2.4vw,36px)))] border-x border-black/[0.08]">
        <div className="px-[clamp(20px,3vw,48px)] py-[clamp(88px,10vw,136px)]">
          <div className="grid gap-x-[clamp(32px,5vw,80px)] gap-y-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            {/* Head: sticky beside the list on desktop */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <BlurReveal>
                <p className="m-0 font-mono text-[13px] uppercase leading-none tracking-[0.1em] text-neutral-500">
                  <span className="text-brand-ink">OpenPlan</span> <span className="text-neutral-300">/</span> FAQ
                </p>
              </BlurReveal>
              <h2 className="mt-7 text-balance text-[clamp(2.2rem,4vw,3.6rem)] font-medium leading-[1.04] tracking-[-0.04em]">
                <BlurWords text="Questions," delay={0.05} />{" "}
                <span className="block text-neutral-400">
                  <BlurWords text="answered." delay={0.18} />
                </span>
              </h2>
              <BlurReveal delay={0.25}>
                <p className="mb-0 mt-6 max-w-[38ch] text-pretty text-[17px] leading-[1.55] text-neutral-600">
                  What hardware teams ask us most. Can&apos;t find yours? We&apos;re happy to help.
                </p>
              </BlurReveal>
              <BlurReveal delay={0.3}>
                <button
                  type="button"
                  onClick={() => navigate("/contact")}
                  className="group/cta mt-8 inline-flex h-12 items-center gap-3 border border-black/[0.14] px-5 font-mono text-[12px] uppercase tracking-[0.1em] text-brand-ink transition-colors duration-300 ease-out hover:border-brand-ink hover:bg-brand-ink hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  Talk to us
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
                    strokeWidth={1.75}
                  />
                </button>
              </BlurReveal>
            </div>

            {/* Questions: one ruled sheet */}
            <BlurReveal delay={0.1} y={24} blur={12}>
              <ul className="relative m-0 list-none border-t border-black/[0.1] p-0">
                <Cross className="-left-[5px] -top-[5px]" />
                <Cross className="-right-[5px] -top-[5px]" />
                {faqs.map((f, i) => {
                  const on = open === i;
                  const panel = `${uid}-a${i}`;
                  const button = `${uid}-q${i}`;
                  return (
                    <li key={f.q} className="group relative border-b border-black/[0.1]">
                      {/* blue rule that draws in on the open row and on hover */}
                      <span
                        aria-hidden
                        className={`pointer-events-none absolute inset-x-0 top-[-1px] h-[2px] origin-left bg-brand transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          on ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                      <h3 className="m-0">
                        <button
                          id={button}
                          type="button"
                          aria-expanded={on}
                          aria-controls={panel}
                          onClick={() => setOpen(on ? -1 : i)}
                          className="flex w-full items-start gap-4 py-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40 sm:gap-6 sm:py-7"
                        >
                          <span className={`mt-[7px] font-mono text-[11.5px] tracking-[0.1em] transition-colors duration-300 ${on ? "text-brand" : "text-neutral-400"}`}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="flex-1 text-[clamp(1.1rem,1.5vw,1.35rem)] font-medium leading-[1.3] tracking-[-0.02em]">{f.q}</span>
                          <span
                            aria-hidden
                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border transition-[background-color,border-color,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                              on ? "border-brand bg-brand text-white" : "border-black/[0.12] text-brand-ink group-hover:border-brand-ink"
                            }`}
                          >
                            <Plus
                              className={`h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${on ? "rotate-45" : ""}`}
                              strokeWidth={1.75}
                            />
                          </span>
                        </button>
                      </h3>
                      <div
                        id={panel}
                        role="region"
                        aria-labelledby={button}
                        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden" inert={!on}>
                          {/* an invisible number keeps the answer lined up with the question text */}
                          <div className="flex gap-4 pb-7 sm:gap-6">
                            <span aria-hidden className="invisible font-mono text-[11.5px] tracking-[0.1em]">00</span>
                            <p className="m-0 max-w-[62ch] flex-1 text-[15.5px] leading-[1.65] text-neutral-600 sm:pr-14">{f.a}</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </BlurReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
