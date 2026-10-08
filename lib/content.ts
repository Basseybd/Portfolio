// Single source for every claim on the site.
// Mirrors the Career Fact Sheet (public-safe version). Do not add metrics
// that are not in the fact sheet. No internal Capital One names or counts.

export const site = {
  name: "Bassey Duke",
  role: "Senior Software Engineer",
  email: "bassey.bd@gmail.com",
  location: "New York, NY",
  resume:
    "https://bassey-duke-static-files.s3.us-east-2.amazonaws.com/Bassey+Duke's+Resume.pdf",
  linkedin: "https://www.linkedin.com/in/basseyduke/",
  github: "https://github.com/basseybd",
  instagram: "https://www.instagram.com/bassey.bd/",
  instagramHandle: "@bassey.bd",
  photoArchive: "https://www.instagram.com/bassey.jpeg/",
  photoArchiveHandle: "@bassey.jpeg",
  url: "https://basseyduke.io",
};

export const portrait = {
  src: "/bassey-duke.jpg",
  srcSmall: "/bassey-duke-1200.jpg",
  width: 2075,
  height: 2075,
  alt: "Bassey Duke smiling in a white shirt beside an orange globe lamp, photographed on film with flash",
  title: "Bassey Duke",
  caption: "Film scan, rendered in code",
};

export type Milestone = {
  year: string;
  title: string;
  org: string;
  detail: string;
};

// Chronological. Promotion years are approximate (see the fact sheet).
export const timeline: Milestone[] = [
  {
    year: "2017",
    title: "Software Engineer",
    org: "Philadelphia Parking Authority",
    detail: "Redesigned a JavaScript UI. Python automation cut processing from days to minutes.",
  },
  {
    year: "2018",
    title: "Reliability Engineer Intern",
    org: "Comcast",
    detail: "Integrated React into a legacy codebase and brought test coverage to 99%.",
  },
  {
    year: "2020",
    title: "B.S. Computer Science, AI",
    org: "Drexel University",
    detail: "Concentration in Artificial Intelligence. AJ Drexel Scholarship.",
  },
  {
    year: "2021",
    title: "Software Engineer",
    org: "Accenture",
    detail: "Replaced HP LoadRunner with JMeter for 150+ teams, saving $2M+ a year. COVID-19 outreach platform for 1M+ patients.",
  },
  {
    year: "2022",
    title: "Software Engineer II",
    org: "Accenture",
    detail: "Generative AI website platform for Accenture Song, $100M+ in revenue within 6 months. Led the move to Amazon EKS.",
  },
  {
    year: "2025",
    title: "Program Director",
    org: "Africode",
    detail: "Appointed by the CEO to run mentorship: 12 mentors, 36 mentees, 4 countries.",
  },
  {
    year: "2025",
    title: "Senior Software Engineer",
    org: "Accenture",
    detail: "Second promotion. Client engagement for a big tech company.",
  },
  {
    year: "2025",
    title: "Senior Software Engineer",
    org: "Capital One",
    detail: "AI features in production, plus reliability and tooling work across the stack.",
  },
];

export type Work = {
  verb: string;
  title: string;
  outcome: string;
  detail: string;
  stack: string[];
};

export const selectedWork: Work[] = [
  {
    verb: "Led full-stack integration",
    title: "AI message assistant",
    outcome: "Live in production with real users.",
    detail:
      "An AI assistant that checks messages for mistakes and sensitive details before they go out. I built the review experience that keeps a person in the loop, plus the APIs and data behind it.",
    stack: ["LLM integration", "React", "Node.js"],
  },
  {
    verb: "Co-built",
    title: "Preference-aware chat prototype",
    outcome: "2nd place in an internal hackathon.",
    detail:
      "A Claude prototype that picks up preferences from conversation and asks the follow-up a good person would. Mention seafood, and it asks what kind.",
    stack: ["Claude", "TypeScript", "Prompt design"],
  },
  {
    verb: "Led",
    title: "Sign-in reliability",
    outcome: "Unexpected sign-outs cut by more than half.",
    detail:
      "People were getting signed out in the middle of their work. I tracked down why and fixed it, so sessions now hold up, even across open tabs.",
    stack: ["Node.js", "React", "AWS"],
  },
  {
    verb: "Delivered",
    title: "Build migration",
    outcome: "Builds from minutes to seconds.",
    detail:
      "Compared the modern build tools, picked one, and moved a large React app over to it, tidying up the TypeScript setup on the way.",
    stack: ["Rsbuild", "TypeScript"],
  },
  {
    verb: "Led",
    title: "React upgrade with coding agents",
    outcome: "A full React upgrade, every test passing.",
    detail:
      "Ran the big refactors with Claude Code agents and kept the test suite green the whole way. Next up: an editor migration that clears the path to React 19.",
    stack: ["Claude Code", "React"],
  },
];

