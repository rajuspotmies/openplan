"use client";

/*
 * The four workflow stages, built from the OpenPlan product-video UI
 * (thakursameershetty/video-edit):
 *
 *   01 AI Architect  — Assistant chat: prompt typed + sent → Project Planning board
 *   02 Requirements  — project workspace, Requirements tab: live counts + requirements tree
 *   03 BOM           — project workspace, BOM tab: part cards with photos, cost roll-up
 *   04 ECO           — project workspace, Eng. Changes tab: Engineering Change Notice
 */

import { AnimatePresence, motion } from "framer-motion";
import { Scaled, useStageClock, type ScreenProps } from "./screen-kit";
import {
  AiChip,
  AssistantShell,
  BomCards,
  BOM_SPEC,
  ChatView,
  DocCard,
  DocHeader,
  IdleView,
  KanbanBoard,
  P,
  RequirementTree,
  Section,
  Spec,
  StatTile,
  Ul,
  WorkspaceShell,
  bomLength,
  cursorOf,
  kanbanSteps,
  specLength,
  treeSteps,
} from "./assistant-kit";
import { BOM, ECN, KANBAN, PROMPT, REQ_TREE } from "./assistant-data";

/** Number of reveal steps done after `elapsed` s: the first lands at `first`, then each step's own beat. */
function stepsAt(elapsed: number, beats: number[], first: number) {
  let t = first;
  let n = 0;
  while (n < beats.length && elapsed >= t) {
    t += beats[n];
    n += 1;
  }
  return n;
}
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const tick = (t: number) => Math.floor(t * 8);

/* ======================= 01 · AI Architect (chat) ======================= */

const CARD_H = 420;
const RISE = 0.6;
const PLAN_TEXT = "Here's the current build plan laid out as a board, tracking every subsystem task from backlog through to done.";
const PLAN_CPS = 190;
const PLAN_BOARD_AT = ("Overview".length + PLAN_TEXT.length + "Task Board".length) / PLAN_CPS;
// after a column heading 0.26s, after a card 0.13s
const KANBAN_BEATS = KANBAN.flatMap((col) => [0.26, ...col.cards.map(() => 0.13)]);
const PLAN_DONE = PLAN_BOARD_AT + 0.26 + sum(KANBAN_BEATS) + 0.3;

function PlanningDoc({ t, start }: { t: number; start: number }) {
  const rev = (t - start) * PLAN_CPS;
  const c = cursorOf();
  const count = stepsAt(t - start - PLAN_BOARD_AT, KANBAN_BEATS, 0.26);
  const done = t >= start + PLAN_DONE;
  return (
    <DocCard title="Project Planning" height={CARD_H} tick={tick(t)} settled={done} shimmer={done && t < start + PLAN_DONE + 0.9}>
      <Section heading="Overview" start={c.take(8)} revealed={rev}>
        <P text={PLAN_TEXT} start={c.take(PLAN_TEXT.length)} revealed={rev} />
      </Section>
      <Section heading="Task Board" start={c.take(10)} revealed={rev}>
        {t >= start + PLAN_BOARD_AT && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
            <KanbanBoard count={count} done={count >= kanbanSteps()} />
          </motion.div>
        )}
      </Section>
    </DocCard>
  );
}

const S1 = { type: 0.9, cps: 22, send: 5.0, think: 5.3, arrive: 8.5 };
const S1_PHASES = [S1.send - 0.3, S1.arrive - 0.1, S1.arrive + RISE + PLAN_DONE + 0.9];

export function ArchitectScreen({ active, step, compact }: ScreenProps) {
  const t = useStageClock(active, step, S1_PHASES, 4);
  const typedText = PROMPT.slice(0, Math.max(0, Math.floor((t - S1.type) * S1.cps)));
  const cards = t >= S1.arrive ? [{ key: "plan", fresh: true, node: <PlanningDoc t={t} start={S1.arrive + RISE} /> }] : [];
  return (
    <Scaled compact={compact}>
      <AssistantShell compact={compact}>
        <AnimatePresence mode="wait" initial={false}>
          {t < S1.send ? (
            <motion.div key="idle" className="flex min-h-0 flex-1" exit={{ opacity: 0, transition: { duration: 0.2 } }}>
              <IdleView value={typedText} sending={t > S1.send - 0.35} compact={compact} />
            </motion.div>
          ) : (
            <motion.div key="chat" className="flex min-h-0 flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <ChatView prompt={PROMPT} cardHeight={CARD_H} thinking={t >= S1.think && t < S1.arrive ? t - S1.think : null} cards={cards} />
            </motion.div>
          )}
        </AnimatePresence>
      </AssistantShell>
    </Scaled>
  );
}

