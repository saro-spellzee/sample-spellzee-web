"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { classroom } from "../../content";
import { tool } from "./styles";

/** "Decodable Reader": tap a word in the sentence to see its sounds (or that it's a sight word). */
export function DecodableReader() {
  const { reader } = classroom;
  const [selected, setSelected] = useState(reader.initial);
  const sounds = reader.words[selected].sounds;

  return (
    <div className={tool.body}>
      <div className="flex flex-wrap justify-center gap-1.5 rounded-2xl border border-line bg-white p-[18px]">
        {reader.words.map((word, i) => {
          const on = i === selected;
          return (
            <button
              key={word.text}
              type="button"
              aria-pressed={on}
              onClick={() => setSelected(i)}
              className={cn(
                "cursor-pointer border-0 px-1.5 py-1 font-serif text-[26px] font-semibold transition-[background-color] duration-200 ease-in-out",
                "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35",
                on ? "rounded-[4px] bg-transparent text-tone-green-deep shadow-[inset_0_-3px_0_var(--color-tone-green)]" : "rounded-lg bg-transparent text-ink hover:bg-[#EEF9F3]",
              )}
            >
              {word.text}
            </button>
          );
        })}
      </div>
      <div aria-live="polite" className="mt-3.5 flex min-h-12 flex-wrap items-center justify-center gap-2">
        {sounds ? (
          sounds.map((sound, i) => (
            <span
              key={`${selected}-${i}`}
              className="flex h-11 min-w-11 items-center justify-center rounded-[12px] bg-tone-green px-2.5 text-[20px] font-extrabold text-white shadow-[0_10px_20px_-12px_rgba(18,133,90,.8)]"
            >
              {sound}
            </span>
          ))
        ) : (
          <span className="rounded-full bg-tone-amber-soft px-3.5 py-2 text-meta font-extrabold text-tone-amber-deep">{reader.tricky}</span>
        )}
      </div>
      <p className={`${tool.message} text-ink-soft`}>{reader.note}</p>
    </div>
  );
}
