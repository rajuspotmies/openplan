"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock3, Download, Share2, UserPlus } from "lucide-react";
import { C, Btn, Pill, Pop, Scaled, countUp, ease, prog, useStageClock, type ScreenProps } from "./screen-kit";

/*
 * Requirements: a breakdown tree that draws itself, edge by edge (category → subsystem
 * → component), then each requirement's review and verification status settles while
 * coverage climbs.
 * Phases (callouts): 0 coverage + categories · 1 tiers and cards drawn · 2 statuses verified.
 */

type Status = "Draft" | "Reviewed" | "Approved";
type Verif = "Not verified" | "In progress" | "Passed";
interface Req {
  id: string;
  title: string;
  kind: "Subsystem" | "Component";
  status: Status;
  verif: Verif;
}

const GROUPS: { name: string; reqs: Req[] }[] = [
  {
    name: "Airframe & Propulsion",
    reqs: [
      { id: "ARP-001", title: "Quad-rotor frame", kind: "Subsystem", status: "Approved", verif: "Passed" },
      { id: "ARP-002", title: "Propeller sizing", kind: "Subsystem", status: "Approved", verif: "Passed" },
    ],
  },
  {
    name: "Power System",
    reqs: [
      { id: "PWR-001", title: "Swappable battery bay", kind: "Subsystem", status: "Approved", verif: "In progress" },
      { id: "PWR-002", title: "Power distribution", kind: "Subsystem", status: "Reviewed", verif: "Passed" },
      { id: "PWR-011", title: "Battery swap latch", kind: "Component", status: "Draft", verif: "Not verified" },
      { id: "PWR-012", title: "Charge controller", kind: "Component", status: "Draft", verif: "Not verified" },
    ],
  },
  {
    name: "Avionics & Navigation",
    reqs: [
      { id: "AVN-001", title: "Flight controller (F7)", kind: "Subsystem", status: "Approved", verif: "Passed" },
      { id: "AVN-002", title: "GPS + IMU redundancy", kind: "Subsystem", status: "Reviewed", verif: "In progress" },
      { id: "AVN-011", title: "Telemetry link (915MHz)", kind: "Component", status: "Draft", verif: "Not verified" },
    ],
  },
  {
    name: "Payload & Delivery",
    reqs: [
      // COPY FOR APPROVAL: two new payload requirements
      { id: "PLD-001", title: "Winch release mechanism", kind: "Subsystem", status: "Reviewed", verif: "In progress" },
      { id: "PLD-011", title: "Parcel bay sensor", kind: "Component", status: "Draft", verif: "Not verified" },
    ],
  },
];
const TIERS = ["Need", "Stakeholder", "System", "Subsystem", "Component"];

const STATUS_TONE: Record<Status, string> = { Draft: "#9a9aa3", Reviewed: C.purple, Approved: C.blue };
const VERIF_TONE: Record<Verif, string> = { "Not verified": "#8a8a93", "In progress": C.amber, Passed: C.green };

const PHASES = [2.6, 7.2, 12];

// tree geometry (inside the tree panel)
const ROW = 104;
const CARD_H = 86;
const TOP = 14;
const cyAt = (g: number) => TOP + CARD_H / 2 + g * ROW;

function Card({ r, settled, show }: { r: Req; settled: boolean; show: boolean }) {
  const status: Status = settled ? r.status : "Draft";
  const verif: Verif = settled ? r.verif : "Not verified";
  const VIcon = verif === "Passed" ? CheckCircle2 : verif === "In progress" ? Clock3 : Circle;
  return (
    <Pop show={show} x={-10} y={0} className="flex h-full flex-col justify-between rounded-[8px] border p-2.5" style={{ borderColor: settled ? C.line2 : C.line, background: C.panel }}>
      <span className="flex items-center justify-between gap-2">
        <Pill tone={r.kind === "Subsystem" ? C.blue : C.green}>{r.kind}</Pill>
        <span className="font-mono text-[10.5px]" style={{ color: C.faint }}>
          {r.id}
        </span>
      </span>
      <span className="truncate text-[13px]">{r.title}</span>
      <span className="flex items-center gap-2">
        <Pill tone={STATUS_TONE[status]}>{status}</Pill>
        <span className="flex items-center gap-1 text-[11px] transition-colors duration-300" style={{ color: VERIF_TONE[verif] }}>
          <VIcon size={12} strokeWidth={2} />
          {verif}
        </span>
      </span>
    </Pop>
  );
}

