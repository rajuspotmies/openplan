"use client";

// Industries as a ruled sheet of four columns inside the page's railed frame, in the same
// vocabulary as Pricing: mono labels, hairlines, square corners and the house blue as accent.
import { Cpu, Plane, Zap, Factory, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useNavigate } from "@/lib/router";
import BlurReveal, { BlurWords } from "@/components/motion/BlurReveal";

const industries = [
  {
    icon: Cpu,
    name: "Consumer Electronics & IoT",
    href: "/industries/consumer-electronics",
    description:
      "Ship smart devices faster: coordinate hardware, firmware and manufacturing across distributed teams with AI-driven planning and BOM-aware schedules.",
    stats: "For teams of 10–100 engineers",
  },
  {
    icon: Plane,
    name: "Robotics & Drones",
    href: "/industries/drone",
    description:
      "Coordinate complex mechanical, electrical and firmware workflows from prototype to production, without losing track of dependencies across teams.",
    stats: "For drones & robotics",
  },
  {
    icon: Zap,
    name: "EV & Clean Energy Hardware",
    href: "/industries/automotive",
    description:
      "Move EV charging infrastructure, battery systems and clean energy hardware from concept to mass production with traceable BOMs and supplier coordination.",
    stats: "For EV infra & battery startups",
  },
  {
    icon: Factory,
    name: "Industrial Equipment",
    href: "/industries/industrial-equipment",
    description:
      "Build connected industrial hardware, from smart factory equipment to specialised machinery, with end-to-end traceability from design to shop floor.",
    stats: "For industrial hardware teams",
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

const Industries = () => {
  const navigate = useNavigate();

  return (
    <section id="industries" className="relative bg-white text-brand-ink">
      <div className="relative mx-auto w-[min(1600px,calc(100%-2*clamp(12px,2.4vw,36px)))] border-x border-black/[0.08]">
        <div className="px-[clamp(20px,3vw,48px)] py-[clamp(88px,10vw,136px)]">
          {/* Header: title left, lede right */}
          <div className="grid items-end gap-x-[clamp(32px,5vw,80px)] gap-y-8 lg:grid-cols-2">
            <div>
              <BlurReveal>
                <p className="m-0 font-mono text-[13px] uppercase leading-none tracking-[0.1em] text-neutral-500">
                  <span className="text-brand-ink">OpenPlan</span> <span className="text-neutral-300">/</span> Industries
                </p>
              </BlurReveal>
              <h2 className="mt-7 text-balance text-[clamp(2.2rem,4vw,3.6rem)] font-medium leading-[1.04] tracking-[-0.04em]">
                <BlurWords text="Built for" delay={0.05} />{" "}
                <span className="block text-neutral-400">
                  <BlurWords text="hardware teams." delay={0.18} />
                </span>
              </h2>
            </div>
            <BlurReveal delay={0.25} className="lg:justify-self-end">
              <p className="m-0 max-w-[40ch] text-pretty text-[17px] leading-[1.55] text-neutral-600">
                Purpose-built workflows to plan, build, and ship reliable products faster.
              </p>
            </BlurReveal>
          </div>

          {/* Industries: one ruled sheet */}
          <BlurReveal delay={0.1} y={24} blur={12}>
            <div className="relative mt-[clamp(48px,6vw,80px)] grid border-t border-black/[0.1] sm:grid-cols-2 lg:grid-cols-4">
              <Cross className="-left-[5px] -top-[5px]" />
              <Cross className="-right-[5px] -top-[5px]" />
              {industries.map((industry, i) => {
                const Icon = industry.icon;
                return (
                  <Link
                    key={industry.name}
                    href={industry.href}
                    aria-label={`${industry.name}: see how OpenPlan works for this industry`}
                    className={`group relative flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/50 border-b border-black/[0.1] bg-white transition-colors duration-500 ease-out hover:bg-[#FAFAFB] ${
                      i % 2 === 1 ? "sm:border-l" : ""
                    } ${i > 0 ? "lg:border-l" : ""}`}
                  >
                    {/* blue rule that draws in on hover */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-[-1px] h-[2px] origin-left scale-x-0 bg-brand transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                    />
                    <div className="flex flex-1 flex-col px-[clamp(20px,2.4vw,36px)] pb-9 pt-[clamp(28px,3vw,40px)]">
                      <div className="flex items-center justify-between font-mono text-[11.5px] uppercase leading-none tracking-[0.1em] text-neutral-400">
                        <span>{String(i + 1).padStart(2, "0")}</span>
                        <span className="flex h-11 w-11 items-center justify-center border border-black/[0.1] text-brand-ink transition-colors duration-500 ease-out group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                          <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                        </span>
                      </div>
                      <h3 className="mt-10 text-[clamp(1.35rem,1.6vw,1.6rem)] font-medium leading-[1.15] tracking-[-0.03em]">{industry.name}</h3>
                      <p className="mb-8 mt-4 text-pretty text-[15px] leading-[1.6] text-neutral-600">{industry.description}</p>
                      <p className="mt-auto flex items-center gap-2 border-t border-black/[0.06] pt-5 font-mono text-[11.5px] uppercase tracking-[0.1em] text-neutral-500">
                        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" />
                        {industry.stats}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </BlurReveal>

          {/* Foot */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 font-mono text-[11.5px] uppercase tracking-[0.1em] text-neutral-400">
            <span>Don&apos;t see your industry?</span>
            <button
              type="button"
              onClick={() => navigate("/contact")}
              className="group/cta inline-flex items-center gap-2 uppercase text-brand-ink transition-colors duration-300 ease-out hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              Talk to us about your platform
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
                strokeWidth={1.75}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Industries;
