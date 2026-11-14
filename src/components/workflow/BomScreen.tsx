"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ChevronDown, Clock3, DollarSign, Download, Layers, Link2, Plus, Search, Upload } from "lucide-react";
import { C, Btn, Pill, Pop, Scaled, countUp, ease, useStageClock, type ScreenProps } from "./screen-kit";

/*
 * BOM: cost and counts roll up, the multi-level tree opens row by row, then each part
 * links back to its requirements and the last pending part is approved.
 * Phases (callouts): 0 cost rolled up · 1 tree expanded · 2 traceability linked.
 */

interface Row {
  lvl: string;
  pn: string;
  desc: string;
  qty: number;
  sup: string;
  rev: string;
  pending?: boolean;
  links: string[];
}

const ROWS: Row[] = [
  { lvl: "1.0", pn: "EV-CS-001", desc: "EV Charging Station — Top Assembly", qty: 1, sup: "Internal", rev: "C", links: ["SYS-001", "SYS-002"] },
  { lvl: "1.1", pn: "EV-PWR-010", desc: "Power Electronics Module", qty: 1, sup: "SiemensAG", rev: "B", links: ["PWR-001", "PWR-002"] },
  { lvl: "1.1.1", pn: "EV-PWR-011", desc: "IGBT Power Bridge 150A", qty: 4, sup: "Infineon", rev: "A", links: ["PWR-003"] },
  { lvl: "1.1.2", pn: "EV-PWR-012", desc: "Gate Driver PCB", qty: 2, sup: "Texas Instruments", rev: "A", links: ["PWR-004"] },
  { lvl: "1.1.3", pn: "EV-PWR-013", desc: "DC Bus Capacitor 1200V 1500µF", qty: 6, sup: "Vishay", rev: "B", pending: true, links: ["PWR-005"] },
  { lvl: "1.2", pn: "EV-CTL-020", desc: "Controller & Communication Board", qty: 1, sup: "Kontron AG", rev: "C", links: ["CTL-001", "CTL-002"] },
  { lvl: "1.2.1", pn: "EV-CTL-021", desc: "ARM Cortex-M7 MCU", qty: 1, sup: "STMicroelectronics", rev: "A", links: ["CTL-003"] },
  { lvl: "1.2.3", pn: "EV-CTL-023", desc: "4G/LTE Modem Module", qty: 1, sup: "Sierra Wireless", rev: "B", links: ["CTL-005", "CTL-006"] },
  { lvl: "1.3", pn: "EV-CHD-030", desc: "Charging Connectors Assembly", qty: 2, sup: "TE Connectivity", rev: "B", links: ["CHD-001"] },
  { lvl: "1.3.1", pn: "EV-CHD-031", desc: "CCS2 DC Combo Connector", qty: 1, sup: "TE Connectivity", rev: "B", links: ["CHD-002", "SAF-001"] },
  { lvl: "1.4", pn: "EV-ENC-040", desc: "Enclosure & Mechanical Structure", qty: 1, sup: "Rittal GmbH", rev: "D", links: ["MEC-001"] },
];

const PHASES = [2.8, 7.6, 12];
const rowAt = (i: number) => (i === 0 ? 1.4 : 3.1 + (i - 1) * 0.42);
const linkAt = (i: number) => 8 + i * 0.28;
const APPROVE_AT = 11;

