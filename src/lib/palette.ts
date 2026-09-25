/**
 * Design-token colours for the few places CSS variables can't reach: the root error screen
 * (it renders without globals.css), next/og images, the web manifest and <meta name="theme-color">.
 * Components use the `@theme` tokens in src/app/globals.css instead. Each value mirrors the
 * token named beside it, and palette.test.ts fails if the two drift apart.
 */
export const palette = {
  cream: "#FCF8F4", // --color-cream
  ink: "#0E1A3A", // --color-ink
  inkSoft: "#4B5575", // --color-ink-soft
  brand: "#1557D6", // --color-brand
  brandHover: "#0F45AE", // --color-brand-hover
  controlLine: "#DCE1EC", // --color-control-line
  spectrumBlue: "#2F6BF2", // --color-spectrum-blue
} as const;

export type PaletteColor = keyof typeof palette;

/** The `@theme` token each palette entry mirrors. */
export const paletteTokens: Record<PaletteColor, `--color-${string}`> = {
  cream: "--color-cream",
  ink: "--color-ink",
  inkSoft: "--color-ink-soft",
  brand: "--color-brand",
  brandHover: "--color-brand-hover",
  controlLine: "--color-control-line",
  spectrumBlue: "--color-spectrum-blue",
};