/* ======================= 02 · Requirements workspace ======================= */

const REQ_START = 0.8;
const TREE_BEATS = REQ_TREE.branches.flatMap((b) => [0.3, ...b.leaves.map(() => 0.17)]);
const REQ_DONE = REQ_START + 0.32 + sum(TREE_BEATS) + 0.3;
const S2_PHASES = [REQ_START + 0.32 + sum(TREE_BEATS.slice(0, 6)), REQ_START + 0.32 + sum(TREE_BEATS.slice(0, 15)), REQ_DONE + 0.9];
const LEAF_COUNT = REQ_TREE.branches.reduce((n, b) => n + b.leaves.length, 0);
// each leaf with its reveal step (steps count branch labels and leaves, in tree order)
const LEAF_STEPS = REQ_TREE.branches.flatMap((b, bi) => {
  const base = REQ_TREE.branches.slice(0, bi).reduce((n, x) => n + 1 + x.leaves.length, 0) + 1;
  return b.leaves.map((leaf, li) => ({ leaf, step: base + li }));
});

export function RequirementsScreen({ active, step, compact }: ScreenProps) {
  const t = useStageClock(active, step, S2_PHASES, 4);
  const count = stepsAt(t - REQ_START, TREE_BEATS, 0.32);
  const done = t >= REQ_DONE;
  const shown = LEAF_STEPS.filter((x) => x.step < count).map((x) => x.leaf);
  const n = (f: (l: (typeof shown)[number]) => boolean) => shown.filter(f).length;
  return (
    <Scaled compact={compact}>
      <WorkspaceShell tab={0} compact={compact}>
        <DocCard
          bare
          title="Requirements"
          tick={tick(t)}
          settled={done}
          shimmer={done && t < REQ_DONE + 0.9}
          header={
            <DocHeader
              title="Requirements"
              // COPY FOR APPROVAL
              aside={!compact && <AiChip working={!done} label={done ? "Drafted from your brief" : "OpenPlan AI is drafting from your brief"} />}
            />
          }
        >
          <div className={`grid gap-2.5 ${compact ? "grid-cols-2" : "grid-cols-4"}`}>
            <StatTile label="Requirements" value={shown.length} sub={`of ${LEAF_COUNT} drafted`} />
            <StatTile label="Approved" value={n((l) => l.status === "Approved")} tone="#7fb2f0" sub="ready to build" />
            <StatTile label="Verified" value={n((l) => l.verification === "Passed")} tone="#7fd8a8" sub="tests passed" />
            <StatTile label="Not verified" value={n((l) => l.verification === "Not Verified")} tone="#e8b374" sub="need a test" />
          </div>
          <div className="flex flex-col gap-2.5">
            <h3 className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#8b8b93]">Requirements Breakdown</h3>
            {t >= REQ_START && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
                <RequirementTree data={REQ_TREE} count={Math.min(count, treeSteps(REQ_TREE))} />
              </motion.div>
            )}
          </div>
        </DocCard>
      </WorkspaceShell>
    </Scaled>
  );
}

/* ======================= 03 · BOM workspace ======================= */

const BOM_START = 0.7;
const BOM_CPS = 190;
const BOM_CHARS = bomLength() + "Timeline & Cost Summary".length + specLength(BOM_SPEC);
const BOM_DONE = BOM_START + BOM_CHARS / BOM_CPS + 0.3;
// char offset at which each part card starts typing
const PART_AT = BOM.reduce<number[]>((acc, it, i) => {
  const prev = i === 0 ? 0 : acc[i - 1] + (BOM[i - 1].name.length + BOM[i - 1].partNumber.length + BOM[i - 1].qty.length + BOM[i - 1].unitPrice.length + BOM[i - 1].manufacturer.length + BOM[i - 1].leadTime.length);
  acc.push(prev);
  return acc;
}, []);
const S3_PHASES = [BOM_START + PART_AT[3] / BOM_CPS, BOM_START + PART_AT[7] / BOM_CPS + 0.4, BOM_DONE + 0.9];

