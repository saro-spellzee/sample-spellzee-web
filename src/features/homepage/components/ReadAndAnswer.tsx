"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { classroom } from "../content";

const option = {
  base:
    "min-h-[46px] cursor-pointer rounded-[14px] border-[1.5px] px-[18px] text-body font-semibold " +
    "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35",
  idle: "border-rule bg-white text-ink hover:border-brand",
  good: "border-tone-green bg-success-soft text-tone-green-deep",
  bad: "border-tone-rose bg-error-soft text-tone-rose-deep",
} as const;

/** Short passage + multiple-choice question with instant feedback. */
export function ReadAndAnswer() {
  const { read } = classroom;
  const [pick, setPick] = useState(-1);
  const isRight = pick === read.correctIndex;

  return (
    <div className="mt-[18px] animate-fade-up">
      <p className="text-[16px] leading-[1.65] text-ink">{read.passage}</p>
      <div id="read-question" className="mt-3.5 text-[15px] font-extrabold">
        {read.question}
      </div>
      <div role="group" aria-labelledby="read-question" className="mt-3 flex flex-wrap gap-2">
        {read.options.map((label, i) => (
          <button
            key={label}
            type="button"
            aria-pressed={pick === i}
            onClick={() => setPick(i)}
            className={cn(option.base, pick !== i ? option.idle : i === read.correctIndex ? option.good : option.bad)}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        aria-live="polite"
        className={cn("mt-3 min-h-5 text-[14px] font-bold", isRight ? "text-tone-green-deep" : "text-tone-rose-deep")}
      >
        {pick < 0 ? "" : isRight ? read.right : read.wrong}
      </div>
    </div>
  );
}
