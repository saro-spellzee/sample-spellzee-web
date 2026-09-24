import { cn } from "@/lib/cn";

type WaveDividerProps = {
  /** Unique gradient id (several waves share the page). */
  id: string;
  position: "top" | "bottom";
  /** `band`: the shallower wave with a stronger hairline that frames the midnight statement band. */
  variant?: "silk" | "band";
};

/** Gradient stop colours (the brand spectrum tokens). */
const blue = "[stop-color:var(--color-spectrum-blue)]";
const violet = "[stop-color:var(--color-spectrum-violet)]";
const pink = "[stop-color:var(--color-spectrum-pink)]";

const shapes = {
  silk: {
    viewBox: "0 0 1440 100",
    size: "h-[clamp(56px,7vw,100px)]",
    opacity: [0.15, 0.55],
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
  },
  band: {
    viewBox: "0 0 1440 90",
    size: "h-[clamp(50px,6vw,90px)]",
    opacity: [0.25, 0.8],
    top: {
      fill: "M0 0 H1440 V36 C1200 86 960 86 720 54 C480 22 240 18 0 60 Z",
      line: "M0 60 C240 18 480 22 720 54 C960 86 1200 86 1440 36",
      stops: [blue, violet, pink],
      className: "-top-px",
    },
    bottom: {
      fill: "M0 90 V52 C240 14 480 18 720 42 C960 66 1200 72 1440 30 V90 Z",
      line: "M0 52 C240 14 480 18 720 42 C960 66 1200 72 1440 30",
      stops: [pink, violet, blue],
      className: "-bottom-px",
    },
  },
} as const;

/** Cream wave edge with a gradient hairline, at the top/bottom of silk sections and the statement band. */
export function WaveDivider({ id, position, variant = "silk" }: WaveDividerProps) {
  const v = shapes[variant];
  const s = v[position];
  const [edge, middle] = v.opacity;
  return (
    <svg
      viewBox={v.viewBox}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn("pointer-events-none absolute left-0 z-1 block w-full", v.size, s.className)}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" className={s.stops[0]} stopOpacity={edge} />
          <stop offset="0.5" className={s.stops[1]} stopOpacity={middle} />
          <stop offset="1" className={s.stops[2]} stopOpacity={edge} />
        </linearGradient>
      </defs>
      <path d={s.fill} className="fill-cream" />
      <path d={s.line} fill="none" stroke={`url(#${id})`} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
