"use server";

import { deliverSubscription } from "./deliver";
import { HONEYPOT_FIELD, newsletterSchema, type NewsletterState } from "./schema";

/**
 * Server Action behind the footer newsletter form. It re-validates with the same schema
 * the client uses (the client check is only UX), drops honeypot hits quietly, and hands
 * valid sign-ups to the configured webhook.
 *
 * Anonymous and public: rate limiting belongs at the edge/WAF or the receiving service
 * (deployment decision; see the forms phase report).
 */
export async function subscribeToNewsletter(_prev: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const trap = formData.get(HONEYPOT_FIELD);
  // Tell a bot it worked, so it has no signal to adapt to. Nothing is delivered.
  if (typeof trap === "string" && trap.trim() !== "") return { status: "success" };

  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    const errors: Extract<NewsletterState, { status: "invalid" }>["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "email" && !errors.email) errors.email = issue.message;
    }
    return { status: "invalid", errors };
  }

  const delivered = await deliverSubscription(parsed.data.email);
  return delivered ? { status: "success" } : { status: "failed" };
}
