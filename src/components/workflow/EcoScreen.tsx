"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Download, GitBranch } from "lucide-react";
import { C, Btn, Pill, Pop, Scaled, ease, useStageClock, type ScreenProps } from "./screen-kit";

/*
 * Engineering change: the approval pipeline advances stage by stage until QA is up,
 * then Rev A is compared with Rev B row by row and the affected parts are listed.
 * Phases (callouts): 0 pipeline at QA · 1 diff + affected parts.
 */

const STAGES = [
  { role: "Originator", name: "Sarah Chen", title: "Mech. Engineer", date: "Apr 14" },
  { role: "Engineering review", name: "Dr. Patel", title: "Lead Engineer", date: "Apr 17" },
  { role: "Quality assurance", name: "Marcus Webb", title: "QA Manager", date: "Apr 21" },
  { role: "Final approval", name: "Linda Torres", title: "VP Engineering", date: "" },
];
const STAGE_AT = [0.5, 1.4, 2.3];

const DIFF: { p: string; a: string; b: string; change: "Modified" | "Improved" | "Increased" | "Added" }[] = [
  { p: "Housing material", a: "Cast Aluminum A380", b: "Die-Cast Magnesium AZ91D", change: "Modified" },
  { p: "Wall thickness", a: "4.5 mm", b: "3.2 mm", change: "Modified" },
  { p: "Mounting holes", a: "4× M6", b: "6× M6", change: "Modified" },
  { p: "Surface finish", a: "Anodized Type II", b: "Powder Coat RAL 7016", change: "Modified" },
  { p: "IP rating", a: "IP54", b: "IP65", change: "Improved" },
  { p: "Thermal vents", a: "Stamped slots", b: "CNC-machined fins", change: "Modified" },
  { p: "Weight", a: "2.4 kg", b: "1.8 kg", change: "Improved" },
  { p: "Est. unit cost", a: "$48.20", b: "$52.75", change: "Increased" },
  { p: "Assembly fixtures", a: "N/A", b: "Custom jig #JIG-047", change: "Added" },
];
const CHANGE_TONE = { Modified: C.blue, Improved: C.green, Increased: C.red, Added: C.purple };

const AFFECTED: { pn: string; name: string; note: string; impact: "High" | "Medium" | "Low" }[] = [
  { pn: "EV-ENC-041", name: "Sheet Metal Cabinet IP54", note: "Redesign required", impact: "High" },
  { pn: "EV-ENC-042", name: "Front Door Panel w/ Display Cutout", note: "Update tolerances", impact: "High" },
  { pn: "EV-ENC-044", name: "Pedestal Mounting Base", note: "Verify mounting pattern", impact: "Medium" },
  { pn: "EV-CHD-034", name: "Cable Management Bracket", note: "Re-validate clearances", impact: "Medium" },
  { pn: "EV-SAF-062", name: "Emergency Stop Button IP65", note: "No change", impact: "Low" },
];
const IMPACT_TONE = { High: C.red, Medium: C.amber, Low: C.green };

const PHASES = [3.2, 8.4];
const diffAt = (i: number) => 3.5 + i * 0.4;
const partAt = (i: number) => 4 + i * 0.5;

