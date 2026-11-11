// Lighting presets for the 3D scene.
export type LightMode = "day" | "dusk" | "studio";

interface Look {
  sun: { position: [number, number, number]; color: string; intensity: number };
  hemi: { sky: string; ground: string; intensity: number };
  fog: string;
  horizon: string;
  zenith: string;
  exposure: number;
  env: string[];
}

// Mars day is butterscotch; a Martian sunset is blue near the sun, because fine dust scatters blue light forward.
export const LOOKS: Record<LightMode, Look> = {
  day: {
    sun: { position: [6, 9, 4], color: "#fff0dc", intensity: 3.1 },
    hemi: { sky: "#f0c49b", ground: "#6e3a22", intensity: 0.75 },
    fog: "#d39a72",
    horizon: "#dca37c",
    zenith: "#a9775a",
    exposure: 1.0,
    env: ["#ffe2c4", "#c98a62", "#7a4a33"],
  },
  dusk: {
    sun: { position: [-9, 1.8, 3], color: "#bcd2ff", intensity: 2.4 },
    hemi: { sky: "#4a3a52", ground: "#24140f", intensity: 0.45 },
    fog: "#3b2e3d",
    horizon: "#6f86b8",
    zenith: "#1d1726",
    exposure: 1.15,
    env: ["#9fb7ff", "#5a4560", "#2a1a14"],
  },
  studio: {
    sun: { position: [4, 8, 6], color: "#ffffff", intensity: 2.6 },
    hemi: { sky: "#cfd8ea", ground: "#1a1d24", intensity: 0.5 },
    fog: "#0b0f17",
    horizon: "#121826",
    zenith: "#06080d",
    exposure: 1.0,
    env: ["#ffffff", "#8fa8d8", "#1c2230"],
  },
};
