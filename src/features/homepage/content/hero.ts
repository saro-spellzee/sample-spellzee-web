/** The hero (`#top`): headline, highlights, credentials and the ledger. */
import type { Tone } from "@/components/ui/tones";
import type { Credential, HeroTag, IconItem } from "../types";
import { img, logos } from "./shared";

export const hero = {
  image: img(
    "hero-child.jpg",
    "A thoughtful child smiling upward, surrounded by a glowing map linking icons for Sound Recognition, Blending, Fluency and Comprehension",
    1672,
    941,
  ),
  tags: [
    { id: "sound", label: "Sound Recognition", tip: "Hearing, segmenting and blending the individual sounds in spoken words.", x: "53.4%", y: "14%", dot: "blue" },
    { id: "fluency", label: "Fluency", tip: "Reading and speaking smoothly, clearly and with confidence.", x: "55.5%", y: "58.5%", dot: "amber" },
    { id: "blending", label: "Blending", tip: "Turning letters into sounds and blending them into words.", x: "89.5%", y: "38.5%", dot: "violet" },
    { id: "comprehension", label: "Comprehension", tip: "Understanding, interpreting and answering questions about what's been read.", x: "90.5%", y: "60.5%", dot: "cyan" },
  ] satisfies HeroTag[],
  badges: {
    method: { before: "Spellzee’s ", strong: "CLM", after: " Methodology" },
    incubated: "IITM Incubated Company",
  },
  title: {
    /** What screen readers hear: the rotating words are hidden from them. */
    spoken: "Read. Write. Speak. Confidently, independently and effortlessly.",
    line: "Read. Write. Speak.",
    words: [
      { text: "Confidently.", tone: "blue" },
      { text: "Independently.", tone: "iris" },
      { text: "Effortlessly.", tone: "pink" },
    ] satisfies { text: string; tone: Tone }[],
  },
  lead: {
    before: "Spellzee’s ",
    strong: "Cognitive Literacy Mapping (CLM)",
    middle: " methodology develops these skills together through an ",
    strong2: "Adaptive 1:1 Learning Process",
    after: ".",
  },
  highlights: [
    { id: "expert", highlight: "1:1", label: " Expert Led Learning", icon: "user", tone: "blue" },
    { id: "path", label: "Personalised Learning Path", icon: "route", tone: "rose" },
    { id: "progress", label: "Progress You Can See", icon: "trend", tone: "green" },
  ] as const,
  language: {
    label: "Native Language Support",
    icon: "globe",
    tone: "amber",
    names: [
      { text: "English", lang: "en" },
      { text: "தமிழ்", lang: "ta" },
      { text: "മലയാളം", lang: "ml" },
      { text: "हिन्दी", lang: "hi" },
    ],
    spoken: "in English, Tamil, Malayalam and Hindi",
  } as const,
  primaryCta: { label: "Get Free Spellzee Improvement Plan", href: "#book" },
  secondaryCta: { label: "See how CLM works", href: "#clm" },
  credentialsLabel: "Accreditations & Recognition",
  credentials: [
    { id: "iitm", name: "IITM", caption: "Incubated Company", logo: logos.iitm },
    { id: "actd", name: "ACTD", caption: "Accredited", logo: logos.actd },
  ] satisfies Credential[],
  ledger: [
    { id: "progress", title: "Guaranteed Progress", icon: "trend", tone: "green" },
    { id: "satisfaction", title: "98% Parent Satisfaction", icon: "star", tone: "amber" },
    { id: "per-class", title: "Pay Per Class, Not Monthly", icon: "calendar", tone: "blue" },
    { id: "refund", title: "Get Refund in 30 Mins", icon: "refund", tone: "rose" },
  ] satisfies IconItem[],
};
