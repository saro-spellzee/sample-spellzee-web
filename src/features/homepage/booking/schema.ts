import { array, boolean, enum as zEnum, maxLength, minLength, object, overwrite, refine, regex, string, trim, type infer as Infer } from "zod/mini";
import { isBookable, phoneDigits } from "../components/booking/model";
import { booking } from "../content";

const { errors } = booking;

/** Field lengths, shared with the inputs' `maxLength`. */
export const BOOKING_MAX = { kid: 40, grade: 20, parent: 60 } as const;

const DIFFICULTY_IDS = booking.difficulties.items.map((d) => d.id) as [string, ...string[]];
/** "" is English only; otherwise the home language added to it. */
const LANGUAGES = ["", ...booking.language.extras] as [string, ...string[]];
const MODES = ["call", "schedule"] as const;

/** Shown for any delivery failure, with the support number filled in. */
export const BOOKING_FAILED = errors.failed.replace("{phone}", booking.done.support.call.number);

/** An Indian mobile number: 10 digits starting 6-9 (after `phoneDigits` drops spaces and +91). */
const INDIAN_MOBILE = /^[6-9]\d{9}$/;

/**
 * The one schema for the booking dialog. The dialog's React Hook Form resolver and the
 * `requestDemo` Server Action both validate with it, so the rules can't drift. Messages
 * come from content.ts. No field-level `abort`: it would stop the slot check below from
 * running, and the dialog wants every error so it can show the first one in field order.
 */
export const bookingSchema = object({
  kid: string({ error: errors.kid }).check(trim(), minLength(2, { error: errors.kid }), maxLength(BOOKING_MAX.kid, { error: errors.kid })),
  grade: string({ error: errors.grade }).check(trim(), minLength(1, { error: errors.grade }), maxLength(BOOKING_MAX.grade, { error: errors.grade })),
  difficulties: array(zEnum(DIFFICULTY_IDS, { error: errors.difficulties }), { error: errors.difficulties }).check(
    minLength(1, { error: errors.difficulties }),
    maxLength(DIFFICULTY_IDS.length, { error: errors.difficulties }),
  ),
  parent: string({ error: errors.parent }).check(trim(), minLength(2, { error: errors.parent }), maxLength(BOOKING_MAX.parent, { error: errors.parent })),
  phone: string({ error: errors.phone }).check(overwrite(phoneDigits), regex(INDIAN_MOBILE, { error: errors.phone })),
  consent: boolean({ error: errors.consent }).check(refine((v) => v, { error: errors.consent })),
  // Chosen with buttons, so these only fail for a hand-made request: the generic message is enough.
  language: zEnum(LANGUAGES, { error: BOOKING_FAILED }),
  mode: zEnum(MODES, { error: BOOKING_FAILED }),
  // YYYY-MM-DD and "10:30 AM" at most; bounded even when unused (mode "call"), since only a script sends more.
  date: string({ error: errors.slot }).check(maxLength(10, { error: errors.slot })),
  slot: string({ error: errors.slot }).check(maxLength(8, { error: errors.slot })),
}).check(
  refine((v) => v.mode !== "schedule" || isBookable(v.date, v.slot), {
    path: ["slot"],
    error: errors.slot,
    // Run even when other fields fail, so a missing slot is reported alongside them; but not
    // when the input isn't an object at all (root issue, empty path) or these three are unusable.
    when: (payload) => payload.issues.every((issue) => !!issue.path?.length && !["mode", "date", "slot"].includes(String(issue.path[0]))),
  }),
);

export type BookingValues = Infer<typeof bookingSchema>;
export type BookingField = keyof BookingValues;
export type BookingMode = BookingValues["mode"];

export const bookingDefaults: BookingValues = {
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
};

/**
 * Each step's fields in on-screen order. The dialog validates a step with these, shows
 * the first failing field's message and moves focus to that field.
 */
export const BOOKING_STEPS: readonly (readonly BookingField[])[] = [
  ["kid", "grade", "difficulties"],
  ["parent", "phone", "consent", "language", "mode", "date", "slot"],
];

/** Name of the honeypot input. Real people never see it; a non-empty value means a bot. */
export const HONEYPOT_FIELD = "website";

/** What the Server Action reports back to the dialog. */
export type BookingResult =
  | { status: "success" }
  | { status: "invalid"; errors: Partial<Record<BookingField, string>> }
  | { status: "failed" };
