import { describe, expect, it } from "vitest";
import { booking } from "../../content";
import { calendarMonth, describeSlot, difficultyText, isBookable, phoneDigits, possessive, slotsFor, toggleDifficulty } from "./model";

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

describe("phoneDigits", () => {
  it("accepts a number typed with spaces or the +91 country code", () => {
    expect(phoneDigits("98765 43210")).toBe("9876543210");
    expect(phoneDigits("+91 98765 43210")).toBe("9876543210");
    expect(phoneDigits("919876543210")).toBe("9876543210");
  });
});

describe("isBookable (the server's slot check)", () => {
  // Thursday 24 September 2026, mid-afternoon.
  const now = new Date(2026, 8, 24, 15, 30);

  it("accepts a slot the calendar offers", () => {
    expect(isBookable("2026-09-26", "10:30 AM", now)).toBe(true); // Saturday morning
    expect(isBookable("2026-09-25", "3:00 PM", now)).toBe(true); // Friday afternoon
  });

  it("refuses Sundays, slots the day doesn't have, and malformed or impossible days", () => {
    expect(isBookable("2026-09-27", "3:00 PM", now)).toBe(false); // Sunday
    expect(isBookable("2026-09-25", "10:30 AM", now)).toBe(false); // weekday mornings are closed
    expect(isBookable("2026-09-25", "", now)).toBe(false);
    expect(isBookable("", "3:00 PM", now)).toBe(false);
    expect(isBookable("2026-02-30", "3:00 PM", now)).toBe(false);
    expect(isBookable("26/09/2026", "10:30 AM", now)).toBe(false);
  });

  it("allows a day of slack either side for a visitor in another time zone, and no more", () => {
    expect(isBookable("2026-09-24", "4:00 PM", now)).toBe(true); // today
    expect(isBookable("2026-09-23", "4:00 PM", now)).toBe(false); // yesterday
    expect(isBookable("2026-11-24", "4:00 PM", now)).toBe(true); // 61 days out
    expect(isBookable("2026-11-25", "4:00 PM", now)).toBe(false); // 62 days out
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