export type Role = {
  title: string;
  dates: string;
  points: string[];
};

export type Job = {
  company: string;
  place: string;
  dates: string;
  note?: string;
  roles: Role[];
};

export const experience: Job[] = [
  {
    company: "Capital One",
    place: "New York",
    dates: "Aug 2025 - Present",
    roles: [
      {
        title: "Senior Software Engineer",
        dates: "Aug 2025 - Present",
        points: [
          "Led full-stack integration of a live AI assistant with human-in-the-loop review.",
          "Led a sign-in reliability fix that cut unexpected sign-outs by more than half.",
          "Moved the build to Rsbuild, from minutes to seconds.",
          "Mentor junior engineers.",
        ],
      },
    ],
  },
  {
    company: "Accenture",
    place: "Promoted twice",
    dates: "Feb 2021 - Aug 2025",
    roles: [
      {
        title: "Senior Software Engineer",
        dates: "2025",
        points: [
          "Client engagement for a big tech company, coordinating delivery and client calls.",
        ],
      },
      {
        title: "Software Engineer II",
        dates: "2022 - 2025",
        points: [
          "Generative AI prompt-to-website platform for Accenture Song, which supported $100M+ in revenue within 6 months.",
          "Led the move from Elastic Beanstalk to Amazon EKS, eliminating production downtime.",
          "Moved the codebase from JavaScript to TypeScript, standardized on Chakra UI, and set up CI/CD across 4 environments. QA cycles down 40%.",
        ],
      },
      {
        title: "Software Engineer",
        dates: "2021 - 2022",
        points: [
          "Replaced HP LoadRunner with open-source JMeter on Amazon ECR and EKS. Adopted by 150+ teams, saving $2M+ a year in licensing.",
          "Built a full-stack COVID-19 outreach platform for a local government organization, reaching 1M+ patients.",
        ],
      },
    ],
  },
];

export const otherExperience = [
  {
    title: "Program Director, Mentorship Program",
    org: "Africode (nonprofit)",
    dates: "Jan 2025 - Present",
    detail: "Appointed by the CEO. 12 mentors and 36 mentees across 4 countries.",
  },
  {
    title: "Reliability Engineer Intern",
    org: "Comcast",
    dates: "2018",
    detail:
      "Integrated React into a legacy codebase. Brought test coverage to 99% with RSpec and Selenium.",
  },
  {
    title: "Software Engineer",
    org: "Philadelphia Parking Authority",
    dates: "2017",
    detail:
      "Redesigned a JavaScript UI. Python automation cut processing from days to minutes.",
  },
];

export const services = [
  {
    title: "LLM features in real products",
    body: "Adding AI to apps that already have users: the model calls, the APIs around them, and the interface people actually touch.",
  },
  {
    title: "Guardrails and human review",
    body: "Checks that catch bad or sensitive output before it ships, plus review flows that keep a person in control.",
  },
  {
    title: "Agentic coding workflows",
    body: "Setting up Claude Code and similar agents for large refactors and upgrades, with tests that prove nothing broke.",
  },
  {
    title: "Front-end modernization",
    body: "React upgrades, editor migrations, and build tooling that turns minutes into seconds.",
  },
];

export type SideBuild = {
  title: string;
  body: string;
  stack: string;
  code: string;
  live: string;
  liveLabel: string;
};

