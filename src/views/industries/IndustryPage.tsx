"use client";

// One industry page in the house vocabulary: railed frame, mono breadcrumbs, two-tone heads,
// ruled sheets with "+" marks, the blue rule that draws in on hover, an anatomy figure in the
// hero and a hairline figure on every capability.
import { useEffect, type ComponentType } from "react";
import { ArrowUpRight } from "lucide-react";
import * as Hairline from "@lucasmarkes/hairline/react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BlurReveal, { BlurWords } from "@/components/motion/BlurReveal";
import IndustryFigure from "@/components/figures/industry/IndustryFigure";
import type { IndustryKey } from "@/components/figures/industry/scenes";
import { useNavigate } from "@/lib/router";

export type HairlineName = Exclude<keyof typeof Hairline, "default">;

export interface IndustryConfig {
  crumb: string;
  badge: string;
  title: [string, string];
  lede: string;
  figure: { key: IndustryKey; title: string };
  stats: { value: string; label: string }[];
  challenges: { title: [string, string]; lede: string; items: { title: string; description: string; stat: string; statLabel: string }[] };
  capabilities: { title: [string, string]; lede: string; items: { title: string; description: string; figure: HairlineName; caption: string }[] };
  programs: { title: [string, string]; lede: string; items: { title: string; description: string; metrics: { value: string; label: string }[] }[] };
  cta: { title: [string, string]; lede: string };
}

const FRAME = "relative mx-auto w-[min(1600px,calc(100%-2*clamp(12px,2.4vw,36px)))] border-x";
const PAD = "px-[clamp(20px,3vw,48px)]";
const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

/** A hairline "+" mark sitting on a ruled corner. */
function Cross({ className, dark = false }: { className: string; dark?: boolean }) {
  const c = dark ? "bg-white/35" : "bg-black/30";
  return (
    <span aria-hidden className={`pointer-events-none absolute z-[1] h-[9px] w-[9px] ${className}`}>
      <span className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 ${c}`} />
      <span className={`absolute left-0 top-1/2 h-px w-full -translate-y-1/2 ${c}`} />
    </span>
  );
}

function Crumb({ trail, dark = false }: { trail: string[]; dark?: boolean }) {
  return (
    <p className={`m-0 font-mono text-[12px] uppercase leading-none tracking-[0.1em] sm:text-[13px] ${dark ? "text-white/45" : "text-neutral-500"}`}>
      <span className={dark ? "text-white" : "text-brand-ink"}>OpenPlan</span>
      {trail.map((t) => (
        <span key={t}>
          {" "}
          <span className={dark ? "text-white/25" : "text-neutral-300"}>/</span> {t}
        </span>
      ))}
    </p>
  );
}

function Head({ trail, title, lede, dark = false }: { trail: string[]; title: [string, string]; lede: string; dark?: boolean }) {
  return (
    <div className="grid items-end gap-x-[clamp(32px,5vw,80px)] gap-y-7 lg:grid-cols-2">
      <div>
        <BlurReveal>
          <Crumb trail={trail} dark={dark} />
        </BlurReveal>
        <h2 className="mt-7 text-balance text-[clamp(2rem,4vw,3.6rem)] font-medium leading-[1.04] tracking-[-0.04em]">
          <BlurWords text={title[0]} delay={0.05} />{" "}
          <span className={`block ${dark ? "text-white/40" : "text-neutral-400"}`}>
            <BlurWords text={title[1]} delay={0.18} />
          </span>
        </h2>
      </div>
      <BlurReveal delay={0.25} className="lg:justify-self-end">
        <p className={`m-0 max-w-[42ch] text-pretty text-[16px] leading-[1.6] sm:text-[17px] ${dark ? "text-white/60" : "text-neutral-600"}`}>{lede}</p>
      </BlurReveal>
    </div>
  );
}

function HoverRule() {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 top-[-1px] z-[1] h-[2px] origin-left scale-x-0 bg-brand transition-transform duration-500 ${EASE} group-hover:scale-x-100`}
    />
  );
}

