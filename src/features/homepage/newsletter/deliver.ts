import "server-only";

/**
 * Hands a newsletter sign-up to whatever service collects them. Server-side only:
 * imported by `actions.ts` and nothing else.
 *
 * TODO(product): there is no newsletter backend yet. Point `NEWSLETTER_WEBHOOK_URL` at
 * the real receiver (mailing-list API, CRM, automation webhook). It gets
 * `POST {"email","source","submittedAt"}` as JSON, plus `Authorization: Bearer <secret>`
 * when `NEWSLETTER_WEBHOOK_SECRET` is set. Any 2xx counts as success.
 *
 * With no URL configured: production fails loudly (server error log + a generic error to
 * the visitor, never a fake "subscribed"); development and tests log a masked address.
 * Production also refuses a URL that isn't https://, so an address never travels in clear text.
 */

const TIMEOUT_MS = 8000;

export const NEWSLETTER_SOURCE = "homepage-footer";

/** `pa****@example.com`: enough to recognise in a dev log, not a full address. */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at < 1) return "***";
  return `${email.slice(0, Math.min(2, at))}****${email.slice(at)}`;
}

export async function deliverSubscription(email: string): Promise<boolean> {
  const url = process.env.NEWSLETTER_WEBHOOK_URL?.trim();

  if (!url) {
    if (process.env.NODE_ENV === "production") {
      console.error("[newsletter] NEWSLETTER_WEBHOOK_URL is not set; the sign-up was NOT saved.");
      return false;
    }
    console.info(`[newsletter] NEWSLETTER_WEBHOOK_URL not set (dev): would subscribe ${maskEmail(email)}`);
    return true;
  }

  if (process.env.NODE_ENV === "production" && !/^https:\/\//i.test(url)) {
    console.error("[newsletter] NEWSLETTER_WEBHOOK_URL must be an https:// URL; the sign-up was NOT sent.");
    return false;
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const secret = process.env.NEWSLETTER_WEBHOOK_SECRET?.trim();
  if (secret) headers.Authorization = `Bearer ${secret}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, source: NEWSLETTER_SOURCE, submittedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[newsletter] webhook responded ${res.status} for ${maskEmail(email)}`);
      return false;
    }
    return true;
  } catch (err) {
    const reason = err instanceof Error ? err.name : "unknown error";
    console.error(`[newsletter] webhook request failed (${reason}) for ${maskEmail(email)}`);
    return false;
  }
}
