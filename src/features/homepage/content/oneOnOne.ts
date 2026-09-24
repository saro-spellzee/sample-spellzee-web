/** "Why 1:1 works": the live 1:1 class band. */
import type { IconItem } from "../types";
import { img } from "./shared";

export const oneOnOne = {
  kicker: "Why 1:1 Works",
  title: { before: "Live 1:1 Classes Built Around ", mark: "Your Child" },
  tagline: "One child. One mentor. Real progress.",
  /** the big decorative "1:1" (colon is drawn) */
  ratio: ["1", "1"],
  lead: "Your child learns at their own pace, asks questions freely and grows in confidence, with a mentor who knows them.",
  assurances: [
    { id: "safe", title: "Safe & Secure Learning", icon: "shieldOutline", tone: "green" },
    { id: "trusted", title: "Trusted by 10,000+ Learners · Parent Approved", icon: "userPair", tone: "sky" },
    { id: "proven", title: "Proven Improvement in Reading & Communication", icon: "trend", tone: "violetDeep" },
  ] satisfies IconItem[],
  mentor: { image: img("mentor-avatar.jpg", "A Spellzee mentor", 360, 360), label: "One mentor" },
  student: { image: img("student-avatar.jpg", "A Spellzee student", 360, 360), label: "One child" },
  features: [
    { id: "mentor", title: "Dedicated 1:1 Mentor", icon: "user", tone: "blue" },
    { id: "lessons", title: "Personalised Lessons", icon: "layers", tone: "rose" },
    { id: "doubts", title: "Doubt-Free Learning", icon: "chat", tone: "green" },
    { id: "progress", title: "Visible Progress", icon: "chart", tone: "amber" },
  ] satisfies IconItem[],
};
