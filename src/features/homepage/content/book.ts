/** How it works (`#book`): the three steps and the sample CLM report. */
import type { BookStep, PlanWeek, ReportLegend, ReportRing } from "../types";

export const book = {
  kicker: "How It Works",
  title: { before: "Three Simple Steps to Your Child’s ", mark: "CLM Report", after: "." },
  lead: "Clarity on where your child stands, and how we can help.",
  cta: { label: "Book a Free Demo Class", href: "#cta" },
  stepsLabel: "What happens after you book",
  steps: [
    { n: 1, title: "A Friendly Call", description: "A caring counsellor listens to your concerns and understands where your child is today with reading, writing and speaking.", time: "15 min" },
    { n: 2, title: "A Live 1:1 Session", description: "Your child joins a live 1:1 session with a certified mentor, who maps their skills using our CLM Methodology.", time: "30 min" },
    { n: 3, title: "Your CLM Report", description: "A personalised report with your child’s level, strengths and a plan.", time: "Same day" },
  ] satisfies BookStep[],
  /** Index of the step highlighted on load. */
  initialStep: 2,
  report: {
    tag: "Sample report",
    initial: "A",
    name: "Aarav",
    age: "Age 7",
    profile: "Reading & Spelling Profile",
    stage: { name: "Early Reader", of: "Stage 2 of 5", current: 2, total: 5 },
    powered: "Powered by CLM",
    kicker: "CLM Passport",
    title: "Your Child’s CLM Report",
    sub: "Tap a skill to see what the mentor observed.",
    rings: [
      { id: "phonemic", label: "Phonemic Awareness", value: 72, status: "Developing", tone: "cobalt", note: "Aarav recognises most letter sounds confidently and can split short words into their sounds." },
      { id: "decoding", label: "Decoding", value: 65, status: "Needs practice", tone: "iris", note: "He needs support blending sounds smoothly, especially in longer words." },
      { id: "comprehension", label: "Comprehension", value: 58, status: "Priority focus", tone: "emerald", note: "He reads short passages but needs help explaining what he has read." },
      { id: "confidence", label: "Confidence", value: 80, status: "Strength", tone: "pink", note: "He speaks up readily and enjoys reading aloud, a real strength to build on." },
    ] satisfies ReportRing[],
    initialRing: 2,
    observation: {
      kicker: "From the live 1:1 session",
      live: "Live 1:1 session · completed",
      title: "What the mentor observed",
    },
    plan: {
      title: "Your Child’s Plan",
      body: "15 minutes of targeted practice in each live session, reviewed weekly.",
      weekLabel: "Week {n}",
      weeks: [
        { focus: "Blend", detail: "Week 1 · Blend: daily sound-blending games with CVC words like ship, chat and thin." },
        { focus: "Decode", detail: "Week 2 · Decode: reading decodable sentences, moving to longer words." },
        { focus: "Understand", detail: "Week 3 · Understand: short passages with guided questions to explain what was read." },
        { focus: "Review", detail: "Week 4 · Review: the mentor re-maps skills and shares an updated report with parents." },
      ] satisfies PlanWeek[],
    },
    note: "This is a sample for illustration. Every child receives their own report, built from their own assessment.",
    legend: [
      { id: "strength", label: "Strength" },
      { id: "developing", label: "Developing" },
      { id: "priority", label: "Priority" },
    ] satisfies ReportLegend[],
  },
};
