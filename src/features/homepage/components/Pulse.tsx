import { cn } from "@/lib/cn";

/** Small dot with an expanding ring (`.pulse`). Pass `bg-*` and `text-*` (ring colour). */
export type PulseProps = { className?: string };

export function Pulse({ className }: PulseProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative size-2 flex-none rounded-full",
        "after:absolute after:-inset-[5px] after:animate-ping-ring after:rounded-full after:border-[1.5px] after:border-current after:content-[''] motion-reduce:after:hidden",
        className,
      )}
    />
  );
}
