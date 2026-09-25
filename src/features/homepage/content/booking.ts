/** The "Book a Free Demo Class" dialog: both steps, errors and the confirmation. */
import type { BookingDifficulty, BookingSeal } from "../types";
import { logos } from "./shared";

export const booking = {
  close: "Close",
  closeBackdrop: "Close booking form",
  side: {
    mark: logos.mark,
    kicker: "Free 1:1 Demo Class",
    title: "Discover exactly where your child stands.",
    gets: [
      { strong: "A Live 1:1 Session", rest: " with a certified mentor" },
      { strong: "A CLM Report", rest: " across 6 core skills" },
      { strong: "A personalised learning plan", rest: " for your child’s next steps" },
    ],
    rating: { label: "Google rating", source: "Google", score: "4.8", stars: "★★★★★" },
    seals: [
      { id: "iitm", logo: { ...logos.iitm, alt: "IITM Incubation Cell" } },
      { id: "actd", logo: { ...logos.actd, alt: "ACTD" } },
    ] satisfies BookingSeal[],
    sealsText: "IITM Incubated · ACTD Accredited",
    free: "100% Free · No Payment · No Obligation",
  },
  progress: "Step {n} of 2 · {name}",
  steps: [
    { name: "About your child", title: "Tell Us About Your Child" },
    { name: "Your details", title: "Where Should We Call You?" },
  ],
  kid: { label: "Child’s name", placeholder: "e.g. Aarav" },
  grade: { label: "Grade / class", placeholder: "e.g. Grade 3, UKG" },
  difficulties: {
    label: "What difficulty is your child facing?",
    hint: "Pick all that apply",
    items: [
      { id: "read", title: "Reading & Spelling", body: "Struggles to read fluently or spell words", icon: "book", tone: "blue" },
      { id: "comp", title: "Comprehension", body: "Reads, but finds it hard to understand", icon: "bulbGlow", tone: "green" },
      { id: "comm", title: "Communication", body: "Spoken English and grammar", icon: "chat", tone: "rose" },
      { id: "ps", title: "Public Speaking", body: "Nervous speaking in front of others", icon: "micStand", tone: "amber" },
      { id: "unsure", title: "Not Sure Yet", body: "Help me find out in the demo", icon: "helpCircle", tone: "violet" },
    ] satisfies BookingDifficulty[],
    /** Picking this one clears the others (and the reverse). */
    unsureId: "unsure",
    none: "Not selected",
  },
  continue: "Continue",
  edit: "Edit",
  parent: { label: "Parent’s name", placeholder: "Your full name" },
  phone: { label: "Mobile number", code: "🇮🇳 +91", placeholder: "98765 43210", hint: "We’ll confirm your demo on this number." },
  consent: {
    before: "I am ",
    after: " parent or guardian and agree to Spellzee contacting me and using these details as described in the ",
    // TODO(product): the export links the Privacy Policy to #privacy; needs the real policy URL.
    link: { label: "Privacy Policy", href: "#privacy" },
    end: ".",
  },
  possessive: { suffix: "’s", fallback: "your child’s" },
  language: {
    label: "Classroom language: ",
    groupLabel: "Classroom language",
    base: "English",
    extras: ["Tamil", "Malayalam", "Telugu", "Kannada", "Hindi"],
    addPrefix: "+ ",
    join: "English + ",
    hint: "English is always included. Add your child’s home language for a bilingual class.",
  },
  mode: {
    label: "How would you like to book?",
    groupLabel: "Booking option",
    call: { title: "Request a Call", body: "A counsellor calls you to fix a time." },
    schedule: { title: "Schedule Now", body: "Pick a day and time for the 30 minute demo." },
  },
  schedule: {
    dateLabel: "Pick a date",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    calendarHint: "Sundays are closed. You can book up to 2 months ahead.",
    unavailable: ", not available",
    slotLabel: "Pick a 30 minute slot",
    slotGroup: "Demo time",
    saturdayHint: "Saturday slots: 10 AM to 9 PM.",
    weekdayHint: "Weekday slots: 3 PM to 9 PM.",
    at: " at ",
  },
  back: "Back",
  submit: { call: "Book my free demo", schedule: "Confirm my demo slot" },
  /** Submit label while the request is on its way (not in the export). */
  pending: "Sending…",
  errors: {
    kid: "Please enter your child’s name.",
    grade: "Please enter your child’s grade or class.",
    difficulties: "Please pick at least one area (or “Not sure yet”).",
    parent: "Please enter your name.",
    phone: "Please enter a valid 10-digit Indian mobile number.",
    slot: "Please pick a day and a time for the demo.",
    consent: "Please confirm you are the parent or guardian.",
    /** Any delivery failure (not in the export); the detail goes to the server log only. {phone} is the support number. */
    failed: "Sorry, we couldn’t send your request just now. Please try again, or call us on {phone}.",
  },
  /** Honeypot: visually hidden and aria-hidden, so only bots fill it in. */
  honeypotLabel: "Leave this field empty",
  done: {
    title: "You’re All Set, {parent}!",
    parentFallback: "there",
    phonePrefix: "+91 ",
    call: { before: "We’ve received ", middle: " free demo request. A Spellzee counsellor will call you on ", after: " to fix a time that suits you." },
    schedule: { middle: " free 30 minute demo is booked for ", after: "." },
    notes: {
      link: { before: "You’ll receive the ", strong: "demo link", middle: " on ", after: " shortly." },
      reminder: { before: "We’ll give you a ", strong: "reminder call", after: " before the demo." },
    },
    card: { child: "Child", focus: "Focus", language: "Language" },
    support: {
      lead: "Prefer to talk now?",
      call: { before: "Call ", number: "+91 82487 51351", href: "tel:+918248751351" },
      whatsapp: { label: "WhatsApp Us", href: "https://wa.me/918248751351" },
    },
    next: [
      { strong: "A Friendly Call", rest: " from a caring counsellor" },
      { strong: "A Live 1:1 Session", rest: " with a certified mentor, using CLM" },
      { strong: "Your CLM Report", rest: "" },
    ],
    button: "Done",
  },
};
