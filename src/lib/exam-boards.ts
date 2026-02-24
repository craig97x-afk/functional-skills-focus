export type ExamBoard = {
  slug: string;
  name: string;
  subjects: string[];
  levels: string[];
};

const allLevels = ["entry-1", "entry-2", "entry-3", "fs-1", "fs-2"];

export const examBoards: ExamBoard[] = [
  {
    slug: "pearson-edexcel",
    name: "Pearson Edexcel",
    subjects: ["english", "maths"],
    levels: allLevels,
  },
  {
    slug: "city-and-guilds",
    name: "City & Guilds",
    subjects: ["english", "maths"],
    levels: allLevels,
  },
  {
    slug: "ncfe",
    name: "NCFE",
    subjects: ["english", "maths"],
    levels: allLevels,
  },
  {
    slug: "aqa",
    name: "AQA",
    subjects: ["english", "maths"],
    levels: allLevels,
  },
  {
    slug: "highfield",
    name: "Highfield Qualifications",
    subjects: ["english", "maths"],
    levels: allLevels,
  },
  {
    slug: "open-awards",
    name: "Open Awards",
    subjects: ["english", "maths"],
    levels: allLevels,
  },
  {
    slug: "nocn",
    name: "NOCN",
    subjects: ["english", "maths"],
    levels: allLevels,
  },
  {
    slug: "vtct-skills",
    name: "VTCT Skills",
    subjects: ["english", "maths"],
    levels: allLevels,
  },
  {
    slug: "tquk",
    name: "TQUK",
    subjects: ["english", "maths"],
    levels: allLevels,
  },
  {
    slug: "gateway-qualifications",
    name: "Gateway Qualifications",
    subjects: ["english", "maths"],
    levels: allLevels,
  },
  {
    slug: "futurequals",
    name: "FutureQuals",
    subjects: ["english", "maths"],
    levels: allLevels,
  },
  {
    slug: "ocn-london",
    name: "OCN London",
    subjects: ["english", "maths"],
    levels: allLevels,
  },
  {
    slug: "learning-machine",
    name: "The Learning Machine",
    subjects: ["english", "maths"],
    levels: allLevels,
  },
  {
    slug: "wjec-essential-skills-wales",
    name: "WJEC (Essential Skills Wales)",
    subjects: ["english", "maths"],
    levels: allLevels,
  },
  {
    slug: "agored-cymru",
    name: "Agored Cymru (Essential Skills Wales)",
    subjects: ["english", "maths"],
    levels: allLevels,
  },
  {
    slug: "ocn-ni",
    name: "OCN NI (Essential Skills NI)",
    subjects: ["english", "maths"],
    levels: allLevels,
  },
];

export const getExamBoardsForLevel = (subject: string, level: string) =>
  examBoards.filter(
    (board) => board.subjects.includes(subject) && board.levels.includes(level)
  );

export const getExamBoardBySlug = (
  subject: string,
  level: string,
  slug?: string
) =>
  examBoards.find(
    (board) =>
      board.slug === slug &&
      board.subjects.includes(subject) &&
      board.levels.includes(level)
  ) ?? null;

export const getExamBoardLabel = (slug?: string | null) =>
  examBoards.find((board) => board.slug === slug)?.name ?? "All boards";
