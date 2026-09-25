/** Footer: newsletter, link columns, badges and legal lines. */
import type { Link } from "../types";
import { logos } from "./shared";

/** The footer's newsletter sign-up; NewsletterForm (a client component) imports only this. */
export const newsletter = {
  title: "Stay in the loop with Spellzee",
  body: "Get learning tips, updates and resources for your child.",
  label: "Email address",
  placeholder: "Your email address",
  submit: "Subscribe",
  pending: "Subscribing…",
  success: "Thanks! You're on the list.",
  errors: {
    required: "Enter your email address.",
    invalid: "Enter a valid email address, like name@example.com.",
    tooLong: "That email address is too long.",
    /** Shown for any delivery failure; the detail goes to the server log only. */
    failed: "Sorry, we couldn't subscribe you just now. Please try again in a moment.",
  },
  /** Honeypot: visually hidden and aria-hidden, so only bots fill it in. */
  honeypotLabel: "Leave this field empty",
};

export const footer = {
  brand: "Spellzee",
  mark: logos.mark,
  tagline: { before: "Happy Learners. ", accent: "Brighter Futures." },
  blurb: "Helping children become confident readers, writers, and speakers.",
  newsletter,
  columns: [
    {
      id: "programs",
      title: "Programs",
      links: [
        // The export links Phonics to its design board ("Phonics.dc.html"); the site route is /phonics.
        { label: "Phonics", href: "/phonics" },
        { label: "Comprehension", href: "/comprehension" },
        { label: "Grammar & Communication", href: "/grammar-and-communication" },
        { label: "Public Speaking", href: "/public-speaking" },
      ],
    },
    {
      id: "explore",
      title: "Explore",
      links: [
        { label: "About Spellzee", href: "#educators" },
        { label: "Our Approach", href: "#clm" },
        { label: "CLM Methodology", href: "#clm" },
        { label: "Stories of Progress", href: "#stories" },
        { label: "Behind the Classroom", href: "#educators" },
        { label: "Resources", href: "#faq" },
      ],
    },
    {
      id: "support",
      title: "Support",
      // TODO(product): Contact/Privacy/Terms/Refund/Parent Resources point at #top in the export.
      links: [
        { label: "Contact Us", href: "#top" },
        { label: "FAQ", href: "#faq" },
        { label: "Privacy Policy", href: "#top" },
        { label: "Terms & Conditions", href: "#top" },
        { label: "Cancellation & Refund", href: "#top" },
        { label: "Parent Resources", href: "#top" },
      ],
    },
  ] satisfies { id: string; title: string; links: Link[] }[],
  badges: {
    iitm: { label: "IITM Incubated Company", logo: logos.iitm },
    actd: { label: "ACTD Accredited", logo: logos.actd },
    plain: ["Safe & Secure Learning", "Trusted by 10,000+ Parents", "Child-Centric Approach"],
  },
  copyright: "© 2026 Spellzee. All rights reserved.",
  company: "Spellzee Edutech Solutions Pvt. Ltd.",
};
