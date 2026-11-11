"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  cubicBezier,
} from "framer-motion";

/*
 * Product shot that starts tipped back in 3D and settles flat as it scrolls
 * into view. Scroll progress is shaped with an ease-in-out curve, then passed
 * through a spring so the motion lands softly instead of tracking the
 * scrollbar 1:1.
 */

const easeInOut = cubicBezier(0.65, 0, 0.35, 1);
const spring = { stiffness: 110, damping: 26, mass: 0.7 };

export default function TiltImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    // 0 when the top of the image enters the bottom of the viewport,
    // 1 when the top of the image reaches 15% from the top.
    offset: ["start end", "start 0.15"],
  });

  const rotateX = useSpring(useTransform(scrollYProgress, [0, 1], [26, 0], { ease: easeInOut }), spring);
  const scale = useSpring(useTransform(scrollYProgress, [0, 1], [0.9, 1], { ease: easeInOut }), spring);
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [40, 0], { ease: easeInOut }), spring);
  const glow = useSpring(useTransform(scrollYProgress, [0, 1], [0.35, 1], { ease: easeInOut }), spring);
  const shadow = useTransform(
    rotateX,
    [0, 26],
    ["0 50px 120px -40px rgba(0,0,0,0.8)", "0 80px 80px -50px rgba(0,0,0,0.6)"],
  );

  return (
    <div ref={ref} className="relative" style={{ perspective: "1800px" }}>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-[8%] -top-8 bottom-10 -z-10 rounded-[40px] bg-brand/20 blur-[80px]"
        style={reduce ? undefined : { opacity: glow }}
      />
      <motion.div
        className="rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur will-change-transform sm:rounded-[20px] sm:p-2"
        style={
          reduce
            ? { boxShadow: "0 50px 120px -40px rgba(0,0,0,0.8)" }
            : { rotateX, scale, y, boxShadow: shadow, transformOrigin: "50% 0%" }
        }
      >
        <div className="overflow-hidden rounded-xl border border-white/10 sm:rounded-2xl">
          <img src={src} alt={alt} width={1920} height={1080} decoding="async" className="block h-auto w-full" />
        </div>
      </motion.div>
    </div>
  );
}
