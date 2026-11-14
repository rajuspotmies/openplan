"use client";

/*
 * The OpenPlan "Assistant" UI, ported from the product-video repo
 * (thakursameershetty/video-edit) and re-driven by the stage clock `t` (seconds)
 * instead of timers, so each stage plays in sync with the scroll callouts.
 */

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ThinkingOrb, type OrbState } from "thinking-orbs";
import {
  ArrowUp,
  Bell,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  Download,
  FileDown,
  FolderKanban,
  Globe,
  LayoutGrid,
  MessageSquare,
  Mic,
  Moon,
  Paperclip,
  Plug,
  Puzzle,
  Settings,
  Share2,
  Sparkles,
  UserCheck,
  Users,
  Activity,
  ClipboardList,
  ShieldAlert,
  Flag,
  ListChecks,
  TriangleAlert,
} from "lucide-react";
import { Boxes, GitBranch, Layers, ListTodo } from "lucide-react";
import { AVATARS, BOM, BOM_SPEC, BOM_TOTAL, KANBAN, SUGGESTIONS, USER_NAME, type ReqLeaf, type ReqTreeData } from "./assistant-data";

export const NO_SCROLLBAR = "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

/* ---------- chrome ---------- */

function OpenPlanLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 259 258" fill="none" className={className} aria-hidden>
      <path
        d="M253.559 6.33C252.017 4.6 250.137 3.2 248.034 2.21L247.396 1.92C244.69.65 241.741 0 238.755 0H190.531C187.658 0 184.819.63 182.215 1.84 179.594 3.07 177.275 4.85 175.423 7.08L174.698 7.95C173.54 9.34 172.653 10.93 172.081 12.64 171.603 14.08 171.352 15.58 171.338 17.09L170.877 65.01C170.846 68.18 170.176 71.31 168.907 74.21 167.731 76.9 166.064 79.34 163.991 81.41L163.829 81.57C162.159 83.25 160.258 84.67 158.184 85.8L156.987 86.45C155.994 86.99 154.944 87.42 153.856 87.73 152.486 88.13 151.068 88.32 149.642 88.32H110.716C108.148 88.32 105.599 87.88 103.18 87.02 100.7 86.13 98.395 84.82 96.372 83.13L96.127 82.93C94.112 81.25 92.383 79.25 91.008 77.02L90.489 76.17C89.404 74.41 88.577 72.5 88.032 70.5 87.524 68.64 87.266 66.72 87.266 64.79V19.1C87.266 16.61 86.808 14.15 85.915 11.82L85.777 11.47C85.013 9.48 83.905 7.64 82.503 6.04L82.238 5.74C81.363 4.74 80.36 3.86 79.254 3.12 78.253 2.45 77.175 1.91 76.043 1.5L75.387 1.26C73.099.43 70.683 0 68.249 0H18.028C15.901 0 13.794.41 11.82 1.2 10.295 1.81 8.868 2.64 7.586 3.66L6.409 4.6C4.968 5.76 3.731 7.15 2.753 8.71 1.979 9.95 1.374 11.29.954 12.69L.828 13.11C.279 14.94 0 16.84 0 18.75V69.03C0 70.95.309 72.86.915 74.68 1.361 76.01 1.964 77.29 2.712 78.49L3.356 79.52C3.937 80.45 4.623 81.31 5.399 82.09 6.378 83.07 7.493 83.9 8.709 84.56L9.783 85.15C11.711 86.2 13.794 86.94 15.955 87.33 17.652 87.64 19.382 87.73 21.102 87.61L25.916 87.27 66.222 88.24C68.592 88.29 70.925 88.83 73.083 89.81 74.771 90.58 76.327 91.61 77.694 92.86L78.814 93.89C80.908 95.81 82.665 98.06 84.012 100.57L84.39 101.27C85.246 102.86 85.878 104.56 86.27 106.32 86.581 107.72 86.738 109.15 86.738 110.58V146.85C86.738 148.38 86.57 149.9 86.239 151.39L86.218 151.48C85.861 153.09 85.307 154.65 84.57 156.13 83.901 157.46 83.087 158.72 82.141 159.88L81.706 160.41C79.786 162.76 77.475 164.75 74.875 166.31L72.918 167.49C71.561 168.3 70.091 168.91 68.555 169.29 67.283 169.61 65.977 169.77 64.665 169.77H19.494C16.752 169.77 14.038 170.33 11.518 171.41L11.204 171.54C9.043 172.47 7.079 173.8 5.417 175.46 3.589 177.29 2.163 179.49 1.235 181.9.42 184.02 0 186.28 0 188.55V237.92C0 240.07.348 242.22 1.029 244.26L1.085 244.43C1.767 246.47 2.792 248.39 4.116 250.09L4.288 250.31C5.303 251.62 6.501 252.77 7.845 253.73 8.958 254.52 10.162 255.18 11.431 255.69L11.555 255.74C13.705 256.6 15.998 257.04 18.313 257.04H69.709C71.529 257.04 73.338 256.75 75.065 256.17L75.351 256.08C76.59 255.66 77.768 255.09 78.855 254.36 79.875 253.68 80.806 252.88 81.626 251.97L82.948 250.5C84.403 248.88 85.533 247 86.276 244.95 86.932 243.15 87.276 241.25 87.295 239.33L87.757 193.15C87.782 190.63 88.258 188.14 89.161 185.79 90.007 183.59 91.218 181.55 92.742 179.75L93.515 178.83C95.33 176.69 97.498 174.87 99.925 173.45L101.032 172.81C102.076 172.2 103.192 171.72 104.354 171.39 105.649 171.02 106.99 170.83 108.337 170.83H151.504C153.798 170.83 156.079 170.49 158.271 169.81L159.353 169.48C161 168.97 162.554 168.21 163.956 167.2 165.009 166.45 165.968 165.57 166.81 164.59L166.92 164.46C168.109 163.08 169.073 161.51 169.776 159.82L169.883 159.57C170.858 157.23 171.359 154.72 171.359 152.18V114.44C171.359 111.15 171.831 107.88 172.76 104.72L173.561 102C173.855 101 174.276 100.04 174.812 99.14 175.329 98.28 175.95 97.48 176.66 96.77L178.762 94.67C180.517 92.92 182.515 91.42 184.694 90.23L185.732 89.67C186.725 89.13 187.775 88.7 188.863 88.39 190.233 87.99 191.651 87.8 193.077 87.8H237.538C239.945 87.8 242.337 87.41 244.621 86.65L245.431 86.38C247.854 85.57 250.082 84.26 251.972 82.55 253.917 80.78 255.46 78.61 256.495 76.2L256.556 76.05C257.573 73.68 258.097 71.13 258.097 68.55V18.55C258.097 16.08 257.608 13.63 256.658 11.35L256.549 11.09C255.823 9.35 254.812 7.74 253.559 6.33Z"
        fill="currentColor"
      />
    </svg>
  );
}

