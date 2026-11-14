"use client";

/*
 * 04 · Engineering change, recreated from the OpenPlan app's Eng. Changes module:
 * the change-order list fills in, ECO-2026-014 is opened, its lifecycle and approval
 * pipeline advance step by step, then the page scrolls to the version diff, the
 * impact panel and the audit trail. Plays on its own and loops.
 */

import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Box,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Cpu,
  Download,
  Flag,
  GitBranch,
  Info,
  PencilLine,
  Search,
  Send,
  Shield,
  SlidersHorizontal,
  Target,
  Upload,
  History,
} from "lucide-react";
import { Scaled, useStageClock, type ScreenProps } from "./screen-kit";
import { NO_SCROLLBAR, WorkspaceShell } from "./assistant-kit";
import { AVATARS } from "./assistant-data";

/* ---------- sample data (COPY FOR APPROVAL) ---------- */

type Status = "In Review" | "Approved" | "Verified" | "Released" | "Rework" | "Draft" | "Closed";
type Priority = "High" | "Medium" | "Low";

const ECOS: { id: string; title: string; type: string; priority: Priority; status: Status; parts: number; owner: string; created: string; rev: string }[] = [
  { id: "ECO-2026-015", title: "Secondary GPS antenna for urban canyons", type: "Component Change", priority: "Medium", status: "In Review", parts: 2, owner: "Jonathan", created: "Oct 29", rev: "A→B" },
  { id: "ECO-2026-014", title: "Swappable battery bay redesign", type: "Design Change", priority: "High", status: "In Review", parts: 3, owner: "Mariana", created: "Oct 22", rev: "B→C" },
  { id: "ECO-2026-013", title: "F7 main controller upgrade", type: "Component Change", priority: "High", status: "Verified", parts: 1, owner: "Jonathan", created: "Oct 21", rev: "A→B" },
  { id: "ECO-2026-012", title: "Payload release mechanism (2.5kg)", type: "Design Change", priority: "Medium", status: "Released", parts: 2, owner: "Mariana", created: "Oct 12", rev: "A→B" },
  { id: "ECO-2026-011", title: "Chassis wheelbase +12%", type: "Design Change", priority: "Medium", status: "Rework", parts: 4, owner: "Noah", created: "Oct 12", rev: "B→C" },
  { id: "ECO-2026-010", title: "Motor driver supplier switch", type: "Supplier Change", priority: "Medium", status: "Approved", parts: 6, owner: "Marcus", created: "Oct 12", rev: "A→B" },
  { id: "ECO-2026-009", title: "Field service checklist update", type: "Process Change", priority: "Low", status: "Draft", parts: 0, owner: "Marcus", created: "Oct 9", rev: "—" },
  { id: "ECO-2026-008", title: "Charge controller firmware hook", type: "Component Change", priority: "High", status: "Closed", parts: 1, owner: "Jonathan", created: "Oct 7", rev: "A→B" },
];
const OPEN = 1; // the row that gets opened

const STATUS_STYLE: Record<Status, string> = {
  "In Review": "text-[#e8b374] bg-[#2a1f10]/70 border-[#4a3518]",
  Approved: "text-[#7fd8a8] bg-[#123521]/70 border-[#1e5b39]",
  Verified: "text-[#c79bf0] bg-[#2a1f3d]/70 border-[#3d2a54]",
  Released: "text-[#7fa6f0] bg-[#132045]/70 border-[#1e335c]",
  Rework: "text-[#f0a070] bg-[#33190f]/70 border-[#5a2c18]",
  Draft: "text-[#8b8b93] bg-[#1a1a1f] border-[#26262c]",
  Closed: "text-[#8b8b93] bg-[#1a1a1f] border-[#26262c]",
};
const PRIORITY_STYLE: Record<Priority, string> = {
  High: "text-[#f0a070] bg-[#33190f]/70 border-[#5a2c18]",
  Medium: "text-[#e8b374] bg-[#2a1f10]/70 border-[#4a3518]",
  Low: "text-[#8b8b93] bg-[#1a1a1f] border-[#26262c]",
};

const Badge = ({ cls, children }: { cls: string; children: React.ReactNode }) => (
  <span className={`inline-flex h-[20px] items-center whitespace-nowrap rounded-full border px-2 text-[10.5px] font-medium transition-colors duration-500 ${cls}`}>{children}</span>
);

