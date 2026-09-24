import { describe, expect, it } from "vitest";
import { booking } from "../../content";
import {
  calendarMonth,
  describeSlot,
  difficultyText,
  initialBooking,
  phoneDigits,
  possessive,
  slotsFor,
  toggleDifficulty,
  validateChild,
  validateParent,
} from "./model";

const { errors } = booking;
const unsure = booking.difficulties.unsureId;

describe("toggleDifficulty", () => {
  it("adds and removes areas", () => {
    expect(toggleDifficulty([], "read")).toEqual(["read"]);
    expect(toggleDifficulty(["read", "comp"], "read")).toEqual(["comp"]);
  });

  it("keeps 'Not sure yet' exclusive with the other areas", () => {
    expect(toggleDifficulty(["read", "comp"], unsure)).toEqual([unsure]);
    expect(toggleDifficulty([unsure], "read")).toEqual(["read"]);
    expect(toggleDifficulty([unsure], unsure)).toEqual([]);
  });

  it("describes the picks in list order", () => {
    expect(difficultyText(["comp", "read"])).toBe("Reading & Spelling, Comprehension");
    expect(difficultyText([])).toBe(booking.difficulties.none);
  });
});

describe("validateChild", () => {
  const ok = { kid: "Aarav", grade: "Grade 3", difficulties: ["read"] };
  it("asks for the name, then the grade, then an area", () => {
    expect(validateChild({ ...ok, kid: " A " })).toBe(errors.kid);
    expect(validateChild({ ...ok, grade: "  " })).toBe(errors.grade);
    expect(validateChild({ ...ok, difficulties: [] })).toBe(errors.difficulties);
    expect(validateChild(ok)).toBe("");
  });
});

describe("validateParent", () => {
  const ok = { ...initialBooking, parent: "Meera Iyer", phone: "98765 43210", consent: true };
  it("needs a name, a valid Indian mobile and consent", () => {
    expect(validateParent({ ...ok, parent: "M" })).toBe(errors.parent);
    expect(validateParent({ ...ok, phone: "12345 67890" })).toBe(errors.phone);
    expect(validateParent({ ...ok, phone: "98765" })).toBe(errors.phone);
    expect(validateParent({ ...ok, consent: false })).toBe(errors.consent);
    expect(validateParent(ok)).toBe("");
  });

  it("needs a day and a slot when scheduling", () => {
    expect(validateParent({ ...ok, mode: "schedule" })).toBe(errors.slot);
    expect(validateParent({ ...ok, mode: "schedule", date: "2026-10-01" })).toBe(errors.slot);
    expect(validateParent({ ...ok, mode: "schedule", date: "2026-10-01", slot: "4:00 PM" })).toBe("");
  });

  it("accepts a number typed with the +91 country code", () => {
    expect(phoneDigits("+91 98765 43210")).toBe("9876543210");
    expect(phoneDigits("919876543210")).toBe("9876543210");
  });
});

describe("possessive", () => {
  it("uses the child's name when given", () => {
    expect(possessive(" Aarav ")).toBe("Aarav’s");
    expect(possessive("")).toBe(booking.possessive.fallback);
  });
});

describe("calendarMonth", () => {
  // Thursday 24 September 2026.
  const today = new Date(2026, 8, 24, 15, 30);

  it("opens on the current month with bookable days from tomorrow, Sundays closed", () => {
    const m = calendarMonth(today, 0);
    const day = (n: number) => m.days[n - 1];

    expect(m.leading).toBe(new Date(2026, 8, 1).getDay());
    expect(m.days).toHaveLength(30);
    expect(day(24).today).toBe(true);
    expect(day(24).disabled).toBe(true); // today
    expect(day(25).disabled).toBe(false); // tomorrow
    expect(day(27).disabled).toBe(true); // a Sunday
    expect(day(27).label.endsWith(booking.schedule.unavailable)).toBe(true);
    expect(m.canGoBack).toBe(false);
    expect(m.canGoForward).toBe(true);
  });

  it("stops 60 days out and at the month that contains that day", () => {
    const last = calendarMonth(today, 2); // November: 60 days out is 23 November
    expect(last.days[22].disabled).toBe(false);
    expect(last.days[23].disabled).toBe(true);
    expect(last.canGoForward).toBe(false);
    expect(calendarMonth(today, 5).days).toHaveLength(last.days.length); // clamped
  });
});

describe("slotsFor", () => {
  it("offers weekday slots from 3 PM and Saturday slots from 10 AM, the last at 8:30 PM", () => {
    const weekday = slotsFor(new Date(2026, 8, 25));
    expect(weekday[0]).toBe("3:00 PM");
    expect(weekday.at(-1)).toBe("8:30 PM");
    expect(weekday).toHaveLength(12);

    const saturday = slotsFor(new Date(2026, 8, 26));
    expect(saturday[0]).toBe("10:00 AM");
    expect(saturday).toContain("12:00 PM");
    expect(saturday.at(-1)).toBe("8:30 PM");
  });

  it("describes the chosen slot", () => {
    expect(describeSlot("2026-09-26", "4:30 PM")).toMatch(/26 Sept? at 4:30 PM$/);
    expect(describeSlot("", "4:30 PM")).toBe("");
  });
});
