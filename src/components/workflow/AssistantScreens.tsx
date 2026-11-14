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

import { memo } from "react";
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

/** A chat document: types itself from `start`, or shows finished when `instant` (it sits behind in the stack). */
interface ChatDocProps {
  t: number;
  start: number;
  instant?: boolean;
}

const PlanningDoc = memo(function PlanningDoc({ t, start, instant }: ChatDocProps) {
  const rev = instant ? Infinity : (t - start) * PLAN_CPS;
  const c = cursorOf();
  const count = instant ? kanbanSteps() : stepsAt(t - start - PLAN_BOARD_AT, KANBAN_BEATS, 0.26);
  const done = instant || t >= start + PLAN_DONE;
  return (
    <DocCard title="Project Planning" height={CARD_H} tick={tick(t)} settled={done} shimmer={!instant && done && t < start + PLAN_DONE + 0.9}>
      <Section heading="Overview" start={c.take(8)} revealed={rev}>
        <P text={PLAN_TEXT} start={c.take(PLAN_TEXT.length)} revealed={rev} />
      </Section>
      <Section heading="Task Board" start={c.take(10)} revealed={rev}>
        {(instant || t >= start + PLAN_BOARD_AT) && (
          <motion.div initial={instant ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
            <KanbanBoard count={count} done={count >= kanbanSteps()} />
          </motion.div>
        )}
      </Section>
    </DocCard>
  );
});

// Requirement Document (chat card)
const RQ_TEXT =
  "This document captures the preliminary requirements for a last-mile delivery rover with a 10km one-way operating range, based on the brief provided.";
const RQ_CPS = 190;
const RQ_TREE_AT = ("Overview".length + RQ_TEXT.length + "Requirements Breakdown".length) / RQ_CPS;
const RQ_BEATS = REQ_TREE.branches.flatMap((b) => [0.3, ...b.leaves.map(() => 0.17)]);
const RQ_DONE = RQ_TREE_AT + 0.32 + sum(RQ_BEATS) + 0.3;

const RequirementChatDoc = memo(function RequirementChatDoc({ t, start, instant }: ChatDocProps) {
  const rev = instant ? Infinity : (t - start) * RQ_CPS;
  const c = cursorOf();
  const count = instant ? treeSteps(REQ_TREE) : stepsAt(t - start - RQ_TREE_AT, RQ_BEATS, 0.32);
  const done = instant || t >= start + RQ_DONE;
  return (
    <DocCard title="Requirement Document" height={CARD_H} tick={tick(t)} settled={done} shimmer={!instant && done && t < start + RQ_DONE + 0.9}>
      <Section heading="Overview" start={c.take(8)} revealed={rev}>
        <P text={RQ_TEXT} start={c.take(RQ_TEXT.length)} revealed={rev} />
      </Section>
      <Section heading="Requirements Breakdown" start={c.take(22)} revealed={rev}>
        {(instant || t >= start + RQ_TREE_AT) && (
          <motion.div initial={instant ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
            <RequirementTree data={REQ_TREE} count={Math.min(count, treeSteps(REQ_TREE))} />
          </motion.div>
        )}
      </Section>
    </DocCard>
  );
});

// Build Plan & Bill of Materials (chat card)
const BC_CPS = 190;
const BC_DONE = ("Bill of Materials".length + bomLength() + "Timeline & Cost Summary".length + specLength(BOM_SPEC)) / BC_CPS + 0.3;

const BomChatDoc = memo(function BomChatDoc({ t, start, instant }: ChatDocProps) {
  const rev = instant ? Infinity : (t - start) * BC_CPS;
  const c = cursorOf();
  const done = instant || t >= start + BC_DONE;
  const h1 = c.take(17);
  const cardsAt = c.take(bomLength());
  const h2 = c.take(23);
  const specStarts = BOM_SPEC.map((r) => [c.take(r.label.length), c.take(r.value.length)] as [number, number]);
  return (
    <DocCard title="Build Plan & Bill of Materials" height={CARD_H} tick={tick(t)} settled={done} shimmer={!instant && done && t < start + BC_DONE + 0.9}>
      <Section heading="Bill of Materials" start={h1} revealed={rev}>
        <BomCards start={cardsAt} revealed={rev} />
      </Section>
      <Section heading="Timeline & Cost Summary" start={h2} revealed={rev}>
        <Spec rows={BOM_SPEC} starts={specStarts} revealed={rev} />
      </Section>
    </DocCard>
  );
});

// Engineering Change Notice (chat card)
const EC_CPS = 300;
const EC_TAIL = "Want me to open these as tasks in the project?";
const ecSecLen = (sec: (typeof ECN)[number]) => sec.heading.length + (sec.p?.length ?? 0) + (sec.ul?.reduce((a, i) => a + i.length, 0) ?? 0) + (sec.spec ? specLength(sec.spec) : 0);
const EC_DONE = (sum(ECN.map(ecSecLen)) + EC_TAIL.length) / EC_CPS + 0.3;

const EcnChatDoc = memo(function EcnChatDoc({ t, start, instant }: ChatDocProps) {
  const rev = instant ? Infinity : (t - start) * EC_CPS;
  const c = cursorOf();
  const done = instant || t >= start + EC_DONE;
  return (
    <DocCard title="Engineering Change Notice" height={CARD_H} tick={tick(t)} settled={done} shimmer={!instant && done && t < start + EC_DONE + 0.9}>
      {ECN.map((sec) => (
        <Section key={sec.heading} heading={sec.heading} start={c.take(sec.heading.length)} revealed={rev}>
          {sec.p && <P text={sec.p} start={c.take(sec.p.length)} revealed={rev} />}
          {sec.ul && <Ul items={sec.ul} starts={sec.ul.map((i) => c.take(i.length))} revealed={rev} />}
          {sec.spec && <Spec rows={sec.spec} starts={sec.spec.map((r) => [c.take(r.label.length), c.take(r.value.length)] as [number, number])} revealed={rev} />}
        </Section>
      ))}
      <P text={EC_TAIL} start={c.take(EC_TAIL.length)} revealed={rev} />
    </DocCard>
  );
});

// The conversation, in the video's order. Each document types itself out and shimmers,
// then the thinking pill runs above the input and the next one rises in front of it.
const S1 = { type: 0.9, cps: 22, send: 5.0, think: 5.3, arrive: 8.5 };
const PILL = 2.4;
const CHAT_DOCS = [
  { key: "req", Doc: RequirementChatDoc, dur: RQ_DONE },
  { key: "plan", Doc: PlanningDoc, dur: PLAN_DONE },
  { key: "bom", Doc: BomChatDoc, dur: BC_DONE },
  { key: "ecn", Doc: EcnChatDoc, dur: EC_DONE },
];
const ARRIVALS: number[] = [];
const THINKS: number[] = [S1.think];
CHAT_DOCS.reduce((at, d, i) => {
  ARRIVALS.push(at);
  const next = at + RISE + d.dur + 0.9 + 0.4;
  if (i < CHAT_DOCS.length - 1) THINKS.push(next);
  return next + PILL;
}, S1.arrive);
const S1_END = ARRIVALS[ARRIVALS.length - 1] + RISE + EC_DONE + 1.2;
const S1_PHASES = [S1_END];

export function ArchitectScreen({ active, step, compact }: ScreenProps) {
  const t = useStageClock(active, step, S1_PHASES, 5);
  const typedText = PROMPT.slice(0, Math.max(0, Math.floor((t - S1.type) * S1.cps)));
  const arrived = ARRIVALS.filter((a) => t >= a).length;
  const cards = CHAT_DOCS.slice(0, arrived).map(({ key, Doc }, i) => {
    const front = i === arrived - 1;
    return { key, fresh: true, node: front ? <Doc t={t} start={ARRIVALS[i] + RISE} /> : <Doc t={0} start={0} instant /> };
  });
  const thinkingIdx = THINKS.findIndex((s, i) => t >= s && t < ARRIVALS[i]);
  const thinking = thinkingIdx >= 0 ? t - THINKS[thinkingIdx] : null;
  return (
    <Scaled compact={compact}>
      <AssistantShell compact={compact} bare>
        <AnimatePresence mode="wait" initial={false}>
          {t < S1.send ? (
            <motion.div key="idle" className="flex min-h-0 flex-1" exit={{ opacity: 0, transition: { duration: 0.2 } }}>
              <IdleView value={typedText} sending={t > S1.send - 0.35} compact={compact} bare />
            </motion.div>
          ) : (
            <motion.div key="chat" className="flex min-h-0 flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <ChatView prompt={PROMPT} cardHeight={CARD_H} thinking={thinking} cards={cards} />
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
      <WorkspaceShell tab={0} compact={compact} action="New Requirement" bare>
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
      <WorkspaceShell tab={1} compact={compact} action="Add Part" bare>
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

export { EcoScreen } from "./EcoWorkspace";
