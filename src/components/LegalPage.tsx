"use client";

// Shared layout for Privacy, Security and Terms, in the landing page's language:
// page black, railed 1600px frame, mono eyebrow with end-ticked rule, tight display
// title, numbered sections on hairline rules and a square "notes" plate.
import { useEffect, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "@/lib/router";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BlurReveal, { BlurWords } from "@/components/motion/BlurReveal";

const FRAME = "mx-auto w-[min(1600px,calc(100%-2*clamp(12px,2.4vw,36px)))] border-x border-white/[0.08] px-[clamp(16px,4vw,72px)]";

export function LegalSection({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <BlurReveal y={12} blur={8}>
      <section className="grid gap-3 border-t border-white/[0.1] pt-5 md:grid-cols-[minmax(220px,0.36fr)_minmax(0,1fr)] md:gap-10">
        <div>
          <span className="font-mono text-[13px] tracking-[0.04em] text-[#3d6bff]">{String(n).padStart(2, "0")}</span>
          <h2 className="m-0 mt-2 text-[22px] font-normal leading-[1.2] tracking-[-0.025em] text-white sm:text-[24px]">{title}</h2>
        </div>
        <div className="space-y-4 text-[15px] leading-[1.7] text-white/60 sm:text-[16px] [&_a]:text-white/85 [&_a]:underline [&_a]:decoration-white/30 [&_a]:underline-offset-4 hover:[&_a]:text-white">
          {children}
        </div>
      </section>
    </BlurReveal>
  );
}

export function LegalNotes({ title, items }: { title: string; items: ReactNode[] }) {
  return (
    <BlurReveal y={12} blur={8}>
      <div className="border border-white/[0.1] bg-white/[0.02]">
        <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-5 py-3.5 font-mono text-[12px] uppercase tracking-[0.12em] text-white/70">
          <span aria-hidden className="h-[7px] w-[7px] bg-[#3d6bff]" />
          {title}
        </div>
        <ul className="m-0 list-none divide-y divide-white/[0.06] p-0">
          {items.map((item, i) => (
            <li key={i} className="flex gap-4 px-5 py-4 text-[15px] leading-[1.6] text-white/65 sm:text-[16px]">
              <span className="mt-[3px] shrink-0 font-mono text-[12px] text-white/35">{String(i + 1).padStart(2, "0")}</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </BlurReveal>
  );
}

export default function LegalPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: ReactNode[]; children: ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) navigate(-1);
    else navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <Navigation />
      <main className={`${FRAME} pb-24 pt-28 md:pb-32 md:pt-36`}>
        <button
          type="button"
          onClick={handleBack}
          className="mb-10 inline-flex items-center gap-2 border border-white/[0.12] px-3.5 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-white/70 transition-colors hover:border-white/30 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back
        </button>

        <BlurReveal y={10} blur={8}>
          <div className="mb-4 flex items-center gap-3 font-mono text-[14px] uppercase tracking-[0.04em] text-white/60">
            <span className="flex-none">{eyebrow}</span>
            <span aria-hidden className="relative h-px min-w-5 flex-1 bg-white/[0.12]">
              <span className="absolute -top-[3px] left-0 h-[7px] w-px bg-white/[0.12]" />
              <span className="absolute -top-[3px] right-0 h-[7px] w-px bg-white/[0.12]" />
            </span>
          </div>
        </BlurReveal>
        <h1 className="m-0 text-balance text-4xl font-medium leading-[1.05] tracking-[-0.045em] sm:text-5xl md:text-6xl">
          <BlurWords text={title} />
        </h1>
        <BlurReveal delay={0.2}>
          <div className="mt-6 max-w-[920px] space-y-4 text-pretty text-[16px] leading-relaxed text-white/60 sm:text-[17px]">
            {intro.map((p, i) => (
              <p key={i} className="m-0">
                {p}
              </p>
            ))}
          </div>
        </BlurReveal>

        <div className="mt-16 space-y-12 md:mt-20 md:space-y-14">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
