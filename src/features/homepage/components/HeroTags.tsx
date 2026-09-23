"use client";

import { useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { hero } from "../content";
import type { HeroTag } from "../types";
import { Pulse } from "./Pulse";

const dotColors: Record<HeroTag["dot"], string> = {
  blue: "bg-vivid-blue text-vivid-blue",
  amber: "bg-vivid-amber text-vivid-amber",
  violet: "bg-vivid-violet text-vivid-violet",
  cyan: "bg-vivid-cyan text-vivid-cyan",
};

/**
 * Floating skill tags over the hero photo, each with a tooltip. The tooltip shows on
 * hover, keyboard focus or click (toggle), stays open while the pointer is over it,
 * and Escape dismisses it (WCAG 1.4.13).
 */
export function HeroTags() {
  const [open, setOpen] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);

  const onKeyDown = (id: string) => (e: KeyboardEvent) => {
    if (e.key !== "Escape") return;
    setOpen(null);
    setDismissed(id);
  };
  const reset = (id: string) => () => {
    if (dismissed === id) setDismissed(null);
    if (open === id) setOpen(null);
  };

  return (
    <div className="hero-art z-3 max-sm:hidden">
      {hero.tags.map((tag) => {
        const isOpen = open === tag.id;
        const isDismissed = dismissed === tag.id;
        return (
          <div
            key={tag.id}
            onMouseLeave={reset(tag.id)}
            className="group absolute z-3 animate-floaty-fast [transform:translate(-50%,-50%)] hover:[animation-play-state:paused] has-focus-visible:[animation-play-state:paused]"
            style={{ left: tag.x, top: tag.y }}
          >
            <button
              type="button"
              aria-describedby={`hero-tip-${tag.id}`}
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : tag.id)}
              onKeyDown={onKeyDown(tag.id)}
              onBlur={reset(tag.id)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white bg-white/85 py-2 pr-3.5 pl-[11px] text-meta font-bold whitespace-nowrap text-ink shadow-[0_10px_30px_-14px_rgba(14,26,58,.35)] backdrop-blur-[10px] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35"
            >
              <Pulse className={dotColors[tag.dot]} />
              {tag.label}
            </button>
            <span
              id={`hero-tip-${tag.id}`}
              role="tooltip"
              className={cn(
                // The ::before bridges the 10px gap so the pointer can move onto the tooltip.
                "pointer-events-none absolute top-[calc(100%+10px)] left-1/2 w-[210px] -translate-x-1/2 -translate-y-1 rounded-[14px] bg-ink px-3.5 py-3 text-left text-fine leading-[1.5] text-[#E4E8F5] opacity-0 transition-all duration-250 ease-in-out",
                "before:absolute before:inset-x-0 before:-top-2.5 before:h-2.5 before:content-['']",
                !isDismissed &&
                  "group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-has-focus-visible:translate-y-0 group-has-focus-visible:opacity-100",
                isOpen && !isDismissed && "pointer-events-auto translate-y-0 opacity-100",
              )}
            >
              {tag.tip}
            </span>
          </div>
        );
      })}
    </div>
  );
}
