"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { tones } from "@/components/ui/tones";
import { cn } from "@/lib/cn";
import { classroom } from "../../content/classroom";
import type { LearningTool } from "../../types";
import { BlendGame } from "./BlendGame";
import { DecodableReader } from "./DecodableReader";
import { FlashcardDeck } from "./FlashcardDeck";
import { WeeklyAssignments } from "./WeeklyAssignments";
import { studioCard } from "./styles";
import { Worksheet } from "./Worksheet";

const panels: Record<LearningTool["id"], ReactNode> = {
  blend: <BlendGame />,
  flashcards: <FlashcardDeck />,
  worksheet: <Worksheet />,
  reader: <DecodableReader />,
  progress: <WeeklyAssignments />,
};

const tab =
  "flex min-h-[74px] cursor-pointer flex-col items-center justify-center gap-[7px] rounded-2xl border border-white/95 px-1.5 py-3 text-center text-[11.5px] leading-[1.2] font-bold backdrop-blur-[10px] transition-all duration-250 ease-in-out " +
  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35";
const tabOff =
  "bg-white/72 text-slate shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(150,120,90,.10),0_12px_26px_-18px_rgba(70,45,20,.38)] " +
  "hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_#fff,0_0_0_1px_var(--tone),0_16px_30px_-18px_rgba(70,45,20,.45)]";
const tabOn =
  "bg-[linear-gradient(180deg,rgba(255,255,255,.95),var(--tone-soft))] text-ink shadow-[inset_0_1px_0_#fff,0_0_0_1.5px_var(--tone),0_18px_34px_-18px_var(--tone)]";

/**
 * "Try the Learning Tools": five tabs over one stage. Every tool stays mounted (hidden when
 * inactive) so a half-done worksheet survives switching away, as in the export.
 */
export function LearningTools() {
  const { tools } = classroom;
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = tools.items.length;
  const current = tools.items[active];

  const onKeyDown = (e: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, Home: -active, End: count - 1 - active };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = (active + keys[e.key] + count) % count;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const stages = current.from === 1 && current.to === 5 ? tools.allStages : tools.stageRange.replace("{from}", String(current.from)).replace("{to}", String(current.to));

  return (
    <div className={cn(studioCard, "p-[26px]")}>
      <div className="flex flex-wrap items-baseline justify-between gap-2.5">
        <h3 className="m-0 text-[20px] font-extrabold">{tools.title}</h3>
        <span className="text-fine font-bold tracking-[.02em] text-subtle">
          {tools.counter.replace("{n}", String(active + 1)).replace("{total}", String(count))}
        </span>
      </div>

      <div
        role="tablist"
        aria-label={tools.label}
        onKeyDown={onKeyDown}
        className="mt-4 grid grid-cols-3 gap-2 rounded-[20px] bg-[rgba(243,238,230,.6)] p-1.5 shadow-[inset_0_1px_2px_rgba(70,45,20,.06)] sm:grid-cols-5"
      >
        {tools.items.map((t, i) => {
          const on = i === active;
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`tool-tab-${t.id}`}
              aria-selected={on}
              aria-controls={`tool-panel-${t.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              className={cn(tones[t.tone], tab, on ? tabOn : tabOff)}
            >
              <span className={cn("flex size-7 items-center justify-center rounded-[9px] transition-all duration-250", on ? "bg-(--tone) text-white" : "bg-(--tone-soft) text-(--tone)")}>
                <Icon name={t.icon} size={15} />
              </span>
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        className={cn(
          tones[current.tone],
          "tool-stage mt-[18px] flex min-h-[360px] flex-1 flex-col justify-center rounded-[20px] border border-white/90 p-[22px] shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(150,120,90,.10)]",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <span className="rounded-full bg-(--tone-soft) px-[11px] py-[5px] text-[12px] font-extrabold text-(--tone)">{current.kind}</span>
          <span className="text-fine font-semibold text-faint">{current.hint}</span>
        </div>
        {tools.items.map((t, i) => (
          <div
            key={t.id}
            role="tabpanel"
            id={`tool-panel-${t.id}`}
            aria-labelledby={`tool-tab-${t.id}`}
            hidden={i !== active}
            className="flex flex-1 flex-col"
          >
            {panels[t.id]}
          </div>
        ))}
      </div>

      <div className={cn(tones[current.tone], "mt-4 flex items-center gap-3 text-[12px] font-bold text-faint")}>
        <span className="text-[10.5px] font-extrabold tracking-[.14em] text-subtle uppercase">{tools.suits}</span>
        <span aria-hidden="true" className="grid flex-1 grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => {
            const on = n >= current.from && n <= current.to;
            return (
              <span key={n} className="flex flex-col items-center gap-[5px]">
                <i className={cn("block h-1.5 w-full rounded-md transition-[background-color,box-shadow] duration-350", on ? "bg-(--tone) shadow-[0_4px_10px_-4px_var(--tone)]" : "bg-[#EDE7DD]")} />
                <em className={cn("text-[10.5px] font-bold not-italic transition-colors duration-350", on ? "text-(--tone)" : "text-quiet")}>{n}</em>
              </span>
            );
          })}
        </span>
        <span className="min-w-[84px] text-right font-extrabold text-(--tone)">{stages}</span>
      </div>
    </div>
  );
}