const LIFECYCLE = [
  { label: "Draft", Icon: PencilLine },
  { label: "Send for review", Icon: Send },
  { label: "Approved", Icon: BadgeCheck },
  { label: "Released", sub: "ECN", Icon: GitBranch },
  { label: "Verified", Icon: Shield },
  { label: "Closed", Icon: Check },
];
const PIPELINE = [
  { label: "Originator", who: "Mariana" },
  { label: "Engineering Review", who: "Noah" },
  { label: "Quality Assurance", who: "Ana" },
  { label: "Final Approval", who: "Marcus" },
];
const DIFF = [
  { p: "Battery mount", a: "Fixed bracket, 4× M4", b: "Quick-release rail, tool-free" },
  { p: "Pack swap time", a: "6 min", b: "Under 90 s" },
  { p: "Bay liner", a: "ABS, 2.0 mm", b: "Glass-filled nylon, 2.4 mm" },
  { p: "Connector", a: "XT60 pigtail", b: "Blind-mate dock connector" },
];
const IMPACT = [
  { Icon: Target, label: "Impact Level", value: <Badge cls={PRIORITY_STYLE.Medium}>Medium</Badge> },
  { Icon: Flag, label: "Affected Milestones", value: "Pilot fleet build" },
  { Icon: CircleDollarSign, label: "Unit Cost Δ", value: "+$4.20/unit" },
  { Icon: Box, label: "One-Time Cost", value: "$1,850 tooling" },
  { Icon: Shield, label: "Recertification", value: "Not required" },
  { Icon: Cpu, label: "Firmware Coupling", value: "BMS v2.3" },
];

/* ---------- timeline (s) ---------- */

const T = {
  rows: 0.5, // list rows land, 0.12s apart
  hover: 2.6, // pointer settles on the row
  open: 3.4, // detail view
  life: [4.0, 4.5], // lifecycle: draft ✓, sent ✓ (approved comes with the pipeline)
  pipe: [5.0, 5.7, 6.4, 7.1], // approvals, one by one
  approved: 7.4,
  scroll: [8.2, 9.6], // page scrolls to the diff + activity
  end: 12.5,
};
const PHASES = [T.open, T.end];

const prog = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (t - a) / (b - a)));
const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const count = (t: number, a: number, b: number, to: number) => Math.round(to * (1 - Math.pow(1 - prog(t, a, b), 3)));

/* ---------- list view ---------- */

