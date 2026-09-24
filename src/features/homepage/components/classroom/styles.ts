/** Class bundles shared by the learning tools (`.seg`, `.lab-*` in the export). */
export const tool = {
  /** A tool panel: fills the stage and centres its content. */
  body: "flex flex-1 animate-fade-up flex-col justify-center pt-4",
  /** Feedback line under a tool; colour set by the caller. */
  message: "mt-3.5 text-center text-[13.5px]",
  controls: "mt-3 flex items-center justify-center gap-2",
  /** Pill control button (`.seg`). */
  seg:
    "inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-rule bg-white px-4 text-[13.5px] font-bold text-slate " +
    "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35",
  /** White card holding a worksheet or assignment list. */
  sheet: "rounded-2xl border border-line bg-white px-4 py-3.5",
  sheetTop: "flex justify-between text-fine font-extrabold text-faint",
  bar: "h-1.5 overflow-hidden rounded-md bg-[#F0ECE4]",
} as const;

/** The two white cards in the classroom studio frame: the live class and the learning tools. */
export const studioCard = "flex flex-col rounded-[28px] border border-white/90 bg-white shadow-[0_24px_50px_-34px_rgba(60,40,140,.45)]";
