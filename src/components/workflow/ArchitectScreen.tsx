"use client";

import { ArrowUp, Plus, Sparkles } from "lucide-react";
import { C, Btn, Caret, Pill, Pop, Scaled, countUp, prog, streamed, typed, useStageClock, type ScreenProps } from "./screen-kit";

/*
 * AI Architect: a chat that plays itself. The PRD is typed into the composer and
 * sent, the architect asks two questions, the user answers, and a plan card comes
 * back with counters and modules.
 * Phases (callouts): 0 prompt sent · 1 questions answered · 2 plan generated.
 */

const PROMPT =
  "We're designing a 150kW bidirectional DC fast charging station. Scope: power electronics, CCS2 and CHAdeMO connectors, OCPP 2.0.1 comms, safety systems and an IP65 enclosure. Team of 5. CE and UL certification required.";
const ASK =
  "Understood. This spans power electronics, firmware, mechanical and regulatory work. Two quick questions before I plan: (1) Do you have preferred suppliers for key components? (2) What's your target timeline for prototype and production?";
const REPLY = "Infineon for IGBTs and gate drivers, TE Connectivity for connectors. Working prototype in 6 months, production in 12.";
const DONE = "Got it. Suppliers and timeline locked in. I've mapped a 30-week roadmap to your 12-month production target:";

const MODULES = [
  { name: "Power Electronics", tasks: 12, tone: C.blue },
  { name: "Charging Connectors", tasks: 8, tone: C.teal },
  { name: "Communication", tasks: 9, tone: C.purple },
  { name: "Safety Systems", tasks: 10, tone: C.red },
  { name: "Enclosure & Thermal", tasks: 11, tone: C.amber },
  { name: "Certification", tasks: 7, tone: C.green },
];

const RECENT = [
  { name: "Industrial Robot Arm 6-DOF", sub: "Mechanical", tone: C.teal },
  { name: "Motor Controller PCB v3", sub: "Electronics", tone: C.amber },
  { name: "IoT Sensor Gateway Node", sub: "Embedded Systems", tone: C.purple },
];

// timeline (s)
const T = {
  type0: 0.4,
  send0: 4.9,
  think0: 5.2,
  ask: 6.4,
  type1: 9.6,
  send1: 12.3,
  think1: 12.5,
  done: 13.3,
  plan: 14.4,
};
const PHASES = [5.8, 12.9, 18];

function Avatar({ ai }: { ai?: boolean }) {
  return ai ? (
    <span className="grid h-[28px] w-[28px] flex-none place-items-center rounded-[7px] border" style={{ borderColor: `${C.blue}55`, background: C.blueSoft, color: C.blue }}>
      <Sparkles size={14} strokeWidth={1.8} />
    </span>
  ) : (
    <span className="grid h-[28px] w-[28px] flex-none place-items-center rounded-[7px] text-[12px] font-semibold" style={{ background: "#2a3350", color: "#c9d4ff" }}>
      B
    </span>
  );
}

function Msg({ ai, show, children }: { ai?: boolean; show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <Pop show className="flex gap-3">
      <Avatar ai={ai} />
      <div className="min-w-0 flex-1">
        <p className="m-0 mb-1 text-[11.5px] font-medium" style={{ color: ai ? C.blue : C.dim }}>
          {ai ? "AI Architect" : "You"}
        </p>
        <div className="text-[13px] leading-[1.6]" style={{ color: "rgba(255,255,255,0.86)" }}>
          {children}
        </div>
      </div>
    </Pop>
  );
}

function Thinking({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="flex items-center gap-3">
      <Avatar ai />
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-[6px] w-[6px] animate-bounce rounded-full" style={{ background: C.blue, animationDelay: `${i * 0.15}s` }} />
        ))}
      </span>
    </div>
  );
}

