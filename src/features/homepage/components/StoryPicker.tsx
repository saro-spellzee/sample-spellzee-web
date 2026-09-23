"use client";

import { useState } from "react";
import { tones } from "@/components/ui/tones";
import { cn } from "@/lib/cn";
import { stories } from "../content";

/** Featured parent quote (navy card) driven by the list of stories on the right. */
export function StoryPicker() {
  const [active, setActive] = useState(0);
  const story = stories.items[active];

  return (
    <div className="mt-10 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
      <div className="flex min-h-[340px] animate-fade-up flex-col justify-between rounded-[26px] bg-ink p-11 text-white">
        <svg width="44" height="34" viewBox="0 0 56 44" fill="#7C9BFF" aria-hidden="true">
          <path d="M0 44V26C0 11 8 2 22 0l2 6C15 9 11 15 11 22h11v22zm32 0V26C32 11 40 2 54 0l2 6c-9 3-13 9-13 16h11v22z" />
        </svg>
        <p aria-live="polite" className="mt-6 font-serif text-[42px] leading-[1.15] font-normal tracking-[-0.01em] italic">
          {story.quote}
        </p>
        <div className="mt-7 flex items-center gap-3.5">
          {/* TODO(product): wire to the parent story video once it exists. */}
          <button
            type="button"
            aria-label={stories.playLabel}
            className="flex size-[54px] cursor-pointer items-center justify-center rounded-full border-0 bg-white focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white/60"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0E1A3A" aria-hidden="true">
              <path d="M7 4l14 8-14 8z" />
            </svg>
          </button>
          <div>
            <div className="font-extrabold">{stories.storyLabel}</div>
            <div className="text-[14px] text-mist">{story.programme}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {stories.items.map((item, i) => {
          const on = i === active;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={on}
              onClick={() => setActive(i)}
              className={cn(
                tones[item.tone],
                "flex w-full cursor-pointer items-center gap-4 rounded-[22px] border-[1.5px] bg-white px-[22px] py-[18px] text-left text-ink transition-all duration-250 ease-in-out",
                "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35",
                on ? "border-brand shadow-[0_20px_44px_-26px_rgba(21,87,214,.7)]" : "border-line hover:border-[#A9C0F2]",
              )}
            >
              <span
                aria-hidden="true"
                className="flex size-10 flex-none items-center justify-center rounded-[12px] bg-(--tone-soft) font-serif text-[30px] text-(--tone)"
              >
                “
              </span>
              <span className="flex-1">
                <span className="block text-[16.5px] font-bold">{item.quote}</span>
                <span className="mt-[3px] block text-meta text-faint">{item.programme}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
