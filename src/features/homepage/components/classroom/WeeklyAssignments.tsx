"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { classroom } from "../../content/classroom";
import { tool } from "./styles";

/** "Progress": tick off this week's assignments; the bar and message follow. */
export function WeeklyAssignments() {
  const { progress } = classroom;
  const [done, setDone] = useState<boolean[]>(progress.initial);
  const pct = Math.round((done.filter(Boolean).length / progress.items.length) * 100);
  const complete = pct === 100;

  return (
    <div className={tool.body}>
      <div className={tool.sheet}>
        <div className={tool.sheetTop}>
          <span>{progress.title}</span>
          <span>{pct}%</span>
        </div>
        <div className={cn(tool.bar, "mt-2.5 mb-3.5")}>
          <span
            className="block h-full rounded-md bg-linear-90 from-tone-emerald to-brand transition-[width] duration-500 ease-in-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        {progress.items.map((item, i) => {
          const on = done[i];
          return (
            <button
              key={item.title}
              type="button"
              aria-pressed={on}
              onClick={() => setDone(done.map((d, k) => (k === i ? !d : d)))}
              className="flex w-full cursor-pointer items-center gap-3 border-0 border-t border-chip bg-transparent px-1 py-2.5 text-[14px] font-semibold text-ink-2 focus-visible:outline-3 focus-visible:outline-brand/35"
            >
              <span
                className={cn(
                  "flex size-[22px] flex-none items-center justify-center rounded-[7px] border-2 text-white transition-all duration-200",
                  on ? "border-tone-green bg-tone-green" : "border-rule [&>svg]:opacity-0",
                )}
              >
                <Icon name="check" size={12} strokeWidth={3.4} />
              </span>
              <span className={cn("flex-1 text-left", on && "text-subtle line-through")}>{item.title}</span>
              <span className="rounded-full bg-tone-violet-soft px-[9px] py-[3px] text-[11.5px] font-extrabold text-tone-violet-deep">{item.tag}</span>
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className={cn(tool.message, complete ? "text-tone-green-deep" : "text-faint")}>
        {complete ? progress.allDone : progress.pending}
      </p>
    </div>
  );
}
