import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Instrument Serif italic accent word inside a heading (`.acc`). Colour/size via className. */
export function Accent({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("font-serif font-normal tracking-[-0.01em] italic", className)}>{children}</span>;
}
