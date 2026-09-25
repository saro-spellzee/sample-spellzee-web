import { palette } from "./palette";

/**
 * Site-wide identity used by metadata, structured data, robots, sitemap and llms.txt.
 * One place to change the domain or brand facts.
 */
export const site = {
  // TODO(product): confirm the production domain. Override per environment with NEXT_PUBLIC_SITE_URL.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://spellzee.in").replace(/\/$/, ""),
  name: "Spellzee",
  legalName: "Spellzee Edutech Solutions Pvt. Ltd.",
  tagline: "Happy Learners. Brighter Futures.",
  description:
    "Cognitive Literacy Mapping and 1:1 live mentoring that help children read, write and speak with confidence.",
  locale: "en_IN",
  language: "en",
  themeColor: palette.cream,
  brandColor: palette.brand,
  logo: { src: "/images/homepage/spellzee-logo.png", width: 524, height: 150 },
  mark: "/images/homepage/spellzee-mark.png",
  // TODO(product): add official social profile URLs (Instagram, YouTube, LinkedIn…) for Organization.sameAs.
  sameAs: [] as string[],
} as const;

export const absoluteUrl = (path = "/") => new URL(path, `${site.url}/`).toString();
