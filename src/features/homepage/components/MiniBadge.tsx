import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Pulse } from "./Pulse";

export type MiniBadgeProps = { children: ReactNode; /** Leading pulse dot (hero badges). */ pulse?: boolean };

/**
 * Frosted pill with a gradient border that lifts on hover (`.mini-badge`). Children are flex
 * items 9px apart, so pass separate pieces (text, <b>) to space them as the export does.
 */
export function MiniBadge({ children, pulse }: MiniBadgeProps) {
  return (
    <span
      className={cn(
        "glass-pill inline-flex cursor-default items-center gap-[9px] rounded-full py-2 pr-4 text-meta font-bold text-ink",
        pulse ? "pl-3.5" : "pl-4",
      )}
    >
      {pulse ? <Pulse className="bg-vivid-rose text-vivid-rose" /> : null}
      {children}
    </span>
  );
}
