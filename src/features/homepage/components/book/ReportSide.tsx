import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { book } from "../../content/book";

/**
 * The sample child's profile column of the report. Centred on desktop; below the desktop
 * breakpoint it becomes a compact row (avatar beside the name).
 */
export function ReportSide() {
  const { report } = book;
  const { stage } = report;
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3.5 gap-y-0.5 bg-linear-to-b from-ink to-[#1B2B66] px-[18px] pt-[18px] pb-4 text-left text-white lg:flex lg:flex-col lg:items-center lg:gap-1.5 lg:px-5 lg:py-6 lg:text-center">
      <span className="col-span-full mb-2 justify-self-start rounded-full bg-tone-green-soft px-3 py-[5px] text-[11px] font-extrabold tracking-[.08em] text-tone-green-deep uppercase lg:mb-0">
        {report.tag}
      </span>
      <span
        aria-hidden="true"
        className="row-span-3 flex size-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--color-periwinkle-soft),#8FA9F5)] font-serif text-[30px] font-medium text-ink shadow-[0_0_0_6px_rgba(255,255,255,.1),0_0_30px_rgba(143,169,245,.5)] lg:mt-3.5 lg:size-[84px] lg:text-[40px]"
      >
        {report.initial}
      </span>
      <div className="font-serif text-[26px] leading-none font-medium lg:mt-2.5 lg:text-[30px]">{report.name}</div>
      <div className="text-[14px] text-haze">{report.age}</div>
      <div className="text-meta leading-[1.4] text-haze lg:mt-2">{report.profile}</div>
      <div role="img" aria-label={stage.of} className="col-span-full mt-3 flex gap-1.5 lg:mt-3.5">
        {Array.from({ length: stage.total }, (_, i) => (
          <i
            key={i}
            className={cn(
              "size-2.5 rounded-full border-[1.5px]",
              i < stage.current ? "border-white bg-white" : "border-white/40",
              i === stage.current - 1 && "shadow-[0_0_0_3px_rgba(143,169,245,.5)]",
            )}
          />
        ))}
      </div>
      <div className="col-span-full mt-2.5 flex items-center gap-2.5 justify-self-start rounded-[14px] bg-white/8 px-3 py-2.5 text-left text-fine text-haze lg:mt-3.5">
        <Icon name="book" size={22} strokeWidth={1.8} />
        <span>
          <b className="text-meta tracking-[.04em] text-white uppercase">{stage.name}</b>
          <br />
          {stage.of}
        </span>
      </div>
      <div className="hidden pt-3.5 text-[11px] font-bold text-white/55 lg:mt-auto lg:block">{report.powered}</div>
    </div>
  );
}
