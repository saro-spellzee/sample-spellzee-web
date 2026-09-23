/**
 * Colour roles for per-item data. Each tone sets two CSS variables on the
 * element: `--tone` (foreground/solid) and `--tone-soft` (tinted background).
 * Children then use `text-(--tone)`, `bg-(--tone-soft)`, `bg-(--tone)/10`,
 * `border-(--tone)` etc. Class strings are static so Tailwind can see them.
 */
export const tones = {
  blue: "[--tone:var(--color-tone-blue)] [--tone-soft:var(--color-tone-blue-soft)]",
  rose: "[--tone:var(--color-tone-rose)] [--tone-soft:var(--color-tone-rose-soft)]",
  green: "[--tone:var(--color-tone-green)] [--tone-soft:var(--color-tone-green-soft)]",
  amber: "[--tone:var(--color-tone-amber)] [--tone-soft:var(--color-tone-amber-soft)]",
  violet: "[--tone:var(--color-tone-violet)] [--tone-soft:var(--color-tone-violet-soft)]",
  sky: "[--tone:var(--color-tone-sky)] [--tone-soft:var(--color-tone-sky-soft)]",
  roseDeep: "[--tone:var(--color-tone-rose-deep)] [--tone-soft:var(--color-tone-rose-soft)]",
  amberDeep: "[--tone:var(--color-tone-amber-deep)] [--tone-soft:var(--color-tone-amber-soft)]",
  greenDeep: "[--tone:var(--color-tone-green-deep)] [--tone-soft:var(--color-tone-green-soft)]",
  violetDeep: "[--tone:var(--color-tone-violet-deep)] [--tone-soft:var(--color-tone-violet-soft)]",
  cobalt: "[--tone:var(--color-tone-cobalt)] [--tone-soft:var(--color-tone-cobalt-soft)]",
  iris: "[--tone:var(--color-tone-iris)] [--tone-soft:var(--color-tone-iris-soft)]",
  emerald: "[--tone:var(--color-tone-emerald)] [--tone-soft:var(--color-tone-emerald-soft)]",
  orchid: "[--tone:var(--color-tone-orchid)] [--tone-soft:var(--color-tone-orchid-soft)]",
  azure: "[--tone:var(--color-tone-azure)] [--tone-soft:var(--color-tone-azure-soft)]",
  pink: "[--tone:var(--color-tone-pink)] [--tone-soft:var(--color-tone-pink-soft)]",
} as const;

export type Tone = keyof typeof tones;
