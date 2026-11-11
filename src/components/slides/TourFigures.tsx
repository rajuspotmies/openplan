"use client";

// The three hairline machines of the tour (360 × 234 each), drawn with the iso helpers:
//   Fig 1.1 SCANNER — a spec sheet is scanned; only the lines that matter come out on a card.
//   Fig 1.2 CHECKER — a long change order feeds in; the one risk comes out, the rest is shredded.
//   Fig 1.3 ROUTER  — parts ride a belt under the OpenPlan gantry and drop at the route that fits.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { P, Slab, clamp01, ease, leftM, rightM, topM, type O } from "./iso";

const VB = "0 0 360 234";
const f = (n: number) => Math.round(n * 100) / 100;

/** Seconds of figure time, advancing at `rate` while `run` is true. */
function useClock(run: boolean, rate: number) {
  const [t, setT] = useState(0);
  const rateRef = useRef(rate);
  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      setT((v) => v + dt * rateRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run]);
  return t;
}

/** Rate that eases toward `target` (hover slows or speeds the machine without a jump). */
function useEasedRate(target: number) {
  const [r, setR] = useState(target);
  useEffect(() => {
    let raf = 0;
    let cur = r;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      cur += (target - cur) * (1 - Math.exp(-5 * dt));
      if (Math.abs(target - cur) < 0.005) cur = target;
      setR(cur);
      if (cur !== target) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return r;
}

export type FigProps = { run: boolean; still: boolean; onRead?: (s: string) => void };

function Svg({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg
      viewBox={VB}
      role="img"
      aria-label={label}
      className="ops-msvg"
      style={{ overflow: "visible", width: "100%", height: "auto" }}
      fill="none"
      stroke="var(--iso-ink)"
      strokeWidth={0.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/** Short hatch marks on a wall (grain): k marks of length 3 along a wall plane. */
function hatch(n: number, s0: number, s1: number, t: number, seed: number) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const s = s0 + ((i * 37 + seed * 13) % 97) / 97 * (s1 - s0);
    const tt = t - ((i * 53 + seed * 7) % 41) / 41 * 14;
    d += `M${f(s)} ${f(tt)}l1.6 -2.8`;
  }
  return d;
}

/* ───────────── Fig 1.1 SCANNER ───────────── */

type Doc = { name: string; lines: [string, boolean][]; out: string[]; from: number; to: number };
const DOCS: Doc[] = [
  {
    name: "enclosure-spec.pdf",
    lines: [
      ["1.2  Scope: outdoor sensor hub", false],
      ["2.1  Housing PC/ABS, UV stable", true],
      ["2.4  Sealing IP67, 1 m, 30 min", true],
      ["     see test plan TP-07", false],
      ["3.1  Operating -20 to 60 °C", true],
      ["3.3  Storage -40 to 85 °C", false],
      ["4.0  Drop 1.2 m onto concrete", true],
      ["5.2  Revision history, 12 rows", false],
    ],
    out: ["IP67 · 1 m · 30 min", "-20 to 60 °C operating", "1.2 m drop · PC/ABS"],
    from: 42,
    to: 4,
  },
  {
    name: "pcb-fab-notes.txt",
    lines: [
      ["FAB-01  FR-4, Tg 170", true],
      ["FAB-02  6 layers, 1.6 mm", true],
      ["FAB-03  Finish ENIG", false],
      ["FAB-04  Trace/space 4/4 mil", true],
      ["FAB-05  Silkscreen white", false],
      ["FAB-06  50 Ω ±10% impedance", true],
      ["FAB-07  Panelize 2 × 3", false],
      ["FAB-08  IPC-6012 Class 2", false],
    ],
    out: ["6L FR-4 Tg170 · 1.6 mm", "4/4 mil · 50 Ω ±10%", "ENIG · Class 2"],
    from: 36,
    to: 4,
  },
  {
    name: "motor-datasheet.pdf",
    lines: [
      ["Rated voltage    24 V", true],
      ["No-load speed    3,800 rpm", false],
      ["Rated torque     0.32 N·m", true],
      ["Stall current    9.6 A", true],
      ["Insulation       Class F", false],
      ["Weight           410 g", false],
      ["Lead time        16 wk", true],
      ["Ordering code    M24-32-F", false],
    ],
    out: ["24 V · 0.32 N·m", "9.6 A stall", "16 wk lead time"],
    from: 58,
    to: 4,
  },
];

export function ScannerFig({ run, still, onRead }: FigProps) {
  const [hover, setHover] = useState<number | null>(null);
  const t = useClock(run && hover === null && !still, 1);
  const period = 6.4;
  const cycle = still ? 0 : Math.floor(t / period);
  const p = still ? 3.9 : t % period;
  const doc = DOCS[((cycle % DOCS.length) + DOCS.length) % DOCS.length];
  // scan head travel (v) — hover scrubs it directly
  const v0 = -46;
  const v1 = 42;
  const scanK = hover !== null ? hover : ease(clamp01(p / 3));
  const vb = v0 + (v1 - v0) * scanK;
  const cardK = hover !== null ? clamp01((hover - 0.85) / 0.15) : ease(clamp01((p - 3.1) / 1.0));
  const fade = hover !== null ? 1 : 1 - clamp01((p - 5.3) / 0.6);
  const docIn = hover !== null ? 1 : clamp01(p / 0.35);
  const passed = (i: number) => -36 + i * 10.4 - 3 < vb;

  const read = `${doc.name} · ${doc.from} → ${doc.to} lines`;
  const lastRead = useRef("");
  useEffect(() => {
    if (onRead && read !== lastRead.current) {
      lastRead.current = read;
      onRead(read);
    }
  }, [read, onRead]);

  const o: O = { cx: 194, cy: 127 };
  const BH = 26; // body height
  const wallL = P(o, -64, 56, 0); // origin on the front-left wall (v = 56), u from -64
  const wallR = P(o, 76, 44, 0); // origin on the front-right wall (u = 76), running −v from v = 44
  const cardV = 22 + 44 * cardK; // the card's near edge in v

  return (
    <div
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setHover(clamp01((e.clientX - r.left - r.width * 0.15) / (r.width * 0.7)));
      }}
      onPointerLeave={() => setHover(null)}
    >
      <Svg label="A scanner. A spec sheet, fab notes or a datasheet is scanned; only the lines that matter come out on a short card, and the full page stays filed in a drawer marked source.">
        <defs>
          <clipPath id="ops-sc-card">
            <rect x={-80} y={57} width={140} height={80} />
          </clipPath>
        </defs>
        {/* body */}
        <Slab
          o={o}
          x={-76}
          y={-56}
          w={152}
          d={112}
          r={12}
          h={BH}
          walls={
            <>
              <path transform={leftM(wallL[0], wallL[1])} d={hatch(26, 4, 124, -6, 1)} className="ops-grain" />
              <path transform={rightM(wallR[0], wallR[1])} d={hatch(18, 4, 84, -6, 2)} className="ops-grain" />
              {/* output slot on the front-left wall */}
              <rect x={6} y={-12} width={100} height={5} rx={2} transform={leftM(wallL[0], wallL[1])} fill="rgba(0,0,0,0.55)" />
              <text x={104} y={-15} fontSize={7} letterSpacing={1.2} transform={leftM(wallL[0], wallL[1])} fill="currentColor" stroke="none" fontFamily="var(--font-mono)" textAnchor="end">
                openplan
              </text>
              {/* source drawer on the front-right wall */}
              <g transform={rightM(wallR[0], wallR[1])}>
                <rect x={10} y={-20} width={62} height={15} rx={2} fill="var(--iso-fill)" />
                <text x={15} y={-10} fontSize={6} fill="currentColor" stroke="none" fontFamily="var(--font-mono)">
                  source
                </text>
                <rect x={56} y={-14} width={10} height={3} rx={1.5} />
                {[0, 1].map((k) => (
                  <circle key={k} cx={k ? 68 : 14} cy={-17.5} r={0.5} fill="currentColor" stroke="none" />
                ))}
              </g>
            </>
          }
        >
          <rect x={-68} y={-51} width={136} height={100} rx={4} className="ops-grain" vectorEffect="non-scaling-stroke" />
          {/* rails for the scan head */}
          <path d="M -72 -50 V 48 M 72 -50 V 48" vectorEffect="non-scaling-stroke" />
          {[-72, 72].flatMap((u) => [-50, 48].map((v) => <circle key={`${u}${v}`} cx={u} cy={v} r={1.1} fill="var(--iso-fill)" vectorEffect="non-scaling-stroke" />))}
        </Slab>

        {/* the page on the glass */}
        <g opacity={f(docIn * fade)}>
          <g transform={topM(o, BH + 0.3)}>
            <rect x={-64} y={-47} width={128} height={90} rx={1.5} fill="var(--iso-fill)" vectorEffect="non-scaling-stroke" />
            {doc.lines.map(([s, key], i) => {
              const done = passed(i);
              return (
                <text
                  key={i}
                  className={`ops-mpart${done && key ? " ops-lit" : ""}`}
                  x={-59}
                  y={-36 + i * 10.4}
                  fontSize={6.1}
                  fill="currentColor"
                  stroke="none"
                  fontFamily="var(--font-mono)"
                  opacity={done && !key ? 0.35 : 1}
                  style={{ whiteSpace: "pre" }}
                >
                  {s}
                </text>
              );
            })}
            {/* scan light on the page */}
            <path d={`M -62 ${f(vb)} H 62`} stroke="var(--iso-hot)" strokeOpacity={0.9} vectorEffect="non-scaling-stroke" />
            <rect x={-62} y={f(vb - 6)} width={124} height={6} fill="rgba(255,255,255,0.05)" stroke="none" />
          </g>
        </g>

        {/* scan head */}
        <Slab o={o} x={-76} y={f(vb - 3)} w={152} d={6} r={1.5} z={BH + 2} h={4}>
          <path d="M -60 0 H 60" className="ops-grain" vectorEffect="non-scaling-stroke" transform={`translate(0 ${f(vb)})`} />
        </Slab>
        {/* carriages on the rails */}
        {[-72, 72].map((u) => (
          <Slab key={u} o={o} x={u - 4} y={f(vb - 5)} w={8} d={10} r={2} z={BH} h={8} />
        ))}

        {/* output tray */}
        <Slab o={o} x={-70} y={56} w={112} d={58} r={6} h={4}>
          <rect x={-64} y={62} width={100} height={46} rx={3} className="ops-grain" vectorEffect="non-scaling-stroke" />
        </Slab>
        <g opacity={f(fade)} clipPath="url(#ops-sc-card)" transform={topM(o, 4.6)}>
          <g transform={`translate(0 ${f(cardV - 22)})`}>
            <rect x={-60} y={22} width={100} height={34} rx={2} fill="var(--iso-fill)" vectorEffect="non-scaling-stroke" className="ops-lit" stroke="currentColor" />
            {doc.out.map((s, i) => (
              <text key={i} x={-56} y={31 + i * 9} fontSize={5.7} fill="currentColor" stroke="none" fontFamily="var(--font-mono)" className="ops-lit">
                {s}
              </text>
            ))}
          </g>
        </g>
      </Svg>
    </div>
  );
}

/* ───────────── Fig 1.2 CHECKER ───────────── */

const ECO = [
  "ECO-118: swap MCU U4 to",
  "STM32H7 for more RAM.",
  "Updates footprint, HAL,",
  "power budget and fixture.",
  "Distributor lead time is",
  "18 weeks. EVT build in 9.",
];

function confetti(n: number) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const u = -54 + ((i * 47) % 100) / 100 * 48;
    const v = 52 + ((i * 71) % 100) / 100 * 30;
    const a = ((i * 29) % 7) - 3;
    d += `M ${f(u)} ${f(v)} l ${f(4 + (i % 3))} ${a}`;
  }
  return d;
}

