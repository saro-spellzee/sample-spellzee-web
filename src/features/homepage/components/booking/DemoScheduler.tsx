import { cn } from "@/lib/cn";
import { booking } from "../../content";
import type { StepProps } from "./ChildStep";
import { calendarMonth, fromIso, slotHint, slotsFor } from "./model";
import { bf } from "./styles";

const navButton =
  "size-[34px] cursor-pointer rounded-full border-[1.5px] border-[#DCE1EC] bg-white text-[18px] leading-none font-extrabold text-ink-2 " +
  "disabled:cursor-default disabled:opacity-35 focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-brand/35";

/** "Schedule Now": a month calendar (tomorrow to 60 days out, no Sundays) and the day's 30-minute slots. */
export function DemoScheduler({ state, update, today }: StepProps & { today: Date }) {
  const { schedule } = booking;
  const month = calendarMonth(today, state.month);
  const day = state.date ? fromIso(state.date) : null;
  return (
    <div className="mt-1 animate-fade-up rounded-[14px] bg-sand p-3">
      <span id="bf-date-label" className={cn(bf.label, "block")}>
        {schedule.dateLabel}
      </span>
      <div className="mt-1.5 rounded-[14px] bg-white p-3 shadow-[0_0_0_1px_#E6DED3]">
        <div className="mb-2 flex items-center justify-between">
          <button type="button" className={navButton} disabled={!month.canGoBack} onClick={() => update({ month: state.month - 1 })} aria-label={schedule.previousMonth}>
            ‹
          </button>
          <b className="text-body font-extrabold text-ink">{month.title}</b>
          <button type="button" className={navButton} disabled={!month.canGoForward} onClick={() => update({ month: state.month + 1 })} aria-label={schedule.nextMonth}>
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
        <div role="group" aria-label={month.title} className="grid grid-cols-7 gap-1">
          {Array.from({ length: month.leading }, (_, k) => (
            <span key={`blank-${k}`} aria-hidden="true" />
          ))}
          {month.days.map((d) => {
            const on = state.date === d.iso;
            return (
              <button
                key={d.iso}
                type="button"
                disabled={d.disabled}
                aria-pressed={on}
                aria-label={d.label}
                onClick={() => update({ date: d.iso, slot: "", error: "" })}
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
          <div role="group" aria-label={schedule.slotGroup} className="mt-1.5 flex max-h-[132px] flex-wrap gap-1.5 overflow-auto p-0.5">
            {slotsFor(day).map((slot) => (
              <button key={slot} type="button" aria-pressed={state.slot === slot} onClick={() => update({ slot, error: "" })} className={bf.chip}>
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
