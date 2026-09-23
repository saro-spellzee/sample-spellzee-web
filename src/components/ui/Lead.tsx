import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type LeadProps = {
  children: ReactNode;
  /** Font-size classes; defaults to the export's 18px `.lead`. */
  size?: string;
  className?: string;
};

/** Intro paragraph under a heading (`.lead`). */
export function Lead({ children, size = "text-[18px] leading-[1.65]", className }: LeadProps) {
  return <p className={cn("text-ink-soft", size, className)}>{children}</p>;
}
