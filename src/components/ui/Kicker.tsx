import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Pill label above a section heading (`.kicker` / `.caps` in the export). */
export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-[9px] rounded-full border border-line-2 bg-white py-1.5 pr-[15px] pl-1.5",
        "text-[13.5px] font-bold tracking-[0.005em] text-ink shadow-soft",
        "before:size-6 before:flex-none before:rounded-full before:content-[''] before:kicker-dot",
        className,
      )}
    >
      {children}
    </div>
  );
}
