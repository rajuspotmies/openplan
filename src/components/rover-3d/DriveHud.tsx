import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { DRIVE, type DriveState } from "./drive";
import { BUMPS, CLIMBABLE, ROAM } from "./terrain";

export interface HudHandle {
  update: (drive: DriveState, boosting: boolean, time: number) => void;
}

const DEG = 180 / Math.PI;
const PX_PER_DEG = 4;
const GAUGE_SWEEP = 0.75; // of the full circle
const RADAR_RANGE = 12; // m
const CARDINAL: Record<number, string> = { 0: "N", 90: "E", 180: "S", 270: "W" };

const setText = (el: HTMLElement | null, text: string) => {
  if (el && el.textContent !== text) el.textContent = text;
};

// The drive-mode heads-up display: speed gauge, boost cell, compass tape, telemetry and a rock radar.
const DriveHud = forwardRef<HudHandle, { show: boolean }>(function DriveHud({ show }, ref) {
  const root = useRef<HTMLDivElement>(null);
  const speed = useRef<HTMLSpanElement>(null);
  const kmh = useRef<HTMLSpanElement>(null);
  const gear = useRef<HTMLSpanElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const boostFill = useRef<HTMLSpanElement>(null);
  const boostLabel = useRef<HTMLSpanElement>(null);
  const tape = useRef<HTMLDivElement>(null);
  const hdg = useRef<HTMLSpanElement>(null);
  const odo = useRef<HTMLSpanElement>(null);
  const pitch = useRef<HTMLSpanElement>(null);
  const roll = useRef<HTMLSpanElement>(null);
  const pos = useRef<HTMLSpanElement>(null);
  const radar = useRef<HTMLCanvasElement>(null);

  // compass ticks from -360° to 720°, so the tape never runs out while it wraps
  const ticks = useMemo(() => Array.from({ length: 1080 / 5 + 1 }, (_, i) => -360 + i * 5), []);
  const gaugeTicks = useMemo(() => Array.from({ length: 35 }, (_, i) => i / 34), []);

  useImperativeHandle(ref, () => ({
    update(d, boosting, time) {
      const v = Math.abs(d.speed);
      setText(speed.current, v.toFixed(2));
      setText(kmh.current, `${(v * 3.6).toFixed(1)} km/h`);
      setText(gear.current, d.speed > 0.03 ? "D" : d.speed < -0.03 ? "R" : "N");
      const frac = Math.min(1, v / DRIVE.boostMax);
      arc.current?.setAttribute("stroke-dashoffset", String((1 - frac) * GAUGE_SWEEP * 100));

      let fill = 1;
      let label = "BOOST READY · SPACE";
      let state = "ready";
      if (d.boost > 0) {
        fill = d.boost / DRIVE.boostTime;
        label = `BOOST ${d.boost.toFixed(1)}s`;
        state = "active";
      } else if (d.cooldown > 0) {
        fill = 1 - d.cooldown / DRIVE.cooldown;
        label = `RECHARGING ${d.cooldown.toFixed(1)}s`;
        state = "charging";
      }
      if (boostFill.current) boostFill.current.style.transform = `scaleX(${fill.toFixed(3)})`;
      setText(boostLabel.current, label);

      // bearing: 0 = north (-z), 90 = east (+x)
      const bearing = (((90 - d.heading * DEG) % 360) + 360) % 360;
      if (tape.current) tape.current.style.transform = `translateX(${(-(bearing + 360) * PX_PER_DEG).toFixed(1)}px)`;
      setText(hdg.current, String(Math.round(bearing) % 360).padStart(3, "0"));
      setText(odo.current, `${d.odometer.toFixed(1)} m`);
      setText(pitch.current, `${(d.pitch * DEG).toFixed(1)}°`);
      setText(roll.current, `${(d.roll * DEG).toFixed(1)}°`);
      setText(pos.current, `${d.x.toFixed(1)}, ${d.z.toFixed(1)}`);

      const el = root.current;
      if (el) {
        if (el.dataset.boost !== state) el.dataset.boost = state;
        const hit = d.impact < 0.45 ? "1" : "";
        if ((el.dataset.impact ?? "") !== hit) el.dataset.impact = hit;
        el.style.setProperty("--hud-speed", frac.toFixed(3));
        if (boosting !== (el.dataset.boosting === "1")) el.dataset.boosting = boosting ? "1" : "";
      }
      drawRadar(radar.current, d, time);
    },
  }));

  return (
    <div ref={root} className="hud" data-show={show || undefined} aria-hidden={!show}>
      <div className="hud-lines" aria-hidden="true" />
      <div className="hud-flash" aria-hidden="true" />
      {(["tl", "tr", "bl", "br"] as const).map((c) => (
        <span key={c} className="hud-corner" data-c={c} />
      ))}

      <div className="hud-top">
        <div className="hud-tag">
          <i className="hud-rec" /> DRIVE MODE · ROVER-01
        </div>
        <div className="hud-compass">
          <div ref={tape} className="hud-tape">
            {ticks.map((deg) => {
              const norm = ((deg % 360) + 360) % 360;
              const major = norm % 15 === 0;
              return (
                <span key={deg} className="hud-tick" data-major={major || undefined} style={{ left: `${(deg + 360) * PX_PER_DEG}px` }}>
                  {major && <b data-cardinal={norm in CARDINAL || undefined}>{CARDINAL[norm] ?? norm}</b>}
                </span>
              );
            })}
          </div>
          <span className="hud-caret" />
        </div>
        <div className="hud-hdg">
          HDG <span ref={hdg}>090</span>°
        </div>
        <div className="hud-exit">
          <kbd>ESC</kbd> EXIT DRIVE
        </div>
      </div>

      <dl className="hud-telemetry">
        <div>
          <dt>ODOMETER</dt>
          <dd ref={odo}>0.0 m</dd>
        </div>
        <div>
          <dt>PITCH</dt>
          <dd ref={pitch}>0.0°</dd>
        </div>
        <div>
          <dt>ROLL</dt>
          <dd ref={roll}>0.0°</dd>
        </div>
        <div>
          <dt>POSITION</dt>
          <dd ref={pos}>0.0, 0.0</dd>
        </div>
        <div>
          <dt>GRAVITY</dt>
          <dd>{DRIVE.gravity} m/s²</dd>
        </div>
      </dl>

      <div className="hud-radar">
        <canvas ref={radar} width={320} height={320} />
        <span>PROXIMITY · {RADAR_RANGE} m</span>
      </div>

      <div className="hud-deck">
        <div className="hud-gauge">
          <svg viewBox="0 0 220 220" aria-hidden="true">
            <g transform="rotate(135 110 110)">
              <circle className="hud-arc-track" cx="110" cy="110" r="92" pathLength="100" strokeDasharray={`${GAUGE_SWEEP * 100} 100`} />
              <circle ref={arc} className="hud-arc" cx="110" cy="110" r="92" pathLength="100" strokeDasharray={`${GAUGE_SWEEP * 100} 100`} strokeDashoffset={GAUGE_SWEEP * 100} />
              {gaugeTicks.map((t, i) => {
                const a = t * GAUGE_SWEEP * Math.PI * 2;
                const r0 = i % 5 === 0 ? 74 : 79;
                return <line key={i} className="hud-gtick" data-major={i % 5 === 0 || undefined} x1={110 + Math.cos(a) * r0} y1={110 + Math.sin(a) * r0} x2={110 + Math.cos(a) * 84} y2={110 + Math.sin(a) * 84} />;
              })}
              <line className="hud-redline" x1={110 + Math.cos((DRIVE.max / DRIVE.boostMax) * GAUGE_SWEEP * Math.PI * 2) * 70} y1={110 + Math.sin((DRIVE.max / DRIVE.boostMax) * GAUGE_SWEEP * Math.PI * 2) * 70} x2={110 + Math.cos((DRIVE.max / DRIVE.boostMax) * GAUGE_SWEEP * Math.PI * 2) * 100} y2={110 + Math.sin((DRIVE.max / DRIVE.boostMax) * GAUGE_SWEEP * Math.PI * 2) * 100} />
            </g>
          </svg>
          <div className="hud-readout">
            <span ref={speed} className="hud-speed">
              0.00
            </span>
            <span className="hud-unit">m/s</span>
            <span ref={kmh} className="hud-kmh">
              0.0 km/h
            </span>
          </div>
          <span ref={gear} className="hud-gear">
            N
          </span>
        </div>
        <div className="hud-boost">
          <span className="hud-boost-bar">
            <span ref={boostFill} />
          </span>
          <span ref={boostLabel} className="hud-boost-label">
            BOOST READY · SPACE
          </span>
        </div>
      </div>

      <ul className="hud-keys">
        <li>
          <kbd>W</kbd>
          <kbd>↑</kbd> throttle
        </li>
        <li>
          <kbd>S</kbd>
          <kbd>↓</kbd> brake · reverse
        </li>
        <li>
          <kbd>A</kbd>
          <kbd>D</kbd>
          <kbd>←</kbd>
          <kbd>→</kbd> steer
        </li>
        <li>
          <kbd>SPACE</kbd> boost
        </li>
      </ul>
    </div>
  );
});

