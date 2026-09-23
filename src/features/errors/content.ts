/**
 * Copy for the site-level failure screens: app/not-found.tsx, app/error.tsx and
 * app/global-error.tsx. Links are absolute ("/#book") because these screens render
 * on any URL, not just the homepage.
 */

export type ErrorLink = { label: string; href: string };

/** The homepage's booking section: the site's primary call to action. */
const bookCta: ErrorLink = { label: "Book a Free Assessment", href: "/#book" };
const home: ErrorLink = { label: "Back to homepage", href: "/" };

export const errorShell = {
  homeLabel: "Spellzee home",
} as const;

export const notFound = {
  /** Document title; the layout template appends " | Spellzee". */
  title: "Page not found",
  kicker: "Error 404",
  heading: "We couldn’t find that page",
  body: "The link may be broken, or the page may have moved. Head back to the homepage, or book a free assessment and we’ll take it from there.",
  cta: bookCta,
  home,
} as const;

export const routeError = {
  kicker: "Unexpected error",
  heading: "Something went wrong on our side",
  body: "This part of the page didn’t load. Try again, and if it keeps happening, head back to the homepage.",
  retry: "Try again",
  cta: bookCta,
  home,
} as const;

/** Shown when the root layout itself fails; rendered without the site's CSS or fonts. */
export const globalError = {
  title: "Something went wrong | Spellzee",
  brand: "Spellzee",
  heading: "Something went wrong",
  body: "We couldn’t load this page. Please try again in a moment.",
  retry: "Try again",
  cta: bookCta,
  home,
} as const;
