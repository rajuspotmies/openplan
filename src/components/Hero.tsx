"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Sparkles } from "lucide-react";
import BlueAsciiField from "@/components/hero/BlueAsciiField";
import BlueprintField from "@/components/hero/BlueprintField";
import { HERO_DESIGN } from "@/components/hero/heroDesign";
import PartsShelfField from "@/components/hero/PartsShelfField";
import { AwsLogo, GoogleLogo, NvidiaLogo } from "@/components/hero/BackerLogos";

const ease = [0.22, 1, 0.36, 1] as const;

/** Blueprint design (see heroDesign.ts): blue primary button, quieter outlines, two-tone headline. */
const BP = HERO_DESIGN === "blueprint";

/** Programs backing OpenPlan: silver-gradient marks; the hovered one lights up in its brand colours. */
const backers = [
  { name: "Google for Startups", Logo: GoogleLogo, logo: "h-[18px] sm:h-[30px]", suffix: "for Startups" },
  { name: "NVIDIA Inception", Logo: NvidiaLogo, logo: "h-[16px] sm:h-[28px]", suffix: "Inception" },
  // the AWS mark carries its smile below the letters, so the label lifts to the letters' centre line
  { name: "AWS for Startups", Logo: AwsLogo, logo: "h-[21px] sm:h-[34px]", suffix: "for Startups", lift: "-translate-y-[3px] sm:-translate-y-[5px]" },
];

/*
 * Hero: electric-blue ASCII sky over a black horizon, centred copy, two mono
 * buttons and a "Backed by" row. Text eases in with a short blur-to-sharp reveal.
 */
/** "shelf" design: the original centred hero copy over the ShelfGlow background (HeroShelf.tsx holds the
 *  Theseus-style split layout, kept unused). */
const SHELF = HERO_DESIGN === "shelf";

const Hero = ({ background = true }: { background?: boolean }) => <AsciiHero background={background} />;

