/** Pill segment button (`.seg` / `.seg.on`) used by the classroom activities. */
export const segment = {
  base:
    "min-h-10 cursor-pointer rounded-full border px-4 text-[13.5px] font-bold " +
    "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35",
  off: "border-rule bg-white text-slate",
  on: "border-brand bg-brand text-white",
} as const;
