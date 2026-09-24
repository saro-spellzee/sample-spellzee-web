/** Meet the mentors (`#educators`). */
import type { Mentor, MentorFilter } from "../types";
import { bookCta, img, logos } from "./shared";

export const educators = {
  kicker: "Our Educators",
  title: { before: "Meet Your Child’s ", mark: "Mentors" },
  lead: "The educators who guide, support and shape every child’s learning journey.",
  stat: { value: "300+", title: "Trained educators", body: "Every one Spellzee certified to teach 1:1" },
  filtersLabel: "Filter mentors by programme",
  filters: [
    { id: "all", label: "All mentors", tone: "ink" },
    { id: "phonics", label: "Phonics", tone: "blue" },
    { id: "comp", label: "Comprehension", tone: "green" },
    { id: "comm", label: "Communication", tone: "rose" },
    { id: "ps", label: "Public Speaking", tone: "amber" },
  ] satisfies MentorFilter[],
  count: { before: "Showing ", middle: " of ", total: "300+", after: " certified mentors" },
  mentors: [
    { id: "priya-menon", name: "Ms. Priya Menon", programme: "phonics", role: "Phonics & Reading Specialist", qualification: "M.A. English, B.Ed.", years: 9, languages: "English, Tamil", quote: "I start every class with a story.", photo: img("mentor-priya-menon.jpg", "Ms. Priya Menon, Phonics & Reading Specialist", 300, 372) },
    { id: "nandini-sharma", name: "Ms. Nandini Sharma", programme: "comp", role: "Comprehension Coach", qualification: "M.A. Linguistics", years: 7, languages: "English, Hindi", quote: "Good questions build great readers.", photo: img("mentor-nandini-sharma.jpg", "Ms. Nandini Sharma, Comprehension Coach", 300, 372) },
    { id: "kavitha-rajan", name: "Mrs. Kavitha Rajan", programme: "comm", role: "Grammar & Communication Mentor", qualification: "M.A., B.Ed.", years: 12, languages: "English, Tamil, Malayalam", quote: "Confidence comes from being heard.", photo: img("mentor-kavitha-rajan.jpg", "Mrs. Kavitha Rajan, Grammar & Communication Mentor", 300, 372) },
    { id: "aditi-rao", name: "Ms. Aditi Rao", programme: "ps", role: "Public Speaking Coach", qualification: "B.A. Mass Communication", years: 5, languages: "English, Hindi, Telugu", quote: "Every child has a voice worth sharing.", photo: img("mentor-aditi-rao.jpg", "Ms. Aditi Rao, Public Speaking Coach", 300, 372) },
  ] satisfies Mentor[],
  certificates: [
    { id: "spellzee", label: "Spellzee Certified", logo: logos.mark },
    { id: "actd", label: "ACTD Certified", logo: { ...logos.actd, alt: "" } },
  ],
  yearsSuffix: " years teaching",
  match: { before: "Every child is ", strong: "matched", after: " with a mentor based on their CLM map, not just assigned." },
  cta: bookCta,
};
