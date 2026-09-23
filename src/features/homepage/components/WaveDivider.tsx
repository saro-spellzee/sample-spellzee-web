import { cn } from "@/lib/cn";

type WaveDividerProps = {
  /** Unique gradient id (several waves share the page). */
  id: string;
  position: "top" | "bottom";
};

/** Gradient stop colours (the brand spectrum tokens). */
const blue = "[stop-color:var(--color-spectrum-blue)]";
const violet = "[stop-color:var(--color-spectrum-violet)]";
const pink = "[stop-color:var(--color-spectrum-pink)]";

const shapes = {
  top: {
    fill: "M0 0 H1440 V40 C1200 96 960 96 720 60 C480 24 240 20 0 66 Z",
    line: "M0 66 C240 20 480 24 720 60 C960 96 1200 96 1440 40",
    stops: [blue, violet, pink],
    className: "top-0 drop-shadow-[0_12px_16px_rgba(110,80,160,.07)]",
  },
  bottom: {
    fill: "M0 100 V58 C240 18 480 22 720 48 C960 74 1200 80 1440 36 V100 Z",
    line: "M0 58 C240 18 480 22 720 48 C960 74 1200 80 1440 36",
    stops: [pink, violet, blue],
    className: "-bottom-px drop-shadow-[0_-10px_14px_rgba(110,80,160,.06)]",
  },
} as const;

/** Cream wave edge with a gradient hairline, used at the top/bottom of silk sections. */
export function WaveDivider({ id, position }: WaveDividerProps) {
  const s = shapes[position];
  return (
    <svg
      viewBox="0 0 1440 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn("pointer-events-none absolute left-0 z-1 block h-[clamp(56px,7vw,100px)] w-full", s.className)}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" className={s.stops[0]} stopOpacity="0.15" />
          <stop offset="0.5" className={s.stops[1]} stopOpacity="0.55" />
          <stop offset="1" className={s.stops[2]} stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path d={s.fill} className="fill-cream" />
      <path d={s.line} fill="none" stroke={`url(#${id})`} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
