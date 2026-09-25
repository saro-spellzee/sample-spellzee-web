/**
 * Booking dialog rules, kept free of React so they can be tested directly and shared with
 * the Server Action (`../../booking/schema.ts`). Behaviour follows the export's logic class
 * (bfNext, bfSubmit, calendar, slots).
 */
import { booking } from "../../content/booking";

/** Toggles a difficulty; "Not sure yet" is exclusive with the others. */
export function toggleDifficulty(current: string[], id: string): string[] {
  const { unsureId } = booking.difficulties;
  const on = current.includes(id);
  if (id === unsureId) return on ? [] : [unsureId];
  const rest = current.filter((d) => d !== unsureId);
  return on ? rest.filter((d) => d !== id) : [...rest, id];
}

/** The chosen difficulties' titles, in list order ("Not selected" when none). */
export function difficultyText(ids: string[]): string {
  const titles = booking.difficulties.items.filter((d) => ids.includes(d.id)).map((d) => d.title);
  return titles.join(", ") || booking.difficulties.none;
}

/** "Aarav’s", or "your child’s" before a name is given. */
export function possessive(kid: string): string {
  const name = kid.trim();
  return name ? name + booking.possessive.suffix : booking.possessive.fallback;
}

export function languageText(language: string): string {
  return language ? booking.language.join + language : booking.language.base;
}

/** Keeps the 10-digit national number: drops spaces and a leading 91 country code. */
export function phoneDigits(raw: string): string {
  return raw.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
}

/** "98765 43210" */
export function formatPhone(digits: string): string {
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

const addDays = (d: Date, n: number) => {
  const out = new Date(d);
  out.setDate(d.getDate() + n);
  return out;
};

export type CalendarDay = { day: number; iso: string; label: string; disabled: boolean; today: boolean };

export type CalendarMonth = {
  title: string;
  /** Empty cells before the 1st, so day 1 sits under its weekday. */
  leading: number;
  days: CalendarDay[];
  canGoBack: boolean;
  canGoForward: boolean;
};

/**
 * A month grid for the demo calendar. Bookable days run from tomorrow to 60 days out,
 * Sundays excluded. `offset` is months after the current one (clamped to 0–2).
 */
export function calendarMonth(today: Date, offset: number): CalendarMonth {
  const d0 = startOfDay(today);
  const min = addDays(d0, 1);
  const max = addDays(d0, 60);
  const month = Math.max(0, Math.min(2, offset));
  const first = new Date(d0.getFullYear(), d0.getMonth() + month, 1);
  const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const lastMonth = new Date(max.getFullYear(), max.getMonth(), 1);
  const todayIso = isoDate(d0);
  const days: CalendarDay[] = [];
  for (let k = 1; k <= count; k++) {
    const d = new Date(first.getFullYear(), first.getMonth(), k);
    const disabled = d < min || d > max || d.getDay() === 0;
    const label = d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }) + (disabled ? booking.schedule.unavailable : "");
    days.push({ day: k, iso: isoDate(d), label, disabled, today: isoDate(d) === todayIso });
  }
  return {
    title: first.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    leading: first.getDay(),
    days,
    canGoBack: month > 0,
    canGoForward: first < lastMonth,
  };
}

/** Parses a YYYY-MM-DD day as local midnight. */
export function fromIso(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

/** 30-minute demo slots: Saturdays from 10 AM, weekdays from 3 PM, the last one at 8:30 PM. */
export function slotsFor(day: Date): string[] {
  const out: string[] = [];
  const start = day.getDay() === 6 ? 10 * 60 : 15 * 60;
  for (let m = start; m <= 20 * 60 + 30; m += 30) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    out.push(`${((h + 11) % 12) + 1}:${mm ? "30" : "00"}${h < 12 ? " AM" : " PM"}`);
  }
  return out;
}

export function slotHint(day: Date): string {
  return day.getDay() === 6 ? booking.schedule.saturdayHint : booking.schedule.weekdayHint;
}

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Server-side check that a scheduled demo is one the calendar could have offered: a real,
 * non-Sunday day and one of that day's slots. The calendar offers tomorrow to 60 days out
 * in the visitor's time zone; this allows today to 61 days out in the checker's own, so a
 * visitor whose clock or time zone differs from the server's is never refused.
 */
export function isBookable(iso: string, slot: string, now: Date = new Date()): boolean {
  if (!ISO_DAY.test(iso)) return false;
  const day = fromIso(iso);
  // Rejects days that don't exist: 2026-02-30 would roll over into March.
  if (Number.isNaN(day.getTime()) || isoDate(day) !== iso || day.getDay() === 0) return false;
  const first = startOfDay(now);
  return day >= first && day <= addDays(first, 61) && slotsFor(day).includes(slot);
}

/** "Sat, 3 Oct at 4:30 PM" */
export function describeSlot(iso: string, slot: string): string {
  if (!iso || !slot) return "";
  return fromIso(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) + booking.schedule.at + slot;
}
