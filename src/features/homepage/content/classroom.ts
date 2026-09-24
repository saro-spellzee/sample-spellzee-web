/** Inside a Spellzee classroom: the live class card and the learning tools. */
import type { BlendWord, Flashcard, IconItem, LearningTool, ReaderWord, WorksheetQuestion } from "../types";
import { img } from "./shared";

export const classroom = {
  kicker: "Live 1:1 Learning Experience",
  title: { before: "Inside a ", brand: "Spellzee", after: " Classroom" },
  lead: "Real teachers, real interaction. Try the tools your child uses in every session.",
  badges: ["1:1 Live Class", "Daily Practice", "Weekly Report", "PTM"],
  live: {
    photo: img("classroom-live-class.jpg", "A Spellzee mentor holding up an 'sh' flashcard during a live 1:1 video class with a young student", 800, 488),
    badge: "Live 1:1 class",
    speaking: "Mentor speaking",
    praise: "“sh”: perfect sound!",
    title: "Classroom Experience",
    body: "Every session is live, face-to-face and built on your child's level.",
    during: [
      { id: "interactive", title: "Interactive activities", icon: "cards", tone: "sky" },
      { id: "correction", title: "Real-time correction", icon: "check", tone: "roseDeep" },
      { id: "guided", title: "Guided practice", icon: "userPair", tone: "amberDeep" },
      { id: "visual", title: "Visual learning support", icon: "eye", tone: "greenDeep" },
    ] satisfies IconItem[],
    rating: { score: "4.8", label: "Rated 4.8 out of 5 on Google", source: "on Google", /** fill of the fifth star, % */ lastStar: 80 },
  },
  tools: {
    title: "Try the Learning Tools",
    counter: "{n} of {total} · Tap a tool to try it",
    label: "Learning tools",
    suits: "Suits",
    allStages: "All stages",
    stageRange: "Stages {from} to {to}",
    items: [
      { id: "blend", label: "Blend Sounds", kind: "Practice activity", hint: "Tap the sounds in order", tone: "blue", icon: "layers", from: 1, to: 2 },
      { id: "flashcards", label: "Flashcards", kind: "Flashcards", hint: "Tap the card to flip it", tone: "rose", icon: "cards", from: 1, to: 3 },
      { id: "worksheet", label: "Worksheet", kind: "Level-based worksheet", hint: "Pick the missing sound", tone: "amber", icon: "clip", from: 2, to: 3 },
      { id: "reader", label: "Decodable Reader", kind: "Decodable reading", hint: "Tap a word to see its sounds", tone: "green", icon: "book", from: 2, to: 4 },
      { id: "progress", label: "Progress", kind: "Progress assignments", hint: "Tick off this week’s tasks", tone: "violet", icon: "trend", from: 1, to: 5 },
    ] satisfies LearningTool[],
  },
  blend: {
    words: [
      { word: "ship", parts: ["sh", "i", "p"], shown: [2, 0, 1] },
      { word: "chat", parts: ["ch", "a", "t"], shown: [1, 2, 0] },
      { word: "thin", parts: ["th", "i", "n"], shown: [2, 1, 0] },
      { word: "cat", parts: ["c", "a", "t"], shown: [1, 0, 2] },
    ] satisfies BlendWord[],
    empty: "?",
    wrong: "✕",
    soundLabel: "Sound {sound}",
    prompt: "Tap the sounds in the order you hear them in “{word}”.",
    success: "Well blended! That spells “{word}”.",
    retry: "Not quite. Listen again and try a new order.",
    reset: "↻ Try again",
    next: "Next word →",
  },
  flashcards: {
    deck: [
      { grapheme: "sh", words: "ship · shop · fish", tone: "rose" },
      { grapheme: "ch", words: "chip · chat · lunch", tone: "blue" },
      { grapheme: "th", words: "thin · bath · moth", tone: "amber" },
      { grapheme: "ee", words: "tree · see · feet", tone: "green" },
    ] satisfies Flashcard[],
    tap: "Tap to flip",
    say: "Say it: /{grapheme}/",
    previous: "Previous card",
    next: "Next card",
    counter: "{n} / {total}",
  },
  worksheet: {
    title: "Worksheet · Level 2",
    score: "{n} / 3 correct",
    blank: "_",
    sets: [
      [
        { before: "c", after: "t", options: ["a", "o", "u"], answer: 0 },
        { before: "d", after: "g", options: ["i", "o", "e"], answer: 1 },
        { before: "s", after: "n", options: ["a", "i", "u"], answer: 2 },
      ],
      [
        { before: "b", after: "d", options: ["e", "a", "o"], answer: 0 },
        { before: "p", after: "g", options: ["i", "u", "a"], answer: 0 },
        { before: "h", after: "t", options: ["o", "e", "u"], answer: 1 },
      ],
    ] satisfies WorksheetQuestion[][],
    reset: "↻ New worksheet",
  },
  reader: {
    words: [
      { text: "Sam", sounds: ["s", "a", "m"] },
      { text: "and", sounds: ["a", "n", "d"] },
      { text: "his", sounds: ["h", "i", "s"] },
      { text: "dog", sounds: ["d", "o", "g"] },
      { text: "sit", sounds: ["s", "i", "t"] },
      { text: "in", sounds: ["i", "n"] },
      { text: "the", sounds: null },
      { text: "sun.", sounds: ["s", "u", "n"] },
    ] satisfies ReaderWord[],
    /** Index of the word selected when the reader first shows. */
    initial: 7,
    tricky: "Tricky word: learn by sight",
    note: "Every word in a decodable reader uses sounds your child has already learned.",
  },
  progress: {
    title: "This week’s assignments",
    items: [
      { title: "Blend 5 words", tag: "Phonics" },
      { title: "Read “Sam and the Sun”", tag: "Reading" },
      { title: "Spell 3 sh-words", tag: "Spelling" },
      { title: "Tell a 1-minute story", tag: "Speaking" },
    ],
    initial: [true, true, false, false],
    allDone: "All done! Your mentor reviews this week’s work.",
    pending: "Parents see these updates in their weekly report.",
  },
  closing: "Learn live. Practise better. Progress continuously.",
};
