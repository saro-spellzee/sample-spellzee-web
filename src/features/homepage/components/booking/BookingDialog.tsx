"use client";

import { FormProvider } from "react-hook-form";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { HONEYPOT_FIELD } from "../../booking/schema";
import { booking } from "../../content/booking";
import { BookingDone } from "./BookingDone";
import { BookingSide } from "./BookingSide";
import { ChildStep } from "./ChildStep";
import { ParentStep } from "./ParentStep";
import { bf } from "./styles";
import { useBookingDialog } from "./useBookingDialog";

/**
 * The "Book a Free Demo Class" dialog: two steps (about the child, then the parent's
 * details and how to book), then a confirmation. Every CTA marked `data-action="book"`
 * opens it; without JavaScript (or modal <dialog> support) those links still go to #book. A native modal <dialog>
 * keeps focus inside and closes on Escape. Behaviour lives in `useBookingDialog`.
 */
export function BookingDialog() {
  const { dialogRef, form, open, today, step, month, setMonth, pending, done, message, close, back, onSubmit } = useBookingDialog();
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
                className="absolute top-[18px] right-[18px] z-3 flex size-[38px] cursor-pointer items-center justify-center rounded-full border-0 bg-hairline text-slate transition-colors duration-200 hover:bg-field-line focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35"
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
