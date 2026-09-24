"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useRef, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { newsletter } from "../content/footer";
import { subscribeToNewsletter } from "../newsletter/actions";
import { HONEYPOT_FIELD, initialNewsletterState, newsletterSchema, type NewsletterState, type NewsletterValues } from "../newsletter/schema";

const ERROR_ID = "nl-email-error";

/**
 * Footer newsletter sign-up. React Hook Form validates with the shared Zod schema
 * (on blur, then on change once touched); the Server Action validates again and
 * delivers.
 *
 * Two paths to the same Server Action:
 * - Before hydration (slow phone, JS still loading or failed) the form posts natively to
 *   the action through `useActionState`, so a tap isn't lost (Safari doesn't replay it) and
 *   the email never ends up in a GET query string. The server's answer renders as `served`.
 * - Once hydrated, the submit handler always prevents that post and calls the action itself
 *   after client validation, so a network failure becomes a message, not an error boundary.
 *
 * The input is 16px below `sm` (the design draws 14px) so iOS Safari doesn't zoom on focus.
 */
export function NewsletterForm() {
  const inFlight = useRef(false);
  const [served, formAction, postPending] = useActionState(subscribeToNewsletter, initialNewsletterState);
  /** The result of a client-side submit; until there is one, show what the server rendered. */
  const [sent, setSent] = useState<NewsletterState | null>(null);
  const result = sent ?? served;
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  const send = async (form: HTMLFormElement) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSent(initialNewsletterState);
    let next: NewsletterState;
    try {
      next = await subscribeToNewsletter(initialNewsletterState, new FormData(form));
    } catch {
      next = { status: "failed" };
    } finally {
      inFlight.current = false;
    }
    setSent(next);
    if (next.status === "success") reset();
    else if (next.status === "invalid" && next.errors.email) {
      setError("email", { type: "server", message: next.errors.email }, { shouldFocus: true });
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    return handleSubmit(() => send(form))(e);
  };

  const emailError = errors.email?.message ?? (!sent && served.status === "invalid" ? served.errors.email : undefined);
  const busy = isSubmitting || postPending;
  const status = result.status === "success" ? newsletter.success : result.status === "failed" ? newsletter.errors.failed : "";

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="mt-3.5">
      <div className="flex gap-2">
        <label htmlFor="nl-email" className="sr-only">
          {newsletter.label}
        </label>
        <input
          id="nl-email"
          type="email"
          inputMode="email"
          required
          autoComplete="email"
          spellCheck={false}
          placeholder={newsletter.placeholder}
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? ERROR_ID : undefined}
          {...register("email")}
          className="min-h-12 min-w-0 flex-1 rounded-full border border-night-line bg-[#16244C] px-[18px] text-base font-medium text-white sm:text-sm placeholder:text-[#8C97BD] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-periwinkle/50 aria-invalid:border-[#FF8FA6]"
        />
        <Button type="submit" size="field" disabled={busy}>
          {busy ? newsletter.pending : newsletter.submit}
        </Button>
      </div>
      {/* Honeypot: off-screen, hidden from assistive tech and skipped by Tab. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="nl-website">{newsletter.honeypotLabel}</label>
        <input id="nl-website" name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      {emailError ? (
        <p id={ERROR_ID} className="mt-2 pl-[18px] text-[13px] font-semibold text-[#FFB3C1]">
          {emailError}
        </p>
      ) : null}
      <p
        role="status"
        className={cn("mt-2 pl-[18px] text-[13px] font-semibold empty:mt-0", result.status === "failed" ? "text-[#FFB3C1]" : "text-[#9FE3BF]")}
      >
        {status}
      </p>
    </form>
  );
}
