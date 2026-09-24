/**
 * Booking dialog state and rules, kept free of React so they can be tested directly.
 * Behaviour follows the export's logic class (bf state, bfNext, bfSubmit, calendar, slots).
 */
import { booking } from "../../content";

export type BookingMode = "call" | "schedule";

export type BookingState = {
  step: 1 | 2;
  kid: string;
  grade: string;
  difficulties: string[];
  parent: string;
  phone: string;
  consent: boolean;
  /** "" means English only; otherwise the added home language ("Tamil"). */
  language: string;
  mode: BookingMode;
  /** Chosen day as YYYY-MM-DD, "" when none. */
  date: string;
  slot: string;
  /** Calendar month shown, as an offset from the current month (0–2). */
  month: number;
  error: string;
  done: boolean;
};

export const initialBooking: BookingState = {
  step: 1,
  kid: "",
  grade: "",
  difficulties: [],
  parent: "",
  phone: "",
  consent: false,
  language: "",
  mode: "call",
  date: "",
  slot: "",
  month: 0,
  error: "",
  done: false,
};

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

/** Step 1 check: returns the error to show, or "" when the step is complete. */
export function validateChild(s: Pick<BookingState, "kid" | "grade" | "difficulties">): string {
  if (s.kid.trim().length < 2) return booking.errors.kid;
  if (!s.grade.trim()) return booking.errors.grade;
  if (s.difficulties.length === 0) return booking.errors.difficulties;
  return "";
}

/** Keeps the 10-digit national number: drops spaces and a leading 91 country code. */
export function phoneDigits(raw: string): string {
  return raw.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
}

/** Step 2 check: returns the error to show, or "" when the booking can be sent. */
export function validateParent(s: Pick<BookingState, "parent" | "phone" | "mode" | "date" | "slot" | "consent">): string {
  if (s.parent.trim().length < 2) return booking.errors.parent;
  if (!/^[6-9]\d{9}$/.test(phoneDigits(s.phone))) return booking.errors.phone;
  if (s.mode === "schedule" && (!s.date || !s.slot)) return booking.errors.slot;
  if (!s.consent) return booking.errors.consent;
  return "";
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

/** "Sat, 3 Oct at 4:30 PM" */
export function describeSlot(iso: string, slot: string): string {
  if (!iso || !slot) return "";
  return fromIso(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) + booking.schedule.at + slot;
}