export function BomScreen({ active, step, compact }: ScreenProps) {
  const t = useStageClock(active, step, S3_PHASES, 4);
  const rev = (t - BOM_START) * BOM_CPS;
  const done = t >= BOM_DONE;
  const parts = BOM.filter((_, i) => rev > PART_AT[i]);
  const cost = parts.reduce((s, it) => s + parseFloat(it.unitPrice.replace(/[$,]/g, "")), 0);
  const c = cursorOf();
  const cardsAt = c.take(bomLength());
  const h2 = c.take(23);
  const specStarts = BOM_SPEC.map((r) => [c.take(r.label.length), c.take(r.value.length)] as [number, number]);
  return (
    <Scaled compact={compact}>
      <WorkspaceShell tab={1} compact={compact}>
        <DocCard
          bare
          title="Bill of Materials"
          tick={tick(t)}
          settled={done}
          shimmer={done && t < BOM_DONE + 0.9}
          header={
            <DocHeader
              title="Bill of Materials"
              aside={
                <>
                  <span className="rounded-full border border-[#1c3654] bg-[#101d2e]/60 px-2 py-0.5 text-[10.5px] font-medium text-[#8fb8e8]">Rev A</span>
                  {!compact && <AiChip working={!done} label={done ? "Built from your requirements" : "OpenPlan AI is sourcing parts"} />}
                </>
              }
            />
          }
        >
          <div className={`grid gap-2.5 ${compact ? "grid-cols-2" : "grid-cols-4"}`}>
            <StatTile label="Parts" value={parts.length} sub={`of ${BOM.length} line items`} />
            <StatTile label="Approved" value={parts.filter((p) => p.status === "Approved").length} tone="#7fd8a8" sub="released" />
            <StatTile label="Draft" value={parts.filter((p) => p.status === "Draft").length} tone="#a8a8ae" sub="awaiting review" />
            <StatTile label="Estimated total" value={`$${Math.round(cost)}`} tone="#fff" sub="rolls up as parts land" />
          </div>
          <BomCards start={cardsAt} revealed={rev} cols={compact ? 2 : 4} />
          <Section heading="Timeline & Cost Summary" start={h2} revealed={rev}>
            <Spec rows={BOM_SPEC} starts={specStarts} revealed={rev} />
          </Section>
        </DocCard>
      </WorkspaceShell>
    </Scaled>
  );
}

/* ======================= 04 · Engineering change workspace ======================= */

const ECN_START = 0.7;
const ECN_CPS = 320;
type EcnSec = (typeof ECN)[number];
const secLen = (sec: EcnSec) => sec.heading.length + (sec.p?.length ?? 0) + (sec.ul?.reduce((a, i) => a + i.length, 0) ?? 0) + (sec.spec ? specLength(sec.spec) : 0);
const ECN_LEFT = ["Summary of Changes", "Reason for Change", "Change Log", "Impact Assessment"];
const LEFT = ECN.filter((s) => ECN_LEFT.includes(s.heading));
const RIGHT = ECN.filter((s) => !ECN_LEFT.includes(s.heading));
const ECN_DONE = ECN_START + sum(ECN.map(secLen)) / ECN_CPS + 0.3;
const S4_PHASES = [ECN_START + sum(LEFT.slice(0, 3).map(secLen)) / ECN_CPS, ECN_DONE + 0.9];

export function EcoScreen({ active, step, compact }: ScreenProps) {
  const t = useStageClock(active, step, S4_PHASES, 4);
  const rev = (t - ECN_START) * ECN_CPS;
  const done = t >= ECN_DONE;
  const c = cursorOf();
  const render = (sec: EcnSec) => (
    <Section key={sec.heading} heading={sec.heading} start={c.take(sec.heading.length)} revealed={rev}>
      {sec.p && <P text={sec.p} start={c.take(sec.p.length)} revealed={rev} />}
      {sec.ul && <Ul items={sec.ul} starts={sec.ul.map((i) => c.take(i.length))} revealed={rev} />}
      {sec.spec && <Spec rows={sec.spec} starts={sec.spec.map((r) => [c.take(r.label.length), c.take(r.value.length)] as [number, number])} revealed={rev} />}
    </Section>
  );
  const left = LEFT.map(render);
  const right = RIGHT.map(render);
  return (
    <Scaled compact={compact}>
      <WorkspaceShell tab={2} compact={compact}>
        <DocCard
          bare
          title="Engineering Change Notice"
          tick={tick(t)}
          settled={done}
          shimmer={done && t < ECN_DONE + 0.9}
          header={
            <DocHeader
              title="Engineering Change Notice"
              aside={
                <>
                  <span className="rounded-full border border-[#26262c] bg-[#1a1a1f] px-2 py-0.5 font-mono text-[10.5px] text-[#a8a8ae]">ECN-2026-0142</span>
                  <span className="rounded-full border border-[#3d2e18] bg-[#2a1f10]/60 px-2 py-0.5 text-[10.5px] font-medium text-[#e8b374]">Pending review</span>
                </>
              }
            />
          }
        >
          <div className={`grid gap-6 ${compact ? "grid-cols-1" : "grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]"}`}>
            <div className="flex min-w-0 flex-col gap-5">{left}</div>
            <div className="flex min-w-0 flex-col gap-5">{right}</div>
          </div>
        </DocCard>
      </WorkspaceShell>
    </Scaled>
  );
}
