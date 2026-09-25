"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { classroom } from "../../content/classroom";
import { tool } from "./styles";

const blankAnswers = [-1, -1, -1];

const option = {
  base: "size-[38px] rounded-[10px] border-[1.5px] text-[16px] font-extrabold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35",
  open: "cursor-pointer border-line bg-white text-ink hover:border-tone-amber",
  right: "border-tone-green bg-success-soft text-tone-green-deep",
  wrong: "border-tone-rose bg-error-soft text-tone-rose-deep",
  dim: "cursor-default border-line bg-white text-ink opacity-40",
} as const;

/**
 * "Worksheet": pick the missing vowel in three words; each row locks once answered. Rows show
 * right and wrong by colour, so each pick is also read out ("Right, cat." / "Not quite, it's dog.").
 */
export function Worksheet() {
  const { worksheet } = classroom;
  const [set, setSet] = useState(0);
  const [answers, setAnswers] = useState<number[]>(blankAnswers);
  /** The row answered last, for the spoken feedback; -1 before any pick on this sheet. */
  const [lastRow, setLastRow] = useState(-1);
  const questions = worksheet.sets[set % worksheet.sets.length];
  const score = questions.filter((q, i) => answers[i] === q.answer).length;
  const answered = answers.filter((a) => a >= 0).length;
  const last = lastRow >= 0 ? questions[lastRow] : null;
  const feedback = last
    ? (answers[lastRow] === last.answer ? worksheet.feedback.right : worksheet.feedback.wrong).replace(
        "{word}",
        `${last.before}${last.options[last.answer]}${last.after}`,
      )
    : "";

  const pick = (row: number, choice: number) => {
    if (answers[row] >= 0) return;
    setAnswers(answers.map((a, i) => (i === row ? choice : a)));
    setLastRow(row);
  };

  return (
    <div className={tool.body}>
      <div className={cn(tool.sheet, "ruled-paper shadow-[0_14px_30px_-24px_rgba(14,26,58,.4)]")}>
        <div className={tool.sheetTop}>
          <span>{worksheet.title}</span>
          <span aria-live="polite">{worksheet.score.replace("{n}", String(score))}</span>
        </div>
        <span aria-live="polite" className="sr-only">
          {feedback}
        </span>
        {questions.map((q, row) => {
          const choice = answers[row];
          const done = choice >= 0;
          const good = done && choice === q.answer;
          return (
            <div key={`${set}-${row}`} className="mt-2.5 flex flex-wrap items-center gap-3 lg:flex-nowrap">
              <span className="flex size-[22px] flex-none items-center justify-center rounded-full bg-tone-amber-soft text-[12px] font-extrabold text-tone-amber-deep">{row + 1}</span>
              <span className="min-w-[92px] text-[24px] font-extrabold tracking-[.06em] text-ink">
                {q.before}
                <span
                  className={cn(
                    "mx-0.5 inline-block min-w-[26px] border-b-[2.5px] text-center",
                    !done ? "border-tone-amber text-tone-amber" : good ? "border-tone-green text-tone-green-deep" : "border-tone-rose text-tone-rose-deep",
                  )}
                >
                  {done ? q.options[choice] : worksheet.blank}
                </span>
                {q.after}
              </span>
              <span role="group" aria-label={`${q.before}${worksheet.blank}${q.after}`} className="flex gap-1.5 lg:ml-auto">
                {q.options.map((letter, i) => (
                  <button
                    key={letter}
                    type="button"
                    aria-disabled={done}
                    onClick={() => pick(row, i)}
                    className={cn(option.base, !done ? option.open : i === q.answer ? option.right : i === choice ? option.wrong : option.dim)}
                  >
                    {letter}
                  </button>
                ))}
              </span>
            </div>
          );
        })}
        <div className={cn(tool.bar, "mt-3.5")}>
          <span
            className="block h-full rounded-md bg-linear-90 from-marigold to-tone-green transition-[width] duration-500 ease-in-out"
            style={{ width: `${Math.round((answered / 3) * 100)}%` }}
          />
        </div>
      </div>
      <div className={tool.controls}>
        <button
          type="button"
          onClick={() => {
            setSet((s) => s + 1);
            setAnswers(blankAnswers);
            setLastRow(-1);
          }}
          className={tool.seg}
        >
          {worksheet.reset}
        </button>
      </div>
    </div>
  );
}
