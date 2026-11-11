"use client";

import { createElement, useEffect, useRef, type ElementType } from "react";

/*
 * Gradient → colour reveal.
 * When the text scrolls into view, all of it appears at once (a quick fade),
 * tinted with a flowing multi-colour gradient, and every character settles
 * into the element's normal text colour together, on an ease-out curve
 * (fast at first, gentle landing).
 * Reduced motion: plain text, no animation.
 *
 * Screen readers get the plain text from a visually hidden copy; the
 * per-character spans are aria-hidden.
 */

// Gradient stops (pink → violet → brand blue → amber → green)
const STOPS: [number, number, number][] = [
  [255, 92, 138],
  [168, 85, 247],
  [47, 91, 255],
  [245, 158, 11],
  [16, 185, 129],
];

const easeOut = (t: number) => 1 - (1 - t) ** 3;

const gradientAt = (u: number): [number, number, number] => {
  const x = (((u % 1) + 1) % 1) * STOPS.length;
  const i = Math.floor(x);
  const f = x - i;
  const a = STOPS[i % STOPS.length];
  const b = STOPS[(i + 1) % STOPS.length];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
};

const parseRGB = (color: string): [number, number, number] => {
  const m = color.match(/[\d.]+/g);
  return m ? [Number(m[0]), Number(m[1]), Number(m[2])] : [10, 10, 11];
};

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  /** seconds to wait after entering the viewport */
  delay?: number;
  /** seconds for the gradient to settle into the text colour */
  duration?: number;
};

const FADE_MS = 250;

export default function GradientReveal({ text, as = "span", className = "", delay = 0, duration = 0.9 }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const spans = Array.from(root.querySelectorAll<HTMLSpanElement>("[data-c]"));
    const N = spans.length;
    const clear = () => {
      root.style.opacity = "";
      spans.forEach((s) => (s.style.color = ""));
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      clear();
      return;
    }

    let raf = 0;
    let started = false;
    const final = parseRGB(getComputedStyle(root).color);
    const seed = Math.random();
    const settleMs = duration * 1000;

    // paint the initial gradient tint so the text never flashes in its final colour
    spans.forEach((s, i) => {
      const g = gradientAt(seed + i * 0.035);
      s.style.color = `rgb(${g.map(Math.round).join(", ")})`;
    });

    const run = () => {
      const start = performance.now() + delay * 1000;
      const tick = (now: number) => {
        const elapsed = now - start;
        // 1) everything fades in together
        root.style.opacity = String(Math.min(1, Math.max(0, elapsed / FADE_MS)));
        // 2) every character settles from the gradient into the text colour together (ease-out)
        const t = Math.min(1, Math.max(0, elapsed / settleMs));
        const k = easeOut(t); // 0 = gradient, 1 = settled
        const drift = now * 0.00035; // the gradient flows while it fades
        for (let i = 0; i < N; i++) {
          const g = gradientAt(seed + i * 0.035 + drift);
          const c = g.map((v, j) => Math.round(v + (final[j] - v) * k));
          spans[i].style.color = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
        }
        if (t < 1) raf = requestAnimationFrame(tick);
        else clear();
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          io.disconnect();
          run();
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(root);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [text, delay, duration]);

  // Words stay unbroken (inline-block); spaces stay as normal text so lines wrap naturally.
  const words = text.split(" ");
  const children = words.flatMap((word, wi) => {
    const w = (
      <span key={`w${wi}`} aria-hidden className="inline-block whitespace-nowrap">
        {Array.from(word).map((ch, ci) => (
          <span key={ci} data-c>
            {ch}
          </span>
        ))}
      </span>
    );
    return wi < words.length - 1 ? [w, " "] : [w];
  });

  return createElement(as, { ref, className, style: { opacity: 0 } }, [
    <span key="sr" className="sr-only">
      {text}
    </span>,
    ...children,
  ]);
}
