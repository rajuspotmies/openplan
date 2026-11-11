import { useEffect, useRef } from "react";
import { ROVER_DATA, ROVER_SVG } from "./roverArt";
import "./iso.css";
import "./rover.css";

type PieceId = (typeof ROVER_DATA.order)[number];

interface PartNode {
  el: SVGGElement;
  piece: string;
  key: number;
  lift: number;
  screen: [number, number];
  shown: string;
}

const { order: ORDER, schedule: SCHEDULE, pieces: PIECES, axes: AXES } = ROVER_DATA;
const END = SCHEDULE.start + (ORDER.length - 1) * SCHEDULE.step + SCHEDULE.length;
const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
// The same schedule the build audits: assembly i leaves over [start + i·step, start + i·step + length].
const shareOf = (p: number, index: number) => smooth((p - SCHEDULE.start - index * SCHEDULE.step) / SCHEDULE.length);
const outAt = (index: number) => SCHEDULE.start + index * SCHEDULE.step + SCHEDULE.length;
const num = (index: number) => String(index + 1).padStart(2, "0");

// variant "blueprint" draws the same figure in white and light-blue lines on blueprint blue.
export default function RoverAnatomy({ variant = "plain" }: { variant?: "plain" | "blueprint" }) {
  const blueprint = variant === "blueprint";
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const note = useRef<HTMLParagraphElement>(null);
  const live = useRef<HTMLSpanElement>(null);
  const legend = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const root = section.current!;
    const box = stage.current!;
    const parts = box.querySelector<SVGGElement>(".rv-parts")!;
    const still = matchMedia("(prefers-reduced-motion: reduce)");
    const nodes: PartNode[] = Array.from(parts.querySelectorAll<SVGGElement>(":scope > .it")).map((el) => {
      const [mx, my, mz] = el.dataset.m!.split(",").map(Number);
      return {
        el,
        piece: el.dataset.piece!,
        key: Number(el.dataset.k),
        lift: Number(el.dataset.l),
        screen: [AXES.x[0] * mx + AXES.y[0] * my + AXES.z[0] * mz, AXES.x[1] * mx + AXES.y[1] * my + AXES.z[1] * mz],
        shown: "",
      };
    });
    const buttons = Array.from(legend.current!.querySelectorAll<HTMLButtonElement>("button"));
    let sorted = nodes.map((_, i) => i);
    let p = 0;
    let target = 0;
    let frame = 0;
    let last = 0;
    let active: PieceId | null = null;
    let phase = "";

    // ?p=0.5 pins the explode at that progress, for screenshots and review.
    const pinned = new URLSearchParams(window.location.search).get("p");
    const progressOf = () => {
      if (pinned !== null) return clamp(Number(pinned) || 0, 0, 1);
      const rect = root.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      return range > 0 ? clamp(-rect.top / range, 0, 1) : 0;
    };

    function place() {
      const shares = Object.fromEntries(ORDER.map((id, i) => [id, shareOf(p, i)])) as Record<string, number>;
      for (const node of nodes) {
        const share = shares[node.piece] ?? 0;
        const text = share === 0 ? "" : `translate(${(node.screen[0] * share).toFixed(2)} ${(node.screen[1] * share).toFixed(2)})`;
        if (text !== node.shown) {
          node.shown = text;
          if (text) node.el.setAttribute("transform", text);
          else node.el.removeAttribute("transform");
        }
      }
      const next = nodes.map((_, i) => i).sort((a, b) => nodes[a].key + nodes[a].lift * (shares[nodes[a].piece] ?? 0) - (nodes[b].key + nodes[b].lift * (shares[nodes[b].piece] ?? 0)));
      if (next.some((index, at) => index !== sorted[at])) {
        const fragment = document.createDocumentFragment();
        for (const index of next) fragment.appendChild(nodes[index].el);
        parts.appendChild(fragment);
        sorted = next;
      }

      // The assembly to watch: the one moving fastest, whose own window is nearest its middle.
      let pick = -1;
      let best = 0.5;
      ORDER.forEach((_, i) => {
        const t = (p - SCHEDULE.start - i * SCHEDULE.step) / SCHEDULE.length;
        if (t > 0 && t < 1 && Math.abs(t - 0.5) <= best) {
          best = Math.abs(t - 0.5);
          pick = i;
        }
      });
      const id = pick < 0 ? null : ORDER[pick];
      if (id !== active) {
        active = id;
        for (const node of nodes) node.el.toggleAttribute("data-on", node.piece === id);
        buttons.forEach((button) => button.toggleAttribute("data-on", button.dataset.part === id));
        if (id) box.setAttribute("data-focus", "");
        else box.removeAttribute("data-focus");
        note.current!.textContent = id ? `${PIECES[id].name}: ${PIECES[id].say}.` : p > 0.5 ? `Apart: ${ORDER.length} assemblies around the fixed body.` : `Assembled: ${ROVER_DATA.solids} solid parts.`;
      }
      const text = p <= 0.001 ? `assembled · ${ROVER_DATA.solids} parts` : !id ? `apart · ${ORDER.length} assemblies` : `${num(pick)} ${PIECES[id].name.toLowerCase()} · ${Math.round(shares[id] * PIECES[id].travel)} cm`;
      if (readout.current!.textContent !== text) readout.current!.textContent = text;
      const said = p <= 0.001 ? "assembled" : !id ? "apart" : PIECES[id].name;
      if (said !== phase) {
        phase = said;
        box.setAttribute("aria-valuetext", p <= 0.001 ? "Assembled" : !id ? `Apart, ${ORDER.length} assemblies` : `Taking apart: ${PIECES[id].name}`);
        if (document.activeElement === box) live.current!.textContent = box.getAttribute("aria-valuetext");
      }
      box.setAttribute("aria-valuenow", String(Math.round(p * 100)));
    }

    function tick(now: number) {
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;
      p = still.matches ? target : p + (target - p) * (1 - Math.exp(-dt / 0.14));
      if (Math.abs(target - p) < 1e-4) p = target;
      place();
      frame = p !== target ? requestAnimationFrame(tick) : 0;
    }
    const run = () => {
      target = progressOf();
      if (!frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };
    const scrollToProgress = (value: number) => {
      const rect = root.getBoundingClientRect();
      const top = window.scrollY + rect.top + value * (rect.height - window.innerHeight);
      window.scrollTo({ top, behavior: still.matches ? "auto" : "smooth" });
    };
    const onKey = (event: KeyboardEvent) => {
      const stops = [0, ...ORDER.map((_, i) => outAt(i))];
      const here = stops.reduce((best, stop, i) => (Math.abs(stop - target) < Math.abs(stops[best] - target) ? i : best), 0);
      let to: number | null = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") to = Math.min(stops.length - 1, here + 1);
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") to = Math.max(0, here - 1);
      if (event.key === "Home") to = 0;
      if (event.key === "End") to = stops.length - 1;
      if (to === null) return;
      event.preventDefault();
      scrollToProgress(to === stops.length - 1 ? 1 : stops[to]);
    };
    const onClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-part]");
      if (button) scrollToProgress(outAt(ORDER.indexOf(button.dataset.part as PieceId)));
    };

    p = target = progressOf();
    place();
    window.addEventListener("scroll", run, { passive: true });
    window.addEventListener("resize", run);
    box.addEventListener("keydown", onKey);
    legend.current!.addEventListener("click", onClick);
    const legendEl = legend.current!;
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", run);
      window.removeEventListener("resize", run);
      box.removeEventListener("keydown", onKey);
      legendEl.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <section ref={section} className={`rv-scroll iso${blueprint ? " rv-blueprint" : ""}`} data-theme="dark">
      <div className="rv-sticky">
        <figure className="iso-figure rv-figure">
          <div className="iso-plate">
            <div className="iso-plate-corners" aria-hidden="true">
              <span className="iso-plate-corner" data-corner="fig">{blueprint ? "Sheet 01 / 01" : "Fig 1"}</span>
              <span className="iso-plate-corner" data-corner="title">{blueprint ? "ROVER-01 · General arrangement" : "Rover, taken apart"}</span>
              <span className="iso-plate-corner" data-corner="hint">Scroll to take it apart</span>
              <span ref={readout} className="iso-plate-corner" data-corner="readout" data-readout="">
                assembled · {ROVER_DATA.solids} parts
              </span>
            </div>
            <div
              ref={stage}
              className="rv-stage"
              tabIndex={0}
              role="slider"
              aria-label="Planetary rover exploded view. Scroll, or use the arrow keys, to take it apart one assembly at a time."
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={0}
              aria-valuetext="Assembled"
              dangerouslySetInnerHTML={{ __html: ROVER_SVG }}
            />
            <span ref={live} className="rv-sr" aria-live="polite" />
          </div>
          <figcaption className="iso-legend rv-legend">
            <ol ref={legend} className="rv-parts-list">
              {ORDER.map((id, i) => (
                <li key={id}>
                  <button type="button" data-part={id}>
                    <span className="rv-num">{num(i)}</span>
                    {PIECES[id].name}
                  </button>
                </li>
              ))}
            </ol>
            <p ref={note} className="rv-note">
              Assembled: {ROVER_DATA.solids} solid parts.
            </p>
            <span className="iso-caption">
              A six-wheeled rover on a test bed. The body hangs from two rocker-bogies, each a rocker and a bogie on free pivots with no springs, so all
              six wheels stay on uneven ground. Scroll and it comes apart from the outside in: the mast and antennas lift first, then the solar deck and
              the avionics under it, the power unit slides back, and the wheels and suspension come off their axles. Units are centimetres.
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
