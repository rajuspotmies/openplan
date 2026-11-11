import React, { memo, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useMotionValue,
  animate,
  motion,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "framer-motion";

export type Logo = {
  src: string;
  alt: string;
  href?: string;
  /** Optional wordmark rendered next to icon-only logos */
  label?: string;
  className?: string;
};

type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  pauseOnHover?: boolean;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  className?: string;
};

const useElementSize = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
};

const InfiniteSlider = memo(function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  pauseOnHover = false,
  direction = "horizontal",
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();
  const translation = useMotionValue(0);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  const isHoveredRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const size = direction === "horizontal" ? width : height;
    const contentSize = size + gap;
    const from = reverse ? -contentSize / 2 : 0;
    const to = reverse ? 0 : -contentSize / 2;

    const controls = animate(translation, [from, to], {
      ease: "linear",
      duration,
      repeat: Infinity,
      repeatType: "loop",
      repeatDelay: 0,
      onRepeat: () => translation.set(from),
    });
    controlsRef.current = controls;
    // A resize restarts the loop; stay paused if the pointer is still over it
    if (isHoveredRef.current) controls.pause();

    return () => {
      controls.stop();
      controlsRef.current = null;
    };
  }, [translation, duration, width, height, gap, direction, reverse, prefersReducedMotion]);

  const hoverProps = pauseOnHover
    ? {
        onHoverStart: () => {
          isHoveredRef.current = true;
          controlsRef.current?.pause();
        },
        onHoverEnd: () => {
          isHoveredRef.current = false;
          controlsRef.current?.play();
        },
      }
    : {};

  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        ref={ref}
        className="flex w-max items-center"
        style={{
          ...(direction === "horizontal"
            ? { x: translation }
            : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === "horizontal" ? "row" : "column",
        }}
        {...hoverProps}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
});

type Tone = "dark" | "light";

const LogoItem = memo(function LogoItem({ logo, tone }: { logo: Logo; tone: Tone }) {
  const content = (
    <span className="group flex shrink-0 items-center gap-2 opacity-60 transition-opacity duration-300 hover:opacity-100">
      <img
        alt={logo.alt}
        src={logo.src}
        loading="lazy"
        draggable={false}
        className={cn(
          "pointer-events-none h-5 w-auto select-none brightness-0 transition-[filter] duration-300 group-hover:brightness-100 group-hover:invert-0 sm:h-6 md:h-7",
          tone === "dark" && "invert",
          logo.className,
        )}
      />
      {logo.label && (
        <span
          className={cn(
            "select-none text-sm font-semibold tracking-[0.18em] sm:text-base md:text-lg",
            tone === "dark" ? "text-white" : "text-black",
          )}
        >
          {logo.label}
        </span>
      )}
    </span>
  );

  if (!logo.href) return content;

  return (
    <a
      href={logo.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={logo.alt}
      className="shrink-0"
    >
      {content}
    </a>
  );
});

export const LogoMarquee = memo(function LogoMarquee({
  logos,
  className,
  tone = "dark",
}: {
  logos: Logo[];
  className?: string;
  /** "dark" = white logos for dark backgrounds, "light" = black logos for light backgrounds */
  tone?: Tone;
}) {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "max-w-7xl mx-auto overflow-hidden py-3 md:py-4",
        "[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
        "md:[mask-image:linear-gradient(to_right,transparent,black_25%,black_75%,transparent)]",
        className,
      )}
    >
      <InfiniteSlider gap={isMobile ? 36 : 56} duration={isMobile ? 55 : 80} pauseOnHover>
        {[...logos, ...logos].map((logo, i) => (
          <LogoItem key={`${logo.alt}-${i}`} logo={logo} tone={tone} />
        ))}
      </InfiniteSlider>
    </div>
  );
});

LogoMarquee.displayName = "LogoMarquee";
export default LogoMarquee;
