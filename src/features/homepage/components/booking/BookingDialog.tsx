"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { requestDemo } from "../../booking/actions";
import {
  BOOKING_FAILED,
  BOOKING_STEPS,
  HONEYPOT_FIELD,
  bookingDefaults,
  bookingSchema,
  type BookingField,
  type BookingResult,
  type BookingValues,
} from "../../booking/schema";
import { booking } from "../../content";
import { BookingDone } from "./BookingDone";
import { BookingSide } from "./BookingSide";
import { ChildStep } from "./ChildStep";
import { ParentStep } from "./ParentStep";
import { bf } from "./styles";

/** Links and buttons with this attribute open the dialog instead of navigating (see Button's `action`). */
const TRIGGER = '[data-action="book"]';

/** Where focus goes when a field fails: the input, or the first usable button of its group. */
const FOCUS_TARGETS: Record<BookingField, string[]> = {
  kid: ['[name="kid"]'],
  grade: ['[name="grade"]'],
  difficulties: ["#bf-difficulties button"],
  parent: ['[name="parent"]'],
  phone: ['[name="phone"]'],
  consent: ['[name="consent"]'],
  language: ["#bf-language button"],
  mode: ['[name="mode"]:checked'],
  date: ["#bf-days button:enabled"],
  slot: ["#bf-slots button", "#bf-days button:enabled"],
};

/** Focuses a field's input, or the first usable button of its group. False when it isn't on screen. */
function focusField(root: HTMLElement | null, field: BookingField) {
  const target = FOCUS_TARGETS[field].map((selector) => root?.querySelector<HTMLElement>(selector)).find(Boolean);
  target?.focus();
  return !!target;
}

type Step = 1 | 2;

/**
 * The "Book a Free Demo Class" dialog: two steps (about the child, then the parent's
 * details and how to book), then a confirmation. Every CTA marked `data-action="book"`
 * opens it; without JavaScript those links still go to #book. A native modal <dialog>
 * keeps focus inside and closes on Escape.
 *
 * One React Hook Form instance holds both steps; `bookingSchema` validates it here and
 * again in the `requestDemo` Server Action, which delivers it. The confirmation shows only
 * once the server has accepted the request. Answers are kept when the dialog is closed and
 * reopened, and cleared after a completed booking (as in the export).
 */
