import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const sizes = {
  md: "font-semibold pb-[9px]",
  lg: "pb-[10px] [--swoosh-h:12px]",
  /** `.mark-xl`: 6px under the word on phones, 10px above. */
  xl: "pb-1.5 sm:pb-[10px] [--swoosh-h:14px]",
} as const;

export type SwooshProps = {
  children: ReactNode;
  size?: keyof typeof sizes;
  /** Text colour class (the export draws most marks in ink, some in white or a word's accent). */
  color?: string;
  className?: string;
};

/** Word underlined with the hand-drawn gradient swoosh that draws in on load (`.mark`). */
export function Swoosh({ children, size = "md", color = "text-ink", className }: SwooshProps) {
  return <span className={cn("swoosh", color, sizes[size], className)}>{children}</span>;
}
