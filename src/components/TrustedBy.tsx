"use client";

// "Trusted by teams at": the customer logo marquee, on the dark page between the hero and
// "How to get started", inside the same railed frame as the sections around it.
import LogoMarquee, { type Logo } from "@/components/LogoMarquee";

const logos: Logo[] = [
  { src: "/company-logos/marquee/safeguardair.png", alt: "SafeGuard Air" },
  { src: "/company-logos/marquee/vitalscarepro.png", alt: "Vitals Care Pro" },
  { src: "/company-logos/marquee/nrtech.png", alt: "NR Techcreatz" },
  { src: "/company-logos/marquee/flostat.png", alt: "Flostat", label: "FLOSTAT" },
  { src: "/company-logos/marquee/dreambot.png", alt: "Dreambot" },
  { src: "/company-logos/marquee/everypin.png", alt: "Everypin" },
  { src: "/company-logos/marquee/spotmies.png", alt: "Spotmies" },
];

export default function TrustedBy() {
  return (
    <section aria-label="Trusted by teams at" className="relative bg-[#0A0A0B] text-white">
      <div className="mx-auto w-[min(1600px,calc(100%-2*clamp(12px,2.4vw,36px)))] border-x border-b border-white/[0.08] px-[clamp(16px,4vw,72px)] pb-10 pt-12 md:pb-14 md:pt-16">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.14em] text-white/45 sm:text-[12px]">
          Trusted by teams at
        </p>
        <LogoMarquee logos={logos} tone="dark" className="mt-5 max-w-none md:mt-7" />
      </div>
    </section>
  );
}