export function BookingDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  /** A submit is being validated or sent: further submits (a second Enter) are ignored. */
  const busy = useRef(false);
  /** The confirmation has been on screen, so the next open starts a fresh booking. */
  const finished = useRef(false);
  /** A failing step-1 field to focus once step 1 is back on screen (instead of its heading). */
  const focusOnStep = useRef<BookingField | null>(null);
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState<Date | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [month, setMonth] = useState(0);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  /** The booking as the server accepted it, for the confirmation. */
  const [done, setDone] = useState<BookingValues | null>(null);

  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    mode: "onTouched",
    defaultValues: bookingDefaults,
    // Focus follows on-screen order (BOOKING_STEPS), including button groups RHF can't focus.
    shouldFocusError: false,
  });
  const {
    clearErrors,
    getFieldState,
    handleSubmit,
    reset,
    setError,
    trigger,
    formState: { errors },
  } = form;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target instanceof Element ? e.target.closest<HTMLElement>(TRIGGER) : null;
      if (!link) return;
      // Capture phase: runs before next/link, which then sees the prevented default and stays put.
      e.preventDefault();
      opener.current = link;
      if (finished.current) {
        finished.current = false;
        reset(bookingDefaults);
        setStep(1);
        setMonth(0);
        setFailed(false);
        setDone(null);
      }
      setToday(new Date());
      setOpen(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [reset]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) {
      dialog.close();
      opener.current?.focus();
    }
  }, [open]);

  // Each view starts at its heading, so screen readers announce where they are, unless
  // the view was brought back to fix a field: then that field (described by the error line).
  useEffect(() => {
    if (!open) return;
    const field = focusOnStep.current;
    focusOnStep.current = null;
    if (!(field && focusField(dialogRef.current, field))) dialogRef.current?.querySelector<HTMLElement>("#bf-title")?.focus();
  }, [open, step, done]);

  // A request that succeeds after the parent closed the dialog still shows its confirmation next time.
  useEffect(() => {
    if (open && done) finished.current = true;
  }, [open, done]);

  const close = () => setOpen(false);

  /** Moves focus to the first failing field in on-screen order (back to step 1 if it's there). */
  const revealFirstError = (current: Step) => {
    const field = BOOKING_STEPS.flat().find((f) => getFieldState(f).invalid);
    if (!field) return false;
    if (current === 2 && BOOKING_STEPS[0].includes(field)) {
      focusOnStep.current = field; // focused by the effect above once step 1 has rendered
      setStep(1);
      return true;
    }
    focusField(dialogRef.current, field);
    return true;
  };

  const next = async () => {
    setFailed(false);
    if (await trigger(BOOKING_STEPS[0])) setStep(2);
    else revealFirstError(1);
  };

  const send = async (values: BookingValues, trap: string) => {
    setFailed(false);
    setPending(true);
    let result: BookingResult;
    try {
      result = await requestDemo({ ...values, [HONEYPOT_FIELD]: trap });
    } catch {
      // Offline, or the action itself failed: never a confirmation.
      result = { status: "failed" };
    }
    setPending(false);
    if (result.status === "success") return setDone(values);
    if (result.status === "invalid") {
      // The server's check disagreed with the dialog's (a stale page, a clock edge): show its messages.
      for (const [field, message] of Object.entries(result.errors) as [BookingField, string][]) {
        setError(field, { type: "server", message });
      }
      if (revealFirstError(2)) return;
    }
    setFailed(true);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy.current) return;
    busy.current = true;
    const trap = (e.currentTarget.elements.namedItem(HONEYPOT_FIELD) as HTMLInputElement | null)?.value ?? "";
    const run =
      step === 1
        ? next()
        : handleSubmit(
            (values) => send(values, trap),
            () => {
              setFailed(false);
              revealFirstError(2);
            },
          )();
    void run.finally(() => {
      busy.current = false;
    });
  };

  const back = () => {
    clearErrors();
    setFailed(false);
    setStep(1);
  };

  const fieldError = BOOKING_STEPS[step - 1].map((f) => errors[f]?.message).find(Boolean);
  const message = fieldError ?? (failed ? BOOKING_FAILED : "");
  const heading = booking.steps[step - 1];

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="bf-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      className="m-0 size-full max-h-none max-w-none items-end justify-center overflow-hidden border-0 bg-transparent p-0 backdrop:bg-transparent open:flex dlg:items-center dlg:p-6"
    >
      {open && today ? (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-label={booking.closeBackdrop}
            onClick={close}
            className="absolute inset-0 animate-backdrop-in cursor-pointer border-0 bg-[rgba(11,20,51,.55)] backdrop-blur-[8px]"
          />
          <div className="relative grid max-h-[min(calc(100svh-32px),740px)] w-full animate-sheet-up grid-rows-[minmax(0,1fr)] overflow-hidden rounded-t-[28px] bg-cream shadow-[0_0_0_1px_rgba(255,255,255,.6),0_50px_120px_-40px_rgba(11,20,51,.8)] dlg:w-[min(960px,100%)] dlg:animate-dialog-in dlg:grid-cols-[340px_minmax(0,1fr)] dlg:rounded-[30px]">
            <BookingSide />
            <div className="relative flex max-h-[92svh] flex-col overflow-y-auto px-[18px] pt-6 dlg:max-h-[min(calc(100svh-32px),740px)] dlg:px-[30px] dlg:pt-[26px]">
              <span aria-hidden="true" className="absolute top-[9px] left-1/2 -ml-[22px] h-[5px] w-11 rounded-[5px] bg-[#DCD4C8] dlg:hidden" />
              <button
                type="button"
                onClick={close}
                aria-label={booking.close}
                className="absolute top-[18px] right-[18px] z-3 flex size-[38px] cursor-pointer items-center justify-center rounded-full border-0 bg-[#F1ECE3] text-slate transition-colors duration-200 hover:bg-field-line focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35"
              >
                <Icon name="close" size={16} strokeWidth={2.4} />
              </button>
              {done ? (
                <BookingDone values={done} onDone={close} />
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div aria-hidden="true" className="flex gap-1.5">
                      {[1, 2].map((n) => (
                        <i
                          key={n}
                          className={cn(
                            "h-1.5 w-7 rounded-md transition-colors duration-300",
                            n <= step ? "bg-linear-90 from-spectrum-blue to-spectrum-violet" : "bg-field-line",
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-fine font-bold text-faint">
                      {booking.progress.replace("{n}", String(step)).replace("{name}", heading.name)}
                    </span>
                  </div>
                  <h2 id="bf-title" tabIndex={-1} className={cn(bf.title, "pr-11 dlg:pr-0")}>
                    {heading.title}
                  </h2>
                  <FormProvider {...form}>
                    {/* `contents`: the form adds no box, so the steps lay out exactly as before. */}
                    <form noValidate onSubmit={onSubmit} className="contents">
                      {step === 1 ? (
                        <ChildStep error={message} />
                      ) : (
                        <ParentStep error={message} pending={pending} onBack={back} today={today} month={month} onMonth={setMonth} />
                      )}
                      {/* Honeypot: off-screen, hidden from assistive tech and skipped by Tab. */}
                      <div aria-hidden="true" className="sr-only">
                        <label htmlFor="bf-website">{booking.honeypotLabel}</label>
                        <input id="bf-website" name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
                      </div>
                    </form>
                  </FormProvider>
                </>
              )}
            </div>
          </div>
        </>
      ) : null}
    </dialog>
  );
}
