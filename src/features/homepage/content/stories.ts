/** Stories of progress (`#stories`): reels, the video dialog and the live-feedback toast. */
import type { FeedbackMessage, Reel } from "../types";
import { bookCta, logos } from "./shared";

export const stories = {
  kicker: "Parent Voices",
  title: { before: "Stories of ", mark: "Progress" },
  lead: "Watch real parents and children share their learning journey with Spellzee.",
  reels: [
    // TODO(product): each reel needs its video; the export shows a "Video will play here" placeholder.
    { id: "reads-independently", kind: "Parent story", quote: "She now reads independently.", tag: "Reading & Spelling", gradient: "blueViolet" },
    { id: "reading-aloud", kind: "Student showcase", quote: "Reading aloud, Stage 2", tag: "Phonics", gradient: "greenTeal" },
    { id: "spelling-confidence", kind: "Parent story", quote: "His spelling confidence improved.", tag: "Reading & Spelling", gradient: "roseViolet" },
    { id: "first-speech", kind: "Student showcase", quote: "My first speech", tag: "Public Speaking", gradient: "amberRose" },
    { id: "speaks-confidently", kind: "Parent story", quote: "She speaks with much more confidence.", tag: "Communication", gradient: "violetBlue" },
    { id: "progress-clearly", kind: "Parent story", quote: "We could see the progress clearly.", tag: "Progress tracking", gradient: "inkBlue" },
  ] satisfies Reel[],
  // A reel's accessible name: it carries all of the reel's visible text, in reading order, so
  // speech-input users can say what they see (WCAG 2.5.3 Label in Name).
  playLabel: "Play video: {kind}. {quote} {tag}",
  ctaText: "Want progress like this for your child?",
  cta: bookCta,
  previous: "Previous videos",
  next: "Next videos",
  video: { label: "Story video", note: "Video will play here", close: "Close video" },
  feedback: {
    mark: logos.mark,
    app: "SPELLZEE",
    live: "Live class feedback",
    dismiss: "Dismiss",
    title: "New message from {kid}’s class",
    stars: "5 out of 5 stars",
    byline: "with {tutor} · {date}",
    delivered: "Delivered",
    when: { now: "Just now", minutes: "{n} min ago", hours: "{n} hr ago", yesterday: "Yesterday" },
    // TODO(product): confirm these are real parent messages and that showing them with times
    // relative to the visitor's clock ("12 min ago") is acceptable.
    messages: [
      { id: "shivansh", kid: "Shivansh S.", initials: "SS", tutor: "Dimple N.", slot: "8:30 to 9:00 PM", days: [1, 2, 3, 4, 5], endHour: 21, endMinute: 0, text: "Excellent", avatar: "blue" },
      { id: "michelle", kid: "Michelle R.", initials: "MR", tutor: "Syed Sadiya S.", slot: "7:00 to 8:00 PM", days: [1, 2, 3, 4, 5], endHour: 20, endMinute: 0, text: "I had a lot of fun at class.", avatar: "plum" },
      { id: "mohammed-1", kid: "Mohammed A.", initials: "MA", tutor: "Kavyadarshini S.", slot: "7:00 to 8:00 PM", days: [1, 2, 3, 4, 5], endHour: 20, endMinute: 0, text: "Today’s class went very well. Thank you so much!", avatar: "ink" },
      { id: "pujya", kid: "Pujya C.", initials: "PC", tutor: "Riya Y.", slot: "5:00 to 6:00 PM", days: [1, 2, 3, 4, 5], endHour: 18, endMinute: 0, text: "I loved the class so much. I loved the story, and I love the tenses writing. Thank you, teacher!", avatar: "green" },
      { id: "kisanth", kid: "Kisanth J.", initials: "KJ", tutor: "Rathisha K.", slot: "3:00 to 3:30 PM", days: [1, 3, 5], endHour: 15, endMinute: 30, text: "Very friendly tutor.", avatar: "olive" },
      { id: "vihaan", kid: "Vihaan R.", initials: "VR", tutor: "Muskan S.", slot: "8:00 to 9:00 PM", days: [1, 2, 3, 4, 5], endHour: 21, endMinute: 0, text: "Best class ever, ma’am. Thanks for the guidance!", avatar: "leaf" },
      { id: "mohammed-2", kid: "Mohammed A.", initials: "MA", tutor: "Kavyadarshini S.", slot: "7:00 to 8:00 PM", days: [1, 2, 3, 4, 5], endHour: 20, endMinute: 0, text: "The trainer is guiding our son well, and he enjoyed the class.", avatar: "ink" },
      { id: "arshida", kid: "Arshida", initials: "Ar", tutor: "Megha R.", slot: "7:00 to 8:00 PM", days: [2, 4, 6], endHour: 20, endMinute: 0, text: "It was very nice. I enjoyed it so much. I love the way she taught me.", avatar: "olive" },
      { id: "harshavardhan", kid: "Harshavardhan A.", initials: "AH", tutor: "Selcia J.", slot: "6:00 to 7:00 PM", days: [1, 3, 5], endHour: 19, endMinute: 0, text: "Good start, the kid is interested.", avatar: "blue" },
    ] satisfies FeedbackMessage[],
  },
};
