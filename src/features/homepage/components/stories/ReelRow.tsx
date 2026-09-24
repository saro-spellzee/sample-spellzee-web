"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { stories } from "../../content/stories";
import { prefersReducedMotion } from "../../hooks/canvas";
import type { Reel } from "../../types";
import { reelGradients } from "./reelGradients";
import { VideoDialog } from "./VideoDialog";

const scrollBehavior = (): ScrollBehavior => (prefersReducedMotion() ? "auto" : "smooth");

const playLabel = (reel: Reel) => stories.playLabel.replace("{kind}", reel.kind).replace("{quote}", reel.quote).replace("{tag}", reel.tag);

/** Whether the element has keyboard focus (a tap or click doesn't count). Engines without `:focus-visible` say no. */
function hasKeyboardFocus(el: Element): boolean {
  try {
    return el.matches(":focus-visible");
  } catch {
    return false;
  }
}

const arrow =
  "flex size-[46px] cursor-pointer items-center justify-center rounded-full border border-white bg-white/80 text-ink backdrop-blur-[8px] transition-all duration-250 ease-in-out " +
  "shadow-[0_0_0_1px_rgba(150,120,90,.12),0_12px_24px_-16px_rgba(70,45,20,.45)] hover:-translate-y-0.5 hover:text-brand hover:shadow-[0_0_0_1px_var(--color-brand),0_14px_26px_-14px_rgba(21,87,214,.5)] " +
  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35";

export type ReelRowProps = {
  /** The call to action under the row, rendered on the server. */
  cta: ReactNode;
};

/**
 * Story reels: a snap-scrolling row (5 across on desktop, 3 on tablets, ~1.6 on phones)
 * with previous/next arrows; each reel opens the video dialog. `cta` is the server-rendered
 * booking prompt shown beside the arrows.
 */
export function ReelRow({ cta }: ReelRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState<Reel | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  const scroll = (direction: 1 | -1) => {
    const row = rowRef.current;
    if (row) row.scrollBy({ left: direction * row.clientWidth * 0.8, behavior: scrollBehavior() });
  };
  // Tabbing onto a reel that's partly outside the row: the browser's own scroll lands between
  // snap points and the mandatory snap pulls the row back, leaving the reel cut off. Align it
  // to the row's start, which is a snap point, so it stays fully in view.
  const reveal = (reel: HTMLElement) => {
    const row = rowRef.current;
    if (!row || !hasKeyboardFocus(reel)) return;
    const box = row.getBoundingClientRect();
    const r = reel.getBoundingClientRect();
    if (r.left >= box.left - 1 && r.right <= box.right + 1) return;
    reel.scrollIntoView?.({ block: "nearest", inline: "start", behavior: scrollBehavior() });
  };
  const close = () => setPlaying(null);
  // Focus goes back to the reel once the dialog has closed (VideoDialog's effect runs first). While
  // the modal is open the page behind it is inert and can't take focus, and Safari, which doesn't
  // focus a tapped button, has nothing of its own to restore.
  useEffect(() => {
    if (!playing) opener.current?.focus();
  }, [playing]);

  return (
    <>
      <div
        ref={rowRef}
        className="mt-10 grid snap-x snap-mandatory auto-cols-[62%] grid-flow-col gap-[18px] overflow-x-auto px-0.5 pt-1.5 pb-[18px] [scrollbar-width:none] sm:auto-cols-[calc((100%-36px)/3)] lg:auto-cols-[calc((100%-72px)/5)] [&::-webkit-scrollbar]:hidden"
      >
        {stories.reels.map((reel) => (
          <button
            key={reel.id}
            type="button"
            aria-label={playLabel(reel)}
            onClick={(e) => {
              opener.current = e.currentTarget;
              setPlaying(reel);
            }}
            onFocus={(e) => reveal(e.currentTarget)}
            className={cn(
              reelGradients[reel.gradient],
              "group relative aspect-[9/16] cursor-pointer snap-start overflow-hidden rounded-[24px] border-0 bg-linear-160 from-(--c) to-(--c2) p-0 text-left text-white",
              "shadow-[0_26px_50px_-30px_rgba(14,26,58,.55)] transition-[translate,box-shadow] duration-350 ease-[cubic-bezier(.3,1.2,.5,1)]",
              "hover:-translate-y-1.5 hover:shadow-[0_34px_60px_-30px_rgba(14,26,58,.65)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35",
            )}
          >
            <span className="relative block size-full">
              <span aria-hidden="true" className="reel-texture absolute inset-0" />
              <span className="absolute top-3.5 left-3.5 rounded-full bg-white/20 px-[11px] py-[5px] text-[11.5px] font-extrabold tracking-[.02em] backdrop-blur-[8px]">
                {reel.kind}
              </span>
              {/* The spaces between the text pieces lay out as nothing (they sit between positioned and
                  flex items), but keep the words apart in the text tools read, such as axe's
                  label-in-name check against the aria-label. */}{" "}
              <span
                aria-hidden="true"
                className="absolute top-[44%] left-1/2 flex size-[58px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-(--c) shadow-[0_0_0_8px_rgba(255,255,255,.18)] transition-[scale,box-shadow] duration-300 ease-in-out group-hover:scale-110 group-hover:shadow-[0_0_0_12px_rgba(255,255,255,.22)]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5.5v13l11-6.5z" />
                </svg>
              </span>
              <span className="absolute inset-x-4 bottom-4 flex flex-col gap-1.5">
                <span className="font-serif text-[21px] leading-[1.2] font-normal italic">{reel.quote}</span>{" "}
                <span className="text-[12px] font-bold opacity-85">{reel.tag}</span>
              </span>
            </span>
          </button>
        ))}
      </div>
      <div className="mt-[18px] flex flex-wrap items-center justify-between gap-3.5 sm:flex-nowrap">
        {cta}
        <div className="flex gap-2.5">
          <button type="button" aria-label={stories.previous} onClick={() => scroll(-1)} className={arrow}>
            <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
          </button>
          <button type="button" aria-label={stories.next} onClick={() => scroll(1)} className={arrow}>
            <Icon name="arrowRight" size={16} strokeWidth={2.4} />
          </button>
        </div>
      </div>
      <VideoDialog reel={playing} onClose={close} />
    </>
  );
}
