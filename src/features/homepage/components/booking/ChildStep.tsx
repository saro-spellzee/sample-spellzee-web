import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { tones } from "@/components/ui/tones";
import { cn } from "@/lib/cn";
import { booking } from "../../content";
import { toggleDifficulty, type BookingState } from "./model";
import { bf } from "./styles";

export type StepProps = {
  state: BookingState;
  update: (patch: Partial<BookingState>) => void;
};

/** Step 1: the child's name, grade and the difficulties to work on. */
export function ChildStep({ state, update, onNext }: StepProps & { onNext: () => void }) {
  const { difficulties } = booking;
  return (
    <div className={bf.body}>
      <label className={bf.field}>
        <span className={bf.label}>{booking.kid.label}</span>
        <input
          className={bf.input}
          type="text"
          name="kid"
          autoComplete="off"
          maxLength={40}
          placeholder={booking.kid.placeholder}
          value={state.kid}
          onChange={(e) => update({ kid: e.target.value, error: "" })}
        />
      </label>
      <label className={bf.field}>
        <span className={bf.label}>{booking.grade.label}</span>
        <input
          className={bf.input}
          type="text"
          name="grade"
          autoComplete="off"
          maxLength={20}
          placeholder={booking.grade.placeholder}
          value={state.grade}
          onChange={(e) => update({ grade: e.target.value, error: "" })}
        />
      </label>
      <div role="group" aria-labelledby="bf-difficulty-label" className={bf.field}>
        <span id="bf-difficulty-label" className={bf.label}>
          {difficulties.label} <em className={bf.labelNote}>{difficulties.hint}</em>
        </span>
        <div className="grid grid-cols-1 gap-[9px] dlg:grid-cols-2">
          {difficulties.items.map((d) => {
            const on = state.difficulties.includes(d.id);
            return (
              <button
                key={d.id}
                type="button"
                aria-pressed={on}
                onClick={() => update({ difficulties: toggleDifficulty(state.difficulties, d.id), error: "" })}
                className={cn(
                  tones[d.tone],
                  "relative flex cursor-pointer items-center gap-[11px] rounded-2xl border-[1.5px] px-3 py-2.5 text-left transition-all duration-220 ease-in-out last:col-span-full",
                  "hover:-translate-y-px hover:border-(--tone) focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35",
                  on ? "border-(--tone) bg-(--tone-soft) shadow-[0_12px_24px_-18px_var(--tone)]" : "border-field-line bg-white",
                )}
              >
                <span className={cn("flex size-8 flex-none items-center justify-center rounded-[11px]", on ? "bg-(--tone) text-white" : "bg-(--tone-soft) text-(--tone)")}>
                  <Icon name={d.icon} size={18} />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <b className="text-[14px] text-ink">{d.title}</b>
                  <span className="text-[11.5px] leading-[1.35] text-muted">{d.body}</span>
                </span>
                <span
                  className={cn(
                    "ml-auto flex size-5 flex-none items-center justify-center rounded-full border-[1.5px] transition-all duration-200",
                    on ? "border-(--tone) bg-(--tone) text-white" : "border-[#D9D1C4] text-transparent",
                  )}
                >
                  <Icon name="check" size={14} strokeWidth={3} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className={bf.actions}>
        <div role="alert" className={bf.error}>
          {state.error}
        </div>
        <Button size="go" arrow onClick={onNext}>
          {booking.continue}
        </Button>
      </div>
    </div>
  );
}