const AsciiHero = ({ background = true }: { background?: boolean }) => {
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
      {background &&
        (SHELF ? (
          <PartsShelfField className="absolute inset-0 -z-10 h-full w-full" />
        ) : BP ? (
          <BlueprintField className="absolute inset-0 -z-10 h-full w-full" />
        ) : (
          <BlueAsciiField className="absolute inset-0 -z-10 h-full w-full" />
        ))}

      <div
        className={`mx-auto flex w-full max-w-[1320px] flex-1 flex-col items-center justify-center px-4 pb-[5svh] pt-[14svh] text-center sm:px-8 sm:pb-[6svh] sm:pt-[16svh] md:pt-[14svh] ${SHELF ? "hero-copy-shadow" : ""}`}
      >
        {/* Announcement pill */}
        <motion.div {...reveal(0)} className="max-w-full">
          <Link
            href="#workflow-section"
            onClick={scrollToLearnMore}
            className={`group inline-flex max-w-full items-center gap-2 border ${BP ? "border-white/15 bg-white/[0.04] hover:border-white/40 hover:bg-white/[0.07]" : "border-white/55 bg-black/60 hover:border-white hover:bg-black/70"} px-3 py-2 font-mono text-[10.5px] sm:gap-3 font-medium tracking-[0.01em] text-white backdrop-blur-sm transition-colors duration-300 ease-out sm:px-[18px] sm:py-[13px] sm:text-[12.5px]`}
          >
            <Sparkles className={`h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4 ${BP ? "text-brand-light" : ""}`} strokeWidth={1.75} aria-hidden />
            <span className="truncate">
              Meet the OpenPlan AI Architect<span className="hidden sm:inline"> for hardware teams</span>
            </span>
            <ArrowRight
              className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5 sm:h-4 sm:w-4"
              strokeWidth={1.75}
              aria-hidden
            />
          </Link>
        </motion.div>

        {/* Headline */}
        <motion.h1
          data-shelf-copy
          {...reveal(0.08)}
          className="mt-5 max-w-[1280px] text-balance text-[1.9rem] font-medium leading-[1.06] sm:leading-[1.04] tracking-[-0.045em] sm:mt-7 sm:text-[3rem] lg:text-[3.2rem] xl:text-[3.45rem]"
        >
          {BP ? (
            <>
              Built for hardware teams <span className="text-white/45">that ship real products.</span>
            </>
          ) : (
            "Built for hardware teams that ship real products."
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          data-shelf-copy
          {...reveal(0.16)}
          className={`mt-4 max-w-[1040px] text-pretty text-[14.5px] leading-[1.55] sm:mt-6 sm:text-[17px] lg:text-[18px] ${BP ? "text-white/60" : "text-white/80 sm:text-white/85"}`}
        >
          The AI planning layer for hardware teams.
          {/* phones stop after the first sentence */}
          <span className="hidden sm:inline">
            {" "}
            OpenPlan connects your parts, BOMs, revisions and engineering changes, and works alongside
            your PLM, so every team sees what a change touches before it ships.
          </span>
        </motion.p>

        {/* Actions */}
        <motion.div
          {...reveal(0.24)}
          className="mt-6 grid w-full max-w-[400px] grid-cols-2 gap-2.5 sm:mt-8 sm:flex sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-3"
        >
          <Link
            href="/contact"
            className={`group inline-flex h-11 items-stretch border font-mono text-[11.5px] font-medium uppercase tracking-[0.08em] sm:h-12 sm:text-[13px] transition-colors duration-300 ease-out ${BP ? "border-brand bg-brand text-white shadow-[0_0_40px_-8px_rgba(47,91,255,0.8)] hover:border-brand-hover hover:bg-brand-hover" : "border-white bg-white text-black hover:bg-neutral-200"}`}
          >
            <span className="flex flex-1 items-center justify-center whitespace-nowrap px-3 sm:flex-none sm:px-[22px]">Book a demo</span>
            <span className={`flex w-9 items-center justify-center border-l max-[359px]:hidden sm:w-12 ${BP ? "border-white/25" : "border-black/15"}`}>
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
            className={`group inline-flex h-11 items-stretch border ${BP ? "border-white/20 bg-white/[0.03] backdrop-blur-sm" : "border-white/70 bg-black/40"} font-mono text-[11.5px] font-medium uppercase tracking-[0.08em] sm:h-12 sm:text-[13px] text-white transition-colors duration-300 ease-out hover:border-white hover:bg-white/10`}
          >
            <span className="flex flex-1 items-center justify-center whitespace-nowrap px-3 sm:flex-none sm:px-[22px]">Learn more</span>
            <span className={`flex w-9 items-center justify-center border-l max-[359px]:hidden sm:w-12 ${BP ? "border-white/15" : "border-white/40"}`}>
              <ArrowDown
                className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-y-0.5"
                strokeWidth={1.75}
                aria-hidden
              />
            </span>
          </a>
        </motion.div>

        {/* Backed by */}
        <motion.div {...reveal(0.34)} className="mt-7 flex flex-col items-center sm:mt-6">
          <p className="font-mono text-[10.5px] tracking-[0.04em] text-white/65 sm:text-[13px] sm:text-white/75">Backed by</p>
          <ul className="group/backers mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:mt-4 sm:gap-x-12 sm:gap-y-5">
            {backers.map(({ name, Logo, logo, suffix, lift }) => (
              <li
                key={name}
                title={name}
                className="group flex cursor-default items-center gap-2 transition-[opacity,transform,filter] duration-500 ease-out group-hover/backers:opacity-45 hover:!opacity-100 hover:-translate-y-0.5 hover:drop-shadow-[0_0_18px_rgba(255,255,255,0.22)]"
              >
                <Logo gradient className={`${logo} w-auto`} />
                {suffix && (
                  <span
                    className={`whitespace-nowrap bg-gradient-to-br from-white via-[#C9CDD4] to-[#7D838D] bg-clip-text text-[13px] font-medium tracking-[-0.02em] text-transparent transition-colors duration-500 ease-out group-hover:text-white sm:text-[20px] ${lift ?? ""}`}
                  >
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
