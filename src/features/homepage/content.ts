/**
 * All homepage copy and list data, verbatim from screens/homepage/Main.dc.html.
 * `{word}`-style placeholders are filled in by the component that owns the value.
 */
import type {
  BlendWord,
  ClmStep,
  Credential,
  Faq,
  HeroTag,
  IconItem,
  ImageAsset,
  Link,
  Program,
  ReportRow,
  Skill,
  Stat,
  Step,
  Story,
} from "./types";

const img = (name: string, alt: string, width: number, height: number): ImageAsset => ({
  src: `/images/homepage/${name}`,
  alt,
  width,
  height,
});

export const meta = {
  title: "Spellzee — Help Your Child Read, Write and Speak with Confidence | CLM",
  description:
    "Cognitive Literacy Mapping pinpoints where your child needs support — then a dedicated 1:1 mentor takes them forward. Book a free assessment.",
};

export const header = {
  logo: img("spellzee-logo.png", "Spellzee — Cognitive Literacy Mapping for kids", 524, 150),
  homeHref: "#top",
  skipLink: { label: "Skip to main content", href: "#main" },
  navLabel: "Main",
  nav: [
    { label: "Approach", href: "#clm" },
    { label: "Programs", href: "#programs" },
    { label: "Stories", href: "#stories" },
    { label: "Educators", href: "#educators" },
    { label: "FAQ", href: "#faq" },
  ] satisfies Link[],
  cta: { label: "Book a Free Assessment", href: "#book" },
};

export const hero = {
  image: img(
    "hero-child.jpg",
    "A thoughtful child smiling upward, surrounded by a glowing map linking icons for Sound Recognition, Blending, Fluency and Comprehension",
    1672,
    941,
  ),
  tags: [
    { id: "sound", label: "Sound Recognition", tip: "Hearing, separating and blending the individual sounds in spoken words.", x: "53.4%", y: "14%", dot: "blue" },
    { id: "fluency", label: "Fluency", tip: "Reading and speaking smoothly, clearly and with confidence.", x: "55.5%", y: "58.5%", dot: "amber" },
    { id: "blending", label: "Blending", tip: "Turning letters into sounds and blending them into words.", x: "89.5%", y: "38.5%", dot: "violet" },
    { id: "comprehension", label: "Comprehension", tip: "Understanding, interpreting and answering questions about what's been read.", x: "90.5%", y: "60.5%", dot: "cyan" },
  ] satisfies HeroTag[],
  badges: { intro: "Introducing CLM", incubated: "IITM Incubated" },
  title: { lines: ["Let’s help your child", "read, write and speak", "with "], accent: "confidence." },
  lead: {
    strong: "Cognitive Literacy Mapping",
    middle: " pinpoints where your child needs support — then a ",
    mark: "dedicated 1:1 mentor",
    after: " takes them forward.",
  },
  highlights: [
    { id: "expert", highlight: "1:1", label: " Expert-Led Learning", icon: "user", tone: "blue" },
    { id: "path", label: "Personalised Learning Path", icon: "route", tone: "rose" },
    { id: "progress", label: "Progress You Can See", icon: "trend", tone: "green" },
  ] as const,
  primaryCta: { label: "Get a Free Improvement Plan", href: "#book" },
  secondaryCta: { label: "See how CLM works", href: "#clm" },
  credentialsLabel: "Accreditations & Recognition",
  credentials: [
    { id: "iitm", name: "IITM", caption: "Incubated Company", logo: img("iitm-logo.png", "IITM Incubation Cell logo", 300, 300), logoClass: "size-[46px]" },
    { id: "actd", name: "ACTD", caption: "Accredited", logo: img("actd-emblem.png", "ACTD accreditation emblem", 520, 508), logoClass: "size-10 object-contain" },
  ] satisfies Credential[],
  ledger: [
    { id: "cancel", title: "Cancel anytime", description: "Month-to-month. No lock-in, ever.", icon: "calendar", tone: "blue" },
    { id: "refund", title: "7-day refund", description: "Full refund within 7 days of your first class.", icon: "refund", tone: "green" },
    { id: "guarantee", title: "Satisfaction guaranteed", description: "We stand behind every learning plan we build with your child.", icon: "shield", tone: "rose" },
    { id: "rating", title: "95% parent satisfaction", description: "Rated across our 1:1 programmes.", icon: "star", tone: "amber" },
  ] satisfies IconItem[],
};

