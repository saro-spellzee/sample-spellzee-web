import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
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
import { focusField } from "./fields";

/** Links and buttons with this attribute open the dialog instead of navigating (see Button's `action`). */
const TRIGGER = '[data-action="book"]';

/** Whether this engine can show a modal <dialog>. Where it can't, the CTAs keep their plain #book link. */
const canShowModal = () => typeof HTMLDialogElement === "function" && typeof HTMLDialogElement.prototype.showModal === "function";

export type BookingStep = 1 | 2;

/** Where the booking request stands. `sent` carries the booking as the server accepted it, for the confirmation. */
export type Submission = { status: "idle" } | { status: "sending" } | { status: "failed" } | { status: "sent"; values: BookingValues };

const IDLE: Submission = { status: "idle" };
const SENDING: Submission = { status: "sending" };
const FAILED: Submission = { status: "failed" };

/**
 * Everything the booking dialog does, apart from drawing it: opening from any `data-action="book"`
 * CTA, the native <dialog>'s modal state, focus, the two steps and sending the booking.
 *
 * One React Hook Form instance holds both steps; `bookingSchema` validates it here and
 * again in the `requestDemo` Server Action, which delivers it. The confirmation shows only
 * once the server has accepted the request. Answers are kept when the dialog is closed and
 * reopened, and cleared after a completed booking (as in the export).
 */
export function useBookingDialog() {
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
  const [step, setStep] = useState<BookingStep>(1);
  const [month, setMonth] = useState(0);
  const [submission, setSubmission] = useState<Submission>(IDLE);
  const pending = submission.status === "sending";
  const done = submission.status === "sent" ? submission.values : null;
  /** Drops a delivery-failure message; a request still on its way keeps going. */
  const clearFailure = () => setSubmission((s) => (s.status === "failed" ? IDLE : s));

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
      if (!link || !canShowModal()) return;
      // Capture phase: runs before next/link, which then sees the prevented default and stays put.
      e.preventDefault();
      opener.current = link;
      if (finished.current) {
        finished.current = false;
        reset(bookingDefaults);
        setStep(1);
        setMonth(0);
        setSubmission(IDLE);
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
  const revealFirstError = (current: BookingStep) => {
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
    clearFailure();
    if (await trigger(BOOKING_STEPS[0])) setStep(2);
    else revealFirstError(1);
  };

  const send = async (values: BookingValues, trap: string) => {
    setSubmission(SENDING);
    let result: BookingResult;
    try {
      result = await requestDemo({ ...values, [HONEYPOT_FIELD]: trap });
    } catch {
      // Offline, or the action itself failed: never a confirmation.
      result = { status: "failed" };
    }
    if (result.status === "success") return setSubmission({ status: "sent", values });
    if (result.status === "invalid") {
      // The server's check disagreed with the dialog's (a stale page, a clock edge): show its messages.
      for (const [field, message] of Object.entries(result.errors) as [BookingField, string][]) {
        setError(field, { type: "server", message });
      }
      if (revealFirstError(2)) return setSubmission(IDLE);
    }
    setSubmission(FAILED);
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
              clearFailure();
              revealFirstError(2);
            },
          )();
    void run.finally(() => {
      busy.current = false;
    });
  };

  const back = () => {
    clearErrors();
    clearFailure();
    setStep(1);
  };

  const fieldError = BOOKING_STEPS[step - 1].map((f) => errors[f]?.message).find(Boolean);
  /** The step's error line: the first failing field's message, or the delivery failure. */
  const message = fieldError ?? (submission.status === "failed" ? BOOKING_FAILED : "");

  return { dialogRef, form, open, today, step, month, setMonth, pending, done, message, close, back, onSubmit };
}
