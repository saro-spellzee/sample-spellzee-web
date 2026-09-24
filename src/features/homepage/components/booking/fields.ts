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
