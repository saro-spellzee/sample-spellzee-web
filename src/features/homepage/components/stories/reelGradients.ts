import type { Reel } from "../../types";

/** Each reel's two-stop gradient, as `--c` / `--c2` (static class strings so Tailwind sees them). */
export const reelGradients: Record<Reel["gradient"], string> = {
  blueViolet: "[--c:var(--color-tone-blue)] [--c2:#5A3FDA]",
  greenTeal: "[--c:var(--color-tone-green)] [--c2:#1592B6]",
  roseViolet: "[--c:var(--color-tone-rose)] [--c2:var(--color-tone-purple)]",
  amberRose: "[--c:var(--color-tone-amber)] [--c2:var(--color-tone-rose)]",
  violetBlue: "[--c:var(--color-tone-purple)] [--c2:var(--color-tone-blue)]",
  inkBlue: "[--c:var(--color-ink)] [--c2:var(--color-tone-blue)]",
};
