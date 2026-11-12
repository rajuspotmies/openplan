"use client";

import { useEffect, useRef, type ReactNode } from "react";

/*
 * Panel reveal: a light content area that opens out of the dark hero and closes
 * back into the dark section after it.
 *
 *  - The hero's background is pinned (sticky) while the hero copy scrolls away.
 *  - Opening: as the panel's top edge rises from the bottom of the viewport to the
 *    top, its clip-path goes from a narrower, dropped, rounded card
 *    (inset 40px / ~13.5vw sides / 64px radius) to full bleed, on an ease-in curve.
 *  - Closing: as the panel's bottom edge rises through the viewport, the clip grows
 *    back, so the panel narrows and its bottom corners round off, revealing the dark page.
 *
 * Only `clip-path` changes (written straight to the DOM, no re-renders), so sticky
 * children inside the panel keep working. Reduced motion: no clipping at all.
 */

const MAX_TOP = 40;
const MAX_RADIUS = 64;
const SIDE_RATIO = 260 / 1919; // side inset as a share of the viewport width
const MAX_SIDE = 260;

/**
 * Watches an element's page position without reading layout on scroll: it is measured once,
 * then again only when the page or the element changes size. Scroll frames just read scrollY.
 */
function trackGeometry(el: HTMLElement, onChange: () => void) {
  const g = { top: 0, height: 0 };
  const measure = () => {
    const r = el.getBoundingClientRect();
    g.top = r.top + window.scrollY;
    g.height = r.height;
    onChange();
  };
  measure();
  const ro = new ResizeObserver(measure);
  ro.observe(el);
  ro.observe(document.body); // content above loading in moves the panel
  window.addEventListener("resize", measure);
  return {
    g,
    stop: () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    },
  };
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeIn = (t: number) => t * t;

/**
 * The card's clip at a given closed-ness (0 = full bleed, 1 = closed card).
 * Phones get a slim inset: the desktop one (~13.5vw) would cut into 16px content padding.
 */
function clipFor(amount: number, vw: number, open: string) {
  if (amount < 0.001) return open;
  const phone = vw < 768;
  const side = (phone ? Math.min(12, vw * 0.03) : Math.min(MAX_SIDE, vw * SIDE_RATIO)) * amount;
  const top = (phone ? 24 : MAX_TOP) * amount;
  const radius = (phone ? 20 : Math.min(MAX_RADIUS, vw * 0.06)) * amount;
  return `inset(${top.toFixed(1)}px ${side.toFixed(1)}px 0px round ${radius.toFixed(1)}px)`;
}

/**
 * Viewport height that ignores the mobile URL bar showing and hiding (which fires
 * resize mid-scroll and would make the clip jump). Only a width change re-reads it.
 */
function stableViewport() {
  const v = { w: window.innerWidth, h: window.innerHeight };
  const onResize = () => {
    if (window.innerWidth !== v.w) {
      v.w = window.innerWidth;
      v.h = window.innerHeight;
    }
  };
  window.addEventListener("resize", onResize);
  return { v, stop: () => window.removeEventListener("resize", onResize) };
}

export default function PanelReveal({
  background,
  hero,
  children,
}: {
  /** Pinned behind the hero and visible around the panel while it opens. */
  background: ReactNode;
  hero: ReactNode;
  /** The light content area. */
  children: ReactNode;
}) {
  const bgRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    const bg = bgRef.current;
    if (!panel || !bg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let lastClip = "";
    const update = () => {
      frame = 0;
      const { w: vw, h: vh } = view.v;
      const rect = { top: geo.g.top - window.scrollY, bottom: geo.g.top + geo.g.height - window.scrollY };

      // 0 → closed card, 1 → full bleed
      const open = easeIn(clamp01((vh - rect.top) / vh));
      const close = easeIn(clamp01((vh - rect.bottom) / vh));
      const amount = Math.max(1 - open, close);
      const clip = clipFor(amount, vw, "inset(0px)");
      if (clip !== lastClip) {
        panel.style.clipPath = clip;
        lastClip = clip;
      }
      // Once the panel covers the screen, retire the pinned hero background so the
      // closing reveals the plain dark page instead of the hero again.
      // data-paused also tells animated backgrounds (BlueAsciiField) to stop drawing: a
      // sticky layer still counts as on screen for IntersectionObserver while covered.
      const covered = rect.top <= 0;
      bg.style.visibility = covered ? "hidden" : "visible";
      if (covered !== (bg.dataset.paused !== undefined)) {
        if (covered) bg.dataset.paused = "";
        else delete bg.dataset.paused;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const view = stableViewport();
    const geo = trackGeometry(panel, schedule); // re-measures as lazy content loads
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      geo.stop();
      view.stop();
      panel.style.clipPath = "";
      bg.style.visibility = "";
      delete bg.dataset.paused;
    };
  }, []);

  return (
    <div className="relative">
      {/* pinned hero background: takes no space in the flow */}
      <div ref={bgRef} aria-hidden className="sticky top-0 -mb-[100svh] h-[100svh] overflow-hidden bg-black">
        {background}
      </div>
      <div className="relative z-10">{hero}</div>
      <div ref={panelRef} className="relative z-10 will-change-[clip-path]">
        {children}
      </div>
    </div>
  );
}

/**
 * The same open/close clip as PanelReveal, for a light block between two dark sections
 * (no pinned background): it opens out of the dark section above as its top rises,
 * and narrows and rounds off onto the dark section below as its bottom leaves.
 */
export function PanelClip({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const panel = ref.current;
    if (!panel) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let lastClip = "";
    const update = () => {
      frame = 0;
      const { w: vw, h: vh } = view.v;
      const rect = { top: geo.g.top - window.scrollY, bottom: geo.g.top + geo.g.height - window.scrollY };
      const open = easeIn(clamp01((vh - rect.top) / vh));
      const close = easeIn(clamp01((vh - rect.bottom) / vh));
      const amount = Math.max(1 - open, close);
      const clip = clipFor(amount, vw, "none");
      if (clip !== lastClip) {
        panel.style.clipPath = clip;
        lastClip = clip;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const view = stableViewport();
    const geo = trackGeometry(panel, schedule);
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      geo.stop();
      view.stop();
      panel.style.clipPath = "";
    };
  }, []);
  return (
    <div ref={ref} className={`relative z-10 ${className}`}>
      {children}
    </div>
  );
}
