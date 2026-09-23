"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { footer } from "../content";

/**
 * Footer newsletter sign-up. Native email validation; the button is disabled while pending.
 * TODO(backend): there is no subscribe endpoint yet. Replace `subscribe` with the real
 * API call, then add success and error feedback (an aria-live message).
 */
async function subscribe(email: string): Promise<void> {
  void email;
}

export function NewsletterForm() {
  const { newsletter } = footer;
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    const form = e.currentTarget;
    const email = String(new FormData(form).get("email") ?? "");
    setPending(true);
    try {
      await subscribe(email);
      form.reset();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-3.5 flex gap-2">
      <label htmlFor="nl-email" className="sr-only">
        {newsletter.label}
      </label>
      <input
        id="nl-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder={newsletter.placeholder}
        className="min-h-12 min-w-0 flex-1 rounded-full border border-night-line bg-[#16244C] px-[18px] text-sm font-medium text-white placeholder:text-[#8C97BD] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-periwinkle/50"
      />
      <Button type="submit" size="field" disabled={pending}>
        {pending ? newsletter.pending : newsletter.submit}
      </Button>
    </form>
  );
}
