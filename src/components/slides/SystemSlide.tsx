"use client";

// Slide 2 — the system map. Tools the team already uses (and the spreadsheets they keep) feed
// OpenPlan, which hands clean work on to suppliers, manufacturing and compliance. Under it the
// AI Architect takes in live changes and sends checked fixes back up. Packets ride the traces.
import { useEffect, useRef, useState, type ComponentType } from "react";
import { Box, Cloud, Factory, ListChecks, Sheet, ShieldCheck, Truck, type LucideProps } from "lucide-react";
import { CUBE, Slab, gridPath, topM, type O } from "./iso";
import { MARK_D } from "./mark";
import { useOnScreen, useReducedMotion, useReveal } from "./useSlideBits";

const W = 1000;
const H = 456;
const o: O = { cx: 500, cy: 160 };
const C = 0.8660254037844386;

type PartId = "tools" | "sheets" | "hub" | "out" | "cloud";

/** Floor coordinates of a tile whose centre lands on screen point (sx, sy) at z = 0. */
const floorAt = (sx: number, sy: number) => {
  const a = (sx - o.cx) / C;
  const b = 2 * (sy - o.cy);
  return { u: (a + b) / 2, v: (b - a) / 2 };
};

type TileSpec = { sx: number; sy: number; h: number; Icon: ComponentType<LucideProps>; brand: string };

function Tile({ sx, sy, h, Icon, brand }: TileSpec) {
  const { u, v } = floorAt(sx, sy);
  return (
    <g style={{ ["--brand" as string]: brand }}>
      <Slab o={o} x={u - 22} y={v - 22} w={44} d={44} r={7} h={h} topFill="var(--top)">
        <rect x={u - 16} y={v - 16} width={32} height={32} rx={4} className="ops-tplate" vectorEffect="non-scaling-stroke" />
        <g transform={`translate(${u - 12} ${v - 12})`}>
          <Icon width={24} height={24} className="ops-glyph" strokeWidth={1.7} />
        </g>
      </Slab>
    </g>
  );
}

const TRACE_L = [
  "M 248.1 88 H 280 C 337.5 88 337.5 166.72 395 166.72 H 414.64",
  "M 248.1 160 H 280 C 337.5 160 337.5 176.8 395 176.8 H 432.1",
  "M 248.1 232 H 280 C 337.5 232 337.5 186.88 395 186.88 H 449.56",
  "M 248.1 350 H 280 C 337.5 350 337.5 196.96 395 196.96 H 467.02",
];
const TRACE_R = [
  "M 585.36 166.72 H 610 C 665 166.72 665 88 720 88 H 751.89",
  "M 567.9 176.8 H 610 C 665 176.8 665 160 720 160 H 751.89",
  "M 550.44 186.88 H 610 C 665 186.88 665 232 720 232 H 751.89",
];
const LANE_DOWN = "M 480 204.45 V 318.55";
const LANE_UP = "M 520 318.55 V 204.45";

// Packets: which path, when they start in the 6 s loop, how long they ride, their size.
type Pkt = { path: number; t0: number; dur: number; s: number; fix?: boolean };
const PATHS = [...TRACE_L, ...TRACE_R, LANE_DOWN, LANE_UP];
const PKTS: Pkt[] = [
  { path: 0, t0: 0.0, dur: 1.9, s: 1 },
  { path: 2, t0: 1.1, dur: 1.9, s: 1 },
  { path: 1, t0: 2.6, dur: 1.9, s: 1 },
  { path: 3, t0: 3.6, dur: 2.1, s: 1 },
  { path: 4, t0: 1.9, dur: 1.7, s: 0.5 },
  { path: 6, t0: 3.0, dur: 1.7, s: 0.5 },
  { path: 5, t0: 4.5, dur: 1.7, s: 0.5 },
  { path: 7, t0: 0.6, dur: 2.0, s: 0.55 },
  { path: 8, t0: 3.3, dur: 2.0, s: 0.55, fix: true },
];
const LOOP = 6;

const PART_TRACES: Record<PartId, number[]> = {
  tools: [0, 1, 2],
  sheets: [3],
  hub: [0, 1, 2, 3, 4, 5, 6],
  out: [4, 5, 6],
  cloud: [7, 8],
};

