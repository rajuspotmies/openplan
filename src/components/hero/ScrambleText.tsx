"use client";

import { useEffect, useState } from "react";

/*
 * Decodes text from random ASCII glyphs into the final string, left to right,
 * on an ease-in-out curve (slow start, quick middle, gentle landing).
 * Server render and screen readers always get the final text.
 */

const GLYPHS = "#%&*+=-<>/\\[]{}01";
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export default function ScrambleText({
  text,
  delay = 400,
  duration = 1100,
  className = "",
}: {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let lastSwap = 0;
    const startAt = performance.now() + delay;
    const random = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

    // first frame (t = 0) shows fully scrambled text; it decodes after `delay`
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - startAt) / duration));
      // swap glyphs at ~20fps so the noise reads as "computing", not flicker
      if (now - lastSwap > 50 || t === 1) {
        lastSwap = now;
        const revealed = Math.floor(easeInOutCubic(t) * text.length);
        setDisplay(
          text
            .split("")
            .map((c, i) => (i < revealed || c === " " ? c : random()))
            .join(""),
        );
      }
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, delay, duration]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{display}</span>
    </span>
  );
}
