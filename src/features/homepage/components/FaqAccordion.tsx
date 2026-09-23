"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { faq } from "../content";
import { ClmStepChips } from "./ClmStepChips";

/** Rotating header tints (tint background + chevron accent), cycled per question. */
const TINTS = [
  { bg: "bg-[#FCDCE6]", accent: "text-tone-rose" },
  { bg: "bg-[#FBEFCB]", accent: "text-[#B77A06]" },
  { bg: "bg-[#DAF0E4]", accent: "text-tone-green" },
  { bg: "bg-[#D8EEFA]", accent: "text-[#1577B0]" },
  { bg: "bg-[#E8E1FA]", accent: "text-tone-violet" },
] as const;

/** Single-open accordion; the first question starts open. Clicking the open one closes it. */
export function FaqAccordion() {
  const [open, setOpen] = useState(0);

  return (
    <div className="flex flex-col gap-2.5">
      {faq.items.map((item, i) => {
        const isOpen = open === i;
        const tint = TINTS[i % TINTS.length];
        return (
          <div
            key={item.id}
            className={cn(
              "overflow-hidden rounded-[18px] transition-[box-shadow,background-color] duration-300 ease-in-out",
              isOpen ? "bg-white shadow-[0_22px_44px_-26px_rgba(14,26,58,.45)]" : tint.bg,
            )}
          >
            <h3 className="m-0">
              <button
                type="button"
                id={`faq-q-${item.id}`}
                aria-expanded={isOpen}
                aria-controls={`faq-a-${item.id}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className={cn(
                  tint.bg,
                  "flex min-h-14 w-full cursor-pointer items-center justify-between gap-5 border-0 px-5 py-[18px] text-left text-[15.5px] leading-[1.4] font-bold text-ink",
                  "focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-brand/35",
                )}
              >
                <span>{item.question}</span>
                <span className="flex size-7 flex-none items-center justify-center rounded-full bg-white">
                  <Icon
                    name="chevronDown"
                    size={13}
                    strokeWidth={2.8}
                    className={cn(tint.accent, "transition-transform duration-300 ease-in-out", isOpen && "rotate-180")}
                  />
                </span>
              </button>
            </h3>
            <div
              id={`faq-a-${item.id}`}
              role="region"
              aria-labelledby={`faq-q-${item.id}`}
              hidden={!isOpen}
              className="animate-fade-up px-5 pt-4 pb-5"
            >
              <p className="text-body leading-[1.7] text-ink-soft">{item.answer}</p>
              {item.showSteps ? <ClmStepChips size="sm" className="mt-3.5 gap-2" /> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
