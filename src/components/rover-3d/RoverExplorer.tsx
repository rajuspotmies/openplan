import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { ASSEMBLIES, BY_ID, END, ORDER, activeAt, outAt, shareOf, type AssemblyId } from "./data";
import Rover, { type Live } from "./Rover";
import { CameraRig, Lighting } from "./Scene";
import type { LightMode } from "./looks";
import { ArrowDown, ArrowLeft, ChevronDown, Gamepad2, Moon, MousePointer2, MousePointerClick, Move3d, Pause, Play, RotateCcw, ScanEye, Sun, Warehouse } from "lucide-react";
import { freshDrive, stepDrive } from "./drive";
import DriveHud, { type HudHandle } from "./DriveHud";
import "./rover3d.css";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const LIGHTS = [
  { mode: "day" as const, label: "Mars day", Icon: Sun },
  { mode: "dusk" as const, label: "Blue sunset", Icon: Moon },
  { mode: "studio" as const, label: "Studio", Icon: Warehouse },
];
const ignore = () => {};
const num = (id: AssemblyId) => String(ORDER.indexOf(id) + 1).padStart(2, "0");

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

const KEYS = {
  up: ["KeyW", "ArrowUp"],
  down: ["KeyS", "ArrowDown"],
  left: ["KeyA", "ArrowLeft"],
  right: ["KeyD", "ArrowRight"],
};
const DRIVE_CODES = new Set([...KEYS.up, ...KEYS.down, ...KEYS.left, ...KEYS.right, "Space"]);

// The render loop's first step: eases the scroll progress (or, while driving, puts the rover back
// together and steps the drive physics from the keys held), then hands the frame to the overlay.
function Driver({
  live,
  target,
  keys,
  boost,
  onFrame,
}: {
  live: React.MutableRefObject<Live>;
  target: React.MutableRefObject<number>;
  keys: React.MutableRefObject<Set<string>>;
  boost: React.MutableRefObject<boolean>;
  onFrame: (p: number, time: number) => void;
}) {
  useFrame((state, delta) => {
    const l = live.current;
    const dt = Math.min(delta, 1 / 20);
    const goal = l.drive ? 0 : target.current;
    l.p = l.calm ? goal : l.p + (goal - l.p) * (1 - Math.exp(-dt / 0.16));
    if (Math.abs(goal - l.p) < 1e-4) l.p = goal;
    if (l.drive) {
      const held = (codes: string[]) => (codes.some((c) => keys.current.has(c)) ? 1 : 0);
      l.boosting = stepDrive(l.drive, { throttle: held(KEYS.up) - held(KEYS.down), steer: held(KEYS.left) - held(KEYS.right), boost: boost.current }, dt, l.flat);
      boost.current = false;
    }
    onFrame(l.p, state.clock.elapsedTime);
  });
  return null;
}

// Numbered pins that ride with their assembly; shown for the assembly in focus and for all once apart.
function Pins({ live, onSelect }: { live: React.MutableRefObject<Live>; onSelect: (id: AssemblyId) => void }) {
  const refs = useRef<Partial<Record<AssemblyId, THREE.Group>>>({});
  const els = useRef<Partial<Record<AssemblyId, HTMLButtonElement>>>({});
  useFrame(() => {
    const { p, hovered, selected, drive } = live.current;
    const active = activeAt(p);
    for (const a of ASSEMBLIES) {
      if (a.id === "body") continue;
      const share = shareOf(p, a.id);
      refs.current[a.id]?.position.set(a.anchor[0] + a.move[0] * share, a.anchor[1] + a.move[1] * share + 0.12, a.anchor[2] + a.move[2] * share);
      const show = !drive && (p >= END - 0.01 || a.id === active || a.id === hovered || a.id === selected);
      const el = els.current[a.id];
      if (el && el.dataset.show !== String(show)) el.dataset.show = String(show);
    }
  });
  return (
    <>
      {ASSEMBLIES.filter((a) => a.id !== "body").map((a) => (
        <group key={a.id} ref={(el) => el && (refs.current[a.id] = el)}>
          <Html center zIndexRange={[20, 10]} style={{ pointerEvents: "none" }}>
            <button
              type="button"
              className="r3-pin"
              data-show="false"
              ref={(el) => { if (el) els.current[a.id] = el; }}
              onClick={() => onSelect(a.id)}
              tabIndex={-1}
              aria-hidden="true"
            >
              <span>{num(a.id)}</span>
              {a.short}
            </button>
          </Html>
        </group>
      ))}
    </>
  );
}

