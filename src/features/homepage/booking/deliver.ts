import "server-only";
import { possessive } from "../components/booking/model";
import { booking } from "../content/booking";
import type { BookingValues } from "./schema";

/**
 * Hands a demo booking to whatever collects leads (CRM, calendar, automation webhook).
 * Server-side only: imported by `actions.ts` and nothing else.
 *
 * TODO(product): there is no leads backend yet. Point `LEADS_WEBHOOK_URL` at the real
 * receiver. It gets `POST` JSON (see `leadPayload`) plus `Authorization: Bearer <secret>`
 * when `LEADS_WEBHOOK_SECRET` is set. Any 2xx counts as success.
 *
 * With no URL configured: production fails loudly (server error log + a generic error to
 * the parent, never a fake confirmation); development and tests log a masked summary.
 * Log lines never carry the parent's or child's name or the full phone number.
 */

const TIMEOUT_MS = 8000;

export const BOOKING_SOURCE = "homepage-booking-dialog";

/** `******3210`: enough to spot a test booking in a dev log, not a phone number. */
export function maskPhone(digits: string): string {
  return `******${digits.slice(-4)}`;
}

/** The consent sentence exactly as the parent saw it, kept with the lead as a record (DPDP). */
export function consentWording(kid: string): string {
  const { consent } = booking;
  return consent.before + possessive(kid) + consent.after + consent.link.label + consent.end;
}

/** Only what a counsellor needs to call back and run the demo. */
export function leadPayload(v: BookingValues, requestId: string, now: Date = new Date()) {
  const submittedAt = now.toISOString();
  return {
    type: "demo-booking",
    source: BOOKING_SOURCE,
    requestId,
    submittedAt,
    child: { name: v.kid, grade: v.grade, difficulties: [...new Set(v.difficulties)] },
    parent: { name: v.parent, phone: `+91${v.phone}` },
    // TODO(product): slot times carry no time zone; they're the times the calendar showed.
    booking: v.mode === "schedule" ? { mode: v.mode, date: v.date, time: v.slot } : { mode: v.mode },
    languages: v.language ? [booking.language.base, v.language] : [booking.language.base],
    consent: { given: true, at: submittedAt, wording: consentWording(v.kid) },
  };
}

export async function deliverBooking(values: BookingValues, requestId: string): Promise<boolean> {
  const url = process.env.LEADS_WEBHOOK_URL?.trim();

  if (!url) {
    if (process.env.NODE_ENV === "production") {
      console.error(`[booking] LEADS_WEBHOOK_URL is not set; demo request ${requestId} was NOT saved.`);
      return false;
    }
    console.info(`[booking] LEADS_WEBHOOK_URL not set (dev): would send a "${values.mode}" demo request for ${maskPhone(values.phone)}`);
    return true;
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const secret = process.env.LEADS_WEBHOOK_SECRET?.trim();
  if (secret) headers.Authorization = `Bearer ${secret}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(leadPayload(values, requestId)),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[booking] webhook responded ${res.status} for demo request ${requestId}`);
      return false;
    }
    return true;
  } catch (err) {
    const reason = err instanceof Error ? err.name : "unknown error";
    console.error(`[booking] webhook request failed (${reason}) for demo request ${requestId}`);
    return false;
  }
}
