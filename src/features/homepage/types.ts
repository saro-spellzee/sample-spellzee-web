import type { Tone } from "@/components/ui/tones";
import type { IconName } from "@/lib/icons";

export type Link = { label: string; href: string };

export type ImageAsset = { src: string; alt: string; width: number; height: number };

/** A labelled item with an icon tile: ledger, features, materials, parent support, trust strip. */
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

export type Story = { id: string; quote: string; programme: string; tone: Tone };

export type Faq = { id: string; question: string; answer: string; showSteps?: boolean };

export type BlendWord = { word: string; parts: [string, string, string]; shown: [number, number, number] };

export type ReportRow = { id: string; label: string; value: number; tone: Tone; delay: string };

export type Stat = { id: string; value: string; label: string; icon: IconName; tone: Tone };

export type Step = { n: string; title: string; description: string };