export default function SystemSlide() {
  const reveal = useReveal<HTMLDivElement>();
  const reveal2 = useReveal<HTMLDivElement>();
  const reduced = useReducedMotion();
  const planRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(planRef, "100px");
  const [hot, setHot] = useState<PartId | null>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const pktRefs = useRef<(SVGGElement | null)[]>([]);
  const hubRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!onScreen || reduced) return;
    const lens = pathRefs.current.map((p) => p?.getTotalLength() ?? 0);
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const T = ((now - start) / 1000) % LOOP;
      let fixing = false;
      PKTS.forEach((k, i) => {
        const g = pktRefs.current[i];
        const p = pathRefs.current[k.path];
        if (!g || !p) return;
        const local = (T - k.t0 + LOOP) % LOOP;
        if (local > k.dur) {
          g.setAttribute("opacity", "0");
          return;
        }
        const x = local / k.dur;
        const e = x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; // ease in-out
        const pt = p.getPointAtLength(e * lens[k.path]);
        const fade = Math.min(1, x / 0.12, (1 - x) / 0.12);
        g.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${(pt.y + 5).toFixed(1)}) scale(${k.s})`);
        g.setAttribute("opacity", fade.toFixed(2));
        if (k.fix && x > 0.85) fixing = true;
      });
      if (hubRef.current) {
        if (fixing) hubRef.current.setAttribute("data-fix", "");
        else hubRef.current.removeAttribute("data-fix");
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onScreen, reduced]);

  const partAttrs = (id: PartId) => ({
    className: "ops-part",
    "data-hot": hot === id ? "" : undefined,
    "data-dim": hot && hot !== id ? "" : undefined,
    onPointerEnter: () => setHot(id),
    onPointerLeave: () => setHot((h) => (h === id ? null : h)),
  });
  const traceOn = (i: number) => (hot && PART_TRACES[hot].includes(i) ? "" : undefined);

  const hubMark = 40 / 259;

  return (
    <section className="ops-sec" id="how-it-fits" aria-labelledby="ops-fits-title">
      <div ref={reveal} className="ops-reveal" data-reveal="pending">
        <p className="ops-label">What we do</p>
        <h2 id="ops-fits-title" className="ops-h2" style={{ maxWidth: "31ch" }}>
          OpenPlan runs the whole hardware program.
          <span className="ops-dim">The AI Architect watches every change, finds the risk, and fixes it before it reaches the line.</span>
        </h2>
      </div>

      <div ref={reveal2} className="ops-reveal ops-map" data-reveal="pending" style={{ ["--reveal-delay" as string]: "80ms" }}>
        <figure className="ops-fig">
          <div className="ops-figTop">
            <span>Fig 0.1</span>
            <span>System</span>
          </div>
          <div className="ops-figStage ops-mapStage">
            <div className="ops-plan" ref={planRef}>
              <svg
                viewBox={`0 0 ${W} ${H}`}
                role="img"
                aria-label="How OpenPlan fits. The tools your team uses, such as SolidWorks, Onshape and Jira, and the spreadsheets you keep feed OpenPlan, which holds requirements, the BOM and the program, and hands clean work to suppliers, manufacturing and compliance. Under that path the AI Architect takes in live changes, finds the risk, checks each fix and sends checked fixes back into OpenPlan."
                style={{ overflow: "visible", width: "100%", height: "auto" }}
                fill="none"
                stroke="var(--iso-ink)"
                strokeWidth={1}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <defs>
                  <radialGradient id="ops-sm-g" cx="50%" cy="50%" r="55%">
                    <stop offset="0" stopColor="#fff" />
                    <stop offset="0.6" stopColor="#fff" stopOpacity="0.6" />
                    <stop offset="1" stopColor="#fff" stopOpacity="0" />
                  </radialGradient>
                  <mask id="ops-sm-m" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
                    <rect width={W} height={H} fill="url(#ops-sm-g)" />
                  </mask>
                </defs>
                <g mask="url(#ops-sm-m)">
                  <path d={gridPath(624, 24)} transform={topM(o)} className="ops-mfloor" stroke="var(--iso-grid)" vectorEffect="non-scaling-stroke" />
                </g>

                {PATHS.map((d, i) => (
                  <path
                    key={i}
                    ref={(el) => {
                      pathRefs.current[i] = el;
                    }}
                    d={d}
                    className={i >= 7 ? "ops-lane" : "ops-trace"}
                    data-on={traceOn(i)}
                  />
                ))}
                <path d="M 475 309.55 l 5 6 l 5 -6 M 515 213.45 l 5 -6 l 5 6" className="ops-arrow" />
                <text x={466} y={266} textAnchor="end" className="ops-head">
                  LIVE CHANGES
                </text>
                <text x={534} y={266} className="ops-head">
                  CHECKED FIXES
                </text>

                {/* tools you use */}
                <g {...partAttrs("tools")}>
                  <rect x={40} y={12} width={230} height={258} className="ops-hit" />
                  <text x={210} y={30} textAnchor="middle" className="ops-head">
                    TOOLS YOU USE
                  </text>
                  <Tile sx={210} sy={88} h={10} Icon={Box} brand="#ff6b6b" />
                  <Tile sx={210} sy={160} h={10} Icon={Cloud} brand="#5cc8ff" />
                  <Tile sx={210} sy={232} h={10} Icon={ListChecks} brand="#7c9bff" />
                  <text x={154} y={93} textAnchor="end" className="ops-name">
                    SolidWorks
                  </text>
                  <text x={154} y={165} textAnchor="end" className="ops-name">
                    Onshape
                  </text>
                  <text x={154} y={237} textAnchor="end" className="ops-name">
                    Jira
                  </text>
                  <text x={154} y={258} textAnchor="end" className="ops-sub">
                    and more
                  </text>
                </g>

                {/* sheets you keep */}
                <g {...partAttrs("sheets")}>
                  <rect x={30} y={280} width={240} height={110} className="ops-hit" />
                  <text x={210} y={298} textAnchor="middle" className="ops-head">
                    SHEETS YOU KEEP
                  </text>
                  <Tile sx={210} sy={350} h={10} Icon={Sheet} brand="#4ade80" />
                  <text x={154} y={347} textAnchor="end" className="ops-name">
                    Your sheets
                  </text>
                  <text x={154} y={367} textAnchor="end" className="ops-sub">
                    Excel · Google Sheets
                  </text>
                </g>

                {/* delivers to */}
                <g {...partAttrs("out")}>
                  <rect x={730} y={12} width={220} height={250} className="ops-hit" />
                  <text x={790} y={30} textAnchor="middle" className="ops-head">
                    DELIVERS TO
                  </text>
                  <Tile sx={790} sy={88} h={16} Icon={Truck} brand="#7c9bff" />
                  <Tile sx={790} sy={160} h={16} Icon={Factory} brand="#ffffff" />
                  <Tile sx={790} sy={232} h={16} Icon={ShieldCheck} brand="#4ade80" />
                  <text x={846} y={93} className="ops-name">
                    Suppliers
                  </text>
                  <text x={846} y={165} className="ops-name">
                    Manufacturing
                  </text>
                  <text x={846} y={237} className="ops-name">
                    Compliance
                  </text>
                </g>

                {/* OpenPlan hub */}
                <g {...partAttrs("hub")} ref={hubRef}>
                  <rect x={330} y={12} width={340} height={210} className="ops-hit" />
                  <text x={500} y={31} textAnchor="middle" className="ops-title">
                    OpenPlan
                  </text>
                  <text x={500} y={55} textAnchor="middle" className="ops-fn">
                    REQUIREMENTS · BOM · PROGRAM
                  </text>
                  <Slab o={o} x={-56} y={-56} w={112} d={112} r={10} h={7} topFill="var(--top)">
                    <path
                      d={[-22, -11, 0, 11, 22]
                        .map((k) => `M ${k} 42 v 5 M ${k} -42 v -5 M 42 ${k} h 5 M -42 ${k} h -5`)
                        .join(" ")}
                      className="ops-pins"
                      vectorEffect="non-scaling-stroke"
                    />
                  </Slab>
                  <Slab o={o} x={-38} y={-38} w={76} d={76} r={7} z={7} h={12} topFill="var(--top)">
                    <path d={MARK_D} className="ops-hubmark" stroke="none" transform={`translate(-20 -20) scale(${hubMark})`} />
                  </Slab>
                </g>

                {/* AI Architect */}
                <g {...partAttrs("cloud")}>
                  <rect x={390} y={300} width={420} height={150} className="ops-hit" />
                  <Slab o={o} x={157} y={157} w={116} d={116} r={12} h={10} topFill="var(--top)">
                    <rect x={166} y={166} width={98} height={98} rx={6} className="ops-pins" vectorEffect="non-scaling-stroke" />
                    {[58, 40, 66, 34, 50].map((len, i) => (
                      <g key={i}>
                        <rect x={175} y={182 + i * 15} width={6} height={6} rx={1} className={i % 2 ? "ops-box" : "ops-boxOn"} vectorEffect="non-scaling-stroke" />
                        <path d={`M 187 ${185 + i * 15} h ${len}`} className="ops-row" vectorEffect="non-scaling-stroke" />
                      </g>
                    ))}
                  </Slab>
                  <circle cx={642} cy={354} r={4} className="ops-live" stroke="none" />
                  <text x={656} y={360} className="ops-title">
                    AI Architect
                  </text>
                  <text x={638} y={386} className="ops-fn">
                    FINDS RISK LIVE
                  </text>
                  <text x={638} y={407} className="ops-fn">
                    CHECKS EACH CHANGE
                  </text>
                  <text x={638} y={428} className="ops-fn">
                    PROVES READINESS
                  </text>
                </g>

                {PKTS.map((k, i) => (
                  <g
                    key={i}
                    ref={(el) => {
                      pktRefs.current[i] = el;
                    }}
                    className={k.fix ? "ops-fix" : "ops-pkt"}
                    opacity={0}
                    pointerEvents="none"
                  >
                    <path d={CUBE} vectorEffect="non-scaling-stroke" />
                  </g>
                ))}
              </svg>
            </div>

            {/* phones: the same map as a schematic */}
            <div className="ops-schem">
              <div className="ops-node">
                <p className="ops-nodeHead">Tools you use</p>
                <ul>
                  <li><Box size={14} />SolidWorks</li>
                  <li><Cloud size={14} />Onshape</li>
                  <li><ListChecks size={14} />Jira</li>
                  <li><Sheet size={14} />Your sheets</li>
                </ul>
              </div>
              <div className="ops-flow"><span>↓ changes</span></div>
              <div className="ops-node" data-core="">
                <p className="ops-nodeTitle">OpenPlan</p>
                <p className="ops-nodeFns">Requirements · BOM · Program</p>
              </div>
              <div className="ops-flow"><span>↓ live changes</span><span>↑ checked fixes</span></div>
              <div className="ops-node">
                <p className="ops-nodeTitle"><i className="ops-dot" />AI Architect</p>
                <p className="ops-nodeFns">Finds risk live · Checks each change · Proves readiness</p>
              </div>
              <div className="ops-flow"><span>↓ clean work</span></div>
              <div className="ops-node">
                <p className="ops-nodeHead">Delivers to</p>
                <ul>
                  <li><Truck size={14} />Suppliers</li>
                  <li><Factory size={14} />Manufacturing</li>
                  <li><ShieldCheck size={14} />Compliance</li>
                </ul>
              </div>
            </div>
          </div>
          <figcaption className="ops-figFoot">
            <span>Hover a part</span>
            <span>illustrative</span>
          </figcaption>
        </figure>

        <div className="ops-legend">
          <div>
            <h3>
              <svg viewBox="0 0 259 258" width="14" height="14" aria-hidden="true">
                <path d={MARK_D} fill="currentColor" />
              </svg>
              OpenPlan
            </h3>
            <p>One workspace for requirements, the BOM and the program. Wired to the tools your team already runs.</p>
          </div>
          <div>
            <h3>
              <i className="ops-dot" />
              AI Architect
            </h3>
            <p>Watches live changes, finds what will slip, and checks each fix before it counts.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
