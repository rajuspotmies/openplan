import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter Tight", "Inter", "Helvetica Neue", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },


      /* ---------------- COLORS (PURE NEUTRAL – NO BLUE) ---------------- */
      colors: {
        /* Brand palette: black ~35%, white ~65%, electric blue ~10% */
        brand: {
          DEFAULT: "#2F5BFF",
          hover: "#2448E6",
          light: "#7C9BFF",
          ink: "rgb(var(--c-ink) / <alpha-value>)",
        },
        /* Base. white, black, ink and the neutral scale read CSS variables so the dark theme can
           swap them inside light surfaces (see "Themes" in globals.css). */
        white: "rgb(var(--c-white) / <alpha-value>)",
        black: "rgb(var(--c-black) / <alpha-value>)",
        neutral: Object.fromEntries(
          [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((k) => [k, `rgb(var(--c-n${k}) / <alpha-value>)`]),
        ),
        background: "#0A0A0B",
        foreground: "#FFFFFF",

        /* Borders & Inputs */
        border: "#26262B",
        input: "#26262B",
        ring: "#2F5BFF",

        /* Primary Button (WHITE) */
        primary: {
          DEFAULT: "#FFFFFF",     // always white
          foreground: "#000000",
        },



        /* Secondary Button (OUTLINE) */
        secondary: {
          DEFAULT: "rgba(255,255,255,0.05)",
          foreground: "#FFFFFF",
        },

        /* Muted / Subtext (FIXED – NO BLUE) */
        muted: {
          DEFAULT: "#0A0A0B",
          foreground: "#9CA3AF",
        },

        /* Accent (NEUTRAL, NOT BLUE) */
        accent: {
          DEFAULT: "#1A1A1A",
          foreground: "#E5E7EB",
        },

        /* Cards / Sections (FIXED – NO BLUE) */
        card: {
          DEFAULT: "#0A0A0B",
          foreground: "#E5E7EB",
        },

        /* Destructive */
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },

        /* Industry (NEUTRALIZED) */
        industry: {
          auto: "#0A0A0B",
          aerospace: "#0A0A0B",
          pharma: "#0A0A0B",
          media: "#0A0A0B",
        },
      },

      /* ---------------- BACKGROUND IMAGES (BLUE REMOVED) ---------------- */
      backgroundImage: {
        /* ❌ Removed blue gradients completely */
        "gradient-hero": "none",
        "gradient-primary": "none",
        "gradient-secondary": "none",

        /* Optional hover glow (neutral, safe) */
        "hover-glow":
          "radial-gradient(80% 40% at 50% -10%, rgba(255,255,255,0.06), transparent 60%)",
      },

      /* ---------------- SHADOWS ---------------- */
      boxShadow: {
        glow: "0 0 40px rgba(255,255,255,0.06)",
        card: "0 20px 40px rgba(0,0,0,0.7)",
        elevated: "0 30px 60px rgba(0,0,0,0.85)",
      },

      /* ---------------- TRANSITIONS ---------------- */
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      /* ---------------- RADIUS ---------------- */
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
      },

      /* ---------------- ANIMATIONS ---------------- */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