// The Side builds block hides itself when this is empty.
export const sideBuilds: SideBuild[] = [
  {
    title: "Gallop",
    body: "Ask any AI models the same question and see where their rankings agree. Runs in your browser on your own OpenRouter account, so your keys never touch a server.",
    stack: "Next.js 16, TypeScript, OpenRouter",
    code: "https://github.com/Basseybd/gallop-ai",
    live: "https://gallop-ai-eight.vercel.app",
    liveLabel: "Try Gallop",
  },
];

// The short band on /work that points to /life.
export const offTheClock = {
  heading: "Off the clock",
  body: "I also take photos. Trips, long dinners with friends, and New York after dark.",
  cta: "See my photos",
};

// /life: quick and short.
export const life = {
  hello: "Hey, I’m Bassey.",
  // First card on the /life drum, captioned as him, so everything after reads as
  // his work. Not in `photos`, so it stays out of /photos and its count.
  me: {
    slug: "bassey-duke",
    accent: "#9A8F88",
    width: 2075,
    height: 2075,
    title: "That’s me",
    place: "",
    category: "Portraits",
    settings: "",
    alt: portrait.alt,
    featured: false,
  } satisfies Photo,
  lead: "I write software for a living and take photos on the side.",
  body: "Mostly trips, long dinners with friends, and New York after dark, all on a Fujifilm X100VI. Here’s some of my favorite work.",
  booking: "Want photos like these? I take on a few portrait and event shoots around New York.",
  bookingCta: "Book a shoot",
  bookingSubject: "Photo shoot",
  otl: "I also co-run OTL, a Brooklyn events collective.",
  otlCta: "See what’s next",
  // Swap for OTL's own domain once it has one.
  otlHref: "https://otl-kappa.vercel.app",
};

export const photoCategories = ["Travel", "Nights out", "Portraits", "City"] as const;
export type PhotoCategory = (typeof photoCategories)[number];

export type Photo = {
  slug: string;
  /** Dominant color. Floods the screen when you step through the Life door. */
  accent: string;
  width: number;
  height: number;
  title: string;
  place: string;
  category: PhotoCategory;
  settings: string;
  alt: string;
  featured: boolean;
};

