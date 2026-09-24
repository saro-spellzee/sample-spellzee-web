"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { book } from "../../content";

/** The three booking steps; tapping one highlights it (the last is highlighted to start). */
export function BookSteps() {
  const [active, setActive] = useState(book.initialStep);
  return (
    <ul aria-label={book.stepsLabel} className="mt-9 grid grid-cols-1 gap-3 md:grid-cols-3">
      {book.steps.map((step, i) => {
        const on = i === active;
        return (
          <li key={step.n} className="flex">
            <button
              type="button"
              aria-pressed={on}
              onClick={() => setActive(i)}
              className={cn(
                "relative flex w-full cursor-pointer items-start gap-3.5 rounded-[20px] border border-white px-[18px] py-4 text-left backdrop-blur-[10px] transition-all duration-300 ease-in-out hover:-translate-y-0.5",
                "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35",
                on
                  ? "bg-ink text-white shadow-[0_20px_40px_-24px_rgba(14,26,58,.7)]"
                  : "bg-white/75 text-ink shadow-[0_0_0_1px_rgba(150,120,90,.12),0_14px_28px_-22px_rgba(70,45,20,.45)]",
              )}
            >
              <span
                className={cn(
                  "flex size-[34px] flex-none items-center justify-center rounded-full text-[14px] font-extrabold",
                  on ? "bg-linear-135 from-spectrum-blue to-spectrum-violet text-white" : "bg-fog text-ink",
                )}
              >
                {step.n}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <span className="pr-20 text-[15.5px] font-extrabold sm:pr-0">{step.title}</span>
                <span className={cn("text-meta leading-[1.5]", on ? "text-mist" : "text-muted")}>{step.description}</span>
              </span>
              <span
                className={cn(
                  "absolute top-3.5 right-3.5 flex-none rounded-full px-[9px] py-[3px] text-[11px] font-extrabold sm:static",
                  on ? "bg-white/12 text-haze" : "bg-[#F3EEE6] text-faint",
                )}
              >
                {step.time}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
