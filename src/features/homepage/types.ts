import type { Tone } from "@/components/ui/tones";
import type { IconName } from "@/lib/icons";

export type Link = { label: string; href: string };

export type ImageAsset = { src: string; alt: string; width: number; height: number };

/** A labelled item with an icon tile: ledger, features, assurances, parent support, stats. */
export type IconItem = { id: string; title: string; description?: string; icon: IconName; tone: Tone };

export type HeroTag = {
  id: string;
  label: string;
  tip: string;
  /** Position on the hero artwork, as percentages of its box. */
  x: string;
  y: string;
  dot: "blue" | "amber" | "violet" | "cyan";
};

export type Credential = { id: string; name: string; caption: string; logo: ImageAsset; logoClass: string };

export type Skill = {
  id: string;
  name: string;
  alt?: string;
  description: string;
  icon: IconName;
  tone: Tone;
  side: "left" | "right";
  /** Vertical position of the pill on the map, in %. */
  y: number;
};

export type ClmStep = { n: number; label: string; tone: Tone };

export type Program = {
  id: string;
  title: string;
  href: string;
  page: string;
  description: string;
  icon: IconName;
  tone: Tone;
  focusSkills: { label: string; tone: Tone }[];
};

export type BlendWord = { word: string; parts: [string, string, string]; shown: [number, number, number] };

export type LearningTool = {
  id: "blend" | "flashcards" | "worksheet" | "reader" | "progress";
  label: string;
  /** Chip at the top of the stage. */
  kind: string;
  hint: string;
  tone: Tone;
  icon: IconName;
  /** Learning stages (1–5) the tool suits. */
  from: number;
  to: number;
};

export type Flashcard = { grapheme: string; words: string; tone: Tone };

export type WorksheetQuestion = { before: string; after: string; options: [string, string, string]; answer: number };

/** A word in the decodable reader; `sounds` is null for a tricky (sight) word. */
export type ReaderWord = { text: string; sounds: string[] | null };

export type Reel = {
  id: string;
  kind: string;
  quote: string;
  tag: string;
  gradient: "blueViolet" | "greenTeal" | "roseViolet" | "amberRose" | "violetBlue" | "inkBlue";
};

export type FeedbackMessage = {
  id: string;
  kid: string;
  initials: string;
  tutor: string;
  slot: string;
  /** Weekdays the class runs (0 = Sunday). */
  days: number[];
  /** When the class ends, 24h clock. */
  endHour: number;
  endMinute: number;
  text: string;
  avatar: "blue" | "plum" | "ink" | "green" | "olive" | "leaf";
};

export type Mentor = {
  id: string;
  name: string;
  programme: string;
  role: string;
  qualification: string;
  years: number;
  languages: string;
  quote: string;
  photo: ImageAsset;
};

export type MentorFilter = { id: string; label: string; tone: Tone };

export type Stat = { id: string; value: string; label: string; icon: IconName; tone: Tone };

export type BookStep = { n: number; title: string; description: string; time: string };

export type ReportRing = { id: string; label: string; value: number; status: string; tone: Tone; note: string };

export type PlanWeek = { focus: string; detail: string };

export type FaqExtra = "about" | "improve" | "speak" | "programmes" | "ages" | "alone" | "compare" | "online" | "structure" | "progress" | "demo" | "payment";

export type Faq = { id: string; question: string; answer: string; showSteps?: boolean; extra?: FaqExtra };

/** A coloured card inside an FAQ answer (`.fq-card`). */
export type FaqCard = { title: string; body: string; tone: Tone };

export type BookingDifficulty = { id: string; title: string; body: string; icon: IconName; tone: Tone };
