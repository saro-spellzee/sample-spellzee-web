import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { tones, type Tone } from "./tones";

type ChipProps = {
  tone: Tone;
  children: ReactNode;
  /** Padding + font-size classes; defaults to the export's `.chipc`. */
  size?: string;
  className?: string;
};

/** Small tinted label pill (`.chipc`). */
export function Chip({ tone, children, size = "px-[13px] py-2 text-fine", className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[7px] rounded-full bg-(--tone-soft) font-bold text-(--tone)",
        tones[tone],
        size,
        className,
      )}
    >
      {children}
    </span>
  );
}
