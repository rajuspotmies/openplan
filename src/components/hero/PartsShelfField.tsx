"use client";

import { useEffect, useRef } from "react";
import { ShelfGlow } from "./shelfGlow";
import "./shelf.css";

/*
 * Hero background: the ShelfGlow canvas engine (see shelfGlow.ts), a pointer-following light
 * over hairline hardware shelves, with a pan-tilt camera that aims at the pointer.
 */
export default function PartsShelfField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const glow = new ShelfGlow(el);
    return () => glow.destroy();
  }, []);
  return <div ref={ref} aria-hidden className={`shelf-glow ${className}`} />;
}