export const clm = {
  badge: { before: "Spellzee’s ", highlight: "CLM", after: " Methodology", mark: img("spellzee-mark.png", "", 148, 160) },
  title: { before: "Cognitive Literacy ", highlight: "Mapping", trademark: "™" },
  tagline: { before: "Before we teach, we ", mark: "understand." },
  intro: {
    before: "Every child processes language differently. ",
    strong: "Cognitive Literacy Mapping",
    after:
      " is Spellzee’s structured way of finding your child’s strengths and gaps across reading, writing and speaking — so we know where to begin, what to strengthen, and how to move forward.",
  },
  brain: img("clm-brain.png", "A glowing brain with neural pathways, representing how CLM maps a child's literacy skills", 460, 400),
  skills: [
    { id: "phonemic", name: "Phonemic Awareness", alt: "Sound Recognition", description: "Hearing, separating, and blending the individual sounds in spoken words. Every confident reader builds on this.", tone: "cobalt", icon: "ear", side: "left", y: 25 },
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
  title: { before: "Select the ", mark: "difficulty", after: " your child is facing" },
  lead: "Choose the area where your child needs the most support.",
  focusLabel: "Focus skills",
  items: [
    { id: "reading", title: "Reading & Spelling", href: "/phonics", page: "Phonics", description: "Struggles to read fluently or spell words correctly.", tone: "blue", icon: "book", focusSkills: [{ label: "Phonemic Awareness", tone: "cobalt" }, { label: "Decoding", tone: "iris" }, { label: "Spelling", tone: "orchid" }] },
    { id: "comprehension", title: "Comprehension", href: "/comprehension", page: "Comprehension", description: "Can read, but finds it difficult to understand, interpret, or answer questions.", tone: "green", icon: "bulb", focusSkills: [{ label: "Decoding", tone: "iris" }, { label: "Comprehension", tone: "emerald" }] },
    { id: "communication", title: "Communication", href: "/grammar-and-communication", page: "Communication", description: "Finds it difficult to express thoughts clearly and confidently.", tone: "rose", icon: "mic", focusSkills: [{ label: "Spoken English", tone: "rose" }, { label: "Grammar", tone: "iris" }] },
    { id: "public-speaking", title: "Public Speaking", href: "/public-speaking", page: "Public Speaking", description: "Feels hesitant or nervous while speaking in front of others.", tone: "amber", icon: "stage", focusSkills: [{ label: "Delivery Techniques", tone: "amber" }, { label: "Anxiety Management", tone: "green" }] },
  ] satisfies Program[],
  explorePrefix: "Explore ",
  help: {
    title: "Not sure which difficulty fits?",
    body: "A free assessment maps your child's reading, writing and speaking — then we recommend the right programme.",
    cta: { label: "Book a Free Assessment", href: "#book" },
  },
};

export const oneOnOne = {
  kicker: "Why 1:1 works",
  title: { before: "1:1 live learning for your child to reach their ", accent: "full potential" },
  tagline: "One child. One mentor. Real attention. Clear progress.",
  /** the big decorative "1:1" (colon is drawn) */
  ratio: ["1", "1"],
  lead: "Personalised 1:1 live sessions give your child the space to learn at their own pace, ask questions freely, overcome learning gaps, and build confidence step by step.",
  assurances: [
    { id: "safe", title: "Safe & Secure Learning", icon: "shieldOutline", tone: "green" },
    { id: "trusted", title: "Trusted by 10,000+ Learners · Parent Approved", icon: "userPair", tone: "sky" },
    { id: "proven", title: "Proven Improvement in Reading & Communication", icon: "trend", tone: "violetDeep" },
  ] satisfies IconItem[],
  mentor: { image: img("mentor-avatar.jpg", "A Spellzee mentor", 360, 360), label: "One mentor" },
  student: { image: img("student-avatar.jpg", "A Spellzee student", 360, 360), label: "One child" },
  features: [
    { id: "mentor", title: "Dedicated 1:1 Mentor", description: "The same mentor, every session — not a rotating roster.", icon: "user", tone: "blue" },
    { id: "lessons", title: "Personalised Lessons", description: "As per your child's level.", icon: "layers", tone: "rose" },
    { id: "doubts", title: "Doubt-Free Learning", description: "Ask anything, anytime.", icon: "chat", tone: "green" },
    { id: "progress", title: "Visible Progress", description: "Regular feedback & reports.", icon: "chart", tone: "amber" },
  ] satisfies IconItem[],
};

export const classroom = {
  kicker: "Live 1:1 Learning Experience",
  title: { before: "Inside a Spellzee ", accent: "classroom" },
  lead: "Real teachers. Real interaction. Real progress. Try the activities below to see how your child learns in a 1:1 live session.",
  experienceTitle: "Classroom Experience",
  photo: img("classroom-live-class.jpg", "A Spellzee mentor holding up an 'sh' flashcard during a live 1:1 video class with a young student", 800, 488),
  liveBadge: "Live 1:1 class",
  activitiesLabel: "Classroom activities",
  tabs: ["Blend sounds", "Read & answer"],
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
    retry: "Not quite — listen again and try a new order.",
    reset: "↻ Try again",
    next: "Next word →",
  },
  read: {
    passage: "Mia saw a red kite stuck in the old tree. She asked her brother Arjun to help. He climbed up and passed it down to her.",
    question: "Who helped Mia get the kite?",
    options: ["Her teacher", "Her brother Arjun", "A neighbour"],
    correctIndex: 1,
    right: "Spot on — you found the answer in the text.",
    wrong: "Not quite — look again at the second sentence.",
  },
  duringTitle: "During the Class",
  during: [
    { id: "interactive", label: "Interactive learning activities", tone: "sky" },
    { id: "correction", label: "Real-time correction", tone: "roseDeep" },
    { id: "guided", label: "Guided practice", tone: "amberDeep" },
    { id: "visual", label: "Visual learning support", tone: "greenDeep" },
  ] as const,
  materialsTitle: "Learning Materials",
  materialsLead: "Matched to your child's stage, so every session has something to build on.",
  materials: [
    { id: "worksheets", title: "Level-based worksheets", icon: "clip", tone: "blue" },
    { id: "decodable", title: "Decodable reading resources", icon: "book", tone: "rose" },
    { id: "practice", title: "Practice activities", icon: "pencil", tone: "amber" },
    { id: "flashcards", title: "Flashcards and visual resources", icon: "layers", tone: "green" },
    { id: "assignments", title: "Progress assignments", icon: "trend", tone: "violet" },
  ] satisfies IconItem[],
  flashcards: ["sh", "ch", "th"],
  scale: { from: "Beginner", to: "Advanced" },
  closing: "Learn live. Practise better. Progress continuously.",
};

