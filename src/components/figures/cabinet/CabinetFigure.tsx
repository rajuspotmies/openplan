"use client";

import * as React from "react";
import { Dots, IsoFigure, Line, Plate, Solid } from "@/components/iso/react/draw";
import { spring, useLoop, useReadout, type Spring } from "@/components/iso/react/live";
import { translateAlong } from "@/components/iso/iso-kit";
import { CABINET_ART, CAVITIES, DRAWERS, MAT_ART, type Item } from "./geometry";
import { HEIGHT, P, TRAVEL, WIDTH } from "./view";
import "@/components/iso/iso.css";
import "./cabinet.css";

/* ── static art ───────────────────────────────────────────────────────────── */

function Items({ items }: { items: Item[] }) {
  return (
    <>
      {items.map((it, k) =>
        it.t === "solid" ? (
          <Solid key={k} paths={it.paths} tone={it.tone} crease={it.crease ?? "faint"} />
        ) : it.t === "line" ? (
          <Line key={k} d={it.d} tone={it.tone} free={it.free} />
        ) : (
          <Dots key={k} points={it.points} size={it.size} tone={it.tone ?? "mid"} />
        ),
      )}
    </>
  );
}

const MAT = (
  <g key="mat">
    <path className="iso-halo" d={MAT_ART.halo} />
    {MAT_ART.feet.map((parts, i) => (
      <g key={i}>
        <Solid paths={parts[0]} tone="lo" />
        <Solid paths={parts[1]} tone="lo" />
      </g>
    ))}
    <Solid paths={MAT_ART.slab} tone="lo" crease="faint" />
    <Line d={MAT_ART.groove} tone="faint" />
    <Line d={MAT_ART.screwRings} tone="lo" />
    <Dots points={MAT_ART.screws} size={0.5} />
    <Solid paths={MAT_ART.ruler} tone="lo" crease="none" />
    <Line d={MAT_ART.ticksMinor} tone="lo" />
    <Line d={MAT_ART.ticksMajor} tone="mid" />
    <Solid paths={MAT_ART.plate} tone="lo" crease="none" />
    <Line d={MAT_ART.plateLine} tone="faint" />
    <Line d={MAT_ART.plateRules} tone="lo" free />
    <Dots points={MAT_ART.plateScrews} size={0.45} />
  </g>
);

const C = CABINET_ART;

const BODY = (
  <g key="body">
    <path className="iso-halo" d={C.halo} />
    {C.pads.map((paths, i) => (
      <Solid key={i} paths={paths} tone="lo" />
    ))}
    <Solid paths={C.plinth} tone="lo" />
    <Solid paths={C.carcass} tone="mid" inner={<Line d={C.carcassSeams} tone="faint" />} />
    {/* right side face */}
    <Line d={C.vents} tone="lo" />
    <Line d={C.grip} tone="mid" />
    <Line d={C.gripInner} tone="faint" />
    <Solid paths={C.sidePlate} tone="lo" crease="none" />
    <Line d={C.sidePlateLine} tone="faint" />
    <Line d={C.sidePlateRules} tone="lo" free />
    <Dots points={C.sidePlateScrews} size={0.45} />
    {/* lock on the top rail */}
    <Solid paths={C.lockPlate} tone="lo" crease="none" />
    <Line d={C.lockRing} tone="mid" />
    <Line d={C.lockCore} tone="lo" />
    <Line d={C.lockKey} tone="hi" />
  </g>
);

const LID = (
  <g key="lid">
    <Solid paths={C.lid} tone="mid" />
    <Line d={C.lidGroove} tone="faint" />
    <Line d={C.lidScrewRings} tone="lo" />
    <Dots points={C.lidScrews} size={0.45} />
    {C.handlePosts.map((parts, i) => (
      <g key={i}>
        <Solid paths={parts[0]} tone="mid" />
        <Solid paths={parts[1]} tone="mid" />
      </g>
    ))}
    <Line d={C.handleCollarSeams} tone="faint" />
    <Solid paths={C.handleBar} tone="mid" inner={<Line d={C.handleKnurl} tone="faint" />} />
    <Dots points={C.handleScrews} size={0.45} />
  </g>
);

/* ── live figure ──────────────────────────────────────────────────────────── */

/**
 * One drawer, memoised: its paths are static, so changing the active drawer only reorders
 * these nodes instead of re-rendering thousands of SVG elements.
 */
const Drawer = React.memo(function Drawer({
  i,
  uid,
  boxRef,
  frontRef,
  onEnter,
  onLeave,
  onPick,
}: {
  i: number;
  uid: string;
  boxRef: (el: SVGGElement | null) => void;
  frontRef: (el: SVGGElement | null) => void;
  onEnter: (i: number) => void;
  onLeave: () => void;
  onPick: (i: number) => void;
}) {
  const d = DRAWERS[i];
  return (
    <g data-drawer={i} className="cab-drawer" onPointerEnter={() => onEnter(i)} onPointerLeave={onLeave} onClick={() => onPick(i)}>
      <g clipPath={`url(#${uid}-d${i})`}>
        <g ref={boxRef}>
          <Items items={d.box} />
          <Items items={d.contents} />
          <Items items={d.nearWall} />
        </g>
      </g>
      <g ref={frontRef}>
        <Solid paths={d.front} tone="mid" />
        <Solid paths={d.holder} tone="lo" crease="none" />
        <Solid paths={d.card} tone="hi" crease="none" />
        <Line d={d.cardRules} tone="lo" free />
        <Dots points={d.holderRivets} size={0.4} />
        {d.pullPosts.map((paths, k) => (
          <Solid key={k} paths={paths} tone="mid" />
        ))}
        <Solid paths={d.pullBar} tone="hi" />
      </g>
    </g>
  );
});

