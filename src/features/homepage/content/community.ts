/** The Spellzee network: family photo strips and stats. */
import type { Stat } from "../types";
import { bookCta, img } from "./shared";

export const community = {
  kicker: "The Spellzee Network",
  title: { before: "10,000+ Families. One ", brand: "Spellzee", after: " Network", end: "." },
  lead: "A growing network of families helping their children learn with confidence, clarity and the right support.",
  cta: bookCta,
  photosLabel: "Photos of Spellzee families",
  strips: [
    { id: "families-1", image: img("community-strip-1.jpg", "Spellzee families and children", 4096, 240), direction: "left", duration: "180s" },
    { id: "families-2", image: img("community-strip-2.jpg", "", 3630, 240), direction: "right", duration: "160s" },
    { id: "families-3", image: img("community-strip-3.jpg", "", 3368, 240), direction: "left", duration: "150s" },
  ] as const,
  stats: [
    { id: "students", value: "10,000+", label: "Students Guided", icon: "users", tone: "blue" },
    { id: "parents", value: "10,000+", label: "Parents Trust Spellzee", icon: "heart", tone: "rose" },
    { id: "educators", value: "300+", label: "Trained Educators", icon: "star", tone: "green" },
    { id: "sessions", value: "25,000+", label: "Live Sessions Every Month", icon: "live", tone: "violet" },
    { id: "minutes", value: "3 Million+", label: "Minutes of Live Classes", icon: "live", tone: "amber" },
  ] satisfies Stat[],
};
