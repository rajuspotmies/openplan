"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** data-reveal="pending" → "shown" the first time the element scrolls into view. */
export function useReveal<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.dataset.reveal = "shown";
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/** True while the element is on screen. */
export function useOnScreen<T extends Element>(ref: RefObject<T | null>, margin = "0px") {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return on;
}

export function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setR(m.matches);
    set();
    m.addEventListener("change", set);
    return () => m.removeEventListener("change", set);
  }, []);
  return r;
}

/**
 * A value that follows `target` with an exponential ease (rate per second), re-rendering
 * only while it moves.
 */
export function useFollow(target: number, rate = 7, instant = false) {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    if (instant) {
      cur.current = target;
      return;
    }
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      const k = 1 - Math.exp(-rate * dt);
      cur.current += (target - cur.current) * k;
      if (Math.abs(target - cur.current) < 0.001) cur.current = target;
      setV(cur.current);
      if (cur.current !== target) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, rate, instant]);
  return instant ? target : v;
}
