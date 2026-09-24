"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { tones } from "@/components/ui/tones";
import { cn } from "@/lib/cn";
import { classroom } from "../../content/classroom";
import { tool } from "./styles";

const face =
  "absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-[20px] border border-line bg-white shadow-[0_20px_40px_-26px_rgba(14,26,58,.5)] [backface-visibility:hidden]";

/** "Flashcards": a 3D card that flips to show how to say the sound; step through the deck. */
export function FlashcardDeck() {
  const { flashcards } = classroom;
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = flashcards.deck[index];
  const count = flashcards.deck.length;
  const go = (step: number) => {
    setIndex((i) => (i + step + count) % count);
    setFlipped(false);
  };

  return (
    <div className={tool.body}>
      <div className={cn(tones[card.tone], "relative mx-auto h-40 w-[250px]")}>
        <span aria-hidden="true" className="absolute inset-0 rounded-[20px] border border-line bg-white [transform:rotate(-6deg)_translate(-8px,4px)]" />
        <span aria-hidden="true" className="absolute inset-0 rounded-[20px] border border-line bg-white [transform:rotate(5deg)_translate(8px,2px)]" />
        {/* The button's name is whichever face is showing. */}
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="relative block size-full cursor-pointer border-0 bg-transparent p-0 [perspective:1000px] focus-visible:rounded-[20px] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35"
        >
          <span
            className={cn(
              "relative block size-full transition-transform duration-600 ease-[cubic-bezier(.3,.7,.2,1)] [transform-style:preserve-3d]",
              flipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]",
            )}
          >
            <span aria-hidden={flipped} className={face}>
              <span className="text-[64px] leading-none font-extrabold tracking-[-.02em] text-(--tone)">{card.grapheme}</span>
              <span className="text-[12px] font-bold tracking-[.06em] text-subtle uppercase">{flashcards.tap}</span>
            </span>
            <span aria-hidden={!flipped} className={cn(face, "[transform:rotateY(180deg)]")}>
              <span className="text-[15px] font-extrabold text-(--tone)">{flashcards.say.replace("{grapheme}", card.grapheme)}</span>
              <span className="text-[20px] font-bold text-ink">{card.words}</span>
            </span>
          </span>
        </button>
      </div>
      <div className={tool.controls}>
        <button type="button" onClick={() => go(-1)} aria-label={flashcards.previous} className={tool.seg}>
          <Icon name="arrowLeft" size={14} strokeWidth={2.4} />
        </button>
        <span className="min-w-12 text-center text-meta font-bold text-faint">
          {flashcards.counter.replace("{n}", String(index + 1)).replace("{total}", String(count))}
        </span>
        <button type="button" onClick={() => go(1)} aria-label={flashcards.next} className={tool.seg}>
          <Icon name="arrowRight" size={14} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
