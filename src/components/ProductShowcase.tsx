"use client";

import { forwardRef } from "react";
import { motion, type MotionValue } from "framer-motion";
import TiltImage from "@/components/hero/TiltImage";
const heroImage = "/assets/newheroimage.png";

/*
 * The section that slides up over the pinned hero. Its zoom-in (scale) and
 * corner radius are driven by the parent's scroll progress (see Hero.tsx).
 */
type Props = {
  scale?: MotionValue<number>;
  radius?: MotionValue<number>;
};

const ProductShowcase = forwardRef<HTMLElement, Props>(function ProductShowcase({ scale, radius }, ref) {
  return (
    <motion.section
      ref={ref}
      id="product"
      className="relative z-10 origin-top overflow-hidden bg-brand-ink text-white"
      style={{ scale, borderTopLeftRadius: radius, borderTopRightRadius: radius }}
    >
      {/* soft accent bloom behind the product */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[22%] h-[520px] w-[min(1100px,90%)] -translate-x-1/2 rounded-full bg-brand/25 blur-[140px]"
      />

      <div className="relative mx-auto max-w-[1240px] px-6 pb-24 pt-24 sm:px-8 md:pb-32 md:pt-28">
        <div className="mx-auto max-w-[720px] text-center">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-brand-light">Command Center</p>
          <h2 className="mt-5 text-balance text-4xl font-medium leading-[1.06] tracking-[-0.035em] sm:text-5xl lg:text-[3.5rem]">
            Every project, change and part in one view
          </h2>
          <p className="mx-auto mt-6 max-w-[560px] text-pretty text-[17px] leading-relaxed text-white/60">
            See what needs you now across projects, engineering changes, BOMs and the program
            schedule, before it turns into a late surprise on the build floor.
          </p>
        </div>

        <div className="relative -mx-3 mt-14 sm:mx-0 md:mt-20 lg:-mx-16 xl:-mx-28">
          <TiltImage
            src={heroImage}
            alt="OpenPlan Command Center: portfolio, requirements, open engineering changes and BOM status in one view"
          />
        </div>
      </div>
    </motion.section>
  );
});

export default ProductShowcase;
