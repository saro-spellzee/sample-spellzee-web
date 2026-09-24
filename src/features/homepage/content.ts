/**
 * All homepage copy and list data, verbatim from screens/homepage/Main.dc.html.
 * `{word}`-style placeholders are filled in by the component that owns the value.
 */
import type { Tone } from "@/components/ui/tones";
import type {
  BlendWord,
  BookStep,
  BookingDifficulty,
  ClmStep,
  Credential,
  Faq,
  FaqCard,
  FeedbackMessage,
  Flashcard,
  HeroTag,
  IconItem,
  ImageAsset,
  LearningTool,
  Link,
  Mentor,
  MentorFilter,
  PlanWeek,
  Program,
  ReaderWord,
  Reel,
  ReportRing,
  Skill,
  Stat,
  WorksheetQuestion,
} from "./types";

const img = (name: string, alt: string, width: number, height: number): ImageAsset => ({
  src: `/images/homepage/${name}`,
  alt,
  width,
  height,
});

const logos = {
  iitm: img("iitm-logo.png", "IITM Incubation Cell logo", 300, 300),
  actd: img("actd-emblem.png", "ACTD accreditation emblem", 520, 508),
  mark: img("spellzee-mark.png", "", 148, 160),
};

/** The "Book a Free Demo Class" call to action used across the page (opens the booking dialog). */
const bookCta = { label: "Book a Free Demo Class", href: "#book" };

export const meta = {
  // The export's <title>; ≤60 chars so search results show it in full.
  title: "Spellzee — Read. Write. Speak. Confidently | CLM Learning",
  description:
    "Spellzee’s Cognitive Literacy Mapping (CLM) methodology helps your child read, write and speak confidently through adaptive 1:1 live classes.",
};

export const motion = { pause: "Pause motion", play: "Play motion" };

export const header = {
  logo: img("spellzee-logo.png", "Spellzee: Cognitive Literacy Mapping for kids", 524, 150),
  homeHref: "#top",
  skipLink: { label: "Skip to main content", href: "#main" },
  navLabel: "Main",
  mobileNavLabel: "Mobile",
  menuLabel: "Menu",
  nav: [
    { label: "Approach", href: "#clm" },
    { label: "Programs", href: "#programs" },
    { label: "How it works", href: "#book" },
    { label: "Stories", href: "#stories" },
    { label: "Mentors", href: "#educators" },
    { label: "FAQ", href: "#faq" },
  ] satisfies Link[],
  cta: bookCta,
};