function EcoList({ t, compact }: { t: number; compact?: boolean }) {
  const hover = t >= T.hover;
  const cols = compact ? "92px minmax(0,1fr) 78px" : "116px minmax(0,1fr) 128px 76px 90px 52px 110px 66px 52px";
  const tiles = [
    { Icon: GitBranch, tone: "#5b7fff", bg: "#132045", v: count(t, 0.2, 1.4, 8), l: "Open ECOs" },
    { Icon: Clock3, tone: "#e8b374", bg: "#2a1f10", v: count(t, 0.2, 1.4, 2), l: "In Review" },
    { Icon: ClipboardCheck, tone: "#f07272", bg: "#331414", v: count(t, 0.2, 1.4, 1), l: "Awaiting My Action" },
    { Icon: GitBranch, tone: "#7fd8a8", bg: "#123521", v: count(t, 0.2, 1.4, 1), l: "Released This Month" },
  ];
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-4 pt-4">
      <div className={`grid gap-3 ${compact ? "grid-cols-2" : "grid-cols-4"}`}>
        {tiles.map(({ Icon, tone, bg, v, l }) => (
          <div key={l} className="flex items-center gap-3 rounded-xl border border-[#1e1e24] bg-[#0f0f12] px-3.5 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: bg, color: tone }}>
              <Icon size={16} />
            </span>
            <span className="min-w-0">
              <span className="block text-[18px] font-semibold tabular-nums leading-none" style={{ color: l === "Open ECOs" ? "#7c9bff" : "#fff" }}>
                {v}
              </span>
              <span className="mt-1 block truncate text-[11px] text-[#8b8b93]">{l}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-[230px] items-center gap-2 rounded-lg border border-[#26262c] bg-[#111114] px-2.5 text-[12px] text-[#6b6b76]">
          <Search size={13} /> Search ECO number, title…
        </span>
        {!compact && (
          <span className="flex items-center rounded-lg border border-[#1e1e24] bg-[#0f0f12] p-0.5 text-[11.5px]">
            {["All", "Draft", "In Review", "Approved", "Released", "Closed"].map((f, i) => (
              <span key={f} className={`rounded-md px-2.5 py-1 ${i === 0 ? "bg-[#1f1f25] font-medium text-[#fff]" : "text-[#8b8b93]"}`}>
                {f}
              </span>
            ))}
          </span>
        )}
        {!compact && (
          <span className="ml-auto flex gap-1.5 text-[#a8a8ae]">
            {[Upload, Download, SlidersHorizontal].map((Icon, i) => (
              <span key={i} className="grid h-8 w-8 place-items-center rounded-lg border border-[#26262c] bg-[#111114]">
                <Icon size={14} />
              </span>
            ))}
          </span>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#1e1e24] bg-[#0d0d10]">
        <div className="grid h-[34px] shrink-0 items-center gap-2 border-b border-[#1e1e24] px-4 text-[10px] font-semibold uppercase tracking-wide text-[#6b6b76]" style={{ gridTemplateColumns: cols }}>
          <span>ECO</span>
          <span>Title</span>
          {compact ? (
            <span>Status</span>
          ) : (
            <>
              <span>Type</span>
              <span>Priority</span>
              <span>Status</span>
              <span>Parts</span>
              <span>Owner</span>
              <span>Created</span>
              <span>Rev</span>
            </>
          )}
        </div>
        {ECOS.map((e, i) => {
          const lit = hover && i === OPEN;
          const status = <Badge cls={STATUS_STYLE[e.status]}>{e.status}</Badge>;
          return (
            <motion.div
              key={e.id}
              initial={false}
              animate={{ opacity: t >= T.rows + i * 0.12 ? 1 : 0, y: t >= T.rows + i * 0.12 ? 0 : 6 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative grid h-[42px] shrink-0 items-center gap-2 border-b border-[#17171c] px-4 text-[12.5px] transition-colors duration-300"
              style={{ gridTemplateColumns: cols, background: lit ? "#16161c" : "transparent" }}
            >
              {lit && <motion.span initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} className="absolute inset-y-0 left-0 w-[2px] bg-[#5b7fff]" />}
              <span className="font-mono text-[11px] font-semibold text-[#7c9bff]">{e.id}</span>
              <span className="truncate font-medium text-[#fff]">{e.title}</span>
              {compact ? (
                <span>{status}</span>
              ) : (
                <>
                  <span className="truncate text-[#8b8b93]">{e.type}</span>
                  <span>
                    <Badge cls={PRIORITY_STYLE[e.priority]}>{e.priority}</Badge>
                  </span>
                  <span>{status}</span>
                  <span className="tabular-nums text-[#e8e8ea]">{e.parts}</span>
                  <span className="flex min-w-0 items-center gap-1.5 text-[#e8e8ea]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={AVATARS[e.owner]} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover" />
                    <span className="truncate">{e.owner}</span>
                  </span>
                  <span className="text-[#8b8b93]">{e.created}</span>
                  <span className="text-[11px] text-[#8b8b93]">{e.rev}</span>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- detail view ---------- */

function Stepper({ steps, doneCount, current }: { steps: { label: string; sub?: string; Icon?: typeof Check }[]; doneCount: number; current?: number }) {
  return (
    <div className="flex items-start">
      {steps.map((s, i) => {
        const done = i < doneCount;
        const isCur = current === i && done;
        const Icon = s.Icon ?? Check;
        return (
          <div key={s.label} className="flex min-w-0 flex-1 items-start last:flex-none">
            <div className="flex w-[84px] shrink-0 flex-col items-center text-center">
              <span
                className={`grid place-items-center rounded-full border transition-all duration-500 ${isCur ? "h-9 w-9" : "h-8 w-8"} ${done ? "border-[#22c55e] bg-[#22c55e] text-[#05140b]" : "border-[#33333b] bg-transparent text-[#6b6b76]"}`}
                style={isCur ? { boxShadow: "0 0 0 5px rgba(34,197,94,0.15)" } : undefined}
              >
                {done ? <Check size={15} strokeWidth={3} /> : <Icon size={14} />}
              </span>
              <span className={`mt-1.5 text-[11px] font-medium leading-tight ${isCur ? "text-[#4ade80]" : done ? "text-[#fff]" : "text-[#8b8b93]"}`}>{s.label}</span>
              {s.sub && <span className="text-[9.5px] text-[#6b6b76]">{s.sub}</span>}
            </div>
            {i < steps.length - 1 && (
              <span className="relative mt-4 h-[2px] min-w-0 flex-1 overflow-hidden bg-[#26262c]">
                <span className="absolute inset-y-0 left-0 bg-[#22c55e] transition-[width] duration-500 ease-out" style={{ width: i < doneCount - 1 ? "100%" : "0%" }} />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EcoDetail({ t, compact }: { t: number; compact?: boolean }) {
  const approvals = T.pipe.filter((at) => t >= at).length;
  const lifeDone = (t >= T.life[0] ? 1 : 0) + (t >= T.life[1] ? 1 : 0) + (t >= T.approved ? 1 : 0);
  const approved = t >= T.approved;
  const e = ECOS[OPEN];
  const scroll = easeInOut(prog(t, T.scroll[0], T.scroll[1])) * (compact ? 520 : 395);
  const activity = [
    approved && { tag: "Approved", tone: STATUS_STYLE.Approved, who: "Marcus", text: "step 'Final Approval' approved" },
    t >= T.pipe[2] && { tag: "Approved", tone: STATUS_STYLE.Approved, who: "Ana", text: "step 'Quality Assurance' approved" },
    t >= T.pipe[1] && { tag: "Approved", tone: STATUS_STYLE.Approved, who: "Noah", text: "step 'Engineering Review' approved" },
    { tag: "Submitted", tone: STATUS_STYLE.Released, who: "Mariana", text: "submitted for review" },
  ].filter(Boolean) as { tag: string; tone: string; who: string; text: string }[];

  return (
    <div className={`min-h-0 flex-1 overflow-hidden ${NO_SCROLLBAR}`}>
      <div className="flex flex-col gap-3 px-5 pb-6 pt-3" style={{ transform: `translateY(${-scroll}px)` }}>
        <p className="m-0 flex items-center gap-1.5 text-[12px] text-[#6b6b76]">
          Eng. Changes <ChevronRight size={12} /> <span className="font-medium text-[#e8e8ea]">{e.id}</span>
        </p>

        {/* header */}
        <div className="rounded-xl border border-[#1e1e24] bg-[#0f0f12] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <GitBranch size={18} className="shrink-0 text-[#7c9bff]" />
              <span className="shrink-0 font-mono text-[12px] font-semibold text-[#7c9bff]">{e.id}</span>
              <span className="truncate text-[17px] font-semibold text-[#fff]">{e.title}</span>
              <Badge cls={STATUS_STYLE[approved ? "Approved" : "In Review"]}>{approved ? "Approved" : "In Review"}</Badge>
              {!compact && <Badge cls={PRIORITY_STYLE.High}>High</Badge>}
              {!compact && <Badge cls={PRIORITY_STYLE.Medium}>Class II</Badge>}
            </div>
            {!compact && (
              <span className={`flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[12px] font-medium transition-colors duration-500 ${approved ? "bg-[#fff] text-[#0a0a0d]" : "border border-[#26262c] bg-[#111114] text-[#6b6b76]"}`}>
                <GitBranch size={13} /> Generate ECN
              </span>
            )}
          </div>
          <div className={`mt-4 grid gap-x-6 gap-y-3 ${compact ? "grid-cols-2" : "grid-cols-4"}`}>
            {[
              ["Type", e.type],
              ["Reason code", "Performance"],
              ["Originator", "Mariana"],
              ["Change owner", "Noah"],
              ["Initiated", e.created],
              ["Affected parts", String(e.parts)],
              ["ECO revision", "B → C"],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="m-0 text-[9.5px] font-semibold uppercase tracking-wide text-[#6b6b76]">{k}</p>
                <p className="m-0 mt-0.5 text-[13px] font-medium text-[#fff]">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* lifecycle */}
        <div className="rounded-xl border border-[#1e1e24] bg-[#0f0f12] px-5 py-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="m-0 text-[14px] font-semibold text-[#fff]">Change Lifecycle</p>
            {!compact && (
              <p className="m-0 flex items-center gap-1.5 text-[11px] text-[#6b6b76]">
                <Info size={12} /> Approval authorizes release · release ≠ start of work
              </p>
            )}
          </div>
          <Stepper steps={LIFECYCLE} doneCount={lifeDone} current={lifeDone - 1} />
        </div>

        {/* approval pipeline */}
        <div className="rounded-xl border border-[#1e1e24] bg-[#0f0f12] px-5 py-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="m-0 text-[14px] font-semibold text-[#fff]">Approval Pipeline</p>
            <p className="m-0 text-[11.5px] tabular-nums text-[#8b8b93]">{approvals} of 4 approved</p>
          </div>
          <Stepper steps={PIPELINE.map((p) => ({ label: p.label, sub: approvals > PIPELINE.indexOf(p) ? p.who : undefined }))} doneCount={approvals} />
        </div>

        {/* diff + impact */}
        <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]"}`}>
          <div className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-xl border border-[#1e1e24] bg-[#0f0f12]">
              <div className="flex items-start justify-between gap-3 px-4 py-3">
                <div>
                  <p className="m-0 text-[14px] font-semibold text-[#fff]">Version Diff — Rev B vs Rev C</p>
                  <p className="m-0 mt-0.5 text-[11px] text-[#6b6b76]">Field-level change set · {DIFF.length} parameters</p>
                </div>
                <p className="m-0 flex gap-3 text-[11px]">
                  <span className="text-[#f07272]">● Rev B (current)</span>
                  <span className="text-[#4ade80]">● Rev C (proposed)</span>
                </p>
              </div>
              <div className="grid grid-cols-[120px_1fr_1fr] border-y border-[#1e1e24] px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#6b6b76]">
                <span>Parameter</span>
                <span>Rev B</span>
                <span>Rev C</span>
              </div>
              {DIFF.map((d) => (
                <div key={d.p} className="grid grid-cols-[120px_1fr_1fr] items-center border-b border-[#17171c] text-[12px] last:border-b-0">
                  <span className="px-4 py-2.5 text-[#a8a8ae]">{d.p}</span>
                  <span className="bg-[#2a0f12]/60 px-3 py-2.5 text-[#f07272] line-through decoration-[#f07272]/60">{d.a}</span>
                  <span className="bg-[#0f2a18]/60 px-3 py-2.5 text-[#4ade80]">{d.b}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-[#1e1e24] bg-[#0f0f12] px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="m-0 flex items-center gap-2 text-[14px] font-semibold text-[#fff]">
                  <History size={15} /> Activity
                </p>
                <p className="m-0 text-[11px] text-[#6b6b76]">Append-only · ISO 9001 audit</p>
              </div>
              <AnimatePresence initial={false}>
                {activity.map((a) => (
                  <motion.div key={a.who + a.text} layout="position" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 py-1.5">
                    <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border ${a.tone}`}>
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-[12px] text-[#8b8b93]">
                        <Badge cls={a.tone}>{a.tag}</Badge> by <span className="font-semibold text-[#fff]">{a.who}</span>
                      </span>
                      <span className="block text-[11.5px] text-[#a8a8ae]">
                        {e.id} {a.text}
                      </span>
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-[#1e1e24] bg-[#0f0f12] px-4 py-1.5">
              {[
                { Icon: PencilLine, label: "Change Type", value: e.type },
                { Icon: Info, label: "Reason Code", value: "Performance" },
                { Icon: Flag, label: "Priority", value: <Badge cls={PRIORITY_STYLE.High}>High</Badge> },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between gap-3 border-b border-[#17171c] py-2.5 text-[12px] last:border-b-0">
                  <span className="flex items-center gap-2 text-[#8b8b93]">
                    <Icon size={13} /> {label}
                  </span>
                  <span className="font-semibold text-[#fff]">{value}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-[#1e1e24] bg-[#0f0f12] px-4 py-1.5">
              {IMPACT.map(({ Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between gap-3 border-b border-[#17171c] py-2.5 text-[12px] last:border-b-0">
                  <span className="flex items-center gap-2 text-[#8b8b93]">
                    <Icon size={13} /> {label}
                  </span>
                  <span className="font-semibold text-[#fff]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- screen ---------- */

export function EcoScreen({ active, step, compact }: ScreenProps) {
  const t = useStageClock(active, step, PHASES, 4);
  const detail = t >= T.open;
  return (
    <Scaled compact={compact}>
      <WorkspaceShell tab={2} compact={compact} action="New ECO">
        <AnimatePresence mode="wait" initial={false}>
          {detail ? (
            <motion.div key="detail" className="flex min-h-0 flex-1 flex-col" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
              <EcoDetail t={t} compact={compact} />
            </motion.div>
          ) : (
            <motion.div key="list" className="flex min-h-0 flex-1 flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
              <EcoList t={t} compact={compact} />
            </motion.div>
          )}
        </AnimatePresence>
      </WorkspaceShell>
    </Scaled>
  );
}