// Files live in public/photos as {slug}-640.webp, -1200.webp, -2400.webp.
// Everything shot on a Fujifilm X100VI (23mm). Featured photos fill the Life
// door on the landing page and the deck on /life; all of them appear on /photos.
//
// Order is the viewing order, phone first. It opens on the strongest frame,
// then alternates people and places, day and night, warm and cool, and never
// puts two red frames side by side. Featured ends on a big smile; the archive
// winds down to the end of the night. On desktop the archive flows down three
// columns, so frames 1, 8 and 15 sit across the top row.
export const photos: Photo[] = [
  {
    slug: "2026-two-lines",
    accent: "#2F6FD0",
    width: 1600,
    height: 2400,
    title: "Two lines",
    place: "2026",
    category: "Portraits",
    settings: "f/5.6, 1/1800s, ISO 500",
    alt: "Portrait in a crochet shirt holding two pink brick phones against a blue sky",
    featured: true,
  },
  {
    slug: "2026-midtown-sunset",
    accent: "#E59A2B",
    width: 1600,
    height: 2400,
    title: "Golden hour, Midtown",
    place: "New York, 2026",
    category: "City",
    settings: "f/2.5, 1/105s, ISO 125",
    alt: "Low sun burning down a Midtown street between towers",
    featured: true,
  },
  {
    slug: "2026-crowned",
    accent: "#B04AD0",
    width: 1600,
    height: 2400,
    title: "Crowned",
    place: "2026",
    category: "Nights out",
    settings: "f/2.0, 1/45s, ISO 500",
    alt: "A friend in a gold party crown and leather jacket in a crowd lit pink and amber",
    featured: true,
  },
  {
    slug: "2026-notre-dame",
    accent: "#1E4FA8",
    width: 1600,
    height: 2400,
    title: "Notre-Dame Basilica",
    place: "Montréal, 2026",
    category: "Travel",
    settings: "f/2.0, 1/34s, ISO 1250",
    alt: "The blue and gold nave of Notre-Dame Basilica in Montréal, a lone visitor walking up the aisle",
    featured: true,
  },
  {
    slug: "2026-behind-the-decks",
    accent: "#D0242A",
    width: 1600,
    height: 2400,
    title: "Behind the decks",
    place: "2026",
    category: "Nights out",
    settings: "f/2.0, 1/34s, ISO 5000",
    alt: "Two friends laughing behind a DJ booth in red light",
    featured: true,
  },
  {
    slug: "2026-east-river",
    accent: "#1F3E7A",
    width: 1600,
    height: 2400,
    title: "East River, blue hour",
    place: "New York, 2026",
    category: "City",
    settings: "f/2.0, 1/34s, ISO 4000",
    alt: "The Manhattan skyline at blue hour reflected in the East River",
    featured: true,
  },
  {
    slug: "2026-rainforest-lunch",
    accent: "#B89A72",
    width: 1600,
    height: 2400,
    title: "Lunch in the rainforest",
    place: "El Yunque, 2026",
    category: "Portraits",
    settings: "f/2.5, 1/110s, ISO 500",
    alt: "A friend in a cap and round glasses mid-bite of a sandwich against deep green leaves",
    featured: true,
  },
  {
    slug: "2026-transito",
    accent: "#B8331F",
    width: 1600,
    height: 2400,
    title: "Tránsito",
    place: "Old San Juan, 2026",
    category: "Travel",
    settings: "f/3.6, 1/180s, ISO 125",
    alt: "A street violinist in an arched doorway on a red wall with a Tránsito sign",
    featured: true,
  },
  {
    slug: "2026-otl-session",
    accent: "#8C5A2E",
    width: 1600,
    height: 2400,
    title: "OTL session",
    place: "2026",
    category: "Portraits",
    settings: "f/2.0, 1/60s, ISO 400",
    alt: "A friend with a shaved head and tattooed hands sits on a stool at an OTL recording session, a giant CD clock and a shelf of bottles behind him",
    featured: true,
  },
  {
    slug: "2026-match-day",
    accent: "#D3262F",
    width: 1600,
    height: 2400,
    title: "Match day",
    place: "2026",
    category: "Nights out",
    settings: "f/2.8, 1/120s, ISO 500",
    alt: "A friend in a red striped soccer jersey grinning at a crowded watch party",
    featured: true,
  },
  {
    slug: "2026-gold",
    accent: "#C9A23F",
    width: 1600,
    height: 2400,
    title: "Gold",
    place: "2026",
    category: "Portraits",
    settings: "f/2.5, 1/110s, ISO 125",
    alt: "Close-up of a wide smile with a single gold grill",
    featured: false,
  },
  {
    slug: "2026-rose-window",
    accent: "#B23A48",
    width: 1600,
    height: 2400,
    title: "Rose window",
    place: "Montréal, 2026",
    category: "Travel",
    settings: "f/2.0, 1/34s, ISO 800",
    alt: "Looking straight up at a glowing rose window in a starred ceiling",
    featured: false,
  },
  {
    slug: "2026-low-light",
    accent: "#B5651D",
    width: 1600,
    height: 2400,
    title: "Low light",
    place: "2026",
    category: "Portraits",
    settings: "f/2.0, 1/20s, ISO 12800",
    alt: "A friend smiling in warm, dim bar light",
    featured: false,
  },
  {
    slug: "2026-el-yunque-window",
    accent: "#7C7568",
    width: 1600,
    height: 2400,
    title: "Tower window",
    place: "El Yunque, 2026",
    category: "Travel",
    settings: "f/5.6, 1/1600s, ISO 500",
    alt: "A stone arch window looking out on palms disappearing into fog",
    featured: false,
  },
  {
    slug: "2026-cookout",
    accent: "#E0601B",
    width: 1600,
    height: 2400,
    title: "Cookout",
    place: "2026",
    category: "Nights out",
    settings: "f/2.0, 1/60s, ISO 10000",
    alt: "Friends around a flaming grill at night with the Manhattan skyline behind",
    featured: false,
  },
  {
    slug: "2026-old-san-juan",
    accent: "#D9B44A",
    width: 1600,
    height: 2400,
    title: "The crew",
    place: "Old San Juan, 2026",
    category: "Travel",
    settings: "f/3.2, 1/180s, ISO 125",
    alt: "A group of friends walking single file down a sidewalk in Old San Juan",
    featured: false,
  },
  {
    slug: "2026-luckys",
    accent: "#B3261E",
    width: 1600,
    height: 2400,
    title: "Lucky’s",
    place: "2026",
    category: "City",
    settings: "ISO 400",
    alt: "A red storm sky over an elevated train line, with a glowing Lucky’s sign below",
    featured: false,
  },
  {
    slug: "2026-pinball",
    accent: "#D33B2C",
    width: 1600,
    height: 2400,
    title: "Pinball",
    place: "Barcade, 2026",
    category: "Nights out",
    settings: "f/3.6, 1/50s, ISO 400",
    alt: "A friend in a striped shirt leaning into a pinball machine at an arcade bar",
    featured: false,
  },
  {
    slug: "2026-omakase",
    accent: "#8E2A1E",
    width: 2400,
    height: 1600,
    title: "Omakase",
    place: "2026",
    category: "Nights out",
    settings: "f/2.0, 1/34s, ISO 640",
    alt: "Two pieces of sushi on ceramic plates at a dim counter, a single light above",
    featured: false,
  },
  {
    slug: "2026-round-two",
    accent: "#E8A317",
    width: 1600,
    height: 2400,
    title: "Round two",
    place: "2026",
    category: "Nights out",
    settings: "f/3.6, 1/50s, ISO 400",
    alt: "Two friends playing a vintage fighting game at an arcade cabinet",
    featured: false,
  },
  {
    slug: "2026-shoes-off",
    accent: "#A88442",
    width: 1600,
    height: 2400,
    title: "Shoes off",
    place: "2026",
    category: "Nights out",
    settings: "f/2.0, 1/5s, ISO 12800",
    alt: "A pair of lace-up flats left on the grass at dusk",
    featured: false,
  },
];

