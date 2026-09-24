"use client";

import { Fragment, useState } from "react";
import { cn } from "@/lib/cn";
import { classroom } from "../../content/classroom";
import { tool } from "./styles";

const slotBase =
  "flex h-[60px] items-center justify-center rounded-[14px] border-[1.5px] text-[22px] font-extrabold";
const slotStates = {
  empty: "w-16 border-dashed border-[#C9D3E6] bg-white text-ink",
  filled: "w-16 border-solid border-brand bg-brand-tint text-brand",
  result: "w-24 border-dashed border-[#C9D3E6] bg-white text-ink",
  correct: "w-24 border-solid border-tone-green bg-success-soft text-tone-green-deep",
  wrong: "w-24 animate-shake border-solid border-tone-rose bg-error-soft text-tone-rose-deep",
} as const;

/** "Blend Sounds": tap the three sounds in order to build the word; wrong orders shake. */
export function BlendGame() {
  const { blend } = classroom;
  const [wordIndex, setWordIndex] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);

  const word = blend.words[wordIndex];
  const done = picked.length === 3;
  const correct = done && picked.every((p, k) => p === k);
  const message = !done
    ? blend.prompt.replace("{word}", word.word)
    : correct
      ? blend.success.replace("{word}", word.word)
      : blend.retry;

  const tap = (part: number) => {
    if (!picked.includes(part) && picked.length < 3) setPicked([...picked, part]);
  };

  return (
    <div className={tool.body}>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {[0, 1, 2].map((k) => (
          <Fragment key={k}>
            <span className={cn(slotBase, picked[k] !== undefined ? slotStates.filled : slotStates.empty)}>
              {picked[k] !== undefined ? word.parts[picked[k]] : blend.empty}
            </span>
            <span aria-hidden="true" className="font-extrabold text-faint">
              {k < 2 ? "+" : "="}
            </span>
          </Fragment>
        ))}
        <span className={cn(slotBase, done ? (correct ? slotStates.correct : slotStates.wrong) : slotStates.result)}>
          {done ? (correct ? word.word : blend.wrong) : blend.empty}
        </span>
      </div>
      <div className="mt-5 flex justify-center gap-2.5">
        {word.shown.map((part) => {
          const used = picked.includes(part);
          return (
            <button
              key={`${word.word}-${part}`}
              type="button"
              onClick={() => tap(part)}
              aria-disabled={used}
              aria-label={blend.soundLabel.replace("{sound}", word.parts[part])}
              className={cn(
                "h-[52px] min-w-[60px] rounded-[14px] px-3.5 text-[20px] font-extrabold transition-all duration-200 ease-in-out",
                "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35",
                used
                  ? "cursor-default bg-rule text-[#8A95B3]"
                  : "cursor-pointer bg-brand text-white shadow-[0_8px_18px_-10px_rgba(21,87,214,.9)] hover:-translate-y-0.5",
              )}
            >
              {word.parts[part]}
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className={`${tool.message} text-ink-soft`}>
        {message}
      </p>
      <div className={tool.controls}>
        <button type="button" onClick={() => setPicked([])} className={tool.seg}>
          {blend.reset}
        </button>
        <button
          type="button"
          onClick={() => {
            setWordIndex((i) => (i + 1) % blend.words.length);
            setPicked([]);
          }}
          className={tool.seg}
        >
          {blend.next}
        </button>
      </div>
    </div>
  );
}
