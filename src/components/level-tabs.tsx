"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminRowActions from "@/components/admin-row-actions";
import WorkbookForm from "@/app/admin/workbooks/workbook-form";

type Category = {
  title: string;
  topics: string[];
};

type WorkbookRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  topic: string;
  thumbnail_path: string | null;
  thumbnail_url: string | null;
  file_path: string | null;
  file_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number | null;
  publish_at: string | null;
  unpublish_at: string | null;
};

type DisplayWorkbook = {
  id: string;
  title: string;
  detail: string;
  description?: string | null;
  category?: string | null;
  topic?: string;
  thumbnail_path?: string | null;
  thumbnail_url?: string | null;
  file_path?: string | null;
  file_url?: string | null;
  isPlaceholder?: boolean;
  is_published?: boolean;
  is_featured?: boolean;
  publish_at?: string | null;
  unpublish_at?: string | null;
};

const normalizeTopic = (value: string) =>
  value
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, "\"")
    .replace(/[.,;:!?]/g, "")
    .replace(/[()]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const topicAliasEntries: Array<[string, string]> = [
  // English Entry Level 1
  ["Say the names of the letters of the alphabet", "Name alphabet letters"],
  [
    "Identify and extract the main information from short statements and explanations",
    "Main info from short statements",
  ],
  [
    "Follow single-step instructions, asking for them to be repeated if necessary",
    "Follow single-step instructions (ask repeat)",
  ],
  [
    "Make requests and ask straightforward questions using appropriate terms and registers",
    "Make requests and clear questions",
  ],
  ["Respond to questions about specific information", "Answer questions about specifics"],
  [
    "Make clear statements about basic information, and communicate their feelings and opinions on straightforward topics",
    "Share basic info, feelings, opinions",
  ],
  [
    "Understand and participate in simple discussions or exchanges with another person about a straightforward topic",
    "Join simple discussions/exchanges",
  ],
  ["Read correctly words designated for Entry Level 1 (see appendix)", "Read E1 words accurately"],
  ["Read simple sentences containing one clause", "Read simple one-clause sentences"],
  ["Understand a short piece of text on a simple subject", "Understand short simple texts"],
  [
    "Punctuate simple sentences with a capital letter and a full stop",
    "Capital letters + full stops",
  ],
  [
    "Use a capital letter for the personal pronoun ‘I’ and the first letter of proper nouns",
    "Capital I and proper nouns",
  ],
  [
    "Use lower-case letters when there is no reason to use capital letters",
    "Use lower-case appropriately",
  ],
  [
    "Write the letters of the alphabet in sequence and in both upper and lower case",
    "Alphabet in order (upper/lower)",
  ],
  ["Spell correctly words designated for Entry Level 1 (see appendix)", "Spell E1 words correctly"],
  [
    "Communicate information in words, phrases and simple sentences",
    "Words, phrases, simple sentences",
  ],
  // English Entry Level 2
  [
    "Identify and extract the main information and detail from short explanations",
    "Main info/detail in short explanations",
  ],
  [
    "Make requests and ask clear questions appropriately in different contexts",
    "Requests and clear questions (contexts)",
  ],
  ["Respond appropriately to straightforward questions", "Respond to straightforward questions"],
  ["Follow the gist of discussions", "Follow discussion gist"],
  [
    "Clearly express straightforward information and communicate feelings and opinions on a range of straightforward topics",
    "Express info, feelings, opinions clearly",
  ],
  [
    "Make appropriate contributions to simple group discussions with others about straightforward topics",
    "Contribute to simple group discussions",
  ],
  ["Read correctly words designated for Entry Level 2 (see appendix)", "Read E2 words accurately"],
  ["Understand the main points in texts", "Understand main points in texts"],
  [
    "Understand organisational markers in short, straightforward texts",
    "Organisational markers in short texts",
  ],
  [
    "Use effective strategies to find the meaning of words and check their spelling (e.g. a simple dictionary, a spell-checker)",
    "Strategies for word meaning/spelling",
  ],
  [
    "Read and understand sentences with more than one clause",
    "Read sentences with multiple clauses",
  ],
  ["Use illustrations, images and captions to locate information", "Use images/captions to locate info"],
  [
    "Use basic punctuation correctly (e.g. full stops, capital letters, question and exclamation marks)",
    "Use basic punctuation correctly",
  ],
  [
    "Use the first and second letters to sequence words in alphabetical order",
    "Alphabetical order (first/second letters)",
  ],
  ["Spell correctly words designated for Entry Level 2 (see appendix)", "Spell E2 words correctly"],
  [
    "Communicate information using words and phrases appropriate to the purpose and audience",
    "Words/phrases for purpose/audience",
  ],
  [
    "Complete a form asking for personal information (e.g. first name, surname, address, postcode, age, date of birth)",
    "Complete personal info forms",
  ],
  [
    "Write in compound sentences, using common conjunctions (e.g. ‘or’, ‘and’, ‘but’) to connect clauses",
    "Compound sentences with conjunctions",
  ],
  ["Use adjectives and simple linking words in the appropriate way", "Use adjectives and linking words"],
  // English Entry Level 3
  [
    "Identify and extract relevant information and detail in straightforward explanations",
    "Relevant info/detail in explanations",
  ],
  [
    "Make requests and ask concise questions using appropriate language in different contexts",
    "Concise requests/questions (contexts)",
  ],
  [
    "Communicate information and opinions clearly on a range of topics",
    "Communicate info/opinions clearly",
  ],
  [
    "Respond appropriately to questions on a range of straightforward topics",
    "Respond to straightforward questions",
  ],
  ["Follow and understand the main points of discussions", "Follow main points in discussions"],
  [
    "Make relevant contributions to group discussions about straightforward topics",
    "Contribute to group discussions",
  ],
  [
    "Listen to and respond appropriately to other points of view, respecting the conventions of turn-taking",
    "Turn-taking and responding to views",
  ],
  ["Read correctly words designated for Entry Level 3 (see appendix)", "Read E3 words accurately"],
  [
    "Identify, understand and extract the main points and ideas in and from texts",
    "Main points/ideas in texts",
  ],
  ["Identify the different purposes of straightforward texts", "Identify text purposes"],
  [
    "Use effective strategies to find the meaning of words (e.g. a dictionary, working out the meaning from the context, using their knowledge of different word types)",
    "Strategies for word meanings",
  ],
  [
    "Understand organisational features and use them to locate relevant information (e.g. contents, index, menus, tabs, links)",
    "Use structure to find info",
  ],
  ["Use a range of punctuation correctly (e.g. full stops, question marks, exclamation marks, commas)", "Use a range of punctuation"],
  [
    "Use mostly correct grammar (e.g. subject-verb agreement, consistent use of tense, definite and indefinite articles)",
    "Use mostly correct grammar",
  ],
  [
    "Use the first, second and third letters in a word to sequence words in alphabetical order",
    "Alphabetical order (1st-3rd letters)",
  ],
  ["Spell correctly words designated for Entry Level 3 (see appendix)", "Spell E3 words correctly"],
  [
    "Communicate information, ideas and opinions clearly and in a logical sequence (e.g. chronologically, by task)",
    "Communicate ideas in logical order",
  ],
  [
    "Write text of an appropriate level of detail and of appropriate length (including where this is specified)",
    "Write appropriate detail/length",
  ],
  [
    "Use an appropriate format and structure when writing straightforward texts, including the appropriate use of headings and bullet points",
    "Format/structure (headings/bullets)",
  ],
  [
    "Write in compound sentences and paragraphs where appropriate",
    "Compound sentences and paragraphs",
  ],
  ["Use language appropriate to the purpose and audience", "Language for purpose/audience"],
  // English Functional Skills Level 1
  [
    "Identify relevant information and lines of argument in explanations or presentations",
    "Relevant info/arguments in presentations",
  ],
  [
    "Make requests and ask relevant questions to obtain specific information in different contexts",
    "Requests/questions for specific info",
  ],
  ["Respond effectively to detailed questions", "Respond to detailed questions"],
  [
    "Communicate information, ideas and opinions clearly and accurately on a range of topics",
    "Communicate info/ideas/opinions clearly",
  ],
  ["Express opinions and arguments, and support them with evidence", "Support opinions with evidence"],
  [
    "Follow and understand discussions and make contributions relevant to the situation and subject",
    "Follow discussions; contribute relevantly",
  ],
  [
    "Use appropriate phrases and registers, and adapt contributions to take account of purpose, audience and medium",
    "Adapt language to purpose/audience",
  ],
  [
    "Respect the turn-taking rights of others during discussions, using the appropriate language for interjections",
    "Respect turn-taking and interjections",
  ],
  [
    "Identify and understand the main points, ideas and details in texts",
    "Main points, ideas, details",
  ],
  [
    "Compare information, ideas and opinions in different texts",
    "Compare info/ideas/opinions across texts",
  ],
  ["Identify meanings in texts, and distinguish between fact and opinion", "Distinguish fact vs opinion"],
  [
    "Recognise that language and other textual features can be varied to suit different audiences and purposes",
    "Language/features for audience/purpose",
  ],
  [
    "Use reference materials and appropriate strategies (e.g. using knowledge of different word types) for a range of purposes, including to find the meaning of words",
    "Use reference materials/strategies",
  ],
  [
    "Understand organisational and structural features, and use them to locate relevant information (e.g. index, menus, subheadings, paragraphs)",
    "Use structure to find info",
  ],
  ["Infer from images meanings not explicit in the accompanying text", "Infer meaning from images"],
  [
    "Recognise vocabulary typically associated with specific types and purposes of texts (e.g. formal, informal, instructional, descriptive, explanatory, persuasive)",
    "Vocabulary for text types/purposes",
  ],
  ["Read and understand a range of specialist words in context", "Read specialist words in context"],
  [
    "Use their knowledge of punctuation to aid understanding of straightforward texts",
    "Use punctuation to aid reading",
  ],
  [
    "Use a range of punctuation correctly (e.g. full stops, question marks, exclamation marks, commas, possessive apostrophes)",
    "Use a range of punctuation",
  ],
  [
    "Use correct grammar (e.g. subject-verb agreement, consistent use of different tenses, definite and indefinite articles)",
    "Use correct grammar",
  ],
  [
    "Spell words used most often in work, study and daily life, including specialist words",
    "Spell common and specialist words",
  ],
  [
    "Communicate information, ideas and opinions clearly, coherently and accurately",
    "Communicate clearly and accurately",
  ],
  [
    "Write text of an appropriate level of detail and of appropriate length (including where this is specified) to meet the needs of the purpose and audience",
    "Write suitable detail/length for audience",
  ],
  [
    "Use format, structure and language appropriate for the audience and purpose",
    "Format/structure for audience",
  ],
  [
    "Write consistently and accurately in complex sentences, using paragraphs where appropriate",
    "Complex sentences with paragraphs",
  ],
  // English Functional Skills Level 2
  [
    "Identify relevant information from extended explanations or presentations",
    "Relevant info in extended presentations",
  ],
  ["Follow narratives and lines of argument", "Follow narratives and arguments"],
  [
    "Respond effectively to detailed or extended questions and feedback",
    "Respond to detailed questions/feedback",
  ],
  [
    "Make requests and ask detailed and pertinent questions to obtain specific information in a range of contexts",
    "Detailed questions for specific info",
  ],
  [
    "Communicate information, ideas and opinions clearly and effectively, providing further detail and development if required",
    "Communicate clearly with detail",
  ],
  [
    "Express opinions and arguments, and support them with relevant and persuasive evidence",
    "Persuasive evidence for arguments",
  ],
  [
    "Use language that is effective, accurate and appropriate to the context and situation",
    "Use accurate language for context",
  ],
  [
    "Make relevant and constructive contributions to move a discussion forward",
    "Contribute constructively to discussions",
  ],
  ["Adapt their contributions to suit the audience, purpose and medium", "Adapt to audience/purpose/medium"],
  [
    "Interject and redirect a discussion using appropriate language and register",
    "Interject/redirect discussions appropriately",
  ],
  [
    "Identify different contexts when the main points are sufficient and when it is important to have specific details",
    "Know when details matter",
  ],
  [
    "Compare information, ideas and opinions in different texts, including how they are conveyed",
    "Compare ideas and how conveyed",
  ],
  ["Identify implicit and inferred meaning", "Identify implicit/inferred meaning"],
  [
    "Understand the relationship between textual features and devices, and how they can be used to shape meaning for different audiences and purposes",
    "Text features shape meaning",
  ],
  [
    "Use a range of reference materials and appropriate resources (e.g. glossaries, legends or keys) for different purposes, including to find the meanings of words in straightforward and complex sources",
    "Use references to find meanings",
  ],
  [
    "Understand organisational features and use them to locate relevant information in a range of straightforward and complex sources",
    "Use structure to find info",
  ],
  [
    "Analyse texts of different levels of complexity, recognising their use of vocabulary and identifying levels of formality and bias",
    "Analyse vocab, formality, bias",
  ],
  [
    "Follow an argument, identifying different points of view and distinguishing fact from opinion",
    "Follow arguments; fact vs opinion",
  ],
  [
    "Identify different styles of writing and the writer’s voice",
    "Identify writing styles and voice",
  ],
  [
    "Punctuate correctly, using a wide range of punctuation markers (e.g. colons, commas, inverted commas, apostrophes, quotation marks)",
    "Use wide range of punctuation",
  ],
  [
    "Use correct grammar (e.g. subject-verb agreement, consistent use of a range of tenses, definite and indefinite articles) and modality devices (e.g. to express probability or desirability)",
    "Grammar and modality devices",
  ],
  [
    "Spell words used in work, study and daily life, including a range of specialist words",
    "Spell common and specialist words",
  ],
  [
    "Communicate information, ideas and opinions clearly, coherently and effectively",
    "Communicate clearly and effectively",
  ],
  [
    "Write text of an appropriate level of detail and of appropriate length (including where this is specified) to meet the needs of the purpose and audience",
    "Write suitable detail/length for audience",
  ],
  [
    "Organise writing for different purposes using the appropriate format and structure (e.g. standard templates, paragraphs, bullet points, tables)",
    "Organise writing by purpose",
  ],
  [
    "Convey clear meaning and establish cohesion using organisational markers effectively",
    "Cohesion using organisational markers",
  ],
  [
    "Use different language and register (e.g. persuasive techniques, supporting evidence, specialist words) suited to the audience and purpose",
    "Language/register for audience",
  ],
  [
    "Construct complex sentences consistently and accurately, using paragraphs where appropriate",
    "Complex sentences with paragraphs",
  ],
  // Maths Entry Level 1
  ["Read, write, order and compare numbers up to 20", "Read/write/order numbers to 20"],
  ["Use whole numbers to count up to 20 items including zero", "Count to 20 (incl. zero)"],
  [
    "Add numbers which total up to 20 and subtract numbers from numbers up to 20",
    "Add/subtract within 20",
  ],
  ["Recognise and interpret the symbols +, – and = appropriately", "Symbols +, - and ="],
  [
    "Recognise coins and notes, and write them in numbers with the correct symbols (£ and p), where these involve numbers up to 20",
    "Coins/notes and £/p to 20",
  ],
  ["Read 12-hour digital and analogue clocks in hours", "Read 12-hour clocks (hours)"],
  [
    "Know the number, name and sequence of: days in a week; months; the seasons",
    "Days, months, seasons order",
  ],
  [
    "Describe and make comparisons in words between measures of items, including: size, length, width, height, weight, capacity",
    "Compare size/length/weight/capacity",
  ],
  [
    "Identify and recognise common 2-dimensional (2-D) and 3-dimensional (3-D) shapes, including a: circle, cube, rectangle (includes squares), triangle",
    "Identify common 2D/3D shapes",
  ],
  [
    "Use everyday positional vocabulary to describe position and direction, including: left, right, in front, behind, under, above",
    "Positional language (left/right/etc.)",
  ],
  ["Read numerical information from lists", "Read numbers in lists"],
  ["Sort and classify objects using a single criterion", "Sort by one criterion"],
  [
    "Read and draw simple charts and diagrams, including a: tally chart, block diagram, graph",
    "Simple charts: tally/block/graph",
  ],
  [
    "Recognise a simple mathematical problem; obtain a solution. (A simple mathematical problem is one that requires working through one step or process.)",
    "Solve simple one-step problems",
  ],
  // Maths Entry Level 2
  ["Count reliably up to 100 items", "Count to 100"],
  ["Read, write, order and compare numbers up to 200", "Read/write/order numbers to 200"],
  ["Recognise and sequence odd and even numbers up to 100", "Odd/even numbers to 100"],
  ["Recognise and interpret the symbols +, – , x, ÷ and = appropriately", "Symbols +, -, x, ÷, ="],
  ["Add and subtract 2-digit numbers", "Add/subtract 2-digit numbers"],
  [
    "Multiply whole numbers in the range 0 x 0 to 12 x 12 using times tables",
    "Times tables to 12x12",
  ],
  ["Know the number and sequence of: hours in a day; weeks in a year", "Hours/day; weeks/year order"],
  [
    "Divide 2-digit whole numbers by single-digit whole numbers and express remainders",
    "Divide 2-digit with remainders",
  ],
  [
    "Approximate by rounding to the nearest 10, and use this rounded answer to check results",
    "Round to nearest 10 (check)",
  ],
  [
    "Recognise simple fractions (halves, quarters and tenths) of: whole numbers; shapes",
    "Simple fractions (1/2, 1/4, 1/10)",
  ],
  ["Read, write and use decimals to one decimal place", "Decimals to 1 d.p."],
  [
    "Calculate money with pence up to one pound and in whole pounds of multiple items, and write the value using the correct symbols (£ or p)",
    "Money to £1 (pence/£)",
  ],
  [
    "Read and record time in common date formats, understand hours from a 24-hour digital clock, and read the time displayed on an analogue clock in: hours; half-hours; quarter-hours",
    "Time: dates, 24h, analogue",
  ],
  ["Use metric measures of length, including: millimetres; centimetres; metres; kilometres", "Metric length (mm–km)"],
  ["Use measures of weight, including: grams; kilograms", "Mass: grams and kilograms"],
  ["Use measures of capacity, including: millilitres; litres", "Capacity: ml and litres"],
  ["Read and compare positive temperatures", "Read/compare temperatures"],
  ["Read and use simple scales to the nearest labelled division", "Use scales to nearest label"],
  [
    "Recognise and name 2-D and 3-D shapes, including: pentagons; hexagons; cylinders; cuboids; pyramids; spheres",
    "Name 2D/3D shapes",
  ],
  [
    "Describe the properties of common 2-D and 3-D shapes, including: numbers of sides; corners; edges; faces; angles; base",
    "Describe shape properties",
  ],
  [
    "Use appropriate positional vocabulary to describe position and direction, including: between; inside; outside; middle; below; on top; forwards; backwards",
    "Positional language (between/etc.)",
  ],
  ["Extract information from: lists; tables; diagrams; bar charts", "Extract info from tables/charts"],
  ["Make numerical comparisons from bar charts", "Compare numbers on bar charts"],
  ["Sort and classify objects using 2 criteria", "Sort by two criteria"],
  [
    "Take information from one format and represent the information in another format, including using a bar chart",
    "Convert info between formats",
  ],
  [
    "Recognise a simple mathematical problem; obtain a solution. (A simple mathematical problem is one that requires working through one step or process.)",
    "Solve simple one-step problems",
  ],
  // Short-to-short alias fixes (post-pass)
  ["Use organisational features to find info", "Use structure to find info"],
  [
    "Compare info/ideas/opinions across texts, including how they are conveyed",
    "Compare ideas and how conveyed",
  ],
  [
    "Write appropriate detail/length to meet the needs of the purpose and audience",
    "Write suitable detail/length for audience",
  ],
  ["Use +, - and = symbols", "Symbols +, - and ="],
  ["Use +, -, x, ÷, =", "Symbols +, -, x, ÷, ="],
];

const topicAliases = new Map<string, string>(
  topicAliasEntries.map(([from, to]) => [normalizeTopic(from), to])
);

const resolveTopicAlias = (topic: string) => {
  const normalized = normalizeTopic(topic);
  const alias = topicAliases.get(normalized);
  return alias ?? topic;
};

const worksheetTemplates = [
  { title: "Worksheet 1 - Core Skills", detail: "Key ideas and definitions." },
  { title: "Worksheet 2 - Guided Practice", detail: "Worked examples + hints." },
  { title: "Worksheet 3 - Exam Style", detail: "Exam-style questions." },
  { title: "Worksheet 4 - Mixed Revision", detail: "Short mixed practice set." },
];

const bannerGradientStyle = {
  background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
};

export default function LevelTabs({
  categories,
  subject,
  levelSlug,
  hasAccess,
  isAdmin,
}: {
  categories: Category[];
  subject: string;
  levelSlug: string;
  hasAccess: boolean;
  isAdmin: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [workbooks, setWorkbooks] = useState<WorkbookRow[]>([]);

  const activeCategory = useMemo(() => {
    if (!categories.length) return null;
    return categories[Math.min(activeIndex, categories.length - 1)];
  }, [activeIndex, categories]);

  const logWorkbookEvent = async (
    workbookId: string,
    eventType: "open" | "download"
  ) => {
    try {
      await fetch("/api/workbooks/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workbookId, eventType }),
      });
    } catch {
      // Ignore analytics failures.
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadWorkbooks() {
      let query = supabase
        .from("workbooks")
        .select(
          "id, title, description, category, topic, thumbnail_path, thumbnail_url, file_path, file_url, is_published, is_featured, sort_order, publish_at, unpublish_at"
        )
        .eq("subject", subject)
        .eq("level_slug", levelSlug)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (!isAdmin) {
        query = query.eq("is_published", true);
      }

      const { data } = await query;

      if (!ignore && data) {
        setWorkbooks(data as WorkbookRow[]);
      }
    }

    loadWorkbooks();
    return () => {
      ignore = true;
    };
  }, [supabase, subject, levelSlug, isAdmin]);

  const workbooksByTopic = useMemo(() => {
    const map = new Map<string, WorkbookRow[]>();
    workbooks.forEach((workbook) => {
      const key = normalizeTopic(resolveTopicAlias(workbook.topic));
      if (!key) return;
      const list = map.get(key) ?? [];
      list.push(workbook);
      map.set(key, list);
    });
    return map;
  }, [workbooks]);

  if (!activeCategory) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Topic categories">
        {categories.map((category, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={category.title}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveIndex(index)}
              className={[
                "rounded-full border px-4 py-2 text-sm transition",
                isActive
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                  : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]",
              ].join(" ")}
            >
              {category.title}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          {activeCategory.title}
        </div>
        <div className="text-xs text-[color:var(--muted-foreground)]">
          {activeCategory.topics.length} subjects
        </div>
      </div>

      <div className="grid gap-6">
        {activeCategory.topics.map((topic) => {
          const key = normalizeTopic(resolveTopicAlias(topic));
          const actual = workbooksByTopic.get(key) ?? [];
          const display: DisplayWorkbook[] =
            actual.length > 0
              ? actual.map((workbook) => ({
                  id: workbook.id,
                  title: workbook.title,
                  detail: workbook.description || "Worksheet material.",
                  description: workbook.description,
                  category: workbook.category,
                  topic: workbook.topic,
                  thumbnail_url: workbook.thumbnail_url,
                  file_url: workbook.file_url,
                  isPlaceholder: false,
                  is_published: workbook.is_published,
                  is_featured: workbook.is_featured,
                  publish_at: workbook.publish_at,
                  unpublish_at: workbook.unpublish_at,
                }))
              : isAdmin
              ? []
              : worksheetTemplates.map((workbook, templateIndex) => ({
                  id: `placeholder-${key}-${templateIndex}`,
                  title: workbook.title,
                  detail: workbook.detail,
                  category: null,
                  topic,
                  isPlaceholder: true,
                }));
          return (
            <article key={topic} className="apple-card p-6 lg:p-8">
              <div
                style={bannerGradientStyle}
                className="relative h-52 lg:h-60 w-full rounded-3xl overflow-hidden border border-white/15"
              >
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_45%)]" />
                <div className="relative h-full w-full flex flex-col items-start justify-end p-6 text-white">
                  <div className="text-xs uppercase tracking-[0.3em] opacity-80">Topic</div>
                  <div className="text-3xl font-semibold leading-tight">{topic}</div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <p className="apple-subtle text-base">
                  Worksheets, lesson packs, and revision sheets for {topic}.
                </p>
                {display.length === 0 ? (
                  <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 text-sm text-[color:var(--muted-foreground)]">
                    No worksheets yet for this topic.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {display.map((workbook, workbookIndex) => {
                      const isLocked = !hasAccess && workbookIndex >= 2;
                      return (
                        <div
                          key={workbook.id}
                          className={[
                            "rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 flex flex-col gap-4 lg:flex-row lg:items-center",
                            isLocked ? "opacity-80" : "",
                          ].join(" ")}
                        >
                          <div className="h-40 w-full lg:h-28 lg:w-64 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] overflow-hidden">
                            {workbook.thumbnail_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={workbook.thumbnail_url}
                                alt={workbook.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-gradient-to-br from-slate-700/30 to-slate-900/50 flex items-center justify-center text-xs uppercase tracking-[0.2em] text-slate-200">
                                Worksheet
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="text-lg font-semibold">{workbook.title}</div>
                              {workbook.is_featured && (
                                <span className="inline-flex rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                                  Featured
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-[color:var(--muted-foreground)]">
                              {workbook.detail}
                            </div>
                            {isAdmin && !workbook.isPlaceholder && (
                              <div className="pt-2 space-y-3">
                                <AdminRowActions
                                  table="workbooks"
                                  id={workbook.id}
                                  initialPublished={Boolean(workbook.is_published)}
                                  supportsFeatured
                                  initialFeatured={Boolean(workbook.is_featured)}
                                />
                                <details className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                                  <summary className="cursor-pointer text-xs font-semibold">
                                    Edit worksheet
                                  </summary>
                                  <div className="mt-4">
                                    <WorkbookForm
                                      defaultSubject={subject}
                                      defaultLevel={levelSlug}
                                      lockSubjectLevel
                                      initialWorkbook={{
                                        id: workbook.id,
                                        subject,
                                        level_slug: levelSlug,
                                        category: workbook.category ?? null,
                                        topic: workbook.topic ?? topic,
                                        title: workbook.title,
                                        description: workbook.description ?? null,
                                        thumbnail_path: workbook.thumbnail_path ?? null,
                                        thumbnail_url: workbook.thumbnail_url ?? null,
                                        file_path: workbook.file_path ?? null,
                                        file_url: workbook.file_url ?? null,
                                        is_published: workbook.is_published,
                                        is_featured: workbook.is_featured,
                                        publish_at: workbook.publish_at ?? null,
                                        unpublish_at: workbook.unpublish_at ?? null,
                                      }}
                                    />
                                  </div>
                                </details>
                              </div>
                            )}
                            {isLocked ? (
                              <span className="inline-flex rounded-full border border-[color:var(--border)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                                Subscription user only
                              </span>
                            ) : workbook.file_url ? (
                              <a
                                className="inline-flex rounded-full border px-4 py-2 text-xs text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]"
                                href={workbook.file_url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => logWorkbookEvent(workbook.id, "open")}
                              >
                                Open worksheet
                              </a>
                            ) : (
                              <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                                {workbook.isPlaceholder ? "Draft" : "No file yet"}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
