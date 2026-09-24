/** Page-level copy: metadata, the motion toggle and the site header. */
import type { Link } from "../types";
import { bookCta, img } from "./shared";

export const meta = {
  // The export's <title>; ≤60 chars so search results show it in full.
  title: "Spellzee — Read. Write. Speak. Confidently | CLM Learning",
  description:
    "Spellzee’s Cognitive Literacy Mapping (CLM) methodology helps your child read, write and speak confidently through adaptive 1:1 live classes.",
  /** The Open Graph / Twitter share card (app/_og/social-card.tsx); its headline and button come from the hero. */
  socialCard: {
    alt: "Spellzee: Read. Write. Speak. Confidently. Cognitive Literacy Mapping and 1:1 live mentoring.",
    tagline: "Cognitive Literacy Mapping · 1:1 live mentoring",
  },
};

export const motion = { pause: "Pause motion", play: "Play motion" };

export const header = {
  logo: img("spellzee-logo.png", "Spellzee: Cognitive Literacy Mapping for kids", 524, 150),
  homeHref: "#top",
  skipLink: { label: "Skip to main content", href: "#main" },
  navLabel: "Main",
  mobileNavLabel: "Mobile",
  menuLabel: "Menu",
  nav: [
    { label: "Approach", href: "#clm" },
    { label: "Programs", href: "#programs" },
    { label: "How it works", href: "#book" },
    { label: "Stories", href: "#stories" },
    { label: "Mentors", href: "#educators" },
    { label: "FAQ", href: "#faq" },
  ] satisfies Link[],
  cta: bookCta,
};