export interface CabinetFigureProps {
  active: number;
  labels: string[];
  onHoverDrawer?: (index: number | null) => void;
  onPickDrawer?: (index: number) => void;
}

const STIFFNESS = 70;
const DAMPING = 17; // a hair under critical: drawers run out smoothly and settle without a bounce

export default function CabinetFigure({ active, labels, onHoverDrawer, onPickDrawer }: CabinetFigureProps) {
  const uid = React.useId().replace(/:/g, "");
  const { anchor, say } = useReadout<SVGGElement>();
  const boxRefs = React.useRef<Array<SVGGElement | null>>([]);
  const frontRefs = React.useRef<Array<SVGGElement | null>>([]);
  const springs = React.useRef<Spring[]>(DRAWERS.map(() => ({ at: 0, rate: 0 })));

  // stable callbacks so the memoised drawers never re-render
  const handlers = React.useRef({ onHoverDrawer, onPickDrawer });
  React.useEffect(() => {
    handlers.current = { onHoverDrawer, onPickDrawer };
  }, [onHoverDrawer, onPickDrawer]);
  const onEnter = React.useCallback((i: number) => handlers.current.onHoverDrawer?.(i), []);
  const onLeave = React.useCallback(() => handlers.current.onHoverDrawer?.(null), []);
  const onPick = React.useCallback((i: number) => handlers.current.onPickDrawer?.(i), []);
  const refSetters = React.useMemo(
    () =>
      DRAWERS.map((_, i) => ({
        box: (el: SVGGElement | null) => {
          boxRefs.current[i] = el;
        },
        front: (el: SVGGElement | null) => {
          frontRefs.current[i] = el;
        },
      })),
    [],
  );

  // paint order: the most recently opened drawer last, so an open drawer is always on top
  const [order, setOrder] = React.useState<number[]>(() => DRAWERS.map((_, i) => i));
  React.useEffect(() => {
    setOrder((prev) => [...prev.filter((i) => i !== active), active]);
  }, [active]);

  const kick = useLoop((dt, calm) => {
    let moving = false;
    springs.current.forEach((s, i) => {
      const target = i === active ? TRAVEL : 0;
      const settled = calm ? ((s.at = target), (s.rate = 0), true) : spring(s, target, dt, STIFFNESS, DAMPING);
      if (!settled) moving = true;
      const t = translateAlong(P, [0, s.at, 0]);
      boxRefs.current[i]?.setAttribute("transform", t);
      frontRefs.current[i]?.setAttribute("transform", t);
    });
    return moving;
  }, true);

  React.useEffect(() => {
    kick();
    say(`${String(active + 1).padStart(2, "0")} / 08 · ${labels[active]}`);
    frontRefs.current.forEach((g, i) => {
      const front = g?.querySelector(".iso-solid");
      if (!front) return;
      if (i === active) front.setAttribute("data-lit", "");
      else front.removeAttribute("data-lit");
    });
  }, [active, kick, say, labels]);

  return (
    <div className="iso cabinet" data-theme="light">
      <Plate fig="" readout="">
        <IsoFigure
          width={WIDTH}
          height={HEIGHT}
          label="A tool cabinet with eight drawers standing on a bench mat. The selected drawer slides out to show what it holds: kanban cards, parts bins, revision cards, folders, workflow stages, lifecycle blocks, certificates with a stamp, and team tokens around a table."
        >
          <defs>
            {DRAWERS.map((d, i) => (
              <clipPath key={i} id={`${uid}-d${i}`}>
                <path d={d.clip} />
              </clipPath>
            ))}
            {CAVITIES.map((c, i) => (
              <clipPath key={i} id={`${uid}-c${i}`}>
                <path d={c.clip} />
              </clipPath>
            ))}
          </defs>

          <g ref={anchor}>
            {MAT}
            {BODY}

            {/* openings: the dark cavity a drawer leaves behind when it slides out */}
            {CAVITIES.map((c, i) => (
              <g key={i} clipPath={`url(#${uid}-c${i})`}>
                <path className="cab-cavity" d={c.clip} />
                <path className="cab-cavity-wall" d={c.wall} />
                <path className="cab-cavity-floor" d={c.floor} />
              </g>
            ))}

            {LID}

            {order.map((i) => (
              <Drawer
                key={i}
                i={i}
                uid={uid}
                boxRef={refSetters[i].box}
                frontRef={refSetters[i].front}
                onEnter={onEnter}
                onLeave={onLeave}
                onPick={onPick}
              />
            ))}
          </g>
        </IsoFigure>
      </Plate>
    </div>
  );
}