export function CheckerFig({ run, still, onRead }: FigProps) {
  const [hover, setHover] = useState(false);
  const rate = useEasedRate(hover ? 2.6 : 1);
  const t = useClock(run && !still, rate);
  const period = 6;
  const p = still ? 3.8 : t % period;
  const feed = ease(clamp01(p / 3)); // 0 → 1 of the page fed
  const cardK = ease(clamp01((p - 2.4) / 1.1));
  const out = 1 - clamp01((p - 5.1) / 0.6);
  const paperIn = clamp01(p / 0.3) * out;

  useEffect(() => {
    onRead?.("words 31 → 4");
  }, [onRead]);

  const o: O = { cx: 170, cy: 132 };
  const BH = 46;
  const PH = 64; // page height
  const above = PH * (1 - feed); // visible height above the slot
  const slot = P(o, -44, 0, BH);
  const wallL = P(o, -50, 36, 0);
  const wallR = P(o, 50, 26, 0);

  return (
    <div onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
      <Svg label="A checker. A long engineering change order feeds into the top; the one risk that matters comes out on a short card, and the rest is shredded into the bin.">
        <defs>
          <clipPath id="ops-ck-page">
            <rect x={-3} y={-90} width={96} height={90} />
          </clipPath>
          <clipPath id="ops-ck-card">
            <rect x={51} y={-60} width={90} height={120} />
          </clipPath>
        </defs>

        {/* bin (behind the body on screen: further left) */}
        <Slab
          o={o}
          x={-62}
          y={44}
          w={60}
          d={44}
          r={4}
          h={18}
          walls={<path transform={leftM(...P(o, -60, 88, 0))} d={hatch(12, 4, 54, -4, 3)} className="ops-grain" />}
        >
          <rect x={-58} y={48} width={52} height={36} rx={2} fill="rgba(0,0,0,0.5)" vectorEffect="non-scaling-stroke" />
          <path d={confetti(Math.round(6 + 26 * feed * out + 6 * (1 - out)))} className="ops-grain" vectorEffect="non-scaling-stroke" />
        </Slab>

        {/* body */}
        <Slab
          o={o}
          x={-50}
          y={-36}
          w={100}
          d={72}
          r={10}
          h={BH}
          walls={
            <>
              <g transform={leftM(wallL[0], wallL[1])}>
                {[0, 1, 2, 3].map((k) => (
                  <rect key={k} x={8 + k * 9} y={-34} width={5} height={22} rx={1.5} />
                ))}
                <text x={92} y={-24} fontSize={7} letterSpacing={1.2} fill="currentColor" stroke="none" fontFamily="var(--font-mono)" textAnchor="end">
                  openplan
                </text>
                <path d={hatch(10, 46, 94, -6, 4)} className="ops-grain" />
              </g>
              <g transform={rightM(wallR[0], wallR[1])}>
                <rect x={6} y={-14} width={56} height={6} rx={2} fill="rgba(0,0,0,0.55)" />
                <path d={hatch(10, 4, 58, -22, 5)} className="ops-grain" />
              </g>
            </>
          }
        >
          <rect x={-46} y={-4} width={92} height={8} rx={2} fill="rgba(0,0,0,0.6)" vectorEffect="non-scaling-stroke" />
          <path d="M -42 0 H 42" className="ops-grain" strokeDasharray="1 2" vectorEffect="non-scaling-stroke" />
          {[-30, -14, 14, 30].map((u) => (
            <circle key={u} cx={u} cy={20} r={1.2} fill="var(--iso-fill)" vectorEffect="non-scaling-stroke" />
          ))}
        </Slab>
        {/* feed lever */}
        <Slab o={o} x={30} y={-32} w={10} d={10} r={3} z={BH} h={6} />
        <path d={(() => {
          const a = P(o, 35, -27, BH + 6);
          const b = P(o, 35, -27, BH + 28 - 6 * feed);
          return `M ${f(a[0])} ${f(a[1])} L ${f(b[0])} ${f(b[1])}`;
        })()} />
        <circle cx={f(P(o, 35, -27, BH + 30 - 6 * feed)[0])} cy={f(P(o, 35, -27, BH + 30 - 6 * feed)[1])} r={3} fill="var(--iso-fill)" />

        {/* the change order, standing in the slot */}
        <g transform={leftM(slot[0], slot[1])} opacity={f(paperIn)}>
          <g clipPath="url(#ops-ck-page)">
            <g transform={`translate(0 ${f(PH - above)})`}>
              <rect x={-1} y={-PH} width={92} height={PH} rx={1.5} fill="var(--iso-fill)" />
              {ECO.map((s, i) => (
                <text
                  key={i}
                  x={5}
                  y={-PH + 10 + i * 9}
                  fontSize={5.4}
                  fill="currentColor"
                  stroke="none"
                  fontFamily="var(--font-mono)"
                  className={i >= 4 ? "ops-mpart ops-lit" : "ops-mpart"}
                >
                  {s}
                </text>
              ))}
              {/* perforation the cutters leave */}
              <path d={`M 2 ${f(-PH * feed)} H 88`} strokeDasharray="1.5 2" className="ops-grain" />
            </g>
          </g>
        </g>

        {/* output tray on the right */}
        <Slab o={o} x={50} y={-26} w={66} d={46} r={5} h={5}>
          <rect x={54} y={-22} width={58} height={38} rx={3} className="ops-grain" vectorEffect="non-scaling-stroke" />
        </Slab>
        <g clipPath="url(#ops-ck-card)" transform={topM(o, 5.6)} opacity={f(out)}>
          <g transform={`translate(${f(-50 + 58 * cardK)} 0)`}>
            <rect x={56} y={-14} width={52} height={20} rx={2} fill="var(--iso-fill)" stroke="currentColor" className="ops-lit" vectorEffect="non-scaling-stroke" />
            <text x={60} y={-5.5} fontSize={5.8} fill="currentColor" stroke="none" fontFamily="var(--font-mono)" className="ops-lit">
              RISK U4
            </text>
            <text x={60} y={2.5} fontSize={5.8} fill="currentColor" stroke="none" fontFamily="var(--font-mono)" className="ops-lit">
              18 wk &gt; EVT
            </text>
          </g>
        </g>
      </Svg>
    </div>
  );
}