export const photoSrc = (slug: string, size: 640 | 1200 | 2400) => `/photos/${slug}-${size}.webp`;
// Sizes are the long edge, so a portrait file is narrower than its name says.
// The `w` descriptors give the real width, or phones pick a file that's too small.
export const photoSrcSet = (p: Pick<Photo, "slug" | "width" | "height">) => {
  const ratio = Math.min(1, p.width / p.height);
  return ([640, 1200, 2400] as const).map((s) => `${photoSrc(p.slug, s)} ${Math.round(s * ratio)}w`).join(", ");
};

export const toolkit = [
  {
    group: "AI",
    items: [
      "Claude",
      "LLM integration",
      "Human-in-the-loop AI",
      "AI guardrails",
      "Claude Code",
      "Windsurf",
      "Copilot",
    ],
  },
  { group: "Languages", items: ["TypeScript", "JavaScript", "Python", "SQL"] },
  {
    group: "Frontend",
    items: [
      "React",
      "Next.js",
      "Redux",
      "React Router",
      "Tailwind CSS",
      "Chakra UI",
      "Material UI",
      "Tiptap",
      "Rsbuild",
    ],
  },
  {
    group: "Backend",
    items: [
      "Node.js",
      "Express",
      "REST APIs",
      "OpenAPI",
      "Prisma",
      "Knex",
      "MySQL",
      "Redis",
      "RabbitMQ",
    ],
  },
  {
    group: "Cloud",
    items: [
      "AWS Lambda",
      "SQS",
      "API Gateway",
      "ECR",
      "EKS",
      "CloudWatch",
      "Docker",
      "Kubernetes",
      "CI/CD",
    ],
  },
  {
    group: "Testing",
    items: ["Jest", "React Testing Library", "Selenium"],
  },
];
