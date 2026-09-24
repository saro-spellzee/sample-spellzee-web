import { useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { BOOKING_MAX, type BookingValues } from "../../booking/schema";
import { booking } from "../../content/booking";
import { DemoScheduler, type SchedulerProps } from "./DemoScheduler";
import { ERROR_ID, fieldAria, groupAria } from "./fields";
import { difficultyText, languageText, possessive } from "./model";
import { bf } from "./styles";

const modeCard =
  "flex cursor-pointer flex-col items-start gap-[3px] rounded-[14px] border-[1.5px] border-control-line bg-white px-3.5 py-3 text-left transition-all duration-200 ease-in-out " +
  "has-checked:border-brand has-checked:bg-brand-tint has-checked:shadow-[0_0_0_1px_var(--color-brand)] " +
  "has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand/35";

export type ParentStepProps = SchedulerProps & {
  /** The step-2 error line: the first failing field's message, or the delivery failure. */
  error: string;
  /** The request is on its way: the submit button is disabled and says so. */
  pending: boolean;
  onBack: () => void;
};

/** Step 2: the parent's details, consent, classroom language and how to book. Submitting sends the booking. */
export function ParentStep({ error, pending, onBack, today, month, onMonth }: ParentStepProps) {
  const { consent, language, mode } = booking;
  const {
    register,
    setValue,
    trigger,
    control,
    formState: { errors },
  } = useFormContext<BookingValues>();
  const [kidRaw, grade, difficulties, chosenLanguage, chosenMode] = useWatch({ control, name: ["kid", "grade", "difficulties", "language", "mode"] });
  const kid = kidRaw.trim();
  return (
    <div className={bf.body}>
      <div className="flex items-center gap-3 rounded-2xl border border-line-soft bg-white px-3.5 py-3 text-[14px] leading-[1.35] text-ink">
        <span aria-hidden="true" className="flex size-10 flex-none items-center justify-center rounded-full bg-linear-135 from-periwinkle-soft to-tone-violet-soft font-extrabold text-brand">
          {(kid[0] ?? "C").toUpperCase()}
        </span>
        <span>
          <b>{kid}</b> · {grade.trim()}
          <br />
          <span className="text-fine text-muted">{difficultyText(difficulties)}</span>
        </span>
        <button
          type="button"
          onClick={onBack}
          className="ml-auto cursor-pointer border-0 bg-transparent text-[13px] font-extrabold text-brand focus-visible:outline-3 focus-visible:outline-brand/35"
        >
          {booking.edit}
        </button>
      </div>

      <label className={bf.field}>
        <span className={bf.label}>{booking.parent.label}</span>
        <input
          className={bf.input}
          type="text"
          autoComplete="name"
          maxLength={BOOKING_MAX.parent}
          placeholder={booking.parent.placeholder}
          {...fieldAria(!!errors.parent)}
          {...register("parent")}
        />
      </label>

      {/* Not one wrapping <label>: its name would then include the +91 chip and the hint. */}
      <div className={bf.field}>
        <label htmlFor="bf-phone" className={bf.label}>
          {booking.phone.label}
        </label>
        <span className="flex items-stretch gap-2">
          <span id="bf-phone-code" className="flex items-center rounded-[14px] border-[1.5px] border-field-line bg-sand px-3.5 text-body font-bold whitespace-nowrap text-ink-2">
            {booking.phone.code}
          </span>
          <input
            id="bf-phone"
            className={bf.input}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={11}
            placeholder={booking.phone.placeholder}
            {...fieldAria(!!errors.phone, "bf-phone-code bf-phone-hint")}
            {...register("phone")}
          />
        </span>
        <span id="bf-phone-hint" className={bf.hint}>
          {booking.phone.hint}
        </span>
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-[1.5] font-medium text-slate">
        <input type="checkbox" className="peer sr-only" {...fieldAria(!!errors.consent)} {...register("consent")} />
        <span
          aria-hidden="true"
          className="mt-px flex size-[22px] flex-none items-center justify-center rounded-[7px] border-[1.5px] border-[#CFC6B8] bg-white text-transparent transition-all duration-200 peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand/35"
        >
          <Icon name="check" size={14} strokeWidth={3} />
        </span>
        <span>
          {consent.before}
          {possessive(kid)}
          {consent.after}
          <a href={consent.link.href} className="font-bold text-brand">
            {consent.link.label}
          </a>
          {consent.end}
        </span>
      </label>

      <div className={bf.field}>
        <span className={bf.label}>
          {language.label}
          <b className="font-extrabold text-brand">{languageText(chosenLanguage)}</b>
        </span>
        <div id="bf-language" role="group" aria-label={language.groupLabel} {...groupAria(!!errors.language)} className="mt-1.5 flex flex-wrap gap-1.5">
          <span className="inline-flex min-h-9 items-center rounded-full border-[1.5px] border-brand bg-brand px-3 text-[13px] font-bold text-white opacity-90">
            {language.base}
          </span>
          {language.extras.map((name) => {
            const on = chosenLanguage === name;
            return (
              <button
                key={name}
                type="button"
                aria-pressed={on}
                onClick={() => setValue("language", on ? "" : name, { shouldDirty: true, shouldValidate: !!errors.language })}
                className={bf.chip}
              >
                {language.addPrefix}
                {name}
              </button>
            );
          })}
        </div>
        <span className={bf.hint}>{language.hint}</span>
      </div>

      <fieldset className="m-0 flex flex-col border-0 p-0">
        <legend className={cn(bf.label, "mb-2 p-0")}>{mode.label}</legend>
        <div className="grid grid-cols-1 gap-2 xs:grid-cols-2">
          {(["call", "schedule"] as const).map((m) => (
            <label key={m} className={modeCard}>
              <input
                type="radio"
                value={m}
                className="sr-only"
                {...register("mode", {
                  // A missing-slot message no longer applies once the parent picks a call-back.
                  onChange: () => (errors.slot ? trigger("slot") : undefined),
                })}
              />
              <b className="text-[14px] font-extrabold text-ink">{mode[m].title}</b>
              <span className="text-[12px] leading-[1.4] text-muted">{mode[m].body}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {chosenMode === "schedule" ? <DemoScheduler today={today} month={month} onMonth={onMonth} /> : null}

      <div className={bf.actions}>
        <div id={ERROR_ID} role="alert" className={bf.error}>
          {error}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-[54px] cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] border-field-line bg-white px-[18px] text-[14px] font-extrabold text-slate focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35"
          >
            <Icon name="arrowLeft" size={16} strokeWidth={2.4} /> {booking.back}
          </button>
          <Button type="submit" size="go" arrow disabled={pending} className="flex-1">
            {pending ? booking.pending : booking.submit[chosenMode]}
          </Button>
        </div>
      </div>
    </div>
  );
}