export const stories = {
  kicker: "Parent Voices",
  title: { before: "Stories of ", accent: "progress" },
  lead: "Watch real parents share their child's learning journey with Spellzee.",
  playLabel: "Play parent story video",
  storyLabel: "Parent story",
  items: [
    { id: "independent", quote: "She now reads independently.", programme: "Reading & Spelling", tone: "blue" },
    { id: "spelling", quote: "His spelling confidence improved.", programme: "Reading & Spelling", tone: "rose" },
    { id: "speaking", quote: "She speaks with much more confidence.", programme: "Communication", tone: "green" },
    { id: "progress", quote: "We could see the progress clearly.", programme: "Progress tracking", tone: "amber" },
  ] satisfies Story[],
};

export const educators = {
  kicker: "Our Educators",
  title: "Behind the classroom",
  lead: "Meet the educators who guide, support, and shape every child's learning journey.",
  featured: {
    photo: img("educator-ananya-rao.jpg", "Ms. Ananya Rao, Phonics & Reading Specialist", 360, 448),
    badge: "Spellzee Certified",
    role: "Phonics & Reading Specialist",
    name: "Ms. Ananya Rao",
    credentials: ["M.A. English, B.Ed.", "8+ Years of Teaching Experience", "Spellzee Certified Educator"],
  },
  stat: {
    value: "300+",
    title: "Trained Educators. One shared goal — meaningful progress for every child.",
    body: "Every Spellzee educator is trained to teach, guide and support children one-to-one.",
    subjects: ["Reading & Spelling", "Comprehension", "Communication", "Public Speaking"],
  },
};

