"use client";

import "./blueprint.css";

/*
 * Blueprint horizon for the hero: the page's near-black, a hairline drafting grid that fades
 * out towards the edges, a glowing electric-blue horizon arc near the bottom (the planet below
 * it is the same near-black as the sections that follow, so the hero runs straight into them),
 * a faint beam from the top centre, and the railed frame with "+" marks used across the site.
 * Pure CSS: the only motion is a slow breathing of the glow, paused when the hero is covered
 * (PanelReveal sets data-paused on the pinned layer) and under reduced motion.
 */
export default function BlueprintField({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`bp ${className}`}>
      <div className="bp-grid" />
      <div className="bp-beam" />
      <div className="bp-bloom" />
      <div className="bp-planet" />
      <div className="bp-frame">
        <span className="bp-cross bp-cross-l" />
        <span className="bp-cross bp-cross-r" />
        <span className="bp-tag bp-tag-l">FIG 00 · PROGRAM</span>
        <span className="bp-tag bp-tag-r">REV A · LIVE</span>
      </div>
    </div>
  );
}
