import { useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { tones } from "@/components/ui/tones";
import { cn } from "@/lib/cn";
import { BOOKING_MAX, type BookingValues } from "../../booking/schema";
import { booking } from "../../content/booking";
import { ERROR_ID, fieldAria, groupAria } from "./fields";
import { toggleDifficulty } from "./model";
import { bf } from "./styles";

export type ChildStepProps = {
  /** The step-1 error line: the first failing field's message. */
  error: string;
};

/** Step 1: the child's name, grade and the difficulties to work on. Continue submits the form. */
export function ChildStep({ error }: ChildStepProps) {
  const { difficulties } = booking;
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<BookingValues>();
  const picked = useWatch({ control, name: "difficulties" });
  return (
    <div className={bf.body}>
      <label className={bf.field}>
        <span className={bf.label}>{booking.kid.label}</span>
        <input
          className={bf.input}
          type="text"
          autoComplete="off"
          maxLength={BOOKING_MAX.kid}
          placeholder={booking.kid.placeholder}
          {...fieldAria(!!errors.kid)}
          {...register("kid")}
        />
      </label>
      <label className={bf.field}>
        <span className={bf.label}>{booking.grade.label}</span>
        <input
          className={bf.input}
          type="text"
          autoComplete="off"
          maxLength={BOOKING_MAX.grade}
          placeholder={booking.grade.placeholder}
          {...fieldAria(!!errors.grade)}
          {...register("grade")}
        />
      </label>
      <div id="bf-difficulties" role="group" aria-labelledby="bf-difficulty-label" {...groupAria(!!errors.difficulties)} className={bf.field}>
        <span id="bf-difficulty-label" className={bf.label}>
          {difficulties.label} <em className={bf.labelNote}>{difficulties.hint}</em>
        </span>
        <div className="grid grid-cols-1 gap-[9px] dlg:grid-cols-2">
          {difficulties.items.map((d) => {
            const on = picked.includes(d.id);
            return (
              <button
                key={d.id}
                type="button"
                aria-pressed={on}
                onClick={() => setValue("difficulties", toggleDifficulty(picked, d.id), { shouldDirty: true, shouldValidate: !!errors.difficulties })}
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
        <div id={ERROR_ID} role="alert" className={bf.error}>
          {error}
        </div>
        <Button type="submit" size="go" arrow>
          {booking.continue}
        </Button>
      </div>
    </div>
  );
}