export default DriveHud;

function drawRadar(canvas: HTMLCanvasElement | null, d: DriveState, time: number) {
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return;
  const size = canvas.width;
  const c = size / 2;
  const scale = (c - 10) / RADAR_RANGE;
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, c - 4, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "rgba(6, 18, 30, 0.55)";
  ctx.fillRect(0, 0, size, size);
  // range rings and cross
  ctx.strokeStyle = "rgba(127, 231, 255, 0.22)";
  ctx.lineWidth = 1.5;
  for (const k of [0.33, 0.66, 1]) {
    ctx.beginPath();
    ctx.arc(c, c, (c - 10) * k, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(c, 6);
  ctx.lineTo(c, size - 6);
  ctx.moveTo(6, c);
  ctx.lineTo(size - 6, c);
  ctx.stroke();
  // sweep
  const sweep = (time * 1.6) % (Math.PI * 2);
  if (typeof ctx.createConicGradient === "function") {
    const g = ctx.createConicGradient(sweep - Math.PI / 2, c, c);
    g.addColorStop(0, "rgba(127, 231, 255, 0.28)");
    g.addColorStop(0.12, "rgba(127, 231, 255, 0)");
    g.addColorStop(1, "rgba(127, 231, 255, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  // rocks, rotated so the rover always faces up
  const fx = Math.cos(d.heading);
  const fz = -Math.sin(d.heading);
  const rx = Math.sin(d.heading);
  const rz = Math.cos(d.heading);
  // rocks it can climb are faint; ones too tall to climb are bright, and turn red when close
  for (const o of BUMPS) {
    if (o.top < 0.08) continue;
    const dx = o.x - d.x;
    const dz = o.z - d.z;
    if (Math.abs(dx) > RADAR_RANGE * 1.5 || Math.abs(dz) > RADAR_RANGE * 1.5) continue;
    const sx = c + (dx * rx + dz * rz) * scale;
    const sy = c - (dx * fx + dz * fz) * scale;
    const tall = o.top > CLIMBABLE;
    const near = Math.hypot(dx, dz) - o.r < 2.2;
    ctx.fillStyle = tall ? (near ? "rgba(255, 120, 90, 0.95)" : "rgba(127, 231, 255, 0.9)") : "rgba(127, 231, 255, 0.35)";
    ctx.beginPath();
    ctx.arc(sx, sy, Math.max(tall ? 3 : 2, o.r * scale), 0, Math.PI * 2);
    ctx.fill();
  }
  // the edge of the roaming area
  const ex = c + (-d.x * rx + -d.z * rz) * scale;
  const ey = c - (-d.x * fx + -d.z * fz) * scale;
  ctx.strokeStyle = "rgba(255, 180, 71, 0.6)";
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.arc(ex, ey, ROAM * scale, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
  // the rover
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(c, c - 11);
  ctx.lineTo(c + 8, c + 9);
  ctx.lineTo(c, c + 5);
  ctx.lineTo(c - 8, c + 9);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(127, 231, 255, 0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(c, c, c - 4, 0, Math.PI * 2);
  ctx.stroke();
}
