"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { footer } from "../content";
import { subscribeToNewsletter } from "../newsletter/actions";
import { HONEYPOT_FIELD, initialNewsletterState, newsletterSchema, type NewsletterState, type NewsletterValues } from "../newsletter/schema";

const ERROR_ID = "nl-email-error";

/**
 * Footer newsletter sign-up. React Hook Form validates with the shared Zod schema
 * (on blur, then on change once touched); the Server Action validates again and
 * delivers. The Server Action is called from the submit handler, not through
 * `useActionState`, so a network failure becomes a message instead of an error boundary.
 */
export function NewsletterForm() {
  const { newsletter } = footer;
  const inFlight = useRef(false);
  const [result, setResult] = useState<NewsletterState>(initialNewsletterState);
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
    setResult(initialNewsletterState);
    let next: NewsletterState;
    try {
      next = await subscribeToNewsletter(initialNewsletterState, new FormData(form));
    } catch {
      next = { status: "failed" };
    } finally {
      inFlight.current = false;
    }
    setResult(next);
    if (next.status === "success") reset();
    else if (next.status === "invalid" && next.errors.email) {
      setError("email", { type: "server", message: next.errors.email }, { shouldFocus: true });
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    return handleSubmit(() => send(form))(e);
  };

  const emailError = errors.email?.message;
  const status = result.status === "success" ? newsletter.success : result.status === "failed" ? newsletter.errors.failed : "";

  return (
    <form onSubmit={onSubmit} noValidate className="mt-3.5">
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
          className="min-h-12 min-w-0 flex-1 rounded-full border border-night-line bg-[#16244C] px-[18px] text-sm font-medium text-white placeholder:text-[#8C97BD] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-periwinkle/50 aria-invalid:border-[#FF8FA6]"
        />
        <Button type="submit" size="field" disabled={isSubmitting}>
          {isSubmitting ? newsletter.pending : newsletter.submit}
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