const SIDEBAR_ICONS = [LayoutGrid, Sparkles, FolderKanban, MessageSquare, Users, Plug, Settings];

export function AssistantShell({ compact, children }: { compact?: boolean; children: ReactNode }) {
  return (
    <div className="flex h-full bg-[#0a0a0d] font-sans text-[#e8e8ea]">
      {!compact && (
        <div className="flex w-[64px] shrink-0 flex-col items-center gap-2 border-r border-[#1c1c22] py-4">
          <div className="mb-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#2a2a31] bg-[#16161b] text-[#fff]">
            <OpenPlanLogo className="h-4 w-4" />
          </div>
          {SIDEBAR_ICONS.map((Icon, i) => (
            <div key={i} className={`flex h-10 w-10 items-center justify-center rounded-xl ${i === 1 ? "bg-[#f2f2f2] text-[#0a0a0d]" : "text-[#6b6b76]"}`}>
              <Icon size={18} />
            </div>
          ))}
          <div className="flex-1" />
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f2f2f2] text-[#0a0a0d]">
            <OpenPlanLogo className="h-3.5 w-3.5" />
          </div>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-[#1c1c22] px-6">
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold text-[#fff]">Assistant</span>
            <span className="text-[10px] font-semibold tracking-wide text-[#6b6b76]">(BETA)</span>
          </div>
          <div className="flex items-center gap-1 text-[#6b6b76]">
            {[Puzzle, Users, Moon, Bell].map((Icon, i) => (
              <div key={i} className="flex h-9 w-9 items-center justify-center rounded-full">
                <Icon size={17} />
              </div>
            ))}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={AVATARS.John} alt="" className="ml-2 h-8 w-8 rounded-full object-cover" />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- input ---------- */

function BorderBeam() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--path", `path("M 0 0 H ${el.offsetWidth} V ${el.offsetHeight} H 0 V 0")`);
  }, []);
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0">
      <motion.div
        className="absolute inset-0 aspect-square"
        style={{ background: "radial-gradient(ellipse at center, #ffffff, transparent, transparent)", width: 220, offsetPath: "var(--path)" } as CSSProperties}
        animate={{ offsetDistance: ["0%", "100%"] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export function InputPill({ value, compact, sending }: { value: string; compact?: boolean; sending?: boolean }) {
  return (
    <div className={`relative w-full max-w-[690px] overflow-hidden rounded-[23px] shadow-[0_8px_30px_rgba(0,0,0,0.35)] ${compact ? "border border-[#1e1e24]" : "p-[1.5px]"}`}>
      {!compact && <BorderBeam />}
      <div className="relative z-10 flex flex-col gap-4 rounded-[21.5px] bg-[#131316] px-5 pb-3 pt-4">
        <p className="m-0 min-h-[22px] text-[15px] leading-[22px]" style={{ color: value ? "#e8e8ea" : "#6b6b76" }}>
          {value || "Ask, and you shall receive..."}
          {value && <span className="ml-px inline-block h-[1em] w-[2px] -mb-[0.15em] animate-pulse bg-[#e8e8ea]" />}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b6b76]">
              <Paperclip size={16} />
            </span>
            <span className="flex h-8 items-center gap-1.5 rounded-full border border-[#26262c] bg-[#1a1a1f] pl-3 pr-2.5 text-[13px] text-[#a8a8ae]">
              <Globe size={13} />
              Select a project
              <ChevronDown size={13} />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b6b76]">
              <Mic size={16} />
            </span>
            <span className="relative h-9 w-9 overflow-hidden rounded-full bg-[#3a3a42]">
              <span className={`absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur transition-opacity duration-300 ${sending ? "opacity-90" : "opacity-0"}`} />
              <span className="relative flex h-full w-full items-center justify-center text-[#e8e8ea]">
                <ArrowUp size={16} />
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const SUGGESTION_ICONS = [Activity, ClipboardList, ShieldAlert, Flag, ListChecks, TriangleAlert];

/** Landing state: greeting, beam-lit input and suggestion pills. */
export function IdleView({ value, sending, compact }: { value: string; sending: boolean; compact?: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6 text-[28px] font-bold text-[#fff]">
        What can I help with, {USER_NAME}?
      </motion.h1>
      <InputPill value={value} sending={sending} />
      <div className="mt-6 flex w-full max-w-[690px] flex-col items-center gap-2.5">
        {SUGGESTIONS.slice(0, compact ? 3 : 6).map((text, i) => {
          const Icon = SUGGESTION_ICONS[i];
          return (
            <motion.span
              key={text}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 + i * 0.06 }}
              className="flex w-fit max-w-full items-center gap-2.5 rounded-full border border-[#1e1e24] bg-[#111114] px-4 py-2.5"
            >
              <Icon size={14} className="shrink-0 text-[#8b8b93]" />
              <span className="text-[13.5px] leading-snug text-[#c8c8cc]">{text}</span>
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- thinking pill ---------- */

const THINKING_STATES: { label: string; orb: OrbState }[] = [
  { label: "Searching...", orb: "searching" },
  { label: "Thinking...", orb: "breathing" },
  { label: "Working...", orb: "working" },
  { label: "Solving...", orb: "solving" },
];

const vanishContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } },
  exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
};
const vanishWord: Variants = {
  hidden: { opacity: 0, filter: "blur(6px)", y: 4 },
  visible: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, filter: "blur(6px)", y: -4, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } },
};

function VanishText({ text, cycleKey }: { text: string; cycleKey: number }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span key={cycleKey} variants={vanishContainer} initial="hidden" animate="visible" exit="exit">
        {text.split(" ").map((w, i, all) => (
          <motion.span key={i} variants={vanishWord} style={{ display: "inline-block" }}>
            {w}
            {i < all.length - 1 ? " " : ""}
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  );
}

export function ThinkingPill({ elapsed }: { elapsed: number }) {
  const idx = Math.floor(Math.max(0, elapsed) / 1.6) % THINKING_STATES.length;
  const s = THINKING_STATES[idx];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
      className="mx-auto inline-flex w-fit items-center gap-2.5 rounded-full border border-[#1e1e24] bg-[#111114] px-4 py-2.5"
    >
      <span className="-ml-0.5 flex shrink-0 items-center justify-center [&_canvas]:!size-[18px]">
        <ThinkingOrb state={s.orb} size={20} theme="dark" />
      </span>
      <span className="text-[13.5px] text-[#c8c8cc]">
        <VanishText text={s.label} cycleKey={idx} />
      </span>
    </motion.div>
  );
}

/* ---------- chat layout ---------- */

export function UserBubble({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4, y: 10, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
      transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
      style={{ transformOrigin: "bottom right" }}
      className="max-w-[85%] self-end rounded-2xl rounded-tr-sm bg-[#fff] px-4 py-2.5 text-[14px] font-medium text-[#111114]"
    >
      {text}
    </motion.div>
  );
}

export interface StackCard {
  key: string;
  node: ReactNode;
  /** true when this card enters during this stage (rises from below) */
  fresh: boolean;
}

/** Cards pinned to the same top edge; older ones recede behind the newest like a stack of papers. */
export function CardStack({ cards, height }: { cards: StackCard[]; height: number }) {
  const front = cards.length - 1;
  return (
    <div className="relative mx-auto mt-12 w-full max-w-[940px]" style={{ height }}>
      {cards.map((c, pos) => {
        const depth = front - pos;
        return (
          <motion.div
            key={c.key}
            className="absolute inset-x-0 top-0 w-full"
            style={{
              zIndex: 100 - depth,
              transformOrigin: "top center",
              transformPerspective: 1400,
              opacity: depth === 0 ? 1 : Math.max(1 - depth * 0.16, 0.55),
            }}
            initial={depth === 0 && c.fresh ? { scale: 0.82, y: 640, rotateX: -28 } : false}
            animate={{ scale: 1 - depth * 0.02, y: -(depth * 14 + (depth > 0 ? 6 : 0)), rotateX: 0 }}
            transition={{ type: "spring", bounce: 0.12, duration: 0.7 }}
          >
            <motion.div initial={depth === 0 && c.fresh ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.45, ease: "easeOut" }}>
              {c.node}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

/** Chat state: user prompt on top, the document stack, and the input (with the thinking pill above it). */
export function ChatView({ prompt, cards, cardHeight, thinking }: { prompt: string; cards: StackCard[]; cardHeight: number; thinking: number | null; compact?: boolean }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-hidden px-6 py-8">
        <div className="mx-auto flex max-w-[690px] flex-col gap-4">
          <UserBubble text={prompt} />
        </div>
        {cards.length === 0 ? (
          <div className="mx-auto mt-5 flex max-w-[690px] justify-center">
            <AnimatePresence>{thinking !== null && <ThinkingPill key="first" elapsed={thinking} />}</AnimatePresence>
          </div>
        ) : (
          <CardStack cards={cards} height={cardHeight} />
        )}
      </div>
      <div className="relative flex shrink-0 flex-col items-center px-6 pb-6 pt-2">
        <AnimatePresence>
          {cards.length > 0 && thinking !== null && (
            <div className="pointer-events-none absolute inset-x-0 bottom-full z-[999] mb-3 flex justify-center px-6">
              <ThinkingPill key="next" elapsed={thinking} />
            </div>
          )}
        </AnimatePresence>
        <InputPill value="" compact />
      </div>
    </div>
  );
}

/* ---------- document card ---------- */

/** Visible typed slice of `text` with a caret where typing currently is. */
export function Typed({ text, start, revealed }: { text: string; start: number; revealed: number }) {
  const shown = Math.max(0, Math.min(text.length, revealed - start));
  const typing = shown > 0 && shown < text.length;
  return (
    <>
      {text.slice(0, shown)}
      {typing && <span data-typing-caret="true" className="ml-[1px] inline-block h-[1em] w-[2px] -mb-[0.15em] animate-pulse bg-[#e8e8ea]" />}
    </>
  );
}

/** Running character budget, consumed in render order. */
export function cursorOf() {
  const c = { pos: 0, take: (n: number) => ((c.pos += n), c.pos - n) };
  return c;
}

/**
 * Keeps whatever is being written in view: the typing caret, or the newest
 * revealed node ([data-latest]). Scrolls the card body and any horizontal strip
 * ([data-xscroll]) it sits in. Resets both to the start once the card settles.
 */
function useFollow(ref: React.RefObject<HTMLDivElement | null>, tick: number, settled: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const s = el.getBoundingClientRect().height / el.offsetHeight || 1;
    if (settled) {
      if (el.scrollTop > 0) el.scrollTo({ top: 0, behavior: "smooth" });
      el.querySelectorAll<HTMLElement>("[data-xscroll]").forEach((r) => r.scrollLeft > 0 && r.scrollTo({ left: 0, behavior: "smooth" }));
      return;
    }
    const latest = el.querySelectorAll<HTMLElement>("[data-latest]");
    const target = el.querySelector<HTMLElement>("[data-typing-caret]") ?? latest[latest.length - 1];
    if (!target) return;
    const er = el.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    const below = (tr.bottom - er.top) / s - el.clientHeight + 20;
    if (below > 0) el.scrollTo({ top: el.scrollTop + below, behavior: "smooth" });
    const row = target.closest<HTMLElement>("[data-xscroll]");
    if (row) {
      const rr = row.getBoundingClientRect();
      const right = (tr.right - rr.left) / s - row.clientWidth + 16;
      if (right > 0) row.scrollTo({ left: row.scrollLeft + right, behavior: "smooth" });
    }
  }, [ref, tick, settled]);
}

export function DocHeader({ title, aside }: { title: string; aside?: ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4 border-b border-[#1e1e24] pb-4">
      <div className="flex min-w-0 items-center gap-3">
        <h2 className="m-0 text-[16px] font-semibold text-[#fff]">{title}</h2>
        {aside}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {[
          { Icon: Download, l: "Download" },
          { Icon: Users, l: "Invite" },
          { Icon: Share2, l: "Share" },
        ].map(({ Icon, l }) => (
          <span key={l} className="flex h-8 items-center gap-1.5 rounded-full border border-[#26262c] bg-[#1a1a1f] px-3 text-[12px] text-[#a8a8ae]">
            <Icon size={13} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DocCard({ title, height, tick, settled, shimmer, children, bare, header }: { title: string; height?: number; tick: number; settled: boolean; shimmer: boolean; children: ReactNode; bare?: boolean; header?: ReactNode }) {
  const body = useRef<HTMLDivElement>(null);
  useFollow(body, tick, settled);
  return (
    <div
      className={`relative flex w-full flex-col overflow-hidden ${bare ? "min-h-0 flex-1 px-6 pb-5 pt-5" : "rounded-3xl border border-[#1e1e24] bg-[#111114] px-6 py-6"}`}
      style={height ? { height } : undefined}
    >
      {header ?? <DocHeader title={title} />}
      <div ref={body} className={`min-h-0 flex-1 overflow-y-auto pr-1 ${NO_SCROLLBAR}`}>
        <div className="flex flex-col gap-5 pb-1">{children}</div>
      </div>
      <AnimatePresence>
        {shimmer && (
          <motion.div
            key="shimmer"
            className="pointer-events-none absolute -inset-[40%]"
            style={{ background: "linear-gradient(135deg, transparent 42%, rgba(255,255,255,0.18) 50%, transparent 58%)" }}
            initial={{ x: "-60%", y: "-60%" }}
            animate={{ x: "60%", y: "60%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- document blocks ---------- */

export function Section({ heading, start, revealed, children }: { heading: string; start: number; revealed: number; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[#8b8b93]">
        <Typed text={heading} start={start} revealed={revealed} />
      </h3>
      {children}
    </div>
  );
}

export function P({ text, start, revealed }: { text: string; start: number; revealed: number }) {
  return (
    <p className="m-0 text-[13.5px] leading-relaxed text-[#c8c8cc]">
      <Typed text={text} start={start} revealed={revealed} />
    </p>
  );
}

export function Ul({ items, starts, revealed }: { items: string[]; starts: number[]; revealed: number }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {items.map((item, j) => (
        <li key={j} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-[#e8e8ea]">
          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#6b6b76]" />
          <span>
            <Typed text={item} start={starts[j]} revealed={revealed} />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Spec({ rows, starts, revealed }: { rows: { label: string; value: string }[]; starts: [number, number][]; revealed: number }) {
  return (
    <dl className="m-0 divide-y divide-[#1e1e24] overflow-hidden rounded-xl border border-[#1e1e24] bg-[#0d0d10]">
      {rows.map((row, j) => (
        <div key={j} className="flex items-center justify-between gap-4 px-3.5 py-2.5">
          <dt className="text-[12px] text-[#8b8b93]">
            <Typed text={row.label} start={starts[j][0]} revealed={revealed} />
          </dt>
          <dd className="m-0 text-right text-[12.5px] font-medium text-[#e8e8ea]">
            <Typed text={row.value} start={starts[j][1]} revealed={revealed} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- requirements tree ---------- */

const REQ_STATUS: Record<ReqLeaf["status"], string> = {
  Approved: "text-[#7fb2f0] bg-[#132a45]/70 border-[#1e3a5c]",
  Reviewed: "text-[#c79bf0] bg-[#2a1f3d]/70 border-[#3d2a54]",
  Draft: "text-[#a8a8ae] bg-[#1a1a1f] border-[#26262c]",
};

function Verification({ v }: { v: ReqLeaf["verification"] }) {
  if (v === "Passed")
    return (
      <span className="inline-flex items-center gap-1 text-[9.5px] text-[#7fd8a8]">
        <CheckCircle2 size={11} /> Passed
      </span>
    );
  if (v === "In Progress")
    return (
      <span className="inline-flex items-center gap-1 text-[9.5px] text-[#e8b374]">
        <Clock3 size={11} /> In Progress
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[9.5px] text-[#6b6b76]">
      <Circle size={11} /> Not Verified
    </span>
  );
}

function LeafCard({ leaf }: { leaf: ReqLeaf }) {
  return (
    <div className="flex w-max min-w-[168px] shrink-0 flex-col gap-1.5 rounded-lg border border-[#1e1e24] bg-[#111114] px-3.5 py-2.5">
      <div className="flex items-center gap-2.5">
        <span
          className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${leaf.type === "Component" ? "border-[#1e5b39] bg-[#123521]/60 text-[#7fd8a8]" : "border-[#1c3654] bg-[#101d2e]/60 text-[#8fb8e8]"}`}
        >
          {leaf.type}
        </span>
        <span className="whitespace-nowrap text-[9px] text-[#6b6b76]">{leaf.id}</span>
      </div>
      <p className="m-0 whitespace-nowrap text-[11px] font-medium leading-snug text-[#e8e8ea]">{leaf.label}</p>
      <div className="flex items-center gap-2 border-t border-[#1e1e24] pt-1.5">
        <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9.5px] ${REQ_STATUS[leaf.status]}`}>{leaf.status}</span>
        <Verification v={leaf.verification} />
      </div>
    </div>
  );
}

/** Steps: a branch label, then each of its leaves. `count` = steps revealed so far. */
export const treeSteps = (d: ReqTreeData) => d.branches.reduce((n, b) => n + 1 + b.leaves.length, 0);

export function RequirementTree({ data, count }: { data: ReqTreeData; count: number }) {
  const box = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const branchEls = useRef<(HTMLDivElement | null)[]>([]);
  const leafEls = useRef<(HTMLDivElement | null)[][]>(data.branches.map(() => []));
  const [lines, setLines] = useState<{ key: string; d: string }[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const c = box.current;
    if (!c) return;
    const s = c.getBoundingClientRect().width / c.offsetWidth || 1;
    const cr = c.getBoundingClientRect();
    const pt = (el: HTMLElement | null | undefined, side: "l" | "r") => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: ((side === "l" ? r.left : r.right) - cr.left) / s + c.scrollLeft, y: (r.top + r.height / 2 - cr.top) / s + c.scrollTop };
    };
    const curve = (a: { x: number; y: number }, b: { x: number; y: number }) => {
      const m = (a.x + b.x) / 2;
      return `M${a.x},${a.y} C${m},${a.y} ${m},${b.y} ${b.x},${b.y}`;
    };
    const rp = pt(root.current, "r");
    const next: { key: string; d: string }[] = [];
    data.branches.forEach((b, bi) => {
      const bl = pt(branchEls.current[bi], "l");
      if (rp && bl) next.push({ key: `b${bi}`, d: curve(rp, bl) });
      const br = pt(branchEls.current[bi], "r");
      b.leaves.forEach((_, li) => {
        const lp = pt(leafEls.current[bi]?.[li], "l");
        if (br && lp) next.push({ key: `b${bi}l${li}`, d: curve(br, lp) });
      });
    });
    setSize({ w: c.scrollWidth, h: c.scrollHeight });
    setLines(next);
  }, [count, data]);

  const st = { i: -1 };
  return (
    <div ref={box} data-xscroll className={`relative overflow-x-auto rounded-xl border border-[#1e1e24] bg-[#0d0d10] p-4 ${NO_SCROLLBAR}`}>
      <svg width={size.w} height={size.h} className="pointer-events-none absolute left-0 top-0 overflow-visible">
        {lines.map((l) => (
          <motion.path key={l.key} d={l.d} stroke="#2a2a31" strokeWidth={1.5} fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35 }} />
        ))}
      </svg>
      <div className="relative flex w-fit items-start gap-10">
        <div ref={root} className="w-[130px] shrink-0 self-center">
          <div className="rounded-xl border border-[#2a2a31] bg-[#16161b] px-3.5 py-3 text-center shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
            <p className="m-0 text-[12.5px] font-semibold leading-snug text-[#fff]">{data.root}</p>
            <p className="m-0 mt-1 text-[10px] text-[#8b8b93]">{data.rootSub}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {data.branches.map((b, bi) => {
            st.i += 1;
            const bIdx = st.i;
            if (count <= bIdx) {
              st.i += b.leaves.length;
              return null;
            }
            return (
              <div key={bi} className="flex items-start gap-4">
                <motion.div
                  ref={(el: HTMLDivElement | null) => {
                    branchEls.current[bi] = el;
                  }}
                  data-latest={count - 1 === bIdx || undefined}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-[128px] shrink-0 rounded-lg border border-[#3a2e1f] bg-[#241d12] px-3 py-2"
                >
                  <p className="m-0 text-[11.5px] font-semibold leading-snug text-[#e8b374]">{b.label}</p>
                  <p className="m-0 mt-0.5 text-[9.5px] text-[#8b8b93]">{b.leaves.length} items</p>
                </motion.div>
                <div className="flex gap-2.5">
                  {b.leaves.map((leaf, li) => {
                    st.i += 1;
                    const lIdx = st.i;
                    if (count <= lIdx) return null;
                    return (
                      <motion.div
                        key={li}
                        ref={(el: HTMLDivElement | null) => {
                          leafEls.current[bi][li] = el;
                        }}
                        data-latest={count - 1 === lIdx || undefined}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <LeafCard leaf={leaf} />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- kanban ---------- */

const TAG: Record<string, string> = {
  Chassis: "text-[#8fb8e8] bg-[#101d2e]/60 border-[#1c3654]",
  Power: "text-[#e8b374] bg-[#2a1f10]/60 border-[#3d2e18]",
  Navigation: "text-[#c79bf0] bg-[#2a1f3d]/70 border-[#3d2a54]",
  Payload: "text-[#7fd8a8] bg-[#123521]/60 border-[#1e5b39]",
  Safety: "text-[#f0a8a8] bg-[#331414]/60 border-[#4d1e1e]",
  Ops: "text-[#a8a8ae] bg-[#1a1a1f] border-[#26262c]",
};

export const kanbanSteps = () => KANBAN.reduce((n, c) => n + 1 + c.cards.length, 0);

export function KanbanBoard({ count, done }: { count: number; done: boolean }) {
  const st = { i: -1 };
  return (
    <div className="flex flex-col gap-3">
      <div data-xscroll className={`-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 ${NO_SCROLLBAR}`}>
        {KANBAN.map((col, ci) => {
          st.i += 1;
          const cIdx = st.i;
          if (count <= cIdx) {
            st.i += col.cards.length;
            return null;
          }
          return (
            <motion.div
              key={ci}
              data-latest={count - 1 === cIdx || undefined}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex w-[180px] shrink-0 flex-col gap-2 rounded-xl border border-[#1e1e24] bg-[#0d0d10] p-2.5"
            >
              <div className="flex items-center justify-between px-0.5">
                <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#8b8b93]">{col.title}</p>
                <span className="text-[9.5px] text-[#6b6b76]">{col.cards.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {col.cards.map((card, cj) => {
                  st.i += 1;
                  const kIdx = st.i;
                  if (count <= kIdx) return null;
                  return (
                    <motion.div key={cj} data-latest={count - 1 === kIdx || undefined} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                      <div className="flex w-full flex-col gap-2 rounded-lg border border-[#1e1e24] bg-[#111114] px-3 py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <Circle size={15} className="shrink-0 text-[#4a4a52]" />
                            <span className="whitespace-nowrap text-[9px] text-[#6b6b76]">{card.id}</span>
                          </div>
                          <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${TAG[card.tag] ?? TAG.Ops}`}>{card.tag}</span>
                        </div>
                        <p className="m-0 text-[11.5px] font-medium leading-snug text-[#e8e8ea]">{card.title}</p>
                        <div className="flex items-center justify-between gap-2 border-t border-[#1e1e24] pt-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={AVATARS[card.assignee]} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover ring-1 ring-[#26262c]" />
                          <span className="whitespace-nowrap text-[9.5px] text-[#6b6b76]">{card.date}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-wrap items-center gap-2 pt-1">
          <span className="flex h-8 items-center gap-1.5 rounded-full bg-[#fff] px-3.5 text-[12px] font-medium text-[#000]">
            <FolderKanban size={13} /> Open Task Board
          </span>
          <span className="flex h-8 items-center gap-1.5 rounded-full border border-[#26262c] bg-[#1a1a1f] px-3 text-[12px] text-[#a8a8ae]">
            <UserCheck size={13} /> Assign
          </span>
          <span className="flex h-8 items-center gap-1.5 rounded-full border border-[#26262c] bg-[#1a1a1f] px-3 text-[12px] text-[#a8a8ae]">
            <FileDown size={13} /> Export CSV
          </span>
        </motion.div>
      )}
    </div>
  );
}

/* ---------- bill of materials ---------- */

export const bomLength = () =>
  BOM.reduce((s, it) => s + it.name.length + it.partNumber.length + it.qty.length + it.unitPrice.length + it.manufacturer.length + it.leadTime.length, 0) + BOM_TOTAL.length;
export const specLength = (rows: { label: string; value: string }[]) => rows.reduce((s, r) => s + r.label.length + r.value.length, 0);
export { BOM_SPEC };

export function BomCards({ start, revealed, cols }: { start: number; revealed: number; /** page layout: a grid instead of a scrolling strip */ cols?: number }) {
  const c = cursorOf();
  c.pos = start;
  const take = c.take;
  return (
    <div className="flex flex-col gap-3">
      <div
        data-xscroll={cols ? undefined : true}
        className={cols ? "grid gap-3" : `-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 ${NO_SCROLLBAR}`}
        style={cols ? { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` } : undefined}
      >
        {BOM.map((it) => {
          const s = [take(it.name.length), take(it.partNumber.length), take(it.qty.length), take(it.unitPrice.length), take(it.manufacturer.length), take(it.leadTime.length)];
          const field = (label: string, text: string, at: number) => (
            <div className="min-w-0">
              <p className="m-0 text-[9.5px] uppercase tracking-wide text-[#6b6b76]">{label}</p>
              <p className="m-0 truncate text-[11.5px] text-[#e8e8ea]">
                <Typed text={text} start={at} revealed={revealed} />
              </p>
            </div>
          );
          return (
            <motion.div
              key={it.partNumber}
              initial={false}
              animate={{ opacity: !cols || revealed > s[0] ? 1 : 0.25, y: !cols || revealed > s[0] ? 0 : 6 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={`flex shrink-0 flex-col overflow-hidden rounded-xl border border-[#1e1e24] bg-[#0d0d10] ${cols ? "min-w-0" : "w-[210px]"}`}
            >
              <div className={`relative flex items-center justify-center bg-[#f2f2f0] ${cols ? "h-[86px]" : "h-[110px]"}`}>
                <span className="absolute left-2 top-2 rounded-full border border-[#26262c] bg-[#1a1a1f]/90 px-1.5 py-0.5 text-[10px] font-semibold text-[#c8c8cc]">{it.version}</span>
                <span
                  className={`absolute right-2 top-2 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${it.status === "Approved" ? "border-[#1e5b39] bg-[#123521]/80 text-[#7fd8a8]" : "border-[#26262c] bg-[#1a1a1f]/90 text-[#a8a8ae]"}`}
                >
                  {it.status}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.image} alt={it.name} className="h-full w-full object-contain p-3" />
              </div>
              <div className="flex flex-col gap-2 px-3 py-3">
                <div>
                  <p className="m-0 min-h-[17px] text-[12.5px] font-medium leading-snug text-[#fff]">
                    <Typed text={it.name} start={s[0]} revealed={revealed} />
                  </p>
                  <p className="m-0 mt-0.5 min-h-[15px] text-[10.5px] text-[#6b6b76]">
                    <Typed text={it.partNumber} start={s[1]} revealed={revealed} />
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 border-t border-[#1e1e24] pt-1">
                  {field("Qty", it.qty, s[2])}
                  {field("Unit price", it.unitPrice, s[3])}
                  {field("Manufacturer", it.manufacturer, s[4])}
                  {field("Lead time", it.leadTime, s[5])}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="flex items-center justify-between rounded-xl border border-[#1e1e24] bg-[#111114] px-3.5 py-2.5">
        <span className="text-[12px] font-semibold text-[#c8c8cc]">Estimated total</span>
        <span className="text-[12.5px] font-semibold text-[#e8e8ea]">
          <Typed text={BOM_TOTAL} start={take(BOM_TOTAL.length)} revealed={revealed} />
        </span>
      </div>
    </div>
  );
}

/* ---------- workspace (project) environment ---------- */

const TABS = [
  { label: "Requirements", Icon: ListChecks, n: null as number | null },
  { label: "BOM", Icon: Layers, n: null as number | null },
  { label: "Eng. Changes", Icon: GitBranch, n: 8 },
  { label: "Tasks", Icon: ListTodo, n: 20 },
  { label: "Modules", Icon: Boxes, n: 6 },
  { label: "Milestones", Icon: Flag, n: 4 },
  { label: "Issues", Icon: TriangleAlert, n: 16 },
];

/** The OpenPlan app sidebar, with the OpenPlan mark on top and the active section highlighted. */
export function AppSidebar({ active }: { active: number }) {
  return (
    <div className="flex w-[56px] shrink-0 flex-col items-center gap-1.5 border-r border-[#1c1c22] py-3.5">
      <div className="mb-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#2a2a31] bg-[#16161b] text-[#fff]">
        <OpenPlanLogo className="h-4 w-4" />
      </div>
      {SIDEBAR_ICONS.map((Icon, i) => (
        <div key={i} className={`flex h-9 w-9 items-center justify-center rounded-lg ${i === active ? "bg-[#1f1f25] text-[#fff]" : "text-[#6b6b76]"}`}>
          <Icon size={17} />
        </div>
      ))}
      <div className="flex-1" />
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f2f2f2] text-[#0a0a0d]">
        <OpenPlanLogo className="h-4 w-4" />
      </div>
    </div>
  );
}

/**
 * The project workspace, as in the OpenPlan app: sidebar, project bar, the module
 * tab group with progress and a primary action, then the page.
 */
export function WorkspaceShell({ tab, compact, action, children }: { tab: number; compact?: boolean; action?: string; children: ReactNode }) {
  return (
    <div className="flex h-full bg-[#0a0a0d] font-sans text-[#e8e8ea]">
      {!compact && <AppSidebar active={2} />}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-[52px] shrink-0 items-center justify-between gap-3 border-b border-[#1c1c22] px-5">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-[16px] font-semibold text-[#fff]">Autonomous Rover</span>
            <ChevronDown size={14} className="shrink-0 text-[#6b6b76]" />
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-[#a8a8ae]">
            {!compact && (
              <span className="mr-1 flex h-8 items-center gap-1.5 rounded-lg border border-[#26262c] bg-[#111114] px-3 text-[12.5px] text-[#c8c8cc]">
                <Sparkles size={13} /> Ask <span className="text-[9.5px] text-[#6b6b76]">(BETA)</span>
              </span>
            )}
            {(compact ? [Moon, Bell] : [Puzzle, Moon, Bell]).map((Icon, i, all) => (
              <div key={i} className="relative flex h-8 w-8 items-center justify-center">
                <Icon size={16} />
                {i === all.length - 1 && <span className="absolute -right-0.5 -top-0.5 rounded-full bg-[#2f5bff] px-1 text-[8.5px] font-semibold leading-[13px] text-[#fff]">12</span>}
              </div>
            ))}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={AVATARS.John} alt="" className="ml-1 h-8 w-8 rounded-full object-cover" />
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#1c1c22] px-5 py-2.5">
          <div className="flex min-w-0 items-center gap-0.5 overflow-hidden rounded-xl border border-[#1e1e24] bg-[#0f0f12] p-1">
            {TABS.map(({ label, Icon, n }, i) => {
              const on = i === tab;
              return (
                <span key={label} className={`relative flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] ${on ? "font-medium text-[#fff]" : "text-[#8b8b93]"}`}>
                  {on && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="absolute inset-0 rounded-lg bg-[#1c1c22]" />}
                  <Icon size={14} className="relative" />
                  <span className="relative">{label}</span>
                  {n !== null && <span className="relative rounded-full bg-[#1f1f25] px-1.5 text-[9.5px] font-semibold text-[#c8c8cc]">{n}</span>}
                </span>
              );
            })}
          </div>
          {!compact && action && (
            <div className="flex shrink-0 items-center gap-2">
              <span className="block h-[5px] w-[70px] overflow-hidden rounded-full bg-[#1f1f25]">
                <span className="block h-full w-[16%] rounded-full bg-[#fff]" />
              </span>
              <span className="text-[11.5px] font-semibold text-[#fff]">16%</span>
              <span className="ml-1 flex h-8 items-center gap-1.5 rounded-lg bg-[#fff] px-3 text-[12px] font-medium text-[#0a0a0d]">+ {action}</span>
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

/** Small "OpenPlan AI is working" chip shown while a page builds itself. */
export function AiChip({ label, working }: { label: string; working: boolean }) {
  return (
    <span className="inline-flex h-7 items-center gap-2 rounded-full border border-[#1e1e24] bg-[#111114] px-2.5 text-[11.5px] text-[#a8a8ae]">
      {working ? (
        <span className="flex [&_canvas]:!size-[14px]">
          <ThinkingOrb state="working" size={20} theme="dark" />
        </span>
      ) : (
        <CheckCircle2 size={13} className="text-[#7fd8a8]" />
      )}
      {label}
    </span>
  );
}

export function StatTile({ label, value, tone = "#e8e8ea", sub }: { label: string; value: ReactNode; tone?: string; sub?: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-[#1e1e24] bg-[#0d0d10] px-3.5 py-2.5">
      <p className="m-0 text-[10.5px] font-semibold uppercase tracking-wide text-[#6b6b76]">{label}</p>
      <p className="m-0 mt-1 text-[20px] font-semibold tabular-nums leading-none" style={{ color: tone }}>
        {value}
      </p>
      {sub && <p className="m-0 mt-1 truncate text-[10.5px] text-[#6b6b76]">{sub}</p>}
    </div>
  );
}
