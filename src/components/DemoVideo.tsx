import { useCallback, useEffect, useRef, useState } from "react";
import {
  easeInOut,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";

const VIDEO_SRC = "/openplan-concept.mp4";
const POSTER_SRC = "/openplan-concept-poster.jpg";

const formatTime = (t: number) => {
  if (!Number.isFinite(t) || t < 0) return "0:00";
  const m = Math.floor(t / 60);
  const sec = Math.floor(t % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const DemoVideo = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const reduceMotion = useReducedMotion();
  const [viewport, setViewport] = useState({ w: 1440, h: 900 });

  useEffect(() => {
    const update = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const isMobile = viewport.w < 768;

  // The section is much taller than the screen and its content is pinned. Scrolling through it:
  //   0.00-0.12  the title has finished revealing; nothing moves yet
  //   0.12-0.36  the title splits at "Open | Plan" and the small 16:9 video grows into the gap
  //   0.46-0.90  the video zooms to (almost) full screen, pushing the text off both sides
  //   0.90-1.00  hold, then the page scrolls on to the next section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const smallWidth = isMobile
    ? viewport.w * 0.3
    : Math.min(viewport.w * 0.2, 320);
  // The frame is always exactly 16:9 (height follows width), so the film is never cropped
  // or stretched. It ends at 96% of the width, or 80% of the height if that is smaller.
  const endWidth = Math.max(
    smallWidth,
    Math.min(viewport.w * 0.96, ((viewport.h * 0.8) / 9) * 16),
  );
  const gap = isMobile ? 8 : 20;
  const stops = [0, 0.12, 0.36, 0.46, 0.9, 1];
  const slotWidth = useTransform(
    scrollYProgress,
    stops,
    [0, 0, smallWidth, smallWidth, endWidth, endWidth],
    { ease: easeInOut },
  );
  const slotMargin = useTransform(
    scrollYProgress,
    stops,
    [0, 0, gap, gap, 0, 0],
    { ease: easeInOut },
  );
  // "Why Open" and "Plan exists ?" have different widths, so a centred row would leave the video
  // off-centre. Shift the row by half the difference, as the video grows, to centre the video.
  const leftTextRef = useRef<HTMLDivElement | null>(null);
  const rightTextRef = useRef<HTMLDivElement | null>(null);
  const [centerShift, setCenterShift] = useState(0);
  useEffect(() => {
    const measure = () => {
      const left = leftTextRef.current?.offsetWidth ?? 0;
      const right = rightTextRef.current?.offsetWidth ?? 0;
      setCenterShift((right - left) / 2);
    };
    measure();
    void document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [viewport.w]);
  const rowX = useTransform(
    scrollYProgress,
    [0, 0.12, 0.36, 1],
    [0, 0, centerShift, centerShift],
    { ease: easeInOut },
  );
  // Opacity is computed from the live scroll value with function transforms. (Range-based
  // opacity transforms get offloaded to a browser scroll timeline that measures the section
  // once; when content above changes height after load, that mapping goes stale and the
  // video fades back out while it grows.)
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  const videoOpacity = useTransform(scrollYProgress, (v) => clamp01((v - 0.12) / 0.08));
  const textOpacity = useTransform(scrollYProgress, (v) => 1 - clamp01((v - 0.4) / 0.22));

  // Title words fade/blur in one after another when the section first comes into view
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const titleInView = useInView(stickyRef, { amount: 0.6 });

  // ── Guided scrolling ──
  // Left alone, the section moves itself along: title -> small video (after ~5.5s idle) ->
  // full-size playing video (after ~7.5s idle). Clicking the small video jumps to full size.
  // Any wheel / touch / key / mouse input cancels the motion straight away.
  const animatingRef = useRef(false);
  const cancelAnimRef = useRef<(() => void) | null>(null);
  const idleTimerRef = useRef<number | undefined>(undefined);
  const scheduleAutoRef = useRef<() => void>(() => {});

  const yForProgress = (pr: number) => {
    const el = sectionRef.current;
    if (!el) return window.scrollY;
    const top = el.getBoundingClientRect().top + window.scrollY;
    return top + pr * (el.offsetHeight - window.innerHeight);
  };

  const scrollToProgress = useCallback(
    (pr: number, msPerPx: number, minMs = 1600, maxMs = 4500) => {
      cancelAnimRef.current?.();
      const from = window.scrollY;
      const to = yForProgress(pr);
      const distance = Math.abs(to - from);
      if (distance < 2) return;
      const duration = Math.min(maxMs, Math.max(minMs, distance * msPerPx));
      const ease = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const start = performance.now();
      let raf = 0;
      animatingRef.current = true;

      const inputEvents = [
        "wheel",
        "touchstart",
        "keydown",
        "pointerdown",
      ] as const;
      const stop = () => {
        cancelAnimationFrame(raf);
        inputEvents.forEach((e) => window.removeEventListener(e, stop));
        animatingRef.current = false;
        cancelAnimRef.current = null;
        scheduleAutoRef.current();
      };
      inputEvents.forEach((e) =>
        window.addEventListener(e, stop, { passive: true }),
      );
      cancelAnimRef.current = stop;

      const step = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        window.scrollTo(0, from + (to - from) * ease(t));
        if (t < 1) raf = requestAnimationFrame(step);
        else stop();
      };
      raf = requestAnimationFrame(step);
    },
    [],
  );

  const scheduleAuto = useCallback(() => {
    window.clearTimeout(idleTimerRef.current);
    const el = sectionRef.current;
    if (reduceMotion || animatingRef.current || !el) return;
    const rect = el.getBoundingClientRect();
    const engaged =
      rect.top <= window.innerHeight * 0.4 &&
      rect.bottom > window.innerHeight * 0.6;
    if (!engaged) return;
    const p = scrollYProgress.get();
    if (p < 0.12) {
      idleTimerRef.current = window.setTimeout(
        () => scrollToProgress(0.36, 1.2),
        5500,
      );
    } else if (p < 0.46) {
      idleTimerRef.current = window.setTimeout(
        () => scrollToProgress(0.9, 1.8),
        7500,
      );
    }
  }, [reduceMotion, scrollYProgress, scrollToProgress]);
  scheduleAutoRef.current = scheduleAuto;

  useEffect(() => {
    // The auto-advance is an idle timer, so it only needs checking once scrolling pauses:
    // debounce it rather than reading layout on every scroll event.
    let settle = 0;
    const onScroll = () => {
      window.clearTimeout(idleTimerRef.current);
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        if (!animatingRef.current) scheduleAuto();
      }, 150);
    };
    scheduleAuto();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(idleTimerRef.current);
      cancelAnimRef.current?.();
    };
  }, [scheduleAuto]);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const frameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sync = () =>
      setFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  // Fullscreen the whole frame (not the <video>) so our controls stay visible
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void frameRef.current?.requestFullscreen?.();
  };

  // ── Scroll-driven playback ──
  // Plays (with sound) once the video has zoomed in past the halfway point and is on screen;
  // pauses + mutes when it shrinks back or leaves the screen; plays again when it returns.
  const inViewRef = useRef(false);
  const expandedRef = useRef(false);
  const stoppedByUserRef = useRef(false); // manual pause, or the film finished
  const userMutedRef = useRef(false); // the viewer pressed mute; scrolling never overrides it
  const [needsGesture, setNeedsGesture] = useState(false);

  const autoPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !video.paused) return;
    video.muted = userMutedRef.current;
    setMuted(userMutedRef.current);
    try {
      await video.play();
    } catch {
      // Browsers block sound until the viewer has clicked/tapped the page: fall back to muted
      video.muted = true;
      setMuted(true);
      setNeedsGesture(true);
      try {
        await video.play();
      } catch {
        /* still blocked: the viewer can press play */
      }
    }
  }, []);

  const autoPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.muted = true;
    setMuted(true);
  }, []);

  const evaluate = useCallback(() => {
    if (inViewRef.current && expandedRef.current) {
      if (!stoppedByUserRef.current) void autoPlay();
    } else {
      if (!inViewRef.current) stoppedByUserRef.current = false; // fresh start next time
      autoPause();
    }
  }, [autoPlay, autoPause]);

  const [controlsOn, setControlsOn] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const expanded = v > 0.5;
    if (expanded !== expandedRef.current) {
      expandedRef.current = expanded;
      evaluate();
    }
    const showControls = v > 0.8;
    setControlsOn((prev) => (prev === showControls ? prev : showControls));
  });

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.intersectionRatio > 0.2;
        if (visible === inViewRef.current) return;
        inViewRef.current = visible;
        evaluate();
      },
      { threshold: [0, 0.2, 0.4] },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [evaluate]);

  // First click / tap / key press anywhere unlocks sound if we had to start muted
  useEffect(() => {
    if (!needsGesture) return;
    const unlock = (e: Event) => {
      // a press on the player is handled by its own buttons: unmuting here as well made the
      // mute button flip the sound twice, so its first press looked like it did nothing
      if (e.target instanceof Node && frameRef.current?.contains(e.target)) return;
      const video = videoRef.current;
      if (video && !video.paused && inViewRef.current && !userMutedRef.current) {
        video.muted = false;
        setMuted(false);
      }
      setNeedsGesture(false);
    };
    const events = ["pointerdown", "keydown", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, unlock, { once: true }));
    return () => events.forEach((e) => window.removeEventListener(e, unlock));
  }, [needsGesture]);

  // ── Ambient glow ──
  const glowRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!playing) return;
    const canvas = glowRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const draw = () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    };
    draw();
    const id = window.setInterval(draw, 90);
    return () => window.clearInterval(id);
  }, [playing]);

  // ── Scrubber ──
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [dragTime, setDragTime] = useState<number | null>(null);
  const displayTime = dragTime ?? currentTime;
  const progress = duration > 0 ? Math.min(displayTime / duration, 1) : 0;

  // Smooth progress while playing (timeupdate alone only fires a few times a second)
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const video = videoRef.current;
      if (video && !draggingRef.current) setCurrentTime(video.currentTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  // the metadata can load before React attaches onLoadedMetadata (cached video): read it once
  useEffect(() => {
    const video = videoRef.current;
    if (video && video.readyState >= 1 && Number.isFinite(video.duration)) setDuration(video.duration);
  }, []);

  const timeFromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || duration <= 0) return 0;
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    return ratio * duration;
  };

  const onScrubDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    setDragTime(timeFromPointer(e.clientX));
  };

  const onScrubMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) setDragTime(timeFromPointer(e.clientX));
  };

  const onScrubUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const t = timeFromPointer(e.clientX);
    if (videoRef.current) videoRef.current.currentTime = t;
    setCurrentTime(t);
    setDragTime(null);
  };

  const onScrubKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const step = e.key === "ArrowRight" ? 5 : e.key === "ArrowLeft" ? -5 : 0;
    if (!step) return;
    e.preventDefault();
    video.currentTime = Math.min(
      Math.max(video.currentTime + step, 0),
      duration,
    );
    setCurrentTime(video.currentTime);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      stoppedByUserRef.current = false;
      // a press is a user gesture, so sound is allowed: restore the viewer’s own choice
      video.muted = userMutedRef.current;
      setMuted(userMutedRef.current);
      setNeedsGesture(false);
      void video.play();
    } else {
      stoppedByUserRef.current = true;
      video.pause();
    }
  };

  // ── Control visibility ──
  // Shown while the pointer is over the video; hidden 1.5s after it leaves (3s after a touch)
  const [controlsShown, setControlsShown] = useState(false);
  const hideTimerRef = useRef<number | undefined>(undefined);
  const lastPointerRef = useRef<string>("mouse");

  const showControls = (e?: React.PointerEvent) => {
    if (e) lastPointerRef.current = e.pointerType;
    window.clearTimeout(hideTimerRef.current);
    setControlsShown(true);
  };

  const hideControlsSoon = () => {
    window.clearTimeout(hideTimerRef.current);
    const delay = lastPointerRef.current === "touch" ? 3000 : 1500;
    hideTimerRef.current = window.setTimeout(
      () => setControlsShown(false),
      delay,
    );
  };

  useEffect(() => () => window.clearTimeout(hideTimerRef.current), []);

  // While the video is still small, a click zooms it to full size instead of toggling playback
  const onFrameClick = () => {
    if (!reduceMotion && scrollYProgress.get() < 0.5)
      scrollToProgress(0.9, 0.2, 200, 400);
    else togglePlay();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    userMutedRef.current = video.muted;
    setMuted(video.muted);
    setNeedsGesture(false);
  };

  const controlClass =
    "flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white";

  const frameStyle = reduceMotion
    ? { width: "min(92vw, 64rem)", aspectRatio: "16 / 9" }
    : {
        width: slotWidth,
        marginInline: slotMargin,
        opacity: videoOpacity,
        aspectRatio: "16 / 9",
      };

  const wordClass = "inline-block will-change-[opacity,filter,transform]";
  // Words re-run their fade/blur reveal every time the section scrolls into view, and reset
  // quickly when it leaves so the next visit starts from a clean slate
  const wordMotion = (i: number) => ({
    initial: { opacity: 0, filter: "blur(14px)", y: 14 },
    animate: titleInView
      ? { opacity: 1, filter: "blur(0px)", y: 0 }
      : { opacity: 0, filter: "blur(14px)", y: 14 },
    transition: titleInView
      ? {
          duration: 0.8,
          delay: i * 0.22,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        }
      : { duration: 0.25 },
  });

  const frame = (
    <motion.div
      ref={frameRef}
      style={frameStyle}
      onPointerEnter={showControls}
      onPointerMove={showControls}
      onPointerLeave={hideControlsSoon}
      onFocusCapture={(e) => {
        if (e.target.matches(":focus-visible")) showControls();
      }}
      onBlurCapture={hideControlsSoon}
      className="group relative shrink-0"
    >
      {/* Ambient glow: a tiny copy of the current video frame, blown up and blurred behind the
          frame, so the light around it follows the picture while it plays */}
      <canvas
        ref={glowRef}
        width={64}
        height={36}
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[109%] w-[109%] -translate-x-1/2 -translate-y-1/2 rounded-3xl blur-[60px] saturate-[1.6] transition-opacity duration-700 group-[:fullscreen]:hidden ${
          playing ? "opacity-35" : "opacity-0"
        }`}
      />
      <div
        className={`relative h-full w-full overflow-hidden rounded-2xl border border-[#1e2f47] bg-black transition-shadow duration-700 group-[:fullscreen]:!rounded-none ${
          playing ? "shadow-none" : "shadow-2xl shadow-[#4a74b0]/10"
        }`}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover group-[:fullscreen]:object-contain"
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          preload="metadata"
          playsInline
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => {
            if (!draggingRef.current)
              setCurrentTime(e.currentTarget.currentTime);
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            stoppedByUserRef.current = true;
            setPlaying(false);
          }}
        />

        {/* Click anywhere on the video to play / pause */}
        <button
          type="button"
          onClick={onFrameClick}
          aria-label={playing ? "Pause video" : "Play video"}
          className="absolute inset-0 flex h-full w-full items-center justify-center focus:outline-none"
        >
          {!playing && (
            <span className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-white/90 text-[#0A0A0B] shadow-lg transition-transform hover:scale-110">
              <Play
                className="ml-1 h-7 w-7 md:h-8 md:w-8"
                fill="currentColor"
              />
            </span>
          )}
        </button>

        <div
          className={`absolute bottom-3 left-3 right-3 flex items-center gap-2 transition-opacity ${
            (controlsOn || reduceMotion) && controlsShown
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause video" : "Play video"}
            className={controlClass}
          >
            {playing ? (
              <Pause className="h-5 w-5" fill="currentColor" />
            ) : (
              <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
            )}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute video" : "Mute video"}
            className={controlClass}
          >
            {muted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-black/60 px-4 backdrop-blur h-10">
            <span className="hidden min-w-[2.75rem] whitespace-nowrap text-right font-mono text-[12px] tabular-nums tracking-[0.02em] text-white sm:block">
              {formatTime(displayTime)}
            </span>
            <div
              ref={trackRef}
              role="slider"
              tabIndex={0}
              aria-label="Seek video"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(displayTime)}
              aria-valuetext={`${formatTime(displayTime)} of ${formatTime(duration)}`}
              onPointerDown={onScrubDown}
              onPointerMove={onScrubMove}
              onPointerUp={onScrubUp}
              onPointerCancel={onScrubUp}
              onKeyDown={onScrubKey}
              className="group/scrub relative flex h-6 flex-1 cursor-pointer touch-none items-center focus:outline-none"
            >
              <div className="relative h-1 w-full rounded-full bg-white/25 transition-[height] group-hover/scrub:h-1.5 group-focus-visible/scrub:h-1.5">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-white"
                  style={{ width: `${progress * 100}%` }}
                />
                <div
                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow transition-transform group-hover/scrub:scale-125"
                  style={{ left: `${progress * 100}%` }}
                />
              </div>
            </div>
            <span className="hidden min-w-[2.75rem] whitespace-nowrap font-mono text-[12px] tabular-nums tracking-[0.02em] text-white/60 sm:block">
              {formatTime(duration)}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? "Exit full screen" : "Full screen"}
            className={controlClass}
          >
            {fullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </button>
        </div>

        {playing && muted && (
          <button
            type="button"
            onClick={toggleMute}
            className="absolute right-3 top-3 inline-flex items-center gap-2 whitespace-nowrap bg-white/90 px-3.5 py-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.1em] text-[#0A0A0B] shadow-lg transition-colors hover:bg-white"
          >
            <VolumeX className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            Unmute
          </button>
        )}
      </div>
    </motion.div>
  );

  return (
    <section
      ref={sectionRef}
      id="demo"
      className={
        reduceMotion
          ? "relative z-10 py-16 md:py-24"
          : // Sits under the light panel above, which closes (narrows and rounds) onto it
            "relative z-10 h-[420vh] md:h-[480vh]"
      }
      style={{ backgroundColor: "#0A0A0B" }}
    >
      <div
        ref={stickyRef}
        className={
          reduceMotion
            ? "relative flex flex-col items-center px-4 sm:px-6"
            : "sticky top-0 flex h-screen items-center justify-center overflow-hidden"
        }
      >
        {reduceMotion ? (
          <>
            <h2 className="mb-8 text-center font-sans text-3xl font-medium tracking-[-0.045em] text-white md:text-5xl">
              Why OpenPlan exists ?
            </h2>
            {frame}
          </>
        ) : (
          <>
            <h2 className="sr-only">Why OpenPlan exists ?</h2>
            {/* Title split around the video: "Why Open" [video] "Plan exists ?" */}
            <motion.div
              aria-hidden
              style={{ x: rowX }}
              className="flex items-center justify-center whitespace-nowrap font-sans font-medium tracking-[-0.045em] leading-none text-white text-[clamp(1.4rem,6.4vw,2.5rem)] md:text-[clamp(3rem,6.5vw,5.5rem)]"
            >
              <motion.div
                ref={leftTextRef}
                style={{ opacity: textOpacity }}
                className="flex shrink-0 gap-[0.28em]"
              >
                <motion.span className={wordClass} {...wordMotion(0)}>
                  Why
                </motion.span>
                <motion.span className={wordClass} {...wordMotion(1)}>
                  Open
                </motion.span>
              </motion.div>

              {frame}

              <motion.div
                ref={rightTextRef}
                style={{ opacity: textOpacity }}
                className="flex shrink-0 gap-[0.28em]"
              >
                <motion.span className={wordClass} {...wordMotion(2)}>
                  Plan
                </motion.span>
                <motion.span className={wordClass} {...wordMotion(3)}>
                  exists
                </motion.span>
                <motion.span className={wordClass} {...wordMotion(4)}>
                  ?
                </motion.span>
              </motion.div>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
};

export default DemoVideo;
