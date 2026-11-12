"use client";

// Pricing as a spec sheet: one hairline-ruled table of three plans inside the page's railed
// frame. Pro is the dark, raised column. Mono labels, square corners, the house blue as accent.
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "@/lib/router";
import BlurReveal, { BlurWords, revealEase } from "@/components/motion/BlurReveal";

type Tier = {
  name: string;
  bestFor: string;
  price: { monthly: string; yearly: string };
  cadence: string;
  note: { monthly: string; yearly: string };
  features: string[];
  cta: string;
  href: string;
  highlight?: boolean;
};

const tiers: Tier[] = [
  {
    name: "Free",
    bestFor: "For a small team getting its first product organised.",
    price: { monthly: "$0", yearly: "$0" },
    cadence: "/ month",
    note: { monthly: "Free forever", yearly: "Free forever" },
    features: [
      "Up to 5 users",
      "3 BOMs / 500 parts",
      "2 GB workspace",
      "3 ECOs per month",
      "Limited integrations",
      "5 AI Architect generations / month",
      "Community support",
    ],
    cta: "Get started",
    href: "/waitlist",
  },
  {
    name: "Pro",
    bestFor: "Everything a growing hardware team needs to ship.",
    price: { monthly: "$24", yearly: "$20" },
    cadence: "/ user / month",
    note: { monthly: "Billed monthly", yearly: "Billed yearly · $240 per user" },
    features: [
      "Unlimited users",
      "Unlimited BOMs / 5K parts",
      "25 GB workspace per user",
      "Unlimited ECOs",
      "Unlimited integrations",
      "25 AI Architect generations / user / month",
      "Compliance support",
      "Dedicated support",
    ],
    cta: "Start Pro",
    href: "/waitlist",
    highlight: true,
  },
  {
    name: "Enterprise",
    bestFor: "Governance, scale and a partner in the rollout.",
    price: { monthly: "Custom", yearly: "Custom" },
    cadence: "",
    note: { monthly: "Annual agreement", yearly: "Annual agreement" },
    features: [
      "Everything in Pro",
      "Unlimited storage",
      "Advanced access controls",
      "Custom SLAs and a dedicated CSM",
      "Private deployments and data residency",
      "Dedicated support under 3 hours",
    ],
    cta: "Contact sales",
    href: "/contact",
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

const Pricing = () => {
  const [yearly, setYearly] = useState(true);
  const navigate = useNavigate();
  const period = yearly ? "yearly" : "monthly";

  return (
    <section id="pricing" className="relative bg-white text-brand-ink">
      <div className="relative mx-auto w-[min(1600px,calc(100%-2*clamp(12px,2.4vw,36px)))] border-x border-black/[0.08]">
        <div className="px-[clamp(20px,3vw,48px)] py-[clamp(88px,10vw,136px)]">
          {/* Header: title left, lede and billing switch right */}
          <div className="grid items-end gap-x-[clamp(32px,5vw,80px)] gap-y-8 lg:grid-cols-2">
            <div>
              <BlurReveal>
                <p className="m-0 font-mono text-[13px] uppercase leading-none tracking-[0.1em] text-neutral-500">
                  <span className="text-brand-ink">OpenPlan</span> <span className="text-neutral-300">/</span> Pricing
                </p>
              </BlurReveal>
              <h2 className="mt-7 text-balance text-[clamp(2.2rem,4vw,3.6rem)] font-medium leading-[1.04] tracking-[-0.04em]">
                <BlurWords text="Start free." delay={0.05} />{" "}
                <span className="block text-neutral-400">
                  <BlurWords text="Scale with the program." delay={0.18} />
                </span>
              </h2>
            </div>
            <BlurReveal delay={0.25} className="lg:justify-self-end">
              <p className="m-0 max-w-[40ch] text-pretty text-[17px] leading-[1.55] text-neutral-600">
                One workspace for requirements, BOMs and programs. Pick the plan that fits your team today and
                upgrade as your products grow.
              </p>
              <div role="radiogroup" aria-label="Billing period" className="mt-6 inline-flex border border-black/[0.1] bg-white p-[3px]">
                {([false, true] as const).map((isYearly) => {
                  const on = yearly === isYearly;
                  return (
                    <button
                      key={String(isYearly)}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setYearly(isYearly)}
                      className="relative h-9 px-4 font-mono text-[11.5px] uppercase tracking-[0.1em] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                    >
                      {on && (
                        <motion.span
                          layoutId="billing-pill"
                          className="absolute inset-0 bg-brand-ink"
                          transition={{ type: "spring", stiffness: 420, damping: 36 }}
                        />
                      )}
                      <span className={`relative flex items-center gap-2 transition-colors duration-300 ${on ? "text-white" : "text-neutral-500 hover:text-brand-ink"}`}>
                        {isYearly ? "Yearly" : "Monthly"}
                        {isYearly && <span className={on ? "text-[#7C9BFF]" : "text-brand"}>−17%</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </BlurReveal>
          </div>

          {/* Plans: one ruled sheet */}
          <BlurReveal delay={0.1} y={24} blur={12}>
            <div className="relative mt-[clamp(48px,6vw,80px)] grid border-t border-black/[0.1] md:grid-cols-3">
              <Cross className="-left-[5px] -top-[5px]" />
              <Cross className="-right-[5px] -top-[5px]" />
              {tiers.map((tier, i) => {
                const price = tier.price[period];
                const dark = !!tier.highlight;
                return (
                  <article
                    key={tier.name}
                    className={`group relative flex flex-col border-b border-black/[0.1] ${i > 0 ? "md:border-l" : ""} ${
                      dark
                        ? "z-[1] bg-brand-ink text-white md:-mt-6 md:mb-[-1px] md:border-l-0 md:shadow-[0_40px_80px_-40px_rgba(47,91,255,0.55)]"
                        : "bg-white"
                    }`}
                  >
                    {dark && <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-brand" />}
                    {dark && (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_45%_at_50%_0%,rgba(47,91,255,0.22),transparent_70%)]"
                      />
                    )}

                    <div className={`relative px-[clamp(20px,2.4vw,36px)] pb-8 ${dark ? "pt-[calc(clamp(28px,3vw,40px)+24px)] md:pt-[calc(clamp(28px,3vw,40px)+24px)]" : "pt-[clamp(28px,3vw,40px)]"}`}>
                      <div className="flex items-center justify-between gap-3 font-mono text-[11.5px] uppercase leading-none tracking-[0.1em]">
                        <span className={dark ? "text-white/50" : "text-neutral-400"}>
                          {String(i + 1).padStart(2, "0")} <span className={dark ? "text-white/90" : "text-brand-ink"}>{tier.name}</span>
                        </span>
                        {dark && (
                          <span className="flex items-center gap-2 text-[#7C9BFF]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#7C9BFF]" />
                            Most popular
                          </span>
                        )}
                      </div>
                      <p className={`mt-5 min-h-[48px] max-w-[30ch] text-[15px] leading-[1.55] ${dark ? "text-white/65" : "text-neutral-600"}`}>
                        {tier.bestFor}
                      </p>

                      {/* Price flips with a blur when the billing period changes */}
                      <div className="mt-8 flex min-h-[64px] items-end gap-2.5">
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span
                            key={price}
                            className="text-[clamp(3rem,4.4vw,4.25rem)] font-medium leading-[0.9] tracking-[-0.05em] tabular-nums"
                            initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
                            transition={{ duration: 0.45, ease: revealEase }}
                          >
                            {price}
                          </motion.span>
                        </AnimatePresence>
                        {tier.cadence && (
                          <span className={`mb-1 font-mono text-[12px] tracking-[0.02em] ${dark ? "text-white/50" : "text-neutral-500"}`}>{tier.cadence}</span>
                        )}
                        {dark && yearly && (
                          <span className="mb-1 font-mono text-[12px] text-white/35 line-through">$24</span>
                        )}
                      </div>
                      <p className={`mt-3 h-4 font-mono text-[11.5px] tracking-[0.02em] ${dark ? "text-white/45" : "text-neutral-400"}`}>{tier.note[period]}</p>

                      <button
                        type="button"
                        onClick={() => navigate(tier.href)}
                        className={`group/cta mt-8 flex h-12 w-full items-center justify-between px-5 font-mono text-[12px] uppercase tracking-[0.1em] transition-[background-color,border-color,color] duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                          dark
                            ? "bg-brand text-white hover:bg-brand-hover"
                            : "border border-black/[0.14] bg-white text-brand-ink hover:border-brand-ink hover:bg-brand-ink hover:text-white"
                        }`}
                      >
                        {tier.cta}
                        <ArrowUpRight
                          className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
                          strokeWidth={1.75}
                        />
                      </button>
                    </div>

                    <div className={`relative border-t px-[clamp(20px,2.4vw,36px)] pb-9 pt-7 ${dark ? "border-white/10" : "border-black/[0.08]"}`}>
                      <p className={`m-0 font-mono text-[11px] uppercase tracking-[0.12em] ${dark ? "text-white/40" : "text-neutral-400"}`}>What you get</p>
                      <ul className="mt-4">
                        {tier.features.map((feature) => (
                          <li
                            key={feature}
                            className={`flex items-baseline gap-3 border-b py-[11px] text-[14.5px] leading-snug last:border-b-0 ${
                              dark ? "border-white/[0.07] text-white/85" : "border-black/[0.05] text-neutral-700"
                            }`}
                          >
                            <span
                              aria-hidden
                              className={`relative top-[-2px] h-[7px] w-[7px] shrink-0 ${dark ? "bg-[#7C9BFF]" : "border border-neutral-400"}`}
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </BlurReveal>

          {/* Foot */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 font-mono text-[11.5px] uppercase tracking-[0.1em] text-neutral-400">
            <span>Prices in USD · Taxes may apply</span>
            <button
              type="button"
              onClick={() => navigate("/contact")}
              className="group inline-flex items-center gap-1.5 text-brand-ink transition-colors hover:text-brand"
            >
              Running a pilot? Talk to us
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
