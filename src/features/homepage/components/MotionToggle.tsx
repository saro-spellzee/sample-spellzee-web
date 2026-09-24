"use client";

import { cn } from "@/lib/cn";
import { motion } from "../content/page";
import { setMotionPaused, useMotionPaused } from "../hooks/motion";

/**
 * Floating "Pause motion" / "Play motion" switch (WCAG 2.2.2). Its name is its visible
 * text; on phones the text is visually hidden, leaving the icon.
 */
export function MotionToggle() {
  const paused = useMotionPaused();
  return (
    <button
      type="button"
      onClick={() => setMotionPaused(!paused)}
      className={cn(
        "fixed right-3 bottom-3 z-[120] inline-flex cursor-pointer items-center gap-[7px] rounded-full border border-white bg-white/88 p-[9px] text-[12px] font-bold text-ink-2 opacity-75 backdrop-blur-[10px]",
        "shadow-[0_0_0_1px_rgba(150,120,90,.14),0_10px_24px_-14px_rgba(14,26,58,.5)] transition-opacity duration-250 ease-in-out hover:opacity-100 focus-visible:opacity-100",
        "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35",
        "sm:right-[18px] sm:bottom-[18px] sm:py-2 sm:pr-[13px] sm:pl-[11px] sm:opacity-80",
      )}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d={paused ? "M8 5.5v13l11-6.5z" : "M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"} />
      </svg>
      <span className="max-sm:sr-only">{paused ? motion.play : motion.pause}</span>
    </button>
  );
}
