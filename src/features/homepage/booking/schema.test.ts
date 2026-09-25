import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { booking } from "../content";
import { BOOKING_FAILED, bookingDefaults, bookingSchema, type BookingValues } from "./schema";

const { errors } = booking;

const valid: BookingValues = {
  ...bookingDefaults,
  kid: "Aarav",
  grade: "Grade 3",
  difficulties: ["read"],
  parent: "Meera Iyer",
  phone: "98765 43210",
  consent: true,
};

/** Every field's first message, keyed by field. */
function problems(input: unknown) {
  const r = bookingSchema.safeParse(input);
  if (r.success) return {};
  const out: Record<string, string> = {};
  for (const issue of r.error.issues) out[String(issue.path[0])] ??= issue.message;
  return out;
}

describe("bookingSchema", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 8, 24, 10, 0)); // Thursday 24 September 2026
  });
  afterEach(() => vi.useRealTimers());

  it("accepts a complete call-back request and normalises it", () => {
    const r = bookingSchema.safeParse({ ...valid, kid: "  Aarav ", parent: " Meera Iyer ", phone: "+91 98765 43210" });
    expect(r.success).toBe(true);
    expect(r.data).toMatchObject({ kid: "Aarav", parent: "Meera Iyer", phone: "9876543210" });
  });

  it("gives each missing or invalid field its own message from content.ts", () => {
    expect(problems({ ...valid, kid: " A " })).toEqual({ kid: errors.kid });
    expect(problems({ ...valid, grade: "   " })).toEqual({ grade: errors.grade });
    expect(problems({ ...valid, difficulties: [] })).toEqual({ difficulties: errors.difficulties });
    expect(problems({ ...valid, parent: "M" })).toEqual({ parent: errors.parent });
    expect(problems({ ...valid, phone: "12345 67890" })).toEqual({ phone: errors.phone });
    expect(problems({ ...valid, phone: "98765" })).toEqual({ phone: errors.phone });
    expect(problems({ ...valid, consent: false })).toEqual({ consent: errors.consent });
  });

  it("reports every failing field at once, so the dialog can focus the first on screen", () => {
    expect(Object.keys(problems({ ...bookingDefaults, mode: "schedule" }))).toEqual(["kid", "grade", "difficulties", "parent", "phone", "consent", "slot"]);
  });

  it("needs a bookable day and slot only when scheduling", () => {
    expect(problems({ ...valid, mode: "schedule" })).toEqual({ slot: errors.slot });
    expect(problems({ ...valid, mode: "schedule", date: "2026-09-26" })).toEqual({ slot: errors.slot });
    expect(problems({ ...valid, mode: "schedule", date: "2026-09-27", slot: "4:00 PM" })).toEqual({ slot: errors.slot }); // Sunday
    expect(problems({ ...valid, mode: "schedule", date: "2026-09-26", slot: "10:30 AM" })).toEqual({});
    expect(problems({ ...valid, mode: "call", date: "", slot: "" })).toEqual({});
  });

  it("refuses what only a hand-made request could send", () => {
    expect(problems({ ...valid, difficulties: ["read", "hacking"] })).toEqual({ difficulties: errors.difficulties });
    expect(problems({ ...valid, language: "Klingon" })).toEqual({ language: BOOKING_FAILED });
    expect(problems({ ...valid, mode: "visit" })).toHaveProperty("mode", BOOKING_FAILED);
    expect(problems({ ...valid, kid: "A".repeat(41) })).toEqual({ kid: errors.kid });
    expect(problems({ ...valid, date: "x".repeat(500) })).toEqual({ date: errors.slot });
    expect(problems({ ...valid, consent: "yes" })).toEqual({ consent: errors.consent });
    expect(problems(null)).not.toEqual({});
  });
});
