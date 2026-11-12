/*
 * Which hero design the home page shows.
 *  - "blueprint": dark base, hairline grid, a glowing blue horizon arc and the railed frame
 *    the rest of the site uses (added 2026-11-12, on trial).
 *  - "ascii":     the original electric-blue ASCII sky (BlueAsciiField).
 *  - "shelf":     Theseus-style dark-gray wireframe parts shelves with a lit change trace,
 *    a hairline exploded phone and a bottom-left headline (added 2026-11-12, on trial).
 * To go back to the original, set this to "ascii". Nothing else needs to change.
 */
export const HERO_DESIGN: "blueprint" | "ascii" | "shelf" = "shelf";

/*
 * Colour of the ASCII hero (only used when HERO_DESIGN is "ascii").
 *  - "electric": the original saturated #0047FF sky with #0A46FF glyphs.
 *  - "brand":    the site's own #2F5BFF, a little deeper, with light-blue glyphs.
 *  - "midnight": a dark navy sky with soft blue glyphs, calmer.
 *  - "graphite": no blue, a silver sky with white glyphs.
 *  - "indigo":   a violet-leaning blue, close to the brand but richer.
 *  - "cyan":     a technical, blueprint cyan.
 *  - "ember":    safety orange, a hardware / shop-floor warmth.
 *  - "emerald":  a deep engineering green.
 *  - "teal":     blue-green, calm and technical.
 *  - "steel":    a muted blue-grey, like brushed metal.
 *  - "amber":    warm gold on black.
 * To go back to the original colour, set this to "electric".
 */
export type HeroTint = "electric" | "brand" | "midnight" | "graphite" | "indigo" | "cyan" | "ember" | "emerald" | "teal" | "steel" | "amber";
export const HERO_TINT: HeroTint = "electric";

/**
 * sky: colour the field ramps up to (sRGB 0-255); glyph: the characters' colour; gain: field brightness;
 * ink: optional multiplier on the characters' opacity (1 = as designed).
 */
export const HERO_TINTS: Record<HeroTint, { sky: [number, number, number]; glyph: [number, number, number]; gain: number; ink?: number }> = {
  electric: { sky: [0, 71, 255], glyph: [10, 70, 255], gain: 1 },
  brand: { sky: [47, 91, 255], glyph: [124, 155, 255], gain: 0.78 },
  midnight: { sky: [30, 58, 190], glyph: [96, 130, 255], gain: 0.6 },
  graphite: { sky: [150, 156, 170], glyph: [250, 251, 253], gain: 0.34, ink: 1.45 },
  indigo: { sky: [88, 70, 255], glyph: [170, 160, 255], gain: 0.7, ink: 1.15 },
  cyan: { sky: [0, 170, 230], glyph: [150, 230, 255], gain: 0.55, ink: 1.15 },
  ember: { sky: [255, 96, 20], glyph: [255, 180, 130], gain: 0.6, ink: 1.15 },
  emerald: { sky: [16, 185, 110], glyph: [170, 255, 210], gain: 0.5, ink: 1.25 },
  teal: { sky: [20, 160, 170], glyph: [170, 245, 245], gain: 0.5, ink: 1.25 },
  steel: { sky: [100, 135, 185], glyph: [215, 228, 245], gain: 0.45, ink: 1.35 },
  amber: { sky: [255, 170, 30], glyph: [255, 225, 160], gain: 0.42, ink: 1.3 },
};