/* ───────────── Fig 1.3 ROUTER ───────────── */

const ZONES = [
  { u: -12, name: "Proto shop" },
  { u: 48, name: "Contract mfg" },
  { u: 108, name: "Tier-1" },
];
const SIZES = [
  { s: 7, h: 9, dots: 1 },
  { s: 10, h: 14, dots: 2 },
  { s: 13, h: 20, dots: 3 },
];
const ORDER = [1, 0, 2, 0, 1, 2, 1, 0];

export function RouterFig({ run, still, onRead }: FigProps) {
  const [hover, setHover] = useState(false);
  const rate = useEasedRate(hover ? 0.3 : 1);
  const t = useClock(run && !still, rate);
  const T = still ? 7.3 : t + 6; // start with the belt already loaded

  useEffect(() => {
    onRead?.(`rate ${rate.toFixed(2)}×`);
  }, [rate, onRead]);

  const o: O = { cx: 186, cy: 112 };
  const BELT = { x: -152, w: 300, y: -24, d: 48, h: 10 };
  const GU = -78; // gantry position
  const SPEED = 30;
  const GAP = 1.9;

  // boxes on the belt right now
  type B = { u: number; k: number; a: number; scan: boolean };
  const boxes: B[] = [];
  const n0 = Math.floor((T - 10) / GAP);
  for (let n = Math.max(0, n0); n <= T / GAP; n++) {
    const born = n * GAP;
    const age = T - born;
    if (age < 0) continue;
    const zone = ORDER[n % ORDER.length];
    const zu = ZONES[zone].u;
    const u = -146 + age * SPEED;
    const arriveAge = (zu + 146) / SPEED;
    if (age > arriveAge + 0.6) continue;
    const a = Math.min(clamp01(age / 0.3), 1 - clamp01((age - arriveAge) / 0.6));
    boxes.push({ u: Math.min(u, zu), k: zone, a, scan: Math.abs(u - GU) < 10 });
  }
  boxes.sort((a, b) => a.u - b.u);
  const scanning = boxes.some((b) => b.scan);

  const wallL = P(o, BELT.x + 6, BELT.y + BELT.d, 0);
  const endR = P(o, BELT.x + BELT.w, 0, 0);
  const crossR = P(o, GU + 10, 38, 46);

  const box = (b: B, i: number) => {
    const sz = SIZES[b.k];
    return (
      <g key={i} opacity={f(b.a)} className="ops-mpart">
        <Slab o={o} x={f(b.u - sz.s)} y={-6 - sz.s} w={sz.s * 2} d={sz.s * 2} r={2} z={BELT.h} h={sz.h}>
          {Array.from({ length: sz.dots }, (_, d) => (
            <circle key={d} cx={f(b.u - (sz.dots - 1) * 2.2 + d * 4.4)} cy={-6} r={0.9} fill="currentColor" stroke="none" />
          ))}
        </Slab>
      </g>
    );
  };

  // anything still under or behind the beam is painted before it; the rest after the front post
  const under = (b: B) => b.u - SIZES[b.k].s < GU + 10;
  const behind = boxes.filter(under);
  const front = boxes.filter((b) => !under(b));

  return (
    <div onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
      <Svg label="A router. Parts ride a belt under the OpenPlan gantry and drop off at the route that fits them: prototype shop, contract manufacturer or tier-1 supplier.">
        {/* belt */}
        <Slab
          o={o}
          x={BELT.x}
          y={BELT.y}
          w={BELT.w}
          d={BELT.d}
          r={6}
          h={BELT.h}
          walls={
            <>
              <g transform={leftM(wallL[0], wallL[1])}>
                {Array.from({ length: 10 }, (_, i) => (
                  <circle key={i} cx={10 + i * 30} cy={-5} r={1.6} />
                ))}
              </g>
              <g transform={rightM(endR[0], endR[1])}>
                <circle cx={0} cy={-5} r={3} fill="var(--iso-fill)" />
              </g>
            </>
          }
        >
          <rect x={BELT.x + 4} y={BELT.y + 4} width={BELT.w - 8} height={BELT.d - 8} rx={3} className="ops-grain" vectorEffect="non-scaling-stroke" />
          <path
            d={Array.from({ length: 24 }, (_, i) => {
              const u = BELT.x + 10 + ((i * 12 + ((T * SPEED) % 12)) % 288);
              return `M ${f(u)} ${BELT.y + 5} V ${BELT.y + BELT.d - 5}`;
            }).join(" ")}
            className="ops-grain"
            vectorEffect="non-scaling-stroke"
          />
          {ZONES.map((z) => (
            <g key={z.name}>
              <rect x={z.u - 20} y={12} width={48} height={8} rx={1.5} fill="var(--iso-fill)" vectorEffect="non-scaling-stroke" />
              <text x={z.u - 17} y={18} fontSize={5.4} fill="currentColor" stroke="none" fontFamily="var(--font-mono)">
                {z.name}
              </text>
            </g>
          ))}
        </Slab>

        {/* gantry: back post, boxes behind it, beam, front post, boxes in front */}
        <Slab o={o} x={GU} y={-36} w={8} d={8} r={1.5} h={46} />
        {behind.map(box)}
        <Slab
          o={o}
          x={GU - 2}
          y={-38}
          w={12}
          d={76}
          r={2}
          z={46}
          h={9}
          walls={
            <text x={10} y={-2.6} fontSize={6} letterSpacing={1} transform={rightM(crossR[0], crossR[1])} fill="currentColor" stroke="none" fontFamily="var(--font-mono)">
              openplan
            </text>
          }
        />
        {scanning ? (
          <path
            d={(() => {
              const a = P(o, GU + 4, -6, 46);
              const b = P(o, GU + 4, -6, BELT.h + 2);
              return `M ${f(a[0])} ${f(a[1])} L ${f(b[0])} ${f(b[1])}`;
            })()}
            stroke="var(--iso-hot)"
            strokeDasharray="1.5 2"
          />
        ) : null}
        <Slab o={o} x={GU} y={28} w={8} d={8} r={1.5} h={46} />
        {front.map(box)}
      </Svg>
    </div>
  );
}
