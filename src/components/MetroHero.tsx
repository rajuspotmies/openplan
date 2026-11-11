import { useEffect, useRef, useState } from "react";
import { buildTimeMap, clamp, progressToTime, type TimeMap } from "@/lib/scrubTimeMap";

// ─────────────────────────────────────────────────────────────
// THE CITY OPENS — locked scroll-scrub video hero
// The page cannot move while this is active — body is pinned
// with position:fixed (the same bulletproof technique modal
// libraries use; plain overflow:hidden alone isn't reliable
// across browsers). Wheel/touch input is captured and used
// purely to drive video.currentTime, forward and backward. Once
// the video reaches the end and the user keeps pushing forward,
// the page unlocks and continues normally — and re-locks if they
// scroll back up into it. No dependencies, system fonts only.
// ─────────────────────────────────────────────────────────────

export interface MetroHeroProps {
  videoSrc?: string;
  /** Total input distance (px) needed to scrub the full video. Tune to taste. */
  scrubDistance?: number;
  /** Video timestamps (seconds) the scrub should slow down around, e.g. where a label's motion graphic needs to read. */
  slowPoints?: number[];
  /** How wide (seconds, roughly one standard deviation) each slow zone is around its point. */
  slowZoneWidth?: number;
  /** How much the scroll-to-video speed drops at the center of a zone: 0 = no slowdown, 1 = fully stalls. */
  slowZoneStrength?: number;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_VIDEO = "/test-video.MP4";
// Exploded-view rover labels — camera dwells here so each part's callout has time to read.
const DEFAULT_SLOW_POINTS = [5.0, 6.85, 8.15];

const COL_BG = "#05070d";

export default function MetroHero({
  videoSrc = DEFAULT_VIDEO,
  scrubDistance = 3200,
  slowPoints = DEFAULT_SLOW_POINTS,
  slowZoneWidth = 0.3,
  slowZoneStrength = 0.72,
  className,
  style,
}: MetroHeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let duration = 0;
    let rafId = 0;
    let targetProgress = 0;
    let currentProgress = 0;
    let isSeeking = false;
    let pendingTime: number | null = null;
    let locked = false;
    let lockedScrollY = 0;
    let touchStartY = 0;
    let timeMap: TimeMap | null = null;

    const onLoadedData = () => {
      duration = video.duration || 0;
      timeMap = buildTimeMap(duration, slowPoints, slowZoneWidth, slowZoneStrength);
      setReady(true);
      if (reduceMotion) {
        video.currentTime = duration * 0.92;
      }
    };
    video.addEventListener("loadeddata", onLoadedData);

    // iOS Safari often won't buffer any video data — even with
    // preload="auto" — until playback actually starts, to save mobile
    // data. Since we only ever seek (never call play() elsewhere), the
    // video can stay permanently blank on iPhone. Force a silent
    // play-then-immediately-pause on mount to kick off real loading.
    const kickstartLoad = () => {
      const p = video.play();
      if (p && typeof p.then === "function") {
        p.then(() => video.pause()).catch(() => {});
      } else {
        video.pause();
      }
    };
    kickstartLoad();

    const onSeeked = () => {
      isSeeking = false;
      if (pendingTime !== null) {
        const t = pendingTime;
        pendingTime = null;
        isSeeking = true;
        video.currentTime = t;
      }
    };
    video.addEventListener("seeked", onSeeked);

    function seekTo(t: number) {
      if (isSeeking) {
        pendingTime = t;
        return;
      }
      isSeeking = true;
      video!.currentTime = t;
    }

    // Locked for the entire lifetime of this component — there is no
    // release valve in either direction. Scroll input only ever moves
    // the video back and forth; the page itself never moves.
    function engageLock() {
      if (locked || typeof document === "undefined") return;
      locked = true;
      lockedScrollY = window.scrollY;
      const b = document.body.style;
      b.position = "fixed";
      b.top = `-${lockedScrollY}px`;
      b.left = "0";
      b.right = "0";
      b.width = "100%";
      b.height = "100%";
      b.overscrollBehavior = "none";
    }

    function releaseLock() {
      if (!locked || typeof document === "undefined") return;
      locked = false;
      const y = lockedScrollY;
      const b = document.body.style;
      b.position = "";
      b.top = "";
      b.left = "";
      b.right = "";
      b.width = "";
      b.height = "";
      b.overscrollBehavior = "";
      window.scrollTo(0, y);
    }

    engageLock();

    function addDelta(deltaY: number) {
      const next = clamp(targetProgress + deltaY / scrubDistance, 0, 1);
      targetProgress = next;
      return true;
    }

    const onWheel = (e: WheelEvent) => {
      addDelta(e.deltaY);
      e.preventDefault();
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? touchStartY;
      const deltaY = touchStartY - y;
      touchStartY = y;
      addDelta(deltaY);
      e.preventDefault();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    // Also bind directly on the element itself, with capture — on some
    // iOS versions a window-level listener alone can lose the race
    // against the browser's own native scroll handling.
    section.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    section.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });

    function frame() {
      currentProgress += (targetProgress - currentProgress) * 0.18;

      if (duration > 0) {
        seekTo(progressToTime(currentProgress, timeMap));
      }

      if (videoRef.current) {
        const scale = 1 + currentProgress * 0.06;
        videoRef.current.style.transform = `scale(${scale})`;
      }
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${currentProgress})`;
      }

      rafId = requestAnimationFrame(frame);
    }

    if (!reduceMotion) {
      rafId = requestAnimationFrame(frame);
    }

    return () => {
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("seeked", onSeeked);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      section.removeEventListener("touchstart", onTouchStart, true);
      section.removeEventListener("touchmove", onTouchMove, true);
      cancelAnimationFrame(rafId);
      releaseLock();
    };
  }, [scrubDistance, slowPoints, slowZoneWidth, slowZoneStrength]);

  return (
    <div
      ref={sectionRef}
      className={className}
      style={{
        position: "relative",
        height: "100dvh",
        width: "100%",
        overflow: "hidden",
        background: COL_BG,
        touchAction: "none",
        ...style,
      }}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        preload="auto"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: ready ? 1 : 0,
          transformOrigin: "center center",
          willChange: "transform",
          transition: "opacity 0.6s ease",
          touchAction: "none",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(5,7,13,0.35), rgba(5,7,13,0) 30%, rgba(5,7,13,0.15) 70%, rgba(5,7,13,0.55))",
          pointerEvents: "none",
        }}
      />

      {/* Thin progress line — fills as the video advances. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 2,
          background: "rgba(255,255,255,0.12)",
        }}
      >
        <div
          ref={progressBarRef}
          style={{
            height: "100%",
            width: "100%",
            background: "linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.95))",
            transform: "scaleX(0)",
            transformOrigin: "left center",
          }}
        />
      </div>
    </div>
  );
}
