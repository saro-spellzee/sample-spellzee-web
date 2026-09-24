"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { tones } from "@/components/ui/tones";
import { cn } from "@/lib/cn";
import { faq } from "../content";

export type FaqAccordionProps = {
  /** Each question's answer, rendered on the server (text plus its designed extra), in `faq.items` order. */
  panels: ReactNode[];
};

/** Single-open accordion; the first question starts open. Clicking the open one closes it. */
export function FaqAccordion({ panels }: FaqAccordionProps) {
  const [open, setOpen] = useState(0);

  return (
    <div className="flex flex-col gap-2.5">
      {faq.items.map((item, i) => {
        const isOpen = open === i;
        const accent = faq.accents[i % faq.accents.length];
        return (
          <div
            key={item.id}
            className={cn(
              tones[accent],
              "overflow-hidden rounded-[18px] border border-white/95 backdrop-blur-[10px] transition-[box-shadow,background-color] duration-300 ease-in-out",
              isOpen
                ? "bg-white shadow-[0_0_0_1px_color-mix(in_srgb,var(--tone)_20%,transparent),0_22px_44px_-26px_rgba(14,26,58,.45)]"
                : "bg-white/72 shadow-[0_0_0_1px_rgba(150,120,90,.12)]",
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
                  "flex min-h-14 w-full cursor-pointer items-center justify-between gap-5 border-0 bg-transparent p-4 text-left text-[15px] leading-[1.4] font-bold text-ink hover:text-brand sm:px-5 sm:py-[18px] sm:text-[15.5px]",
                  "focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-brand/35",
                )}
              >
                <span className="flex items-center gap-3">
                  <span aria-hidden="true" className="size-2 flex-none rounded-full bg-(--tone)" />
                  <span>{item.question}</span>
                </span>
                <span className="flex size-7 flex-none items-center justify-center rounded-full bg-white">
                  <Icon
                    name="chevronDown"
                    size={13}
                    strokeWidth={2.8}
                    className={cn("text-(--tone) transition-transform duration-300 ease-in-out", isOpen && "rotate-180")}
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
              {panels[i]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
