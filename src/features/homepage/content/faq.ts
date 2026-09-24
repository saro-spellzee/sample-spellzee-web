/** FAQ (`#faq`), its designed answers, and the closing call to action (`#cta`). */
import type { Tone } from "@/components/ui/tones";
import type { Faq, FaqCard } from "../types";
import { bookCta, logos, seals } from "./shared";

const items = [
  { id: "about", question: "What is Spellzee, and how is it different from regular English tuition?", answer: "Spellzee is an IITM-incubated online learning platform that helps children aged 3 to 15 read, write and speak English with confidence, through live 1:1 classes built on Cognitive Literacy Mapping.", extra: "about" },
  { id: "clm", question: "What is CLM, and how do you decide my child’s plan?", answer: "Cognitive Literacy Mapping (CLM) is Spellzee’s structured way of understanding your child’s reading, writing and speaking before any teaching starts. It maps strengths and gaps across six core skills, and the learning path is then personalised around those needs.", showSteps: true },
  { id: "improve", question: "How can I improve my child’s English reading and writing?", answer: "Start by finding the real gap. Most children who struggle are missing a specific skill, such as blending sounds or understanding what they read, not simply more practice.", extra: "improve" },
  { id: "speaking", question: "My child studies English at school but can’t speak confidently. Can you help?", answer: "Yes. This is one of the most common concerns we hear, and it usually has a simple reason.", extra: "speak" },
  { id: "programmes", question: "Which Spellzee programme is right for my child?", answer: "Choose by the difficulty your child is facing. Each programme focuses on one core skill.", extra: "programmes" },
  { id: "ages", question: "What age groups do you teach?", answer: "Spellzee teaches children aged 3 to 15, with programmes matched to each child’s current stage.", extra: "ages" },
  { id: "phonics-alone", question: "Can my child take just the Phonics course?", answer: "Yes, you can choose Phonics alone, but here’s what you should know.", extra: "alone" },
  { id: "compare", question: "How do Foundational Skills compare to Phonics?", answer: "Here’s a side-by-side view of what each option covers.", extra: "compare" },
  { id: "online", question: "Are online English classes effective for kids?", answer: "Yes, when they are live, 1:1 and structured. A mentor who hears every word can correct it instantly, which recorded videos and apps cannot do.", extra: "online" },
  { id: "structure", question: "How are classes structured, and how long do courses take?", answer: "Every class is live and 1:1. The length of your child’s course depends on their level.", extra: "structure" },
  { id: "progress", question: "How will I know my child is progressing?", answer: "You stay informed at every stage, with three clear touchpoints.", extra: "progress" },
  { id: "demo", question: "What happens in the free demo class?", answer: "Three simple steps that give you clarity on where your child stands.", extra: "demo" },
  { id: "payment", question: "How does payment work, and what if it’s not the right fit?", answer: "You pay for classes, not months, and your satisfaction is protected.", extra: "payment" },
] satisfies Faq[];

/** Chevron/dot accents, cycled per question. */
const accents = ["rose", "amber", "green", "blue", "violet"] as const;

/**
 * The questions and their short answers, in page order. The accordion (a client component)
 * imports only these, so the designed answers below stay out of the browser bundle. Keep the
 * pieces as plain references (no spread) so the bundler can drop what a client doesn't use.
 */
export const faqQuestions = { items, accents };