export const parentSupport = {
  kicker: "More than classes",
  title: "We don't disappear after enrollment.",
  lead: "At Spellzee, we stay involved, keep parents informed, monitor progress, and support every stage of the child's learning journey — setting a higher standard in Parent–Student first learning.",
  items: [
    { id: "guidance", title: "Teacher guidance", description: "Personalised support throughout", icon: "users", tone: "blue" },
    { id: "monitoring", title: "Academic monitoring", description: "Track learning progress", icon: "bars", tone: "rose" },
    { id: "updates", title: "Parent updates", description: "Stay informed, always", icon: "bell", tone: "amber" },
    { id: "continuous", title: "Continuous progress", description: "Support at every stage", icon: "loop", tone: "green" },
  ] satisfies IconItem[],
};

export const community = {
  notes: { left: ["Real", "Families", "Real Progress"], right: ["A brighter", "tomorrow", "together"] },
  kicker: "Our Learning Community",
  title: { line1: "Thousands of parents.", before: "One shared goal: ", accent: "better learning", after: " for their child." },
  lead: "Be part of a growing community of families helping their children learn with confidence, clarity, and the right support.",
  stats: [
    { id: "students", value: "10,000+", label: "Students Guided", icon: "users", tone: "blue" },
    { id: "parents", value: "10,000+", label: "Parents Trust Spellzee", icon: "heart", tone: "rose" },
    { id: "educators", value: "300+", label: "Trained Educators", icon: "star", tone: "green" },
    { id: "sessions", value: "25,000+", label: "Live Sessions Every Month", icon: "live", tone: "violet" },
  ] satisfies Stat[],
  cta: { label: "Book a Free Assessment", href: "#book" },
  mosaic: img("community-mosaic.jpg", "A mosaic of Spellzee families and children smiling together", 2530, 508),
  trust: [
    { id: "parents", title: "Trusted by Parents", description: "95% parent satisfaction", icon: "shield", tone: "blue" },
    { id: "diverse", title: "Diverse Learners", description: "Every learning stage", icon: "users", tone: "rose" },
    { id: "live", title: "Live 1:1 Classes", description: "One child, one mentor", icon: "live", tone: "green" },
    { id: "real", title: "Real Improvements", description: "Reading, spelling & confidence", icon: "bars", tone: "violet" },
  ] satisfies IconItem[],
};

export const book = {
  kicker: "After you book",
  title: "No sales pitch. Just clarity on where your child stands.",
  lead: "Here's exactly what happens when you book a free assessment — nothing more, nothing hidden.",
  steps: [
    { n: "1", title: "A call with a counsellor", description: "We understand your child's current reading, writing and speaking, in plain conversation." },
    { n: "2", title: "A live diagnostic demo", description: "Your child joins a real 1:1 session with a mentor, so you see Spellzee in action first." },
    { n: "3", title: "Your personalised report", description: "A written diagnostic report with your child's current level and a recommended learning path." },
  ] satisfies Step[],
  cta: { label: "Book a Free Assessment", href: "#cta" },
  report: {
    chip: "Sample report",
    child: "Aarav, age 7",
    test: "Reading & Spelling diagnostic",
    stage: "Early Reader",
    stageOf: "Stage 2 of 5",
    rows: [
      { id: "phonemic", label: "Phonemic Awareness", value: 72, tone: "blue", delay: "0s" },
      { id: "decoding", label: "Decoding", value: 65, tone: "violet", delay: ".15s" },
      { id: "comprehension", label: "Comprehension", value: 58, tone: "emerald", delay: ".3s" },
      { id: "confidence", label: "Confidence", value: 80, tone: "pink", delay: ".45s" },
    ] satisfies ReportRow[],
    focusLabel: "Recommended focus —",
    focus: " daily 15-minute sound-blending practice, alongside guided comprehension reading, over the next 4 weeks.",
    note: "This is a sample for illustration. Every child receives their own report, built from their own assessment.",
  },
};

