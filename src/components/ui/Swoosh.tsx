import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const sizes = {
  md: "font-semibold pb-[9px]",
  lg: "pb-[10px] [--swoosh-h:12px]",
  xl: "pb-[10px] [--swoosh-h:14px]",
} as const;

export type SwooshProps = { children: ReactNode; size?: keyof typeof sizes };

/** Word underlined with the hand-drawn gradient swoosh that draws in on load (`.mark`). */
export function Swoosh({ children, size = "md" }: SwooshProps) {
  return <span className={cn("swoosh text-ink", sizes[size])}>{children}</span>;
}
