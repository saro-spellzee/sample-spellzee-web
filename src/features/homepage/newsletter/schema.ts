import { maxLength, minLength, object, regex, string, trim, type infer as Infer } from "zod/mini";
import { newsletter } from "../content/footer";

const { errors } = newsletter;

/** RFC 5321 caps a forward/reverse path at 256 octets, i.e. 254 for the address itself. */
export const EMAIL_MAX_LENGTH = 254;

/**
 * Zod's own email pattern (zod/v4/core regexes `email`), copied so the client bundle
 * doesn't pull in Zod's whole regex table (~20 KB gzip) for one pattern.
 */
const EMAIL_PATTERN = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;

/**
 * The one schema for the footer newsletter form. The client resolver (React Hook Form)
 * and the Server Action both validate with it, so the rules can't drift.
 * `zod/mini` keeps the client bundle small (the form hydrates on every page view).
 */
export const newsletterSchema = object({
  email: string({ error: errors.required }).check(
    trim(),
    minLength(1, { error: errors.required, abort: true }),
    maxLength(EMAIL_MAX_LENGTH, { error: errors.tooLong, abort: true }),
    regex(EMAIL_PATTERN, { error: errors.invalid }),
  ),
});

export type NewsletterValues = Infer<typeof newsletterSchema>;

/** Name of the honeypot input. Real people never see it; a non-empty value means a bot. */
export const HONEYPOT_FIELD = "website";

/** What the Server Action reports back to the form. Messages are looked up client side. */
export type NewsletterState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "invalid"; errors: Partial<Record<keyof NewsletterValues, string>> }
  | { status: "failed" };

export const initialNewsletterState: NewsletterState = { status: "idle" };
