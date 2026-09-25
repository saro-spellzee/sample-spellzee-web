/** Cognitive Literacy Mapping (`#clm`) and the four CLM steps used across the page. */
import type { ClmStep, Skill } from "../types";
import { img, logos } from "./shared";

export const clm = {
  badge: { before: "Spellzee’s ", highlight: "CLM", after: " Methodology", mark: logos.mark },
  title: { before: "Cognitive Literacy ", highlight: "Mapping", trademark: "™" },
  tagline: { before: "Before we teach, we ", mark: "understand." },
  intro: {
    before: "Every child processes language differently. ",
    strong: "Cognitive Literacy Mapping",
    after:
      " is Spellzee’s structured way of finding your child’s strengths and gaps across reading, writing and speaking, so we know where to begin, what to strengthen, and how to move forward.",
  },
  brain: img("clm-brain.png", "A glowing brain with neural pathways, representing how CLM maps a child's literacy skills", 460, 400),
  skills: [
    { id: "phonemic", name: "Phonemic Awareness", alt: "Sound Recognition", description: "Hearing, segmenting, and blending the individual sounds in spoken words. Every confident reader builds on this.", tone: "cobalt", icon: "ear", side: "left", y: 25 },
    { id: "decoding", name: "Decoding", alt: "Blending", description: "Turning letters into sounds and blending them into words.", tone: "iris", icon: "book", side: "left", y: 50 },
    { id: "comprehension", name: "Comprehension", description: "Understanding, interpreting, and answering questions about what's been read.", tone: "emerald", icon: "bulb", side: "left", y: 75 },
    { id: "spelling", name: "Spelling", description: "Connecting sounds back to letters and remembering patterns.", tone: "orchid", icon: "spell", side: "right", y: 25 },
    { id: "writing", name: "Writing", description: "Putting thoughts into clear, well-ordered sentences.", tone: "azure", icon: "pencil", side: "right", y: 50 },
    { id: "communication", name: "Communication", alt: "Fluency", description: "Speaking clearly and confidently, and listening well.", tone: "pink", icon: "chat", side: "right", y: 75 },
  ] satisfies Skill[],
  altPrefix: "Also called ",
  closing: { before: "Because meaningful progress starts with ", strong: "understanding the learner", after: " first." },
  cta: { label: "Map My Child’s Learning", href: "#book" },
};

export const clmSteps: ClmStep[] = [
  { n: 1, label: "Assess", tone: "blue" },
  { n: 2, label: "Map", tone: "rose" },
  { n: 3, label: "Personalise", tone: "green" },
  { n: 4, label: "Progress", tone: "violet" },
];