export const faq = {
  title: { line1: "Frequently asked", accent: "questions" },
  lead: "Everything you need to know about how Spellzee works, our classes, and your child's learning journey — all in one place.",
  help: {
    title: "Still have a question?",
    body: "Book a free assessment and we'll walk you through it.",
    cta: { label: "Book a Free Assessment", href: "#book" },
  },
  items: [
    { id: "plan", question: "How does Spellzee decide the right learning plan for my child?", answer: "Spellzee first understands your child's current learning stage and areas that need support through Cognitive Literacy Mapping — a live diagnostic that identifies exactly where to begin. The learning path is then personalised around those needs.", showSteps: true },
    { id: "assessment", question: "What happens when I book the free assessment?", answer: "You'll get a call from a Spellzee counsellor, followed by a live diagnostic demo class for your child. You'll then receive a personalised report with your child's current level and next steps — no pressure, no obligation." },
    { id: "one-on-one", question: "Are Spellzee classes 1:1?", answer: "Yes. Spellzee offers focused 1:1 live learning experiences with a dedicated mentor who stays with your child throughout their journey — not a rotating roster of teachers." },
    { id: "clm", question: "What is Cognitive Literacy Mapping (CLM)?", answer: "CLM is Spellzee's structured method for understanding a child's current reading, writing and speaking ability before building their learning path — mapping strengths and gaps across six core skills: phonemic awareness, decoding, comprehension, spelling, writing, and communication." },
    { id: "tracking", question: "How do you track my child's progress?", answer: "Progress is monitored through learning milestones, educator feedback, practice performance, and regular academic review shared directly with parents." },
    { id: "updates", question: "Do parents receive updates about their child?", answer: "Yes. We don't disappear after enrollment — parents receive regular updates, educator feedback and progress reviews, so you always know how your child is doing and what comes next." },
    { id: "ages", question: "What age groups does Spellzee support?", answer: "Spellzee supports children across different learning stages, with programmes designed according to each child's current ability and needs." },
    { id: "struggles", question: "Can Spellzee help if my child struggles with reading or spelling?", answer: "Yes. Your child's present reading and spelling abilities are assessed first through CLM, so we can identify the right starting point and build the learning path from there." },
    { id: "materials", question: "What learning materials are provided?", answer: "Children receive materials matched to their level, including worksheets, decodable reading resources, practice activities, and flashcards." },
    { id: "lock-in", question: "Is there any lock-in or long-term commitment?", answer: "No. Spellzee runs on a simple month-to-month subscription. There's no lock-in — you can continue for as long as it's working for your child, and cancel anytime." },
    { id: "refund", question: "What if Spellzee isn't the right fit for my child?", answer: "You can claim a full refund within 7 days of your child's first class. Every learning plan we build is backed by our satisfaction guarantee." },
    { id: "emi", question: "Do you offer EMI or instalment plans?", answer: "Not currently. Because Spellzee is month-to-month with no lock-in, there's no long-term payment commitment to begin with." },
    { id: "free-plan", question: "How can I get my child's Free Spellzee Improvement Plan?", answer: "Book a free assessment. After a short call with a counsellor and a live diagnostic demo, you'll receive your child's personalised report and improvement plan — free, with no obligation." },
  ] satisfies Faq[],
};

export const cta = {
  title: { before: "Get Your Child's Free Spellzee ", accent: "Improvement Plan" },
  body: "Understand where your child stands and what they should focus on next.",
  // TODO(product): the export points this CTA at its own section (#cta); needs the real booking URL.
  button: { label: "Book a Free Assessment", href: "#cta" },
};

export const footer = {
  brand: "Spellzee",
  mark: img("spellzee-mark.png", "", 148, 160),
  tagline: { before: "Happy Learners. ", accent: "Brighter Futures." },
  blurb: "Helping children become confident readers, writers, and speakers.",
  newsletter: {
    title: "Stay in the loop with Spellzee",
    body: "Get learning tips, updates and resources for your child.",
    label: "Email address",
    placeholder: "Your email address",
    submit: "Subscribe",
    pending: "Subscribing…",
  },
  columns: [
    {
      id: "programs",
      title: "Programs",
      links: [
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
    iitm: { label: "IITM Incubated Company", logo: img("iitm-logo.png", "IITM Incubation Cell logo", 300, 300) },
    actd: { label: "ACTD Accredited", logo: img("actd-emblem.png", "ACTD accreditation emblem", 520, 508) },
    plain: ["Safe & Secure Learning", "Trusted by 10,000+ Parents", "Child-Centric Approach"],
  },
  copyright: "© 2026 Spellzee. All rights reserved.",
  company: "Spellzee Edutech Solutions Pvt. Ltd.",
};
