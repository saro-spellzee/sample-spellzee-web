"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { booking } from "../../content";
import { BookingDone } from "./BookingDone";
import { BookingSide } from "./BookingSide";
import { ChildStep } from "./ChildStep";
import { formatPhone, initialBooking, phoneDigits, validateChild, validateParent, type BookingState } from "./model";
import { ParentStep } from "./ParentStep";
import { bf } from "./styles";

/** Links and buttons with this attribute open the dialog instead of navigating (see Button's `action`). */
const TRIGGER = '[data-action="book"]';

/**
 * The "Book a Free Demo Class" dialog: two steps (about the child, then the parent's
 * details and how to book), then a confirmation. Every CTA marked `data-action="book"`
 * opens it; without JavaScript those links still go to #book. A native modal <dialog>
 * keeps focus inside and closes on Escape. The form keeps its answers when closed and
 * reopened, and starts fresh after a completed booking (as in the export).
 */
export function BookingDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState<Date | null>(null);
  const [state, setState] = useState<BookingState>(initialBooking);
  const update = useCallback((patch: Partial<BookingState>) => setState((s) => ({ ...s, ...patch })), []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const trigger = e.target instanceof Element ? e.target.closest<HTMLElement>(TRIGGER) : null;
      if (!trigger) return;
      // Capture phase: runs before next/link, which then sees the prevented default and stays put.
      e.preventDefault();
      opener.current = trigger;
      setToday(new Date());
      setState((s) => (s.done ? initialBooking : s));
      setOpen(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) {
      dialog.close();
      opener.current?.focus();
    }
  }, [open]);

  // Each view starts at its heading, so screen readers announce where they are.
  useEffect(() => {
    if (open) dialogRef.current?.querySelector<HTMLElement>("#bf-title")?.focus();
  }, [open, state.step, state.done]);

  const close = () => setOpen(false);

  const next = () => {
    const error = validateChild(state);
    if (error) return update({ error });
    update({ step: 2, kid: state.kid.trim(), grade: state.grade.trim(), error: "" });
  };

  const submit = () => {
    const error = validateParent(state);
    if (error) return update({ error });
    // TODO(product): send { kid, grade, difficulties, parent, phone, language, mode, date, slot }
    // to the CRM / calendar here (the export leaves this to the developer). Until then the
    // confirmation shows without the request going anywhere.
    update({ done: true, parent: state.parent.trim(), phone: formatPhone(phoneDigits(state.phone)), error: "" });
  };

  const step = booking.steps[state.step - 1];

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
              {state.done ? (
                <BookingDone state={state} onDone={close} />
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div aria-hidden="true" className="flex gap-1.5">
                      {[1, 2].map((n) => (
                        <i
                          key={n}
                          className={cn(
                            "h-1.5 w-7 rounded-md transition-colors duration-300",
                            n <= state.step ? "bg-linear-90 from-spectrum-blue to-spectrum-violet" : "bg-field-line",
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-fine font-bold text-faint">
                      {booking.progress.replace("{n}", String(state.step)).replace("{name}", step.name)}
                    </span>
                  </div>
                  <h2 id="bf-title" tabIndex={-1} className={cn(bf.title, "pr-11 dlg:pr-0")}>
                    {step.title}
                  </h2>
                  {state.step === 1 ? (
                    <ChildStep state={state} update={update} onNext={next} />
                  ) : (
                    <ParentStep state={state} update={update} onBack={() => update({ step: 1, error: "" })} onSubmit={submit} today={today} />
                  )}
                </>
              )}
            </div>
          </div>
        </>
      ) : null}
    </dialog>
  );
}
