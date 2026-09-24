"use server";

import { deliverBooking } from "./deliver";
import { HONEYPOT_FIELD, bookingDefaults, bookingSchema, type BookingField, type BookingResult } from "./schema";

const isField = (key: PropertyKey): key is BookingField => typeof key === "string" && Object.hasOwn(bookingDefaults, key);

/**
 * Server Action behind the booking dialog. It re-validates with the schema the dialog uses
 * (the client check is only UX), drops honeypot hits quietly and hands valid requests to
 * the configured leads webhook. Takes the values object, not FormData: the dialog's steps
 * unmount as the parent moves between them, so the DOM never holds every field at once.
 *
 * Anonymous and public: rate limiting belongs at the edge/WAF or the receiving service
 * (deployment decision; see the forms phase report).
 */
export async function requestDemo(input: unknown): Promise<BookingResult> {
  const fields = typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
  const trap = fields[HONEYPOT_FIELD];
  // Tell a bot it worked, so it has no signal to adapt to. Nothing is delivered.
  if (typeof trap === "string" && trap.trim() !== "") return { status: "success" };

  const parsed = bookingSchema.safeParse(fields);
  if (!parsed.success) {
    const errors: Partial<Record<BookingField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field !== undefined && isField(field) && !errors[field]) errors[field] = issue.message;
    }
    return { status: "invalid", errors };
  }

  const delivered = await deliverBooking(parsed.data, crypto.randomUUID());
  return delivered ? { status: "success" } : { status: "failed" };
}
