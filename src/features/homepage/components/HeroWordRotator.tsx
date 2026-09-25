"use client";

import { useEffect, useState } from "react";
import { tones } from "@/components/ui/tones";
import { cn } from "@/lib/cn";
import { hero } from "../content/hero";
import { prefersReducedMotion } from "../hooks/canvas";
import { isMotionPaused } from "../hooks/motion";

const ROTATE_MS = 3600;

/**
 * The hero headline's last word, cycling Confidently → Independently → Effortlessly every
 * 3.6s: the new word rises in and draws its swoosh while the old one slides up and out.
 * Stays on the first word under reduced motion; holds while motion is paused. The headline
 * is aria-hidden: screen readers get the full sentence from the h1's visually hidden text.
 */
export function HeroWordRotator() {
  const words = hero.title.words;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      if (!isMotionPaused()) setCurrent((i) => (i + 1) % words.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [words.length]);

  const previous = (current + words.length - 1) % words.length;
  return (
    <span className="-mb-1 inline-grid overflow-hidden pb-1 align-top">
      {words.map((word, i) => {
        const on = i === current;
        return (
          <span
            key={word.text}
            className={cn(
              "col-start-1 row-start-1 pb-3.5 whitespace-nowrap transition-[opacity,transform] duration-[350ms,600ms] ease-[ease,cubic-bezier(.2,.8,.2,1)]",
              on ? "opacity-100" : i === previous ? "-translate-y-[105%] opacity-0" : "translate-y-[105%] opacity-0",
            )}
          >
            <span
              className={cn(
                tones[word.tone],
                "swoosh pb-3 font-[inherit] text-(--tone) [--swoosh-h:14px]",
                // The current word's underline draws in; without the animation (reduced or paused
                // motion) it simply shows. The other words carry none.
                on ? "[background-size:100%_14px] [animation:swoosh_.8s_cubic-bezier(.6,.05,.25,1)_.3s_both]" : "[background-size:0%_14px] [animation:none]",
              )}
            >
              {word.text}
            </span>
          </span>
        );
      })}
    </span>
  );
}