export const hero = {
  image: img(
    "hero-child.jpg",
    "A thoughtful child smiling upward, surrounded by a glowing map linking icons for Sound Recognition, Blending, Fluency and Comprehension",
    1672,
    941,
  ),
  tags: [
    { id: "sound", label: "Sound Recognition", tip: "Hearing, segmenting and blending the individual sounds in spoken words.", x: "53.4%", y: "14%", dot: "blue" },
    { id: "fluency", label: "Fluency", tip: "Reading and speaking smoothly, clearly and with confidence.", x: "55.5%", y: "58.5%", dot: "amber" },
    { id: "blending", label: "Blending", tip: "Turning letters into sounds and blending them into words.", x: "89.5%", y: "38.5%", dot: "violet" },
    { id: "comprehension", label: "Comprehension", tip: "Understanding, interpreting and answering questions about what's been read.", x: "90.5%", y: "60.5%", dot: "cyan" },
  ] satisfies HeroTag[],
  badges: {
    method: { before: "Spellzee’s ", strong: "CLM", after: " Methodology" },
    incubated: "IITM Incubated Company",
  },
  title: {
    /** What screen readers hear: the rotating words are hidden from them. */
    spoken: "Read. Write. Speak. Confidently, independently and effortlessly.",
    line: "Read. Write. Speak.",
    words: [
      { text: "Confidently.", tone: "blue" },
      { text: "Independently.", tone: "iris" },
      { text: "Effortlessly.", tone: "pink" },
    ] satisfies { text: string; tone: Tone }[],
  },
  lead: {
    before: "Spellzee’s ",
    strong: "Cognitive Literacy Mapping (CLM)",
    middle: " methodology develops these skills together through an ",
    strong2: "Adaptive 1:1 Learning Process",
    after: ".",
  },
  highlights: [
    { id: "expert", highlight: "1:1", label: " Expert Led Learning", icon: "user", tone: "blue" },
    { id: "path", label: "Personalised Learning Path", icon: "route", tone: "rose" },
    { id: "progress", label: "Progress You Can See", icon: "trend", tone: "green" },
  ] as const,
  language: {
    label: "Native Language Support",
    icon: "globe",
    tone: "amber",
    names: [
      { text: "English", lang: "en" },
      { text: "தமிழ்", lang: "ta" },
      { text: "മലയാളം", lang: "ml" },
      { text: "हिन्दी", lang: "hi" },
    ],
    spoken: "in English, Tamil, Malayalam and Hindi",
  } as const,
  primaryCta: { label: "Get Free Spellzee Improvement Plan", href: "#book" },
  secondaryCta: { label: "See how CLM works", href: "#clm" },
  credentialsLabel: "Accreditations & Recognition",
  credentials: [
    { id: "iitm", name: "IITM", caption: "Incubated Company", logo: logos.iitm, logoClass: "size-[46px]" },
    { id: "actd", name: "ACTD", caption: "Accredited", logo: logos.actd, logoClass: "size-10 object-contain" },
  ] satisfies Credential[],
  ledger: [
    { id: "progress", title: "Guaranteed Progress", icon: "trend", tone: "green" },
    { id: "satisfaction", title: "98% Parent Satisfaction", icon: "star", tone: "amber" },
    { id: "per-class", title: "Pay Per Class, Not Monthly", icon: "calendar", tone: "blue" },
    { id: "refund", title: "Get Refund in 30 Mins", icon: "refund", tone: "rose" },
  ] satisfies IconItem[],
};

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

export const programs = {
  kicker: "Tailored Support",
  title: { before: "Select the ", mark: "Difficulty", after: " Your Child Is Facing" },
  lead: "Choose the area where your child needs the most support.",
  focusLabel: "Focus skills",
  items: [
    // The export links Phonics to its own design board ("Phonics.dc.html"); the site route is /phonics.
    { id: "reading", title: "Reading & Spelling", href: "/phonics", page: "Phonics", description: "Struggles to read fluently or spell words correctly.", tone: "blue", icon: "book", focusSkills: [{ label: "Phonemic Awareness", tone: "cobalt" }, { label: "Decoding", tone: "iris" }, { label: "Spelling", tone: "orchid" }] },
    { id: "comprehension", title: "Comprehension", href: "/comprehension", page: "Comprehension", description: "Can read, but finds it difficult to understand, interpret, or answer questions.", tone: "green", icon: "bulb", focusSkills: [{ label: "Decoding", tone: "iris" }, { label: "Comprehension", tone: "emerald" }] },
    { id: "communication", title: "Communication", href: "/grammar-and-communication", page: "Communication", description: "Finds it difficult to express thoughts clearly and confidently.", tone: "rose", icon: "mic", focusSkills: [{ label: "Spoken English", tone: "rose" }, { label: "Grammar", tone: "iris" }] },
    { id: "public-speaking", title: "Public Speaking", href: "/public-speaking", page: "Public Speaking", description: "Feels hesitant or nervous while speaking in front of others.", tone: "amber", icon: "stage", focusSkills: [{ label: "Delivery Techniques", tone: "amber" }, { label: "Anxiety Management", tone: "green" }] },
  ] satisfies Program[],
  explorePrefix: "Explore ",
  help: {
    title: "Not sure which difficulty fits?",
    body: "A free assessment maps your child's reading, writing and speaking, then we recommend the right programme.",
    cta: bookCta,
  },
};

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
  playLabel: "Play video: {quote}",
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

