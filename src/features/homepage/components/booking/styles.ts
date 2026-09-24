/** Class bundles shared by the booking dialog's steps (`.bf-*` in the export). */
export const bf = {
  body: "mt-4 flex animate-fade-up flex-col gap-3.5",
  field: "flex flex-col gap-2",
  label: "text-[13.5px] font-extrabold text-ink-2",
  labelNote: "ml-1 font-semibold not-italic text-subtle",
  // 16px on phones so iOS Safari doesn't zoom the page on focus (the design draws 15.5px).
  input:
    "h-[46px] w-full rounded-[14px] border-[1.5px] border-field-line bg-white px-4 text-base font-semibold text-ink outline-none sm:text-[15.5px] " +
    "transition-[border-color,box-shadow] duration-200 ease-in-out placeholder:font-medium placeholder:text-[#A7AEC4] " +
    "focus:border-brand focus:shadow-[0_0_0_4px_rgba(21,87,214,.12)]",
  hint: "text-fine text-subtle",
  chip:
    "min-h-9 cursor-pointer rounded-full border-[1.5px] border-[#DCE1EC] bg-white px-3 text-[13px] font-bold text-ink-2 transition-all duration-200 ease-in-out " +
    "hover:border-brand hover:text-brand focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35 " +
    "aria-pressed:border-brand aria-pressed:bg-brand aria-pressed:text-white",
  /** Sticky action bar at the bottom of the scrolling panel. */
  actions:
    "sticky bottom-0 z-2 -mx-[18px] mt-auto flex flex-col gap-1.5 bg-[linear-gradient(180deg,rgba(252,248,244,0),#FCF8F4_22%)] px-[18px] pt-2.5 pb-[18px] dlg:-mx-[30px] dlg:px-[30px] dlg:pb-[22px]",
  error: "text-[13px] font-bold text-[#C2264F]",
  title: "m-0 mt-2 text-[24px] font-extrabold tracking-[-.03em] text-ink outline-none",
} as const;