export default function ArchitectScreen({ active, step, compact }: ScreenProps) {
  const t = useStageClock(active, step, PHASES);
  const sent0 = t >= T.send0;
  const sent1 = t >= T.send1;
  const composer = !sent0 ? typed(PROMPT, t, T.type0, 52) : t >= T.type1 && !sent1 ? typed(REPLY, t, T.type1, 48) : "";
  const typing = composer.length > 0;
  const planP = prog(t, T.plan + 0.3, T.plan + 1.8);
  const ready = t >= T.plan + 2.4;

  return (
    <Scaled compact={compact}>
      <div className="flex h-full">
        {/* sidebar */}
        {!compact && (
          <aside className="flex w-[232px] flex-none flex-col border-r" style={{ borderColor: C.line, background: "#0f0f11" }}>
            <div className="flex items-center gap-2.5 border-b px-4 py-3.5" style={{ borderColor: C.line }}>
              <Avatar ai />
              <div>
                <p className="m-0 text-[13px] font-semibold">AI Architect</p>
                <p className="m-0 text-[10.5px]" style={{ color: C.faint }}>
                  by OpenPlan AI
                </p>
              </div>
            </div>
            <div className="p-3">
              <span className="flex h-[32px] items-center gap-2 rounded-[6px] border px-3 text-[12.5px]" style={{ borderColor: C.line2, color: C.dim }}>
                <Plus size={13} /> New project plan
              </span>
            </div>
            <p className="m-0 px-4 pb-2 pt-1 font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: C.faint }}>
              Recent
            </p>
            <div className="flex flex-col gap-0.5 px-2">
              <Pop show={sent0} y={-6}>
                <div className="rounded-[6px] border px-2.5 py-2" style={{ borderColor: `${C.blue}40`, background: C.blueSoft }}>
                  <p className="m-0 flex items-center gap-2 text-[12.5px]" style={{ color: "#c9d4ff" }}>
                    <span className="h-[6px] w-[6px] rounded-full" style={{ background: C.blue }} />
                    EV Charging Station 150kW
                  </p>
                  <p className="m-0 pl-[14px] text-[10.5px]" style={{ color: C.faint }}>
                    Power Electronics
                  </p>
                </div>
              </Pop>
              {RECENT.map((r) => (
                <div key={r.name} className="px-2.5 py-2">
                  <p className="m-0 flex items-center gap-2 text-[12.5px]" style={{ color: "rgba(255,255,255,0.8)" }}>
                    <span className="h-[6px] w-[6px] rounded-full" style={{ background: r.tone }} />
                    {r.name}
                  </p>
                  <p className="m-0 pl-[14px] text-[10.5px]" style={{ color: C.faint }}>
                    {r.sub}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* conversation */}
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[52px] flex-none items-center justify-between gap-3 border-b px-5" style={{ borderColor: C.line }}>
            <p className="m-0 truncate text-[14px] font-semibold">{sent0 ? "EV DC Fast Charging Station — 150kW" : "New project plan"}</p>
            {sent0 && (
              <Pill tone={ready ? C.green : C.blue}>
                <span className="mr-1.5 h-[5px] w-[5px] rounded-full" style={{ background: "currentColor" }} />
                {ready ? "Plan ready" : "In progress"}
              </Pill>
            )}
          </header>

          <div className="flex min-h-0 flex-1 flex-col justify-end gap-5 overflow-hidden px-6 pb-4 pt-6 [&>*]:flex-none">
            <Msg show={sent0}>{PROMPT}</Msg>
            <Thinking show={t >= T.think0 && t < T.ask} />
            <Msg ai show={t >= T.ask}>
              {streamed(ASK, t, T.ask, 15)}
            </Msg>
            <Msg show={sent1}>{REPLY}</Msg>
            <Thinking show={t >= T.think1 && t < T.done} />
            <Msg ai show={t >= T.done}>
              {streamed(DONE, t, T.done, 18)}
            </Msg>
            {t >= T.plan && (
              <Pop show className="ml-[40px] overflow-hidden rounded-[10px] border" style={{ borderColor: C.line2, background: C.panel }}>
                <div className="flex items-start justify-between gap-3 px-4 pt-3.5">
                  <div className="min-w-0">
                    <p className="m-0 font-mono text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: C.blue }}>
                      Plan generated <span style={{ color: C.faint }}>· 94% confidence</span>
                    </p>
                    <p className="m-0 mt-1 text-[15px] font-semibold">EV DC Fast Charging Station — 150kW</p>
                    <p className="m-0 mt-0.5 truncate text-[11.5px]" style={{ color: C.faint }}>
                      Bidirectional · IP65 · CE + UL certified · Infineon / TE Connectivity
                    </p>
                  </div>
                  {!compact && (
                    <span className="flex flex-none gap-2">
                      <Btn>Export</Btn>
                      <Btn primary>Open in workspace →</Btn>
                    </span>
                  )}
                </div>
                <div className="flex gap-7 px-4 pb-3 pt-3">
                  {[
                    { v: Math.round(countUp(t, T.plan + 0.3, T.plan + 1.6, 7)), l: "modules", tone: C.blue },
                    { v: Math.round(countUp(t, T.plan + 0.3, T.plan + 1.8, 65)), l: "tasks", tone: C.text },
                    { v: Math.round(countUp(t, T.plan + 0.3, T.plan + 1.6, 6)), l: "milestones", tone: C.green },
                    { v: `${Math.round(countUp(t, T.plan + 0.3, T.plan + 1.8, 30))} wks`, l: "to production", tone: C.amber },
                  ].map((s) => (
                    <div key={s.l}>
                      <p className="m-0 text-[20px] font-semibold tabular-nums leading-none" style={{ color: s.tone }}>
                        {s.v}
                      </p>
                      <p className="m-0 mt-1 text-[10.5px]" style={{ color: C.faint }}>
                        {s.l}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-5 border-t px-4 text-[12px]" style={{ borderColor: C.line }}>
                  <span className="border-b-2 py-2 font-medium" style={{ borderColor: C.blue, color: C.blue }}>
                    Modules
                  </span>
                  <span className="py-2" style={{ color: C.faint }}>
                    Milestones
                  </span>
                  <span className="py-2" style={{ color: C.faint }}>
                    Sample tasks
                  </span>
                </div>
                <div className={`grid gap-2 px-4 pb-4 pt-1 ${compact ? "grid-cols-2" : "grid-cols-3"}`}>
                  {MODULES.slice(0, compact ? 4 : 6).map((m, i) => (
                    <Pop key={m.name} show={planP > 0.15 + i * 0.12} className="flex items-center justify-between rounded-[6px] border px-3 py-2" style={{ borderColor: C.line, background: C.panel2 }}>
                      <span className="flex items-center gap-2 text-[12px]">
                        <span className="h-[6px] w-[6px] rounded-full" style={{ background: m.tone }} />
                        {m.name}
                      </span>
                      <span className="text-[11px] tabular-nums" style={{ color: C.faint }}>
                        {m.tasks} tasks
                      </span>
                    </Pop>
                  ))}
                </div>
              </Pop>
            )}
          </div>

          {/* composer */}
          <div className="flex-none border-t px-5 py-3.5" style={{ borderColor: C.line }}>
            <div className="flex min-h-[46px] items-center gap-3 rounded-[10px] border px-3.5 py-2" style={{ borderColor: typing ? `${C.blue}70` : C.line2, background: C.panel }}>
              <p className="m-0 line-clamp-2 min-w-0 flex-1 text-[13px] leading-[1.5]" style={{ color: typing ? C.text : C.faint }}>
                {typing ? (
                  <>
                    {composer.length > 150 ? `…${composer.slice(-150)}` : composer}
                    <Caret />
                  </>
                ) : (
                  "Describe your product or paste a PRD…"
                )}
              </p>
              <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-[7px] transition-colors duration-200" style={{ background: typing ? C.blue : "rgba(255,255,255,0.08)", color: "#fff" }}>
                <ArrowUp size={15} />
              </span>
            </div>
          </div>
        </section>
      </div>
    </Scaled>
  );
}
