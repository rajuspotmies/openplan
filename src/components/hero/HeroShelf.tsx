"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Sparkles } from "lucide-react";
import PartsShelfField from "@/components/hero/PartsShelfField";
import { AwsLogo, GoogleLogo, NvidiaLogo } from "@/components/hero/BackerLogos";

const ease = [0.22, 1, 0.36, 1] as const;

const backers = [
  { name: "Google for Startups", Logo: GoogleLogo, logo: "h-[14px] sm:h-[17px]", suffix: "for Startups" },
  { name: "NVIDIA Inception", Logo: NvidiaLogo, logo: "h-[13px] sm:h-[16px]", suffix: "Inception" },
  { name: "AWS for Startups", Logo: AwsLogo, logo: "h-[16px] sm:h-[20px]", suffix: "for Startups" },
];

const uses = ["Parts & BOMs", "Revisions", "Engineering changes"];

/*
 * Parts-shelf hero (HERO_DESIGN "shelf"): Theseus-style layout in dark gray. Wireframe
 * shelves behind (PartsShelfField: pointer light, pan-tilt camera that follows the pointer),
 * a big three-line headline bottom-left, a "planning layer for" list and CTA bottom-right,
 * and a thin bar along the bottom with the backers.
 */
export default function HeroShelf({ background = true }: { background?: boolean }) {
  const reduce = useReducedMotion();

  const reveal = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18, filter: "blur(10px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 0.9, ease, delay },
        };

  const scrollToLearnMore = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById("workflow-section");
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <section className={`relative isolate flex min-h-[100svh] flex-col overflow-hidden text-white ${background ? "bg-[#161618]" : ""}`}>
      {background && <PartsShelfField className="absolute inset-0 -z-10 h-full w-full" />}

      <div className="relative mx-auto flex w-full max-w-[1384px] flex-1 flex-col px-4 pt-[88px] sm:px-8 lg:pt-[96px]">
        {/* bottom block: headline left, list + CTA right */}
        <div className="hero-copy-shadow mt-auto grid gap-8 pb-8 pt-8 sm:pb-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end lg:gap-12 lg:pb-14">
          <div>
            <motion.div {...reveal(0)}>
              <Link
                href="#workflow-section"
                onClick={scrollToLearnMore}
                className="group inline-flex max-w-full items-center gap-2 border border-white/15 bg-white/[0.04] px-3 py-2 font-mono text-[10.5px] font-medium tracking-[0.01em] text-white/85 backdrop-blur-sm transition-colors duration-300 hover:border-white/40 hover:text-white sm:gap-3 sm:px-4 sm:py-2.5 sm:text-[12px]"
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#4f7bff]" strokeWidth={1.75} aria-hidden />
                <span className="truncate">Meet the OpenPlan AI Architect</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={1.75} aria-hidden />
              </Link>
            </motion.div>
            <motion.h1
              data-shelf-copy
              {...reveal(0.08)}
              className="mt-5 text-[2.5rem] font-medium leading-[1.02] tracking-[-0.045em] sm:mt-6 sm:text-[min(4rem,9.5svh)] lg:text-[min(4.4rem,9.5svh)] xl:text-[min(5rem,10svh)]"
            >
              Built for
              <br />
              <span className="hero-accent">hardware teams</span>
              <br />
              that ship real products.
            </motion.h1>
          </div>

          <motion.div data-shelf-copy {...reveal(0.2)} className="lg:pb-2">
            <p className="text-[17px] text-white/60 sm:text-[19px]">The AI planning layer for</p>
            <ul className="mt-3 space-y-2">
              {uses.map((u) => (
                <li key={u} className="flex items-center gap-3 text-[18px] font-medium tracking-[-0.01em] sm:text-[21px]">
                  <span className="h-[6px] w-[6px] shrink-0 bg-[#4f7bff] shadow-[0_0_8px_rgba(47,91,255,0.9)]" />
                  {u}
                </li>
              ))}
            </ul>
            <div className="my-5 h-px bg-white/15" />
            <p className="text-[16px] leading-[1.45] text-white/85 sm:text-[18px]">
              Works alongside your PLM, so every team sees what a change touches before it ships.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link
                href="/contact"
                className="group inline-flex h-11 items-center gap-2 border border-[#2f5bff]/45 bg-[#2f5bff]/[0.14] px-4 text-[14px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_6px_24px_-10px_rgba(47,91,255,0.8)] backdrop-blur-sm transition-colors duration-300 hover:border-[#2f5bff] hover:bg-[#2f5bff]/30"
              >
                Book a demo
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={1.75} aria-hidden />
              </Link>
              <a
                href="#workflow-section"
                onClick={scrollToLearnMore}
                className="group inline-flex h-11 items-center gap-2 px-3 text-[14px] font-medium text-white/65 transition-colors duration-300 hover:text-white"
              >
                Learn more
                <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" strokeWidth={1.75} aria-hidden />
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* bottom bar */}
      <motion.div {...reveal(0.34)} className="relative border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[1384px] flex-col items-start gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-white/45">Backed by</p>
          <ul className="flex flex-wrap items-center gap-x-3.5 gap-y-2 min-[400px]:gap-x-5 sm:gap-x-9">
            {backers.map(({ name, Logo, logo, suffix }) => (
              <li key={name} title={name} className="flex items-center gap-1.5 text-white/75 transition-colors duration-500 hover:text-white">
                <Logo color className={`${logo} w-auto`} />
                <span className="whitespace-nowrap text-[11px] font-medium tracking-[-0.01em] min-[400px]:text-[12px] sm:text-[14px]">{suffix}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
}