/** The designed part of some answers (cards, steps, tables), rendered on the server by FaqExtra and panels. */
export const faqExtras = {
  about: [
    { title: "Diagnose First", body: "CLM maps six core skills before any teaching starts.", tone: "blue" },
    { title: "Live 1:1 Always", body: "One child, one certified mentor, every class.", tone: "purple" },
    { title: "All Four Skills", body: "Reading, writing, speaking and understanding.", tone: "rose" },
  ] satisfies FaqCard[],
  improve: {
    steps: [
      { label: "Find the Gap with CLM", tone: "blue" },
      { label: "Build Phonics and Comprehension", tone: "purple" },
      { label: "Write in Every Class", tone: "magenta" },
      { label: "Track Progress Weekly", tone: "rose" },
    ] satisfies { label: string; tone: Tone }[],
    note: { strong: "Good to know:", body: " reading and writing improve fastest when the real gap is found first, instead of doing more of the same homework." },
  },
  speak: {
    school: { title: "At school", body: "Mostly reading, writing and grammar exercises. Speaking is rarely practised or corrected." },
    spellzee: { title: "At Spellzee", body: "Your child speaks in every live 1:1 class, and the mentor corrects pronunciation and sentences in the moment." },
    note: { strong: "Best fit:", body: " Communication for spoken English and grammar, Public Speaking for confidence in front of others." },
  },
  programmes: {
    cards: [
      { title: "Phonics", body: "Struggles to read fluently or spell words.", tone: "blue" },
      { title: "Comprehension", body: "Reads, but finds it hard to understand.", tone: "green" },
      { title: "Communication", body: "Needs spoken English and grammar.", tone: "rose" },
      { title: "Public Speaking", body: "Nervous speaking in front of others.", tone: "amber" },
    ] satisfies FaqCard[],
    note: { strong: "Not sure?", body: " The free demo class and CLM Report tell you exactly where to start." },
  },
  ages: { from: "3 yrs", to: "15 yrs", marks: [0, 25, 50, 75, 100], labels: ["Early learners", "Growing readers", "Confident teens"] },
  alone: {
    good: { title: "Phonics alone is good for", items: ["Children who already speak English well", "Students who just need reading support", "Kids with specific pronunciation challenges", "Supplementing existing English education"] },
    missing: { title: "Phonics alone won’t provide", items: ["Grammar and sentence structure", "Speaking and conversation skills", "Writing and composition", "Vocabulary expansion", "Comprehension strategies"] },
    recommendation: {
      title: "Our recommendation",
      first: { before: "For most children, ", strong: "Foundational Skills", middle: " is the better choice because it includes phonics ", strong2: "plus", after: " all the other essential English skills." },
      second: "Think of it this way: Phonics teaches your child to read words. Foundational Skills teaches them to understand, speak and use English confidently in real life.",
      cta: { label: "Book a Free Demo Class", href: "#cta" },
      // TODO(product): the export points "Schedule a consultation" at #cta; needs its real destination.
      secondary: { label: "Schedule a consultation", href: "#cta" },
    },
  },
  compare: {
    foundational: {
      title: "Foundational Skills",
      tag: "Complete",
      items: [
        { label: "Phonics & sound recognition", included: true },
        { label: "Reading comprehension", included: true },
        { label: "Grammar & writing", included: true },
        { label: "Speaking & listening", included: true },
        { label: "Vocabulary building", included: true },
        { label: "Critical thinking", included: true },
        { label: "A1 to C2 progression", included: true },
      ],
      result: { strong: "Result:", body: " Complete English mastery" },
    },
    phonics: {
      title: "Phonics only",
      tag: "Focused",
      items: [
        { label: "Sound recognition", included: true },
        { label: "Basic word reading", included: true },
        { label: "Grammar training", included: false },
        { label: "Speaking practice", included: false },
        { label: "Writing skills", included: false },
        { label: "Comprehension", included: false },
        { label: "Broad vocabulary", included: false },
      ],
      result: { strong: "Result:", body: " Reads words, with limited communication" },
    },
    recommendation: { strong: "Recommendation:", body: " Foundational Skills provides the complete English learning experience, while Phonics alone covers the core reading mechanics." },
  },
  online: [
    { title: "Live 1:1", body: "A mentor hears and sees every answer your child gives.", tone: "blue" },
    { title: "Instant Correction", body: "Mistakes are fixed before they become habits.", tone: "purple" },
    { title: "Visible Progress", body: "Weekly reports and parent teacher meetings.", tone: "green" },
  ] satisfies FaqCard[],
  structure: {
    title: "Class structure",
    stats: [
      { value: "1:1 live", label: "one child, one mentor", icon: "user", tone: "violet" },
      { value: "30 or 60 min", label: "per class", icon: "clock", tone: "rose" },
      { value: "CLM-based", label: "plan for every child", icon: "shield", tone: "green" },
    ] as const,
    lengthTitle: "Course length, set by your child’s level",
    plans: [
      { value: "60", tone: "blue" },
      { value: "90", tone: "violet" },
      { value: "120", tone: "rose" },
    ] as const,
    unit: "classes",
    note: "Your child’s Cognitive Literacy Map decides the right plan, with no guesswork and no one-size-fits-all course.",
  },
  progress: [
    { title: "Daily practice", body: "Short activities that build on every class.", icon: "calendar", tone: "green" },
    { title: "Weekly report", body: "Progress, strengths and focus areas, every week.", icon: "trend", tone: "blue" },
    { title: "PTM", body: "Parent teacher meetings to review the plan together.", icon: "users", tone: "amber" },
  ] as const,
  demo: [
    { title: "A Friendly Call", body: "A caring counsellor listens and understands your child’s needs.", tone: "blue" },
    { title: "A Live 1:1 Session", body: "A certified mentor maps your child’s skills using our CLM Methodology.", tone: "violet" },
    { title: "Your CLM Report", body: "A personalised report with your child’s level and next steps.", tone: "rose" },
  ] as const,
  payment: {
    classes: {
      title: "Pay for classes, not months",
      body: "You pay for a set of classes and complete them at your own pace. No monthly fees, and any missed class gets a compensation class. The more classes you enrol for, for example continuing from Phonics into Spoken English, the lower your price per class.",
    },
    refund: {
      title: "Refund policy",
      body: "Within 7 days of your child’s first class, change the tutor or ask for a full refund. Once confirmed, the refund is released within 30 minutes.",
    },
  },
};

export const faq = {
  title: { before: "Frequently Asked ", mark: "Questions" },
  lead: "Everything parents ask about improving their child’s English reading, writing and speaking, and how Spellzee helps.",
  help: {
    title: "Still Have a Question?",
    body: "Book a free demo class and we'll walk you through it.",
    cta: bookCta,
  },
  items,
  accents,
  extras: faqExtras,
};

/** The closing call-to-action bar at the end of the FAQ section (`#cta`). */
export const closingCta = {
  id: "cta",
  title: "Ready to See Where Your Child Stands?",
  body: "Get your child’s free CLM Report in one live 1:1 session.",
  cta: bookCta,
  mark: logos.mark,
  chips: ["Pay per class, not monthly", "Learn at your own pace", "98% parent satisfaction"],
  seals,
};