// nextId: the section the "continue" button scrolls to once the rover is fully apart.
export default function RoverExplorer({ nextId }: { nextId?: string }) {
  const webgl = useMemo(hasWebGL, []);
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const percent = useRef<HTMLSpanElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const still = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)"), []);
  const live = useRef<Live>({ p: 0, hovered: null, selected: null, animate: !still.matches, calm: still.matches, drive: null, boosting: false, flat: false });
  const keys = useRef(new Set<string>());
  const boost = useRef(false);
  const hud = useRef<HudHandle>(null);
  const [driving, setDriving] = useState(false);
  const target = useRef(0);
  const orbit = useRef({ yaw: 0, pitch: 0, zoom: 1 });
  // ?light=dusk|studio and ?select=<assembly> open the page in that state, for sharing and review.
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const [mode, setMode] = useState<LightMode>(() => (["day", "dusk", "studio"].includes(query.get("light") ?? "") ? (query.get("light") as LightMode) : "day"));
  const [xray, setXray] = useState(() => query.has("xray"));
  const [animate, setAnimate] = useState(!still.matches);
  const [hovered, setHovered] = useState<AssemblyId | null>(null);
  const [selected, setSelected] = useState<AssemblyId | null>(() => (query.get("select") && query.get("select")! in BY_ID ? (query.get("select") as AssemblyId) : null));
  const [active, setActive] = useState<AssemblyId | null>(null);
  const [phase, setPhase] = useState<"start" | "moving" | "apart">("start");
  const [visible, setVisible] = useState(true);
  const tip = useRef<HTMLDivElement>(null);

  live.current.hovered = hovered;
  live.current.selected = selected;
  live.current.animate = animate;
  live.current.flat = mode === "studio";

  // ?p=0.5 pins the explode at that progress, for screenshots and review.
  const pinned = query.get("p");

  const progressOf = useCallback(() => {
    if (pinned !== null) return clamp(Number(pinned) || 0, 0, 1);
    const el = section.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const range = rect.height - window.innerHeight;
    return range > 0 ? clamp(-rect.top / range, 0, 1) : 0;
  }, [pinned]);

  useEffect(() => {
    const onScroll = () => (target.current = progressOf());
    onScroll();
    live.current.p = target.current;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const io = new IntersectionObserver((entries) => setVisible(entries[entries.length - 1].isIntersecting), { rootMargin: "100px 0px" });
    if (section.current) io.observe(section.current);
    const onMotion = () => {
      live.current.calm = still.matches;
      setAnimate(!still.matches);
    };
    still.addEventListener("change", onMotion);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      io.disconnect();
      still.removeEventListener("change", onMotion);
    };
  }, [progressOf, still]);

  // Overlay updates straight from the render loop: progress bar, per-assembly fill, and the phase.
  const last = useRef({ active: null as AssemblyId | null, phase: "start" });
  const onFrame = useCallback((p: number, time: number) => {
    const drive = live.current.drive;
    if (drive) hud.current?.update(drive, live.current.boosting, time);
    if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
    const pct = String(Math.round(Math.min(1, p / END) * 100));
    if (percent.current && percent.current.textContent !== pct) percent.current.textContent = pct;
    list.current?.querySelectorAll<HTMLElement>("[data-fill]").forEach((el) => {
      const share = shareOf(p, el.dataset.fill as AssemblyId);
      el.style.transform = `scaleX(${share.toFixed(3)})`;
    });
    const a = activeAt(p);
    const ph = p <= 0.002 ? "start" : p >= END - 0.005 ? "apart" : "moving";
    if (a !== last.current.active) {
      last.current.active = a;
      setActive(a);
    }
    if (ph !== last.current.phase) {
      last.current.phase = ph;
      setPhase(ph as typeof phase);
    }
  }, []);

  const scrollTo = useCallback((p: number) => {
    const el = section.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + rect.top + p * (rect.height - window.innerHeight), behavior: still.matches ? "auto" : "smooth" });
  }, [still]);

  const select = useCallback((id: AssemblyId | null) => setSelected((cur) => (cur === id ? null : id)), []);
  const pick = useCallback(
    (id: AssemblyId) => {
      setSelected(id);
      if (id !== "body") scrollTo(Math.min(1, outAt(id)));
    },
    [scrollTo],
  );

  // Drag to orbit (mouse anywhere on the stage; on touch, horizontal drags only, so the page still scrolls).
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let down: { x: number; y: number; yaw: number; pitch: number; id: number; touch: boolean } | null = null;
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest(".r3-ui")) return;
      down = { x: e.clientX, y: e.clientY, yaw: orbit.current.yaw, pitch: orbit.current.pitch, id: e.pointerId, touch: e.pointerType === "touch" };
    };
    const onMove = (e: PointerEvent) => {
      if (tip.current) {
        tip.current.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 14}px)`;
      }
      if (!down || e.pointerId !== down.id) return;
      const dx = e.clientX - down.x;
      const dy = e.clientY - down.y;
      if (down.touch && Math.abs(dy) > Math.abs(dx)) return;
      orbit.current.yaw = down.yaw + dx * 0.006;
      if (!down.touch) orbit.current.pitch = clamp(down.pitch + dy * 0.004, -0.25, 0.9);
    };
    const onUp = () => (down = null);
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      orbit.current.zoom = clamp(orbit.current.zoom * Math.exp(e.deltaY * 0.004), 0.55, 1.6);
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  // Drive mode: G (or the dock button) hands over the controls; Esc or G hands them back.
  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  const enterDrive = useCallback(() => {
    const el = section.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      // the stage only stays pinned inside its section, so bring the section to the top first
      if (rect.top !== 0) window.scrollTo({ top: window.scrollY + rect.top, behavior: "auto" });
    }
    live.current.drive = freshDrive();
    orbit.current = { yaw: 0, pitch: 0, zoom: 1 };
    setSelected(null);
    setHovered(null);
    setDriving(true);
  }, []);
  const exitDrive = useCallback(() => {
    live.current.drive = null;
    live.current.boosting = false;
    keys.current.clear();
    orbit.current = { yaw: 0, pitch: 0, zoom: 1 };
    setDriving(false);
  }, []);

  useEffect(() => {
    if (!driving) return;
    // the page must not scroll while the arrow keys and space bar drive the rover
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    const onBlur = () => keys.current.clear();
    window.addEventListener("blur", onBlur);
    return () => {
      html.style.overflow = before;
      window.removeEventListener("blur", onBlur);
    };
  }, [driving]);

  useEffect(() => {
    const typing = (e: KeyboardEvent) => e.target instanceof Element && !!e.target.closest("input, textarea, select, [contenteditable]");
    const onDown = (e: KeyboardEvent) => {
      if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      const drive = live.current.drive;
      if (e.code === "KeyG" && !e.repeat && (drive || visibleRef.current)) {
        e.preventDefault();
        if (drive) exitDrive();
        else enterDrive();
        return;
      }
      if (e.key === "Escape") {
        if (drive) exitDrive();
        else setSelected(null);
        return;
      }
      if (!drive || !DRIVE_CODES.has(e.code)) return;
      e.preventDefault();
      keys.current.add(e.code);
      if (e.code === "Space" && !e.repeat) boost.current = true;
    };
    const onUp = (e: KeyboardEvent) => keys.current.delete(e.code);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [enterDrive, exitDrive]);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);

  if (!webgl)
    return (
      <section className="r3-nogl">
        <h1>Anatomy of a rover</h1>
        <p>The 3D viewer needs WebGL, which this browser has turned off. The blueprint below shows the same rover.</p>
      </section>
    );

  const focus = selected ?? active;
  const info = focus ? BY_ID[focus] : null;

  return (
    <section ref={section} className="r3-scroll" aria-label="Interactive 3D rover. Scroll to take it apart.">
      <div ref={stage} className="r3-sticky" data-driving={driving || undefined}>
        <Canvas
          className="r3-canvas"
          shadows
          dpr={[1, 1.75]}
          frameloop={visible ? "always" : "never"}
          camera={{ fov: 34, near: 0.05, far: 200, position: [3.5, 1.6, 2.7] }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, powerPreference: "high-performance" }}
          onPointerMissed={() => setSelected(null)}
        >
          <Suspense fallback={null}>
            <Driver live={live} target={target} keys={keys} boost={boost} onFrame={onFrame} />
            <Lighting mode={mode} live={live} />
            <Rover live={live} xray={xray && !driving} onHover={driving ? ignore : setHovered} onSelect={driving ? ignore : select} />
            <Pins live={live} onSelect={pick} />
            <CameraRig live={live} orbit={orbit} />
          </Suspense>
        </Canvas>

        <div className="r3-vignette" aria-hidden="true" />

        <header className="r3-ui r3-top">
          <div className="r3-brand">
            <span className="r3-mark" aria-hidden="true" />
            <span>
              ROVER-01 <em>Interactive anatomy</em>
            </span>
          </div>
          <ul className="r3-help" aria-label="How to explore">
            <li>
              <MousePointer2 aria-hidden="true" /> Hover to identify
            </li>
            <li>
              <Move3d aria-hidden="true" /> Drag to orbit
            </li>
            <li>
              <MousePointerClick aria-hidden="true" /> Click to inspect
            </li>
          </ul>
        </header>

        <div className="r3-ui r3-panel" aria-live="polite">
          <div className="r3-steps" aria-hidden="true">
            {ORDER.map((id) => (
              <span key={id} data-on={(focus === id) || undefined} data-done={phase === "apart" || (active && ORDER.indexOf(id) < ORDER.indexOf(active)) || undefined} />
            ))}
          </div>
          <div className="r3-card" key={info?.id ?? phase}>
            <p className="r3-eyebrow">
              {info ? (
                <>
                  <span>{info.id === "body" ? "Core" : `${num(info.id)} / ${String(ORDER.length).padStart(2, "0")}`}</span>
                  {selected ? "Inspecting" : "Taking apart"}
                </>
              ) : phase === "apart" ? (
                <>
                  <span>10 / 10</span>Fully apart
                </>
              ) : (
                <>
                  <span>00 / 10</span>Assembled
                </>
              )}
            </p>
            <h1 className="r3-title">{info ? info.name : phase === "apart" ? "Every assembly, laid out" : "Anatomy of a rover"}</h1>
            <p className="r3-about">
              {info
                ? info.about
                : phase === "apart"
                  ? "All ten assemblies have left the body. Orbit around them, hover to identify a part, or click one to fly in close."
                  : "A six-wheeled planetary rover, built part by part. Scroll and it comes apart from the outside in."}
            </p>
            {info && (
              <ul className="r3-specs">
                {info.specs.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            )}
            {selected && (
              <button type="button" className="r3-link" onClick={() => setSelected(null)}>
                <ArrowLeft aria-hidden="true" /> Back to the tour <kbd>Esc</kbd>
              </button>
            )}
          </div>
        </div>

        <nav className="r3-ui r3-list" aria-label="Assemblies">
          <p className="r3-list-head">Assemblies</p>
          <ol ref={list}>
            {ORDER.map((id) => (
              <li key={id}>
                <button type="button" data-on={focus === id || undefined} onClick={() => pick(id)} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}>
                  <span className="r3-num">{num(id)}</span>
                  <span className="r3-name">{BY_ID[id].name}</span>
                  <span className="r3-fill" data-fill={id} />
                </button>
              </li>
            ))}
            <li>
              <button type="button" data-on={selected === "body" || undefined} onClick={() => select("body")} onMouseEnter={() => setHovered("body")} onMouseLeave={() => setHovered(null)}>
                <span className="r3-num">··</span>
                <span className="r3-name">{BY_ID.body.name}</span>
              </button>
            </li>
          </ol>
        </nav>

        <div className="r3-ui r3-cue" data-show={phase === "start" || undefined} aria-hidden={phase !== "start"}>
          <span>Scroll to take it apart</span>
          <ChevronDown aria-hidden="true" />
        </div>

        {phase === "apart" && nextId && (
          <button type="button" className="r3-ui r3-next" onClick={() => document.getElementById(nextId)?.scrollIntoView({ behavior: still.matches ? "auto" : "smooth" })}>
            Continue to the blueprint <ArrowDown aria-hidden="true" />
          </button>
        )}

        <div className="r3-ui r3-dock" role="toolbar" aria-label="Viewer controls">
          <span className="r3-meter" aria-hidden="true">
            <span ref={percent}>0</span>%
          </span>
          <span className="r3-sep" aria-hidden="true" />
          <div className="r3-seg" role="group" aria-label="Lighting">
            {LIGHTS.map(({ mode: m, label, Icon }) => (
              <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} title={label}>
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <span className="r3-sep" aria-hidden="true" />
          <button type="button" className="r3-icon" aria-pressed={xray} onClick={() => setXray((v) => !v)} title="X-ray: ghost everything but the part in focus">
            <ScanEye aria-hidden="true" />
            <span>X-ray</span>
          </button>
          <button type="button" className="r3-icon" aria-pressed={animate} onClick={() => setAnimate((v) => !v)} title={animate ? "Pause the idle motion" : "Play the idle motion"}>
            {animate ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            <span>Motion</span>
          </button>
          <span className="r3-sep r3-drive-only" aria-hidden="true" />
          <button type="button" className="r3-icon r3-drive r3-drive-only" onClick={enterDrive} title="Drive the rover (G)">
            <Gamepad2 aria-hidden="true" />
            <span>Drive</span>
            <kbd>G</kbd>
          </button>
          <button
            type="button"
            className="r3-icon"
            title="Reset the camera"
            onClick={() => {
              orbit.current = { yaw: 0, pitch: 0, zoom: 1 };
              setSelected(null);
            }}
          >
            <RotateCcw aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>

        <div className="r3-track" aria-hidden="true">
          <div ref={bar} className="r3-progress" />
          {ORDER.map((id) => (
            <span key={id} className="r3-tick" style={{ left: `${outAt(id) * 100}%` }} />
          ))}
        </div>

        <DriveHud ref={hud} show={driving} />

        <div ref={tip} className="r3-tip" data-show={(!!hovered && !driving) || undefined} aria-hidden="true">
          {hovered ? BY_ID[hovered].name : ""}
        </div>
      </div>
    </section>
  );
}
