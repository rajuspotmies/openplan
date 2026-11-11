"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

/*
 * Gaussian-blur reveal: content comes into focus (blur 14px → 0), fades in and
 * rises slightly as it enters the viewport, on an expo-style ease-out curve.
 */
export const revealEase = [0.22, 1, 0.36, 1] as const;

type Props = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
  blur?: number;
  duration?: number;
};

export default function BlurReveal({ delay = 0, y = 18, blur = 14, duration = 0.9, children, ...rest }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y, filter: `blur(${blur}px)` }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration, ease: revealEase, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Splits a heading into words that blur into focus one after another. */
export function BlurWords({ text, className = "", delay = 0, stagger = 0.06 }: { text: string; className?: string; delay?: number; stagger?: number }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          aria-hidden
          className="inline-block"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: "0.35em", filter: "blur(12px)" }}
          whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "0px 0px -12% 0px" }}
          transition={{ duration: 0.9, ease: revealEase, delay: delay + i * stagger }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}
