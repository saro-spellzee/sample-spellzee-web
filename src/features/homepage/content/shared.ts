/** Helpers and values several content modules share. Not re-exported from the content index. */
import type { ImageAsset } from "../types";

export const img = (name: string, alt: string, width: number, height: number): ImageAsset => ({
  src: `/images/homepage/${name}`,
  alt,
  width,
  height,
});

export const logos = {
  iitm: img("iitm-logo.png", "IITM Incubation Cell logo", 300, 300),
  actd: img("actd-emblem.png", "ACTD accreditation emblem", 520, 508),
  mark: img("spellzee-mark.png", "", 148, 160),
};

/** The "Book a Free Demo Class" call to action used across the page (opens the booking dialog). */
export const bookCta = { label: "Book a Free Demo Class", href: "#book" };

export const seals = [
  { id: "iitm", name: "IITM", caption: " Incubated Company", logo: logos.iitm },
  { id: "actd", name: "ACTD", caption: " Accredited", logo: logos.actd },
];