function CtaButton({ children, onClick, solid = false, dark = false }: { children: string; onClick: () => void; solid?: boolean; dark?: boolean }) {
  const look = solid
    ? "bg-brand text-white hover:bg-brand-hover"
    : dark
      ? "border border-white/[0.18] text-white hover:border-white hover:bg-white hover:text-brand-ink"
      : "border border-black/[0.14] bg-white text-brand-ink hover:border-brand-ink hover:bg-brand-ink hover:text-white";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group/cta inline-flex h-12 w-full items-center justify-between gap-6 px-5 font-mono text-[12px] uppercase tracking-[0.1em] transition-[background-color,border-color,color] duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 sm:w-auto sm:min-w-[220px] ${look}`}
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" strokeWidth={1.75} />
    </button>
  );
}

const pad2 = (i: number) => String(i + 1).padStart(2, "0");

export default function IndustryPage({ c }: { c: IndustryConfig }) {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const capCols = c.capabilities.items.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";
  const chCols = c.challenges.items.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";

  return (
    <div className="flex min-h-screen flex-col bg-white text-brand-ink">
      <Navigation />
      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative bg-white">
          <div className={`${FRAME} border-black/[0.08]`}>
            <div className={`${PAD} pb-[clamp(56px,7vw,96px)] pt-[clamp(104px,11vw,148px)]`}>
              <div className="grid items-center gap-x-[clamp(32px,4vw,72px)] gap-y-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                <div className="min-w-0">
                  <BlurReveal>
                    <Crumb trail={["Industries", c.crumb]} />
                  </BlurReveal>
                  <BlurReveal delay={0.08}>
                    <span className="mt-8 inline-flex items-center gap-2 border border-black/[0.1] px-3 py-2 font-mono text-[11px] uppercase leading-none tracking-[0.1em] text-neutral-600">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" />
                      {c.badge}
                    </span>
                  </BlurReveal>
                  <h1 className="mt-6 text-balance text-[clamp(2.4rem,5.4vw,4.6rem)] font-medium leading-[1.0] tracking-[-0.045em]">
                    <BlurWords text={c.title[0]} delay={0.1} />{" "}
                    <span className="block text-neutral-400">
                      <BlurWords text={c.title[1]} delay={0.24} />
                    </span>
                  </h1>
                  <BlurReveal delay={0.3}>
                    <p className="mt-7 max-w-[46ch] text-pretty text-[16px] leading-[1.6] text-neutral-600 sm:text-[18px]">{c.lede}</p>
                  </BlurReveal>
                  <BlurReveal delay={0.38}>
                    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                      <CtaButton solid onClick={() => navigate("/waitlist")}>
                        Join the waitlist
                      </CtaButton>
                      <CtaButton onClick={() => navigate("/contact")}>Talk to us</CtaButton>
                    </div>
                  </BlurReveal>
                </div>
                <BlurReveal delay={0.2} y={24} blur={12} className="min-w-0">
                  <div className="relative">
                    <Cross className="-left-[5px] -top-[5px]" />
                    <Cross className="-right-[5px] -top-[5px]" />
                    <Cross className="-bottom-[5px] -left-[5px]" />
                    <Cross className="-bottom-[5px] -right-[5px]" />
                    <IndustryFigure industry={c.figure.key} title={c.figure.title} />
                  </div>
                </BlurReveal>
              </div>

              {/* stats sheet */}
              <BlurReveal delay={0.1} y={20} blur={10}>
                <dl className="relative m-0 mt-[clamp(56px,7vw,96px)] grid grid-cols-2 border-t border-black/[0.1] lg:grid-cols-4">
                  <Cross className="-left-[5px] -top-[5px]" />
                  <Cross className="-right-[5px] -top-[5px]" />
                  {c.stats.map((s, i) => (
                    <div
                      key={s.label}
                      className={`group relative border-b border-black/[0.1] px-[clamp(16px,2.4vw,36px)] py-7 sm:py-9 ${i % 2 === 1 ? "border-l" : ""} ${i > 0 ? "lg:border-l" : ""}`}
                    >
                      <HoverRule />
                      <dt className="font-mono text-[10.5px] uppercase leading-[1.4] tracking-[0.1em] text-neutral-500 sm:text-[11.5px]">{s.label}</dt>
                      <dd className="m-0 mt-4 text-[clamp(2rem,3.6vw,3.2rem)] font-medium leading-none tracking-[-0.04em]">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </BlurReveal>
            </div>
          </div>
        </section>

        {/* ── Challenges (dark) ───────────────────────────────────────────── */}
        <section className="relative bg-[#0A0A0B] text-white">
          <div className={`${FRAME} border-white/[0.08]`}>
            <div className={`${PAD} py-[clamp(88px,10vw,136px)]`}>
              <Head dark trail={[c.crumb, "Challenges"]} title={c.challenges.title} lede={c.challenges.lede} />
              <BlurReveal delay={0.1} y={24} blur={12}>
                <div className={`relative mt-[clamp(48px,6vw,80px)] grid border-t border-white/[0.1] sm:grid-cols-2 ${chCols}`}>
                  <Cross dark className="-left-[5px] -top-[5px]" />
                  <Cross dark className="-right-[5px] -top-[5px]" />
                  {c.challenges.items.map((it, i) => (
                    <article
                      key={it.title}
                      className={`group relative flex flex-col border-b border-white/[0.1] px-[clamp(20px,2.4vw,36px)] pb-9 pt-[clamp(28px,3vw,40px)] transition-colors duration-500 ease-out hover:bg-white/[0.02] ${
                        i % 2 === 1 ? "sm:border-l" : ""
                      } ${i > 0 ? "lg:border-l" : ""}`}
                    >
                      <HoverRule />
                      <div className="flex items-baseline justify-between font-mono text-[11.5px] uppercase leading-none tracking-[0.1em] text-white/35">
                        <span>{pad2(i)}</span>
                        <span>{it.statLabel}</span>
                      </div>
                      <p className="m-0 mt-10 font-mono text-[clamp(2rem,3vw,2.6rem)] leading-none tracking-[-0.02em] text-white">{it.stat}</p>
                      <h3 className="mt-8 text-[clamp(1.2rem,1.5vw,1.45rem)] font-medium leading-[1.2] tracking-[-0.025em]">{it.title}</h3>
                      <p className="m-0 mt-3 text-pretty text-[15px] leading-[1.6] text-white/55">{it.description}</p>
                    </article>
                  ))}
                </div>
              </BlurReveal>
            </div>
          </div>
        </section>

        {/* ── Capabilities ────────────────────────────────────────────────── */}
        <section className="relative bg-white">
          <div className={`${FRAME} border-black/[0.08]`}>
            <div className={`${PAD} py-[clamp(88px,10vw,136px)]`}>
              <Head trail={[c.crumb, "Platform"]} title={c.capabilities.title} lede={c.capabilities.lede} />
              <BlurReveal delay={0.1} y={24} blur={12}>
                <div className={`relative mt-[clamp(48px,6vw,80px)] grid border-t border-black/[0.1] sm:grid-cols-2 ${capCols}`}>
                  <Cross className="-left-[5px] -top-[5px]" />
                  <Cross className="-right-[5px] -top-[5px]" />
                  {c.capabilities.items.map((it, i) => {
                    const Fig = Hairline[it.figure] as ComponentType<{ play?: boolean; theme?: string; intensity?: number; label?: string; className?: string }>;
                    return (
                      <article
                        key={it.title}
                        className={`group relative flex flex-col border-b border-black/[0.1] bg-white transition-colors duration-500 ease-out hover:bg-[#FAFAFB] ${
                          i % 2 === 1 ? "sm:border-l" : ""
                        } ${i > 0 ? "lg:border-l" : ""}`}
                      >
                        <HoverRule />
                        <div className="hl-plate border-b border-black/[0.06] px-[clamp(12px,2vw,28px)] pt-4">
                          <div className="flex items-center justify-between font-mono text-[10.5px] uppercase leading-none tracking-[0.1em] text-neutral-400">
                            <span>Fig. {pad2(i)}</span>
                            <span>{it.caption}</span>
                          </div>
                          <Fig play theme="light" intensity={0.6} label={it.caption} className="mx-auto max-w-[340px]" />
                        </div>
                        <div className="flex flex-1 flex-col px-[clamp(20px,2.4vw,36px)] pb-9 pt-7">
                          <span className="font-mono text-[11.5px] uppercase leading-none tracking-[0.1em] text-neutral-400">{pad2(i)}</span>
                          <h3 className="mt-5 text-[clamp(1.2rem,1.5vw,1.45rem)] font-medium leading-[1.2] tracking-[-0.025em]">{it.title}</h3>
                          <p className="m-0 mt-3 text-pretty text-[15px] leading-[1.6] text-neutral-600">{it.description}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </BlurReveal>
            </div>
          </div>
        </section>

        {/* ── Programs (dark) ─────────────────────────────────────────────── */}
        <section className="relative bg-[#0A0A0B] text-white">
          <div className={`${FRAME} border-white/[0.08]`}>
            <div className={`${PAD} py-[clamp(88px,10vw,136px)]`}>
              <Head dark trail={[c.crumb, "Programs"]} title={c.programs.title} lede={c.programs.lede} />
              <div className="relative mt-[clamp(48px,6vw,80px)] border-t border-white/[0.1]">
                <Cross dark className="-left-[5px] -top-[5px]" />
                <Cross dark className="-right-[5px] -top-[5px]" />
                {c.programs.items.map((it, i) => (
                  <BlurReveal key={it.title} delay={0.06 * i} y={16} blur={10}>
                    <article className="group relative grid gap-x-[clamp(24px,4vw,64px)] gap-y-6 border-b border-white/[0.1] py-[clamp(28px,3.4vw,44px)] transition-colors duration-500 ease-out hover:bg-white/[0.02] lg:grid-cols-[72px_minmax(0,1fr)_minmax(0,auto)] lg:px-4">
                      <HoverRule />
                      <span className="font-mono text-[11.5px] uppercase leading-none tracking-[0.1em] text-white/35 lg:pt-2">{pad2(i)}</span>
                      <div className="min-w-0">
                        <h3 className="m-0 text-[clamp(1.35rem,2vw,1.9rem)] font-medium leading-[1.15] tracking-[-0.03em]">{it.title}</h3>
                        <p className="m-0 mt-3 max-w-[56ch] text-pretty text-[15px] leading-[1.6] text-white/55">{it.description}</p>
                      </div>
                      <dl className="m-0 grid grid-cols-2 gap-px self-start bg-white/[0.08] sm:max-w-[420px] lg:w-[360px]">
                        {it.metrics.map((m) => (
                          <div key={m.label} className="bg-[#0A0A0B] px-4 py-4 sm:px-5">
                            <dd className="m-0 font-mono text-[clamp(1.4rem,2vw,1.8rem)] leading-none tracking-[-0.02em] text-white transition-colors duration-500 group-hover:text-brand-light">
                              {m.value}
                            </dd>
                            <dt className="mt-2.5 font-mono text-[10.5px] uppercase leading-[1.35] tracking-[0.1em] text-white/40">{m.label}</dt>
                          </div>
                        ))}
                      </dl>
                    </article>
                  </BlurReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <section className="relative bg-white">
          <div className={`${FRAME} border-black/[0.08]`}>
            <div className={`${PAD} py-[clamp(88px,10vw,136px)]`}>
              <BlurReveal y={20} blur={10}>
                <div className="relative grid items-end gap-x-[clamp(32px,5vw,80px)] gap-y-10 border-y border-black/[0.1] py-[clamp(40px,6vw,80px)] lg:grid-cols-[minmax(0,1fr)_auto]">
                  <Cross className="-left-[5px] -top-[5px]" />
                  <Cross className="-right-[5px] -top-[5px]" />
                  <Cross className="-bottom-[5px] -left-[5px]" />
                  <Cross className="-bottom-[5px] -right-[5px]" />
                  <div>
                    <Crumb trail={[c.crumb, "Get started"]} />
                    <h2 className="mt-7 text-balance text-[clamp(2rem,4vw,3.6rem)] font-medium leading-[1.04] tracking-[-0.04em]">
                      {c.cta.title[0]} <span className="block text-neutral-400">{c.cta.title[1]}</span>
                    </h2>
                    <p className="m-0 mt-6 max-w-[48ch] text-pretty text-[16px] leading-[1.6] text-neutral-600 sm:text-[17px]">{c.cta.lede}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <CtaButton solid onClick={() => navigate("/waitlist")}>
                      Join the waitlist
                    </CtaButton>
                    <CtaButton onClick={() => navigate("/contact")}>Book a walkthrough</CtaButton>
                  </div>
                </div>
              </BlurReveal>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
