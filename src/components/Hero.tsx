"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Sparkles } from "lucide-react";
import BlueAsciiField from "@/components/hero/BlueAsciiField";
import { AwsLogo, GoogleLogo, NvidiaLogo } from "@/components/hero/BackerLogos";

const ease = [0.22, 1, 0.36, 1] as const;

/** Programs backing OpenPlan: white marks that ease into their brand colours on hover. */
const backers = [
  { name: "Google for Startups", Logo: GoogleLogo, logo: "h-[24px] sm:h-[30px]", suffix: "for Startups" },
  { name: "NVIDIA Inception", Logo: NvidiaLogo, logo: "h-[22px] sm:h-[28px]", suffix: "Inception" },
  { name: "AWS for Startups", Logo: AwsLogo, logo: "h-[28px] sm:h-[34px]", suffix: "for Startups" },
];

/*
 * Hero: electric-blue ASCII sky over a black horizon, centred copy, two mono
 * buttons and a "Backed by" row. Text eases in with a short blur-to-sharp reveal.
 */
const Hero = ({ background = true }: { background?: boolean }) => {
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
    <section className={`relative isolate flex min-h-[100svh] flex-col overflow-hidden text-white ${background ? "bg-black" : ""}`}>
      {background && <BlueAsciiField className="absolute inset-0 -z-10 h-full w-full" />}

      <div className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col items-center justify-center px-4 pb-[6svh] pt-[16svh] text-center sm:px-8 md:pt-[14svh]">
        {/* Announcement pill */}
        <motion.div {...reveal(0)} className="max-w-full">
          <Link
            href="#workflow-section"
            onClick={scrollToLearnMore}
            className="group inline-flex max-w-full items-center gap-3 border border-white/55 bg-black/60 px-4 py-3 font-mono text-[11.5px] font-medium tracking-[0.01em] text-white backdrop-blur-sm transition-colors duration-300 ease-out hover:border-white hover:bg-black/70 sm:px-[18px] sm:py-[13px] sm:text-[12.5px]"
          >
            <Sparkles className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="truncate">
              Meet the OpenPlan AI Architect<span className="hidden sm:inline"> for hardware teams</span>
            </span>
            <ArrowRight
              className="h-4 w-4 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
              strokeWidth={1.75}
              aria-hidden
            />
          </Link>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...reveal(0.08)}
          className="mt-6 max-w-[1280px] text-balance text-[2.3rem] font-medium leading-[1.04] tracking-[-0.045em] sm:mt-7 sm:text-[3rem] lg:text-[3.2rem] xl:text-[3.45rem]"
        >
          Built for hardware teams that ship real products.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...reveal(0.16)}
          className="mt-5 max-w-[1040px] text-pretty text-[15.5px] leading-[1.55] text-white/85 sm:mt-6 sm:text-[17px] lg:text-[18px]"
        >
          The AI planning layer for hardware teams. OpenPlan connects your parts, BOMs, revisions and
          engineering changes, and works alongside your PLM, so every team sees what a change touches
          before it ships.
        </motion.p>

        {/* Actions */}
        <motion.div
          {...reveal(0.24)}
          className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:items-center sm:gap-3"
        >
          <Link
            href="/contact"
            className="group inline-flex h-12 items-stretch border border-white bg-white font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-black transition-colors duration-300 ease-out hover:bg-neutral-200"
          >
            <span className="flex flex-1 items-center justify-center px-[22px] sm:flex-none">Book a demo</span>
            <span className="flex w-12 items-center justify-center border-l border-black/15">
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                strokeWidth={1.75}
                aria-hidden
              />
            </span>
          </Link>
          <a
            href="#workflow-section"
            onClick={scrollToLearnMore}
            className="group inline-flex h-12 items-stretch border border-white/70 bg-black/40 font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-white transition-colors duration-300 ease-out hover:border-white hover:bg-white/10"
          >
            <span className="flex flex-1 items-center justify-center px-[22px] sm:flex-none">Learn more</span>
            <span className="flex w-12 items-center justify-center border-l border-white/40">
              <ArrowDown
                className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-y-0.5"
                strokeWidth={1.75}
                aria-hidden
              />
            </span>
          </a>
        </motion.div>

        {/* Backed by */}
        <motion.div {...reveal(0.34)} className="mt-9 flex flex-col items-center sm:mt-6">
          <p className="font-mono text-[11.5px] tracking-[0.04em] text-white/75 sm:text-[13px]">Backed by</p>
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-9 gap-y-5 sm:mt-4 sm:gap-x-12">
            {backers.map(({ name, Logo, logo, suffix }) => (
              <li
                key={name}
                title={name}
                className="group flex cursor-default items-center gap-2 text-white/85 opacity-90 transition-opacity duration-500 ease-out hover:opacity-100"
              >
                <Logo className={`${logo} w-auto`} />
                {suffix && (
                  <span className="whitespace-nowrap text-[16px] font-medium tracking-[-0.02em] transition-colors duration-500 ease-out group-hover:text-white sm:text-[20px]">
                    {suffix}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
