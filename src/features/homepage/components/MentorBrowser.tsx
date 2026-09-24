"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { tones, type Tone } from "@/components/ui/tones";
import { cn } from "@/lib/cn";
import { educators } from "../content";
import { MentorCard } from "./MentorCard";

const toneOf = (programme: string): Tone => educators.filters.find((f) => f.id === programme)?.tone ?? "ink";

const filterButton =
  "inline-flex min-h-10 flex-none cursor-pointer items-center gap-2 rounded-full border border-white/95 py-0 pr-4 pl-3 text-[13.5px] font-bold backdrop-blur-[8px] transition-all duration-250 ease-in-out " +
  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35";

/**
 * Programme filter tabs over the mentor cards. On phones both the filters and the cards
 * scroll sideways (snap), as in the export.
 */
export function MentorBrowser() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const filters = educators.filters;
  const current = filters[active];
  const mentors = educators.mentors.filter((m) => current.id === "all" || m.programme === current.id);

  const onKeyDown = (e: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, Home: -active, End: filters.length - 1 - active };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = (active + keys[e.key] + filters.length) % filters.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <>
      <div className="mt-[34px] flex flex-wrap items-center justify-between gap-3.5">
        <div
          role="tablist"
          aria-label={educators.filtersLabel}
          onKeyDown={onKeyDown}
          className="-mr-[18px] flex flex-nowrap gap-2 overflow-x-auto pr-[18px] [scrollbar-width:none] sm:mr-0 sm:flex-wrap sm:overflow-visible sm:pr-0 [&::-webkit-scrollbar]:hidden"
        >
          {filters.map((f, i) => {
            const on = i === active;
            return (
              <button
                key={f.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`mentor-tab-${f.id}`}
                aria-selected={on}
                aria-controls="mentor-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => setActive(i)}
                className={cn(
                  tones[f.tone],
                  filterButton,
                  on
                    ? "bg-(--tone) text-white shadow-[0_12px_24px_-14px_var(--tone)]"
                    : "bg-white/75 text-slate shadow-[0_0_0_1px_rgba(150,120,90,.12),0_8px_18px_-14px_rgba(70,45,20,.4)] hover:text-ink hover:shadow-[0_0_0_1px_var(--tone),0_10px_20px_-14px_rgba(70,45,20,.45)]",
                )}
              >
                <span aria-hidden="true" className={cn("size-2 rounded-full", on ? "bg-white" : "bg-(--tone) opacity-55")} />
                {f.label}
              </button>
            );
          })}
        </div>
        <span className="text-meta font-semibold text-faint">
          {educators.count.before}
          <b className="font-extrabold text-ink">{mentors.length}</b>
          {educators.count.middle}
          <b className="font-extrabold text-ink">{educators.count.total}</b>
          {educators.count.after}
        </span>
      </div>
      <div
        key={current.id}
        id="mentor-panel"
        role="tabpanel"
        aria-labelledby={`mentor-tab-${current.id}`}
        className={cn(
          "mt-[22px] grid gap-3.5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4",
          // Phones: bleeds to the screen edge (the export pulls it 20px out of an 18px gutter; 18 keeps it on screen).
          "-mr-[18px] auto-cols-[80%] grid-flow-col snap-x snap-mandatory overflow-x-auto pt-1 pr-[18px] pb-3 pl-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "sm:mr-0 sm:auto-cols-auto sm:grid-flow-row sm:overflow-visible sm:p-0",
        )}
      >
        {mentors.map((mentor) => (
          <MentorCard key={mentor.id} mentor={mentor} tone={toneOf(mentor.programme)} />
        ))}
      </div>
    </>
  );
}