export default function BomScreen({ active, step, compact }: ScreenProps) {
  const t = useStageClock(active, step, PHASES);
  const approved = t >= APPROVE_AT;
  const cols = compact ? "64px 92px minmax(0,1fr) 84px" : "62px 104px minmax(0,1fr) 40px 136px 40px 92px 178px";

  const stats = [
    { label: "Total parts", value: Math.round(countUp(t, 0.3, 2.2, 142)).toString(), sub: "across all levels", tone: C.blue, Icon: Layers },
    { label: "Approved", value: Math.round(countUp(t, 0.3, 2.2, 117) + (approved ? 1 : 0)).toString(), sub: `${approved ? 83 : 82}% approval rate`, tone: C.green, Icon: CheckCircle2 },
    { label: "Pending review", value: Math.round(countUp(t, 0.3, 2.2, 17) - (approved ? 1 : 0)).toString(), sub: "needs attention", tone: C.amber, Icon: Clock3 },
    { label: "Total BOM cost", value: `$${countUp(t, 0.3, 2.6, 875.4).toFixed(2)}`, sub: "estimated assembly cost", tone: C.purple, Icon: DollarSign },
  ];

  return (
    <Scaled compact={compact}>
      <div className="flex h-full flex-col px-6 pt-4">
        <p className="m-0 text-[11.5px]" style={{ color: C.faint }}>
          Projects › EV Charging Station › <span style={{ color: C.dim }}>BOM</span>
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="m-0 flex items-center gap-2 text-[19px] font-semibold tracking-[-0.01em]">
              <Layers size={18} style={{ color: C.blue }} /> Bill of Materials <Pill tone={C.blue}>Rev C</Pill>
            </p>
            {!compact && (
              <p className="m-0 mt-0.5 text-[12px]" style={{ color: C.dim }}>
                Project: EV Charging Station — multi-level part hierarchy with traceability.
              </p>
            )}
          </div>
          {!compact && (
            <span className="flex gap-2">
              <Btn>
                <Upload size={13} /> Import
              </Btn>
              <Btn>
                <Download size={13} /> Export
              </Btn>
              <span className="inline-flex h-[30px] items-center gap-1.5 rounded-[6px] bg-white px-3 text-[12.5px] font-medium text-black">
                <Plus size={13} /> Add Part
              </span>
            </span>
          )}
        </div>

        {/* stats */}
        <div className={`mt-3.5 grid gap-2.5 ${compact ? "grid-cols-2" : "grid-cols-4"}`}>
          {stats.map(({ label, value, sub, tone, Icon }) => (
            <div key={label} className="rounded-[8px] border px-3.5 py-2.5" style={{ borderColor: C.line, background: C.panel }}>
              <p className="m-0 flex items-center justify-between text-[11.5px]" style={{ color: C.dim }}>
                {label}
                <Icon size={13} style={{ color: tone }} />
              </p>
              <p className="m-0 mt-1 text-[22px] font-semibold tabular-nums leading-none" style={{ color: label === "Total parts" ? tone : C.text }}>
                {value}
              </p>
              <p className="m-0 mt-1 text-[10.5px]" style={{ color: C.faint }}>
                {sub}
              </p>
            </div>
          ))}
        </div>

        {/* toolbar */}
        <div className="mt-3 flex items-center gap-2 text-[12px]">
          <span className="flex h-[30px] w-[220px] items-center gap-2 rounded-[6px] border px-2.5" style={{ borderColor: C.line2, color: C.faint }}>
            <Search size={13} /> Search parts, suppliers…
          </span>
          <span className="rounded-[6px] border px-2.5 py-1.5" style={{ borderColor: `${C.blue}55`, background: C.blueSoft, color: "#c9d4ff" }}>
            All parts
          </span>
          {!compact && (
            <>
              <span className="px-2" style={{ color: C.faint }}>
                Approved
              </span>
              <span className="px-2" style={{ color: C.faint }}>
                Pending
              </span>
              <span className="ml-auto px-2" style={{ color: C.dim }}>
                Expand all
              </span>
            </>
          )}
        </div>

        {/* table */}
        <div className="mt-2.5 min-h-0 flex-1 overflow-hidden border-t" style={{ borderColor: C.line }}>
          <div className="grid h-[30px] items-center gap-2 border-b px-1 font-mono text-[10px] uppercase tracking-[0.08em]" style={{ gridTemplateColumns: cols, borderColor: C.line, color: C.faint }}>
            <span>Level</span>
            <span>Part no.</span>
            <span>Description</span>
            {!compact && (
              <>
                <span>Qty</span>
                <span>Supplier</span>
                <span>Rev</span>
                <span>Status</span>
              </>
            )}
            <span>{compact ? "Status" : "Requirements"}</span>
          </div>
          {ROWS.map((r, i) => {
            const depth = r.lvl.split(".").length - 1 - (r.lvl.endsWith(".0") ? 1 : 0);
            const parent = depth < 2;
            const pending = r.pending && !approved;
            const show = t >= rowAt(i);
            const status = (
              <Pill tone={pending ? C.amber : C.green} className={r.pending && approved ? "ring-1 ring-[#4FBF8A]/50" : ""}>
                {pending ? "Pending" : "Approved"}
              </Pill>
            );
            return (
              <motion.div
                key={r.pn}
                initial={false}
                animate={{ opacity: show ? 1 : 0, height: show ? 34 : 0 }}
                transition={{ duration: 0.35, ease }}
                className="grid items-center gap-2 overflow-hidden border-b px-1"
                style={{ gridTemplateColumns: cols, borderColor: C.line, background: pending ? "rgba(240,180,91,0.04)" : "transparent" }}
              >
                <span className="flex items-center gap-1 tabular-nums" style={{ paddingLeft: depth * 10, color: parent ? C.text : C.faint, fontSize: 12 }}>
                  {parent && (
                    <ChevronDown
                      size={12}
                      className="transition-transform duration-300"
                      style={{ color: C.faint, transform: t >= rowAt(i + 1) ? "none" : "rotate(-90deg)" }}
                    />
                  )}
                  {r.lvl}
                </span>
                <span className="font-mono text-[11.5px]" style={{ color: "#8fa6ff" }}>
                  {r.pn}
                </span>
                <span className="truncate" style={{ fontWeight: parent ? 600 : 400, paddingLeft: parent ? 0 : 10, fontSize: 12.5 }}>
                  {r.desc}
                </span>
                {!compact && (
                  <>
                    <span className="tabular-nums text-[12px]">{r.qty}</span>
                    <span className="truncate text-[12px]" style={{ color: C.dim }}>
                      {r.sup}
                    </span>
                    <span className="grid h-[20px] w-[22px] place-items-center rounded-[4px] border font-mono text-[10.5px]" style={{ borderColor: C.line2, color: C.dim }}>
                      {r.rev}
                    </span>
                    <span>{status}</span>
                  </>
                )}
                <span className="flex gap-1 overflow-hidden">
                  {compact
                    ? status
                    : r.links.map((l) => (
                        <Pop key={l} show={t >= linkAt(i)} y={0} x={-6}>
                          <span className="inline-flex h-[20px] items-center gap-1 rounded-[4px] border px-1.5 font-mono text-[10.5px]" style={{ borderColor: `${C.teal}45`, color: C.teal, background: `${C.teal}10` }}>
                            <Link2 size={10} />
                            {l}
                          </span>
                        </Pop>
                      ))}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Scaled>
  );
}
