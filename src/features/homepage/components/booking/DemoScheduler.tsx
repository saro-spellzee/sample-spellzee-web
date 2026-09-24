import { useFormContext, useWatch } from "react-hook-form";
import { cn } from "@/lib/cn";
import type { BookingValues } from "../../booking/schema";
import { booking } from "../../content";
import { groupAria } from "./fields";
import { calendarMonth, fromIso, slotHint, slotsFor } from "./model";
import { bf } from "./styles";

const navButton =
  "size-[34px] cursor-pointer rounded-full border-[1.5px] border-[#DCE1EC] bg-white text-[18px] leading-none font-extrabold text-ink-2 " +
  "disabled:cursor-default disabled:opacity-35 focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-brand/35";

export type SchedulerProps = {
  /** When the dialog opened: the calendar counts bookable days from here. */
  today: Date;
  /** Calendar month shown, as an offset from the current month (0–2). */
  month: number;
  onMonth: (month: number) => void;
};

/** "Schedule Now": a month calendar (tomorrow to 60 days out, no Sundays) and the day's 30-minute slots. */
export function DemoScheduler({ today, month: offset, onMonth }: SchedulerProps) {
  const { schedule } = booking;
  const {
    setValue,
    control,
    formState: { errors },
  } = useFormContext<BookingValues>();
  const [date, chosenSlot] = useWatch({ control, name: ["date", "slot"] });
  const month = calendarMonth(today, offset);
  const day = date ? fromIso(date) : null;
  const slotError = !!errors.slot;
  return (
    <div className="mt-1 animate-fade-up rounded-[14px] bg-sand p-3">
      <span id="bf-date-label" className={cn(bf.label, "block")}>
        {schedule.dateLabel}
      </span>
      <div className="mt-1.5 rounded-[14px] bg-white p-3 shadow-[0_0_0_1px_#E6DED3]">
        <div className="mb-2 flex items-center justify-between">
          <button type="button" className={navButton} disabled={!month.canGoBack} onClick={() => onMonth(offset - 1)} aria-label={schedule.previousMonth}>
            ‹
          </button>
          <b className="text-body font-extrabold text-ink">{month.title}</b>
          <button type="button" className={navButton} disabled={!month.canGoForward} onClick={() => onMonth(offset + 1)} aria-label={schedule.nextMonth}>
            ›
          </button>
        </div>
        <div aria-hidden="true" className="grid grid-cols-7 gap-1">
          {schedule.weekdays.map((w) => (
            <span key={w} className="py-1 text-center text-[11px] font-extrabold text-[#8A92AD]">
              {w}
            </span>
          ))}
        </div>
        <div id="bf-days" role="group" aria-label={month.title} {...groupAria(slotError && !date)} className="grid grid-cols-7 gap-1">
          {Array.from({ length: month.leading }, (_, k) => (
            <span key={`blank-${k}`} aria-hidden="true" />
          ))}
          {month.days.map((d) => {
            const on = date === d.iso;
            return (
              <button
                key={d.iso}
                type="button"
                disabled={d.disabled}
                aria-pressed={on}
                aria-label={d.label}
                onClick={() => {
                  setValue("date", d.iso, { shouldDirty: true });
                  // A new day has its own slots; re-check so the error line keeps up.
                  setValue("slot", "", { shouldValidate: slotError });
                }}
                className={cn(
                  "aspect-square min-h-[34px] cursor-pointer rounded-[10px] border-0 text-[13px] font-bold transition-all duration-150 ease-in-out",
                  "focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-brand/35",
                  d.today && "shadow-[inset_0_0_0_1.5px_#9AA6C4]",
                  on
                    ? "bg-brand text-white"
                    : d.disabled
                      ? "cursor-default bg-transparent text-[#C5CAD8] line-through decoration-[rgba(197,202,216,.6)]"
                      : "bg-[#F4F7FE] text-ink-2 hover:bg-tone-blue-soft hover:text-brand",
                )}
              >
                {d.day}
              </button>
            );
          })}
        </div>
        <span className={cn(bf.hint, "mt-2 block")}>{schedule.calendarHint}</span>
      </div>
      {day ? (
        <>
          <span id="bf-slot-label" className={cn(bf.label, "mt-3 block")}>
            {schedule.slotLabel}
          </span>
          <div id="bf-slots" role="group" aria-label={schedule.slotGroup} {...groupAria(slotError)} className="mt-1.5 flex max-h-[132px] flex-wrap gap-1.5 overflow-auto p-0.5">
            {slotsFor(day).map((slot) => (
              <button
                key={slot}
                type="button"
                aria-pressed={chosenSlot === slot}
                onClick={() => setValue("slot", slot, { shouldDirty: true, shouldValidate: slotError })}
                className={bf.chip}
              >
                {slot}
              </button>
            ))}
          </div>
          <span className={bf.hint}>{slotHint(day)}</span>
        </>
      ) : null}
    </div>
  );
}