const seals = [
  { id: "iitm", name: "IITM", caption: " Incubated Company", logo: logos.iitm },
  { id: "actd", name: "ACTD", caption: " Accredited", logo: logos.actd },
];

export const parentSupport = {
  kicker: "More Than Classes",
  title: { before: "We Don’t Disappear After ", mark: "Enrollment." },
  lead: {
    before: "We stay involved, keep parents informed, monitor progress and support every stage of your child’s journey, with our ",
    strong: "Parents and Students First Approach",
    after: ".",
  },
  items: [
    { id: "guidance", title: "Teacher Guidance", description: "Your child’s mentor gives personalised support in every class.", icon: "users", tone: "blueLight" },
    { id: "monitoring", title: "Academic Monitoring", description: "We track your child’s learning progress week by week.", icon: "bars", tone: "roseLight" },
    { id: "updates", title: "Parent Updates", description: "You stay informed through regular updates and reports.", icon: "bell", tone: "amberLight" },
    { id: "continuous", title: "Continuous Progress", description: "We support your child at every stage of the journey.", icon: "loop", tone: "mintLight" },
  ] satisfies IconItem[],
  seals,
};

export const community = {
  kicker: "The Spellzee Network",
  title: { before: "10,000+ Families. One ", brand: "Spellzee", after: " Network", end: "." },
  lead: "A growing network of families helping their children learn with confidence, clarity and the right support.",
  cta: bookCta,
  photosLabel: "Photos of Spellzee families",
  strips: [
    { id: "families-1", image: img("community-strip-1.jpg", "Spellzee families and children", 4096, 240), direction: "left", duration: "180s" },
    { id: "families-2", image: img("community-strip-2.jpg", "", 3630, 240), direction: "right", duration: "160s" },
    { id: "families-3", image: img("community-strip-3.jpg", "", 3368, 240), direction: "left", duration: "150s" },
  ] as const,
  stats: [
    { id: "students", value: "10,000+", label: "Students Guided", icon: "users", tone: "blue" },
    { id: "parents", value: "10,000+", label: "Parents Trust Spellzee", icon: "heart", tone: "rose" },
    { id: "educators", value: "300+", label: "Trained Educators", icon: "star", tone: "green" },
    { id: "sessions", value: "25,000+", label: "Live Sessions Every Month", icon: "live", tone: "violet" },
    { id: "minutes", value: "3 Million+", label: "Minutes of Live Classes", icon: "live", tone: "amber" },
  ] satisfies Stat[],
};

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
      { label: "Strength", dot: "bg-tone-pink" },
      { label: "Developing", dot: "bg-[#6D8BFF]" },
      { label: "Priority", dot: "bg-tone-emerald" },
    ],
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
  items: [
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
  ] satisfies Faq[],
  /** Chevron/dot accents, cycled per question. */
  accents: ["rose", "amber", "green", "blue", "violet"] as const,
  extras: {
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
  },
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
      { id: "iitm", logo: { ...logos.iitm, alt: "IITM Incubation Cell" }, className: "size-[30px]" },
      { id: "actd", logo: { ...logos.actd, alt: "ACTD" }, className: "size-6 object-contain" },
    ],
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
  errors: {
    kid: "Please enter your child’s name.",
    grade: "Please enter your child’s grade or class.",
    difficulties: "Please pick at least one area (or “Not sure yet”).",
    parent: "Please enter your name.",
    phone: "Please enter a valid 10-digit Indian mobile number.",
    slot: "Please pick a day and a time for the demo.",
    consent: "Please confirm you are the parent or guardian.",
  },
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

export const footer = {
  brand: "Spellzee",
  mark: logos.mark,
  tagline: { before: "Happy Learners. ", accent: "Brighter Futures." },
  blurb: "Helping children become confident readers, writers, and speakers.",
  newsletter: {
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
  },
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
