import type { BookingField } from "../../booking/schema";

/**
 * The booking dialog shows one error line in its sticky action bar (as the export does)
 * rather than a message under each field. Invalid fields point at that line, so a screen
 * reader hears the message when focus lands on the field.
 */
export const ERROR_ID = "bf-error";

/** `aria-invalid` + `aria-describedby` for an input, adding the error line while it's invalid. */
export function fieldAria(invalid: boolean, describedBy?: string) {
  const ids = [describedBy, invalid ? ERROR_ID : undefined].filter(Boolean).join(" ");
  return { "aria-invalid": invalid ? true : undefined, "aria-describedby": ids || undefined };
}

/** For a group of buttons: no `aria-invalid` (not allowed on role=group), just the description. */
export function groupAria(invalid: boolean) {
  return { "aria-describedby": invalid ? ERROR_ID : undefined };
}

/** Where focus goes when a field fails: the input, or the first usable button of its group. */
const FOCUS_TARGETS: Record<BookingField, string[]> = {
  kid: ['[name="kid"]'],
  grade: ['[name="grade"]'],
  difficulties: ["#bf-difficulties button"],
  parent: ['[name="parent"]'],
  phone: ['[name="phone"]'],
  consent: ['[name="consent"]'],
  language: ["#bf-language button"],
  mode: ['[name="mode"]:checked'],
  date: ["#bf-days button:enabled"],
  slot: ["#bf-slots button", "#bf-days button:enabled"],
};

/** Focuses a field's input, or the first usable button of its group. False when it isn't on screen. */
export function focusField(root: HTMLElement | null, field: BookingField) {
  const target = FOCUS_TARGETS[field].map((selector) => root?.querySelector<HTMLElement>(selector)).find(Boolean);
  target?.focus();
  return !!target;
}