export default function RequirementsScreen({ active, step, compact }: ScreenProps) {
  const t = useStageClock(active, step, PHASES);
  const catX = compact ? 26 : 34;
  const catW = compact ? 118 : 148;
  const cardX = catX + catW + 26;
  const cardW = compact ? 178 : 188;
  const gap = 14;

  // phase 1: cards in reading order
  const flat = GROUPS.flatMap((g, gi) => g.reqs.map((r, ri) => ({ gi, ri, r })));
  const cardAt = (k: number) => 2.9 + k * 0.32;
  // phase 2: statuses settle in the same order
  const settleAt = (k: number) => 7.5 + k * 0.32;
  const settledCount = flat.filter((_, k) => t >= settleAt(k)).length;
  const coverage = Math.round(countUp(t, 0.4, 2.2, 12) + (settledCount / flat.length) * 52);
  const tiersLit = Math.floor(prog(t, 2.8, 6.4) * TIERS.length + (t >= 2.8 ? 1 : 0));

  return (
    <Scaled compact={compact}>
      <div className="flex h-full flex-col px-6 pb-5 pt-5">
        {/* header */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="m-0 font-mono text-[10.5px] uppercase tracking-[0.1em]" style={{ color: C.faint }}>
              Delivery drone · v2
            </p>
            <p className="m-0 mt-0.5 text-[19px] font-semibold tracking-[-0.01em]">Requirement Document</p>
          </div>
          {!compact && (
            <span className="flex gap-2">
              <Btn>
                <Download size={13} /> Download
              </Btn>
              <Btn>
                <UserPlus size={13} /> Invite
              </Btn>
              <Btn>
                <Share2 size={13} /> Share
              </Btn>
            </span>
          )}
        </div>

        {/* coverage + tiers */}
        <div className={`mt-4 grid gap-3 border-y py-3 ${compact ? "grid-cols-1" : "grid-cols-[300px_1fr]"}`} style={{ borderColor: C.line }}>
          <div>
            <p className="m-0 flex items-baseline justify-between text-[11.5px]" style={{ color: C.dim }}>
              Verification coverage
              <span className="text-[15px] font-semibold tabular-nums" style={{ color: C.green }}>
                {coverage}%
              </span>
            </p>
            <span className="mt-1.5 block h-[5px] overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
              <span className="block h-full rounded-full transition-[width] duration-500" style={{ width: `${coverage}%`, background: C.green }} />
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-hidden font-mono text-[10.5px] uppercase tracking-[0.08em]">
            {TIERS.map((tier, i) => {
              const lit = i < tiersLit;
              return (
                <span key={tier} className="flex items-center gap-1.5 whitespace-nowrap">
                  <span
                    className="rounded-[5px] border px-2 py-1 transition-colors duration-300"
                    style={{ borderColor: lit ? `${C.blue}66` : C.line, color: lit ? "#c9d4ff" : C.faint, background: lit ? C.blueSoft : "transparent" }}
                  >
                    {tier}
                  </span>
                  {i < TIERS.length - 1 && <span style={{ color: lit ? C.blue : C.faint }}>›</span>}
                </span>
              );
            })}
          </div>
        </div>

        <p className="m-0 mb-2 mt-4 font-mono text-[10.5px] uppercase tracking-[0.1em]" style={{ color: C.faint }}>
          Requirements breakdown
        </p>

        {/* tree */}
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-[10px] border" style={{ borderColor: C.line, background: "#0f0f11" }}>
          <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
            {GROUPS.map((g, gi) => {
              const cy = cyAt(gi);
              const mid = cyAt(1.5);
              return (
                <motion.path
                  key={g.name}
                  d={`M6 ${mid} C${catX - 6} ${mid}, 12 ${cy}, ${catX} ${cy}`}
                  fill="none"
                  stroke="rgba(255,255,255,0.28)"
                  strokeWidth={1}
                  initial={false}
                  animate={{ pathLength: t >= 0.5 + gi * 0.25 ? 1 : 0 }}
                  transition={{ duration: 0.6, ease }}
                />
              );
            })}
            {flat.map(({ gi, ri }, k) => {
              const cy = cyAt(gi);
              const x0 = ri === 0 ? catX + catW : cardX + ri * (cardW + gap) - gap;
              const x1 = cardX + ri * (cardW + gap);
              return (
                <motion.path
                  key={k}
                  d={`M${x0} ${cy} L${x1} ${cy}`}
                  fill="none"
                  stroke={C.blue}
                  strokeWidth={1}
                  initial={false}
                  animate={{ pathLength: t >= cardAt(k) - 0.15 ? 1 : 0, opacity: t >= cardAt(k) - 0.15 ? 0.7 : 0 }}
                  transition={{ duration: 0.3, ease }}
                />
              );
            })}
          </svg>
          {/* root port */}
          <span className="absolute h-[7px] w-[7px] -translate-y-1/2" style={{ left: 3, top: cyAt(1.5), background: C.blue }} />

          {GROUPS.map((g, gi) => {
            const settled = g.reqs.every((_, ri) => t >= settleAt(flat.findIndex((f) => f.gi === gi && f.ri === ri)));
            return (
              <Pop
                key={g.name}
                show={t >= 0.7 + gi * 0.25}
                x={-8}
                y={0}
                className="absolute flex flex-col justify-center rounded-[8px] border px-3"
                style={{ left: catX, top: cyAt(gi) - 30, width: catW, height: 60, borderColor: `${C.amber}45`, background: "rgba(240,180,91,0.08)" }}
              >
                <span className="text-[12.5px] font-medium leading-[1.3]" style={{ color: "#f3c98a" }}>
                  {g.name}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[10.5px]" style={{ color: C.faint }}>
                  {g.reqs.length} items
                  {settled && <CheckCircle2 size={11} style={{ color: C.green }} />}
                </span>
              </Pop>
            );
          })}

          {flat.map(({ gi, ri, r }, k) => (
            <div key={r.id} className="absolute" style={{ left: cardX + ri * (cardW + gap), top: cyAt(gi) - CARD_H / 2, width: cardW, height: CARD_H }}>
              <Card r={r} show={t >= cardAt(k)} settled={t >= settleAt(k)} />
            </div>
          ))}
        </div>
      </div>
    </Scaled>
  );
}