export default function EcoScreen({ active, step, compact }: ScreenProps) {
  const t = useStageClock(active, step, PHASES);

  return (
    <Scaled compact={compact}>
      <div className="flex h-full flex-col px-6 pt-4">
        <p className="m-0 text-[11.5px]" style={{ color: C.faint }}>
          Projects › EV Charging Station › Changes › <span style={{ color: C.dim }}>ECO-2024-047</span>
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <p className="m-0 flex min-w-0 items-center gap-2 text-[18px] font-semibold tracking-[-0.01em]">
            <GitBranch size={17} style={{ color: C.blue }} />
            <span className="truncate">ECO-2024-047: Motor Housing Redesign</span>
            <Pill tone={C.amber}>In review</Pill>
          </p>
          {!compact && (
            <span className="flex flex-none gap-2">
              <Btn>
                <Download size={13} /> Export PDF
              </Btn>
              <Btn primary>
                <Check size={13} /> Approve
              </Btn>
            </span>
          )}
        </div>
        <p className="m-0 mt-1 text-[12px]" style={{ color: C.dim }}>
          Redesign motor housing from cast aluminum to die-cast magnesium to cut weight by 25% and reach IP65.
        </p>
        {!compact && (
          <p className="m-0 mt-2 flex gap-5 text-[11.5px]" style={{ color: C.faint }}>
            <span>
              Originator: <span style={{ color: C.text }}>Sarah Chen</span>
            </span>
            <span>
              Priority: <span style={{ color: C.text }}>High</span>
            </span>
            <span>
              Affected parts: <span style={{ color: C.text }}>6</span>
            </span>
            <span>
              Revision: <span style={{ color: C.text }}>A → B</span>
            </span>
            <span>
              Type: <span style={{ color: C.text }}>Design change</span>
            </span>
          </p>
        )}

        {/* pipeline */}
        <div className="mt-3 rounded-[10px] border p-3.5" style={{ borderColor: C.line, background: C.panel }}>
          <p className="m-0 text-[13px] font-semibold">Approval pipeline</p>
          <p className="m-0 text-[11px]" style={{ color: C.faint }}>
            {t >= STAGE_AT[2] ? "Stage 3 of 4 · awaiting QA sign-off" : t >= STAGE_AT[1] ? "Stage 2 of 4 · engineering review" : "Stage 1 of 4 · submitted"}
          </p>
          <div className={`mt-2.5 grid gap-2 ${compact ? "grid-cols-2" : "grid-cols-[1fr_16px_1fr_16px_1fr_16px_1fr]"}`}>
            {STAGES.map((s, i) => {
              const done = i < 2 && t >= STAGE_AT[i];
              const current = i === 2 && t >= STAGE_AT[2];
              const tone = done ? C.green : current ? C.blue : "rgba(255,255,255,0.35)";
              return (
                <div key={s.role} className="contents">
                  <div
                    className="relative rounded-[8px] border px-3 py-2.5 transition-[background-color,border-color] duration-500"
                    style={{ borderColor: done ? `${C.green}45` : current ? `${C.blue}70` : C.line, background: done ? "rgba(79,191,138,0.07)" : current ? C.blueSoft : "transparent" }}
                  >
                    <p className="m-0 flex items-center justify-between font-mono text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors duration-500" style={{ color: tone }}>
                      {s.role}
                      {done ? (
                        <motion.span initial={{ scale: 0.3 }} animate={{ scale: 1 }} transition={{ duration: 0.35, ease }} className="grid h-[16px] w-[16px] place-items-center rounded-full" style={{ background: C.green, color: "#0c0c0d" }}>
                          <Check size={10} strokeWidth={3} />
                        </motion.span>
                      ) : current ? (
                        <span className="relative grid h-[16px] w-[16px] place-items-center">
                          <span className="absolute inset-0 animate-ping rounded-full" style={{ background: `${C.blue}60` }} />
                          <span className="h-[10px] w-[10px] rounded-full border-2" style={{ borderColor: C.blue }} />
                        </span>
                      ) : (
                        <span className="h-[12px] w-[12px] rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                      )}
                    </p>
                    <p className="m-0 mt-1.5 text-[13px] font-medium">{s.name}</p>
                    <p className="m-0 text-[11px]" style={{ color: C.faint }}>
                      {s.title}
                    </p>
                    <p className="m-0 mt-1 text-[11px] transition-colors duration-500" style={{ color: tone }}>
                      {done ? `Approved · ${s.date}` : current ? `In review · ${s.date}` : "Pending"}
                    </p>
                  </div>
                  {!compact && i < STAGES.length - 1 && (
                    <span className="grid place-items-center transition-colors duration-500" style={{ color: t >= STAGE_AT[i + 1] ? C.green : C.faint }}>
                      <ArrowRight size={13} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* diff + affected */}
        <div className={`mt-3 grid min-h-0 flex-1 gap-3 ${compact ? "grid-cols-1" : "grid-cols-[1fr_330px]"}`}>
          <div className="min-h-0 overflow-hidden rounded-t-[10px] border border-b-0" style={{ borderColor: C.line, background: C.panel }}>
            <div className="flex items-center justify-between px-3.5 pb-2 pt-2.5">
              <div>
                <p className="m-0 text-[13px] font-semibold">Version diff · Rev A vs Rev B</p>
                <p className="m-0 text-[11px]" style={{ color: C.faint }}>
                  Motor Housing Assembly EV-ENC-MH-001
                </p>
              </div>
              {!compact && (
                <span className="flex gap-3 text-[11px]">
                  <span style={{ color: C.red }}>● Rev A (current)</span>
                  <span style={{ color: C.green }}>● Rev B (proposed)</span>
                </span>
              )}
            </div>
            <div className="grid grid-cols-[128px_1fr_1fr_76px] border-y px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em]" style={{ borderColor: C.line, color: C.faint }}>
              <span>Parameter</span>
              <span>Revision A</span>
              <span>Revision B</span>
              <span>Change</span>
            </div>
            {DIFF.map((d, i) => {
              const show = t >= diffAt(i);
              const showB = t >= diffAt(i) + 0.25;
              return (
                <motion.div
                  key={d.p}
                  initial={false}
                  animate={{ opacity: show ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid h-[29px] grid-cols-[128px_1fr_1fr_76px] items-center border-b px-3.5 text-[12px]"
                  style={{ borderColor: C.line }}
                >
                  <span style={{ color: C.dim }}>{d.p}</span>
                  <span className="-my-1 truncate py-1 pr-2" style={{ color: C.red, background: "rgba(240,114,114,0.05)" }}>
                    {d.a}
                  </span>
                  <motion.span
                    initial={false}
                    animate={{ opacity: showB ? 1 : 0, x: showB ? 0 : -8 }}
                    transition={{ duration: 0.35, ease }}
                    className="-my-1 truncate py-1 pl-2 pr-2"
                    style={{ color: C.green, background: "rgba(79,191,138,0.05)" }}
                  >
                    {d.b}
                  </motion.span>
                  <span className="pl-1 text-[11px] font-medium" style={{ color: CHANGE_TONE[d.change], opacity: showB ? 1 : 0, transition: "opacity .3s" }}>
                    {d.change}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {!compact && (
            <div className="min-h-0 overflow-hidden rounded-t-[10px] border border-b-0" style={{ borderColor: C.line, background: C.panel }}>
              <div className="border-b px-3.5 pb-2 pt-2.5" style={{ borderColor: C.line }}>
                <p className="m-0 text-[13px] font-semibold">Affected parts</p>
                <p className="m-0 text-[11px]" style={{ color: C.faint }}>
                  6 parts require review
                </p>
              </div>
              {AFFECTED.map((p, i) => (
                <Pop key={p.pn} show={t >= partAt(i)} y={6} className="border-b px-3.5 py-2" style={{ borderColor: C.line }}>
                  <p className="m-0 flex items-center justify-between">
                    <span className="font-mono text-[11.5px]" style={{ color: "#8fa6ff" }}>
                      {p.pn}
                    </span>
                    <span className="text-[11px] font-medium" style={{ color: IMPACT_TONE[p.impact] }}>
                      {p.impact}
                    </span>
                  </p>
                  <p className="m-0 truncate text-[12.5px]">{p.name}</p>
                  <p className="m-0 text-[11px]" style={{ color: C.faint }}>
                    {p.note}
                  </p>
                </Pop>
              ))}
            </div>
          )}
        </div>
      </div>
    </Scaled>
  );
}
