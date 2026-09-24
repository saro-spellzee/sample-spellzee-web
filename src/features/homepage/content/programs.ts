/** Programmes (`#programs`): the four difficulty cards. */
import type { Program } from "../types";
import { bookCta } from "./shared";

export const programs = {
  kicker: "Tailored Support",
  title: { before: "Select the ", mark: "Difficulty", after: " Your Child Is Facing" },
  lead: "Choose the area where your child needs the most support.",
  focusLabel: "Focus skills",
  items: [
    // The export links Phonics to its own design board ("Phonics.dc.html"); the site route is /phonics.
    { id: "reading", title: "Reading & Spelling", href: "/phonics", page: "Phonics", description: "Struggles to read fluently or spell words correctly.", tone: "blue", icon: "book", focusSkills: [{ label: "Phonemic Awareness", tone: "cobalt" }, { label: "Decoding", tone: "iris" }, { label: "Spelling", tone: "orchid" }] },
    { id: "comprehension", title: "Comprehension", href: "/comprehension", page: "Comprehension", description: "Can read, but finds it difficult to understand, interpret, or answer questions.", tone: "green", icon: "bulb", focusSkills: [{ label: "Decoding", tone: "iris" }, { label: "Comprehension", tone: "emerald" }] },
    { id: "communication", title: "Communication", href: "/grammar-and-communication", page: "Communication", description: "Finds it difficult to express thoughts clearly and confidently.", tone: "rose", icon: "mic", focusSkills: [{ label: "Spoken English", tone: "rose" }, { label: "Grammar", tone: "iris" }] },
    { id: "public-speaking", title: "Public Speaking", href: "/public-speaking", page: "Public Speaking", description: "Feels hesitant or nervous while speaking in front of others.", tone: "amber", icon: "stage", focusSkills: [{ label: "Delivery Techniques", tone: "amber" }, { label: "Anxiety Management", tone: "green" }] },
  ] satisfies Program[],
  explorePrefix: "Explore ",
  help: {
    title: "Not sure which difficulty fits?",
    body: "A free assessment maps your child's reading, writing and speaking, then we recommend the right programme.",
    cta: bookCta,
  },
};
