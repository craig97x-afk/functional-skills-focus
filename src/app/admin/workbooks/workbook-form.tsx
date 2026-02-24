"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const levelOptions = [
  { value: "entry-1", label: "Entry Level 1" },
  { value: "entry-2", label: "Entry Level 2" },
  { value: "entry-3", label: "Entry Level 3" },
  { value: "fs-1", label: "Functional Skills Level 1" },
  { value: "fs-2", label: "Functional Skills Level 2" },
];

const mathsCategorySuggestions = [
  "Using Numbers",
  "Using numbers and the number system",
  "Common Measures, Shape and Space",
  "Using common measures, shape and space",
  "Handling Information and Data",
  "Handling information and data",
  "Solving mathematical problems and decision-making",
];

const englishCategorySuggestions = [
  "Speaking, Listening and Communicating",
  "Reading",
  "Writing",
];

const mathsTopicSuggestions: Record<string, string[]> = {
  "entry-1": [
    "Read/write/order numbers to 20",
    "Count to 20 (incl. zero)",
    "Add/subtract within 20",
    "Symbols +, - and =",
    "Coins/notes and £/p to 20",
    "Read 12-hour clocks (hours)",
    "Days, months, seasons order",
    "Compare size/length/weight/capacity",
    "Identify common 2D/3D shapes",
    "Positional language (left/right/etc.)",
    "Read numbers in lists",
    "Sort by one criterion",
    "Simple charts: tally/block/graph",
    "Solve simple one-step problems",
  ],
  "entry-2": [
    "Count to 100",
    "Read/write/order numbers to 200",
    "Odd/even numbers to 100",
    "Symbols +, -, x, ÷, =",
    "Add/subtract 2-digit numbers",
    "Times tables to 12x12",
    "Hours/day; weeks/year order",
    "Divide 2-digit with remainders",
    "Round to nearest 10 (check)",
    "Simple fractions (1/2, 1/4, 1/10)",
    "Decimals to 1 d.p.",
    "Money to £1 (pence/£)",
    "Time: dates, 24h, analogue",
    "Metric length (mm–km)",
    "Mass: grams and kilograms",
    "Capacity: ml and litres",
    "Read/compare temperatures",
    "Use scales to nearest label",
    "Name 2D/3D shapes",
    "Describe shape properties",
    "Positional language (between/etc.)",
    "Extract info from tables/charts",
    "Compare numbers on bar charts",
    "Sort by two criteria",
    "Convert info between formats",
    "Solve simple one-step problems",
  ],
  "entry-3": [
    "Number Basics",
    "Addition and Subtraction",
    "Multiplication",
    "Division",
    "Rounding and Estimating",
    "Decimal Basics",
    "Fraction Basics",
    "Number Patterns",
    "Money",
    "Length",
    "Capacity",
    "Weight",
    "Time",
    "Temperature",
    "Scales",
    "Angles",
    "Symmetry and 2D Shapes",
    "3D Shape Basics",
    "Movement and Direction",
    "Lists",
    "Tables",
    "Tally Charts",
    "Bar Charts",
    "Line Graphs",
  ],
  "fs-1": [
    "Numbers and Place Value",
    "Ordering Numbers",
    "Addition and Subtraction",
    "Multiplication",
    "Division",
    "BIDMAS",
    "Fractions",
    "Decimals",
    "Rounding and Estimating",
    "Percentages",
    "Fractions, Decimals and Percentages",
    "Ratio",
    "Proportion",
    "Formulas",
    "Length",
    "Capacity",
    "Weight",
    "Time",
    "Problems Involving Money",
    "Interest",
    "Perimeter",
    "Area",
    "Circles",
    "3D Shapes",
    "Volume",
    "Length/area/volume calculations",
    "Nets",
    "Plans and Elevations",
    "2D Shapes",
    "Maps and Scale Drawings",
    "Angles and Bearings",
    "Data Tables",
    "Bar Charts",
    "Line Graphs",
    "Pie Charts",
    "Grouped Data",
    "Mean and Range",
    "Probability",
  ],
  "fs-2": [
    "Numbers and Place Value",
    "Ordering Numbers",
    "Addition and Subtraction",
    "Multiplication",
    "Division",
    "BIDMAS",
    "Fractions",
    "Decimals",
    "Rounding and Estimating",
    "Percentages",
    "Fractions, Decimals and Percentages",
    "Ratio",
    "Proportion",
    "Formulas",
    "Unit Conversions",
    "Conversion Graphs",
    "Problems Involving Money",
    "Best Buys",
    "Interest and Compound Interest",
    "Speed",
    "Density",
    "Perimeter",
    "Area",
    "Circles",
    "3D Shapes",
    "Volume",
    "Length/area/volume calculations",
    "Nets",
    "Surface Area",
    "Plans and Elevations",
    "Maps and Scale Drawings",
    "Coordinates",
    "Angles in 2D Shapes",
    "Mean/median/mode/range",
    "Comparing Data Sets",
    "Estimating the Mean",
    "Probability",
    "Probability Tables",
    "Scatter Graphs",
  ],
};

const mathsCategoryTopics: Record<string, Record<string, string[]>> = {
  "entry-1": {
    "Using numbers and the number system": [
      "Read/write/order numbers to 20",
      "Count to 20 (incl. zero)",
      "Add/subtract within 20",
      "Symbols +, - and =",
    ],
    "Using common measures, shape and space": [
      "Coins/notes and £/p to 20",
      "Read 12-hour clocks (hours)",
      "Days, months, seasons order",
      "Compare size/length/weight/capacity",
      "Identify common 2D/3D shapes",
      "Positional language (left/right/etc.)",
    ],
    "Handling information and data": [
      "Read numbers in lists",
      "Sort by one criterion",
      "Simple charts: tally/block/graph",
    ],
    "Solving mathematical problems and decision-making": [
      "Solve simple one-step problems",
    ],
  },
  "entry-2": {
    "Using numbers and the number system": [
      "Count to 100",
      "Read/write/order numbers to 200",
      "Odd/even numbers to 100",
      "Symbols +, -, x, ÷, =",
      "Add/subtract 2-digit numbers",
      "Times tables to 12x12",
      "Hours/day; weeks/year order",
      "Divide 2-digit with remainders",
      "Round to nearest 10 (check)",
      "Simple fractions (1/2, 1/4, 1/10)",
      "Decimals to 1 d.p.",
    ],
    "Using common measures, shape and space": [
      "Money to £1 (pence/£)",
      "Time: dates, 24h, analogue",
      "Metric length (mm–km)",
      "Mass: grams and kilograms",
      "Capacity: ml and litres",
      "Read/compare temperatures",
      "Use scales to nearest label",
      "Name 2D/3D shapes",
      "Describe shape properties",
      "Positional language (between/etc.)",
    ],
    "Handling information and data": [
      "Extract info from tables/charts",
      "Compare numbers on bar charts",
      "Sort by two criteria",
      "Convert info between formats",
    ],
    "Solving mathematical problems and decision-making": [
      "Solve simple one-step problems",
    ],
  },
  "entry-3": {
    "Using Numbers": [
      "Number Basics",
      "Addition and Subtraction",
      "Multiplication",
      "Division",
      "Rounding and Estimating",
      "Decimal Basics",
      "Fraction Basics",
      "Number Patterns",
    ],
    "Common Measures, Shape and Space": [
      "Money",
      "Length",
      "Capacity",
      "Weight",
      "Time",
      "Temperature",
      "Scales",
      "Angles",
      "Symmetry and 2D Shapes",
      "3D Shape Basics",
      "Movement and Direction",
    ],
    "Handling Information and Data": ["Lists", "Tables", "Tally Charts", "Bar Charts", "Line Graphs"],
  },
  "fs-1": {
    "Using Numbers": [
      "Numbers and Place Value",
      "Ordering Numbers",
      "Addition and Subtraction",
      "Multiplication",
      "Division",
      "BIDMAS",
      "Fractions",
      "Decimals",
      "Rounding and Estimating",
      "Percentages",
      "Fractions, Decimals and Percentages",
      "Ratio",
      "Proportion",
      "Formulas",
    ],
    "Common Measures, Shape and Space": [
      "Length",
      "Capacity",
      "Weight",
      "Time",
      "Problems Involving Money",
      "Interest",
      "Perimeter",
      "Area",
      "Circles",
      "3D Shapes",
      "Volume",
      "Length/area/volume calculations",
      "Nets",
      "Plans and Elevations",
      "2D Shapes",
      "Maps and Scale Drawings",
      "Angles and Bearings",
    ],
    "Handling Information and Data": [
      "Data Tables",
      "Bar Charts",
      "Line Graphs",
      "Pie Charts",
      "Grouped Data",
      "Mean and Range",
      "Probability",
    ],
  },
  "fs-2": {
    "Using Numbers": [
      "Numbers and Place Value",
      "Ordering Numbers",
      "Addition and Subtraction",
      "Multiplication",
      "Division",
      "BIDMAS",
      "Fractions",
      "Decimals",
      "Rounding and Estimating",
      "Percentages",
      "Fractions, Decimals and Percentages",
      "Ratio",
      "Proportion",
      "Formulas",
    ],
    "Common Measures, Shape and Space": [
      "Unit Conversions",
      "Conversion Graphs",
      "Problems Involving Money",
      "Best Buys",
      "Interest and Compound Interest",
      "Speed",
      "Density",
      "Perimeter",
      "Area",
      "Circles",
      "3D Shapes",
      "Volume",
      "Length/area/volume calculations",
      "Nets",
      "Surface Area",
      "Plans and Elevations",
      "Maps and Scale Drawings",
      "Coordinates",
      "Angles in 2D Shapes",
    ],
    "Handling Information and Data": [
      "Mean/median/mode/range",
      "Comparing Data Sets",
      "Estimating the Mean",
      "Probability",
      "Probability Tables",
      "Scatter Graphs",
    ],
  },
};

const englishCategoryTopics: Record<string, Record<string, string[]>> = {
  "entry-1": {
    "Speaking, Listening and Communicating": [
      "Name alphabet letters",
      "Main info from short statements",
      "Follow single-step instructions (ask repeat)",
      "Make requests and clear questions",
      "Answer questions about specifics",
      "Share basic info, feelings, opinions",
      "Join simple discussions/exchanges",
    ],
    Reading: [
      "Read E1 words accurately",
      "Read simple one-clause sentences",
      "Understand short simple texts",
    ],
    Writing: [
      "Capital letters + full stops",
      "Capital I and proper nouns",
      "Use lower-case appropriately",
      "Alphabet in order (upper/lower)",
      "Spell E1 words correctly",
      "Words, phrases, simple sentences",
    ],
  },
  "entry-2": {
    "Speaking, Listening and Communicating": [
      "Main info/detail in short explanations",
      "Requests and clear questions (contexts)",
      "Respond to straightforward questions",
      "Follow discussion gist",
      "Express info, feelings, opinions clearly",
      "Contribute to simple group discussions",
    ],
    Reading: [
      "Read E2 words accurately",
      "Understand main points in texts",
      "Organisational markers in short texts",
      "Strategies for word meaning/spelling",
      "Read sentences with multiple clauses",
      "Use images/captions to locate info",
    ],
    Writing: [
      "Use basic punctuation correctly",
      "Form regular plurals",
      "Alphabetical order (first/second letters)",
      "Spell E2 words correctly",
      "Words/phrases for purpose/audience",
      "Complete personal info forms",
      "Compound sentences with conjunctions",
      "Use adjectives and linking words",
    ],
  },
  "entry-3": {
    "Speaking, Listening and Communicating": [
      "Relevant info/detail in explanations",
      "Concise requests/questions (contexts)",
      "Communicate info/opinions clearly",
      "Respond to straightforward questions",
      "Follow main points in discussions",
      "Contribute to group discussions",
      "Turn-taking and responding to views",
    ],
    Reading: [
      "Read E3 words accurately",
      "Main points/ideas in texts",
      "Identify text purposes",
      "Strategies for word meanings",
      "Use structure to find info",
    ],
    Writing: [
      "Use a range of punctuation",
      "Form irregular plurals",
      "Use mostly correct grammar",
      "Alphabetical order (1st-3rd letters)",
      "Spell E3 words correctly",
      "Communicate ideas in logical order",
      "Write appropriate detail/length",
      "Format/structure (headings/bullets)",
      "Compound sentences and paragraphs",
      "Language for purpose/audience",
    ],
  },
  "fs-1": {
    "Speaking, Listening and Communicating": [
      "Relevant info/arguments in presentations",
      "Requests/questions for specific info",
      "Respond to detailed questions",
      "Communicate info/ideas/opinions clearly",
      "Support opinions with evidence",
      "Follow discussions; contribute relevantly",
      "Adapt language to purpose/audience",
      "Respect turn-taking and interjections",
    ],
    Reading: [
      "Main points, ideas, details",
      "Compare info/ideas/opinions across texts",
      "Distinguish fact vs opinion",
      "Language/features for audience/purpose",
      "Use reference materials/strategies",
      "Use structure to find info",
      "Infer meaning from images",
      "Vocabulary for text types/purposes",
      "Read specialist words in context",
      "Use punctuation to aid reading",
    ],
    Writing: [
      "Use a range of punctuation",
      "Use correct grammar",
      "Spell common and specialist words",
      "Communicate clearly and accurately",
      "Write suitable detail/length for audience",
      "Format/structure for audience",
      "Complex sentences with paragraphs",
    ],
  },
  "fs-2": {
    "Speaking, Listening and Communicating": [
      "Relevant info in extended presentations",
      "Follow narratives and arguments",
      "Respond to detailed questions/feedback",
      "Detailed questions for specific info",
      "Communicate clearly with detail",
      "Persuasive evidence for arguments",
      "Use accurate language for context",
      "Contribute constructively to discussions",
      "Adapt to audience/purpose/medium",
      "Interject/redirect discussions appropriately",
    ],
    Reading: [
      "Know when details matter",
      "Compare ideas and how conveyed",
      "Identify implicit/inferred meaning",
      "Text features shape meaning",
      "Use references to find meanings",
      "Use structure to find info",
      "Analyse vocab, formality, bias",
      "Follow arguments; fact vs opinion",
      "Identify writing styles and voice",
    ],
    Writing: [
      "Use wide range of punctuation",
      "Grammar and modality devices",
      "Spell common and specialist words",
      "Communicate clearly and effectively",
      "Write suitable detail/length for audience",
      "Organise writing by purpose",
      "Cohesion using organisational markers",
      "Language/register for audience",
      "Complex sentences with paragraphs",
    ],
  },
};

type WorkbookFormProps = {
  defaultSubject?: string;
  defaultLevel?: string;
  lockSubjectLevel?: boolean;
  initialWorkbook?: {
    id: string;
    subject: string;
    level_slug: string;
    category: string | null;
    topic: string;
    title: string;
    description: string | null;
    thumbnail_path?: string | null;
    thumbnail_url?: string | null;
    file_path?: string | null;
    file_url?: string | null;
    is_published?: boolean;
    is_featured?: boolean;
    publish_at?: string | null;
    unpublish_at?: string | null;
  } | null;
  onSaved?: () => void;
};

export default function WorkbookForm({
  defaultSubject = "maths",
  defaultLevel = "entry-3",
  lockSubjectLevel = false,
  initialWorkbook = null,
  onSaved,
}: WorkbookFormProps) {
  const supabase = useMemo(() => createClient(), []);
  const [subject, setSubject] = useState(defaultSubject);
  const [levelSlug, setLevelSlug] = useState(defaultLevel);
  const [category, setCategory] = useState("");
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrlInput, setThumbnailUrlInput] = useState("");
  const [fileUrlInput, setFileUrlInput] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [published, setPublished] = useState(false);
  const [publishAt, setPublishAt] = useState("");
  const [unpublishAt, setUnpublishAt] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(initialWorkbook?.id);

  const toLocalInputValue = (value: string | null | undefined) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

  const toIsoValue = (value: string) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  };

  useEffect(() => {
    if (!initialWorkbook) return;
    setSubject(initialWorkbook.subject ?? defaultSubject);
    setLevelSlug(initialWorkbook.level_slug ?? defaultLevel);
    setCategory(initialWorkbook.category ?? "");
    setTopic(initialWorkbook.topic ?? "");
    setTitle(initialWorkbook.title ?? "");
    setDescription(initialWorkbook.description ?? "");
    setThumbnailUrlInput(initialWorkbook.thumbnail_url ?? "");
    setFileUrlInput(initialWorkbook.file_url ?? "");
    setPublished(Boolean(initialWorkbook.is_published));
    setPublishAt(toLocalInputValue(initialWorkbook.publish_at ?? null));
    setUnpublishAt(toLocalInputValue(initialWorkbook.unpublish_at ?? null));
    setThumbnail(null);
    setFile(null);
  }, [initialWorkbook, defaultSubject, defaultLevel]);

  async function saveWorkbook() {
    // Upload assets first so workbook rows point to public storage URLs.
    setLoading(true);
    setMsg(null);

    if (!title.trim() || !topic.trim()) {
      setMsg("Add a title and topic.");
      setLoading(false);
      return;
    }

    let thumbnailPath: string | null = initialWorkbook?.thumbnail_path ?? null;
    let thumbnailUrl: string | null = initialWorkbook?.thumbnail_url ?? null;
    let filePath: string | null = initialWorkbook?.file_path ?? null;
    let fileUrl: string | null = initialWorkbook?.file_url ?? null;
    const initialThumbnail = initialWorkbook?.thumbnail_url ?? "";
    const initialFile = initialWorkbook?.file_url ?? "";

    if (thumbnail) {
      // Thumbnail stored in workbooks bucket and surfaced in the UI.
      const safeName = thumbnail.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `workbooks/thumbnails/${Date.now()}-${safeName}`;
      const { error: uploadErr } = await supabase.storage
        .from("workbooks")
        .upload(path, thumbnail, { upsert: false });

      if (uploadErr) {
        setMsg(uploadErr.message);
        setLoading(false);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("workbooks")
        .getPublicUrl(path);
      thumbnailPath = path;
      thumbnailUrl = publicUrl.publicUrl;
    }

    if (!thumbnail && thumbnailUrlInput.trim()) {
      thumbnailUrl = thumbnailUrlInput.trim();
      thumbnailPath = null;
    }

    if (file) {
      // Optional workbook file for download/preview.
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `workbooks/files/${Date.now()}-${safeName}`;
      const { error: uploadErr } = await supabase.storage
        .from("workbooks")
        .upload(path, file, { upsert: false });

      if (uploadErr) {
        setMsg(uploadErr.message);
        setLoading(false);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("workbooks")
        .getPublicUrl(path);
      filePath = path;
      fileUrl = publicUrl.publicUrl;
    }

    if (!file && fileUrlInput.trim()) {
      fileUrl = fileUrlInput.trim();
      filePath = null;
    }

    const thumbnailChanged =
      Boolean(thumbnail) || thumbnailUrlInput.trim() !== initialThumbnail;
    const fileChanged = Boolean(file) || fileUrlInput.trim() !== initialFile;
    const hasVersionChange = isEdit && (thumbnailChanged || fileChanged);

    if (hasVersionChange && initialWorkbook?.id) {
      await supabase.from("workbook_versions").insert({
        workbook_id: initialWorkbook.id,
        file_path: initialWorkbook.file_path ?? null,
        file_url: initialWorkbook.file_url ?? null,
        thumbnail_path: initialWorkbook.thumbnail_path ?? null,
        thumbnail_url: initialWorkbook.thumbnail_url ?? null,
      });
    }

    const updates: Record<string, unknown> = {
      subject,
      level_slug: levelSlug,
      category: category || null,
      topic: topic.trim(),
      title: title.trim(),
      description: description || null,
      is_published: published,
      publish_at: toIsoValue(publishAt),
      unpublish_at: toIsoValue(unpublishAt),
    };

    if (!isEdit || thumbnailChanged) {
      updates.thumbnail_path = thumbnailPath;
      updates.thumbnail_url = thumbnailUrl;
    }

    if (!isEdit || fileChanged) {
      updates.file_path = filePath;
      updates.file_url = fileUrl;
    }

    if (isEdit && !initialWorkbook?.id) {
      setMsg("Missing worksheet id.");
      setLoading(false);
      return;
    }

    const workbookId = initialWorkbook?.id ?? null;
    if (isEdit && !workbookId) {
      setMsg("Missing workbook id.");
      setLoading(false);
      return;
    }

    const { error } = isEdit
      ? await supabase.from("workbooks").update(updates).eq("id", workbookId)
      : await supabase.from("workbooks").insert(updates);

    setLoading(false);
    setMsg(error ? error.message : isEdit ? "Worksheet updated." : "Worksheet created.");
    if (!error) {
      if (onSaved) {
        onSaved();
      } else {
        window.location.reload();
      }
    }
  }

  const isMaths = subject === "maths";
  const categoryKey = category.trim();
  const categorySuggestionsForSubject = isMaths
    ? mathsCategorySuggestions
    : englishCategorySuggestions;
  const categoryMap = isMaths
    ? mathsCategoryTopics[levelSlug] ?? {}
    : englishCategoryTopics[levelSlug] ?? {};
  const topicsForLevel = isMaths
    ? mathsTopicSuggestions[levelSlug] ?? []
    : Object.values(categoryMap).flat();
  const topicList =
    categoryKey && categoryMap[categoryKey]
      ? categoryMap[categoryKey]
      : topicsForLevel;

  useEffect(() => {
    if (!categoryKey) return;
    const allowed = categoryMap[categoryKey];
    if (allowed && topic && !allowed.includes(topic)) {
      setTopic("");
    }
  }, [categoryKey, topic, categoryMap]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="block">
          <span className="text-sm">Subject</span>
          <select
            className="mt-1 w-full rounded-md border p-2"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={lockSubjectLevel}
          >
            <option value="maths">Maths</option>
            <option value="english">English</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm">Level</span>
          <select
            className="mt-1 w-full rounded-md border p-2"
            value={levelSlug}
            onChange={(e) => setLevelSlug(e.target.value)}
            disabled={lockSubjectLevel}
          >
            {levelOptions.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm">Category</span>
          <input
            className="mt-1 w-full rounded-md border p-2"
            list="category-suggestions"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Using Numbers"
          />
        </label>
      </div>

      <datalist id="category-suggestions">
        {categorySuggestionsForSubject.map((value) => (
          <option key={value} value={value} />
        ))}
      </datalist>

      <label className="block">
        <span className="text-sm">Topic</span>
        <input
          className="mt-1 w-full rounded-md border p-2"
          list="topic-suggestions"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Number Basics"
        />
        <div className="text-xs text-[color:var(--muted-foreground)] mt-1">
          Match the topic name used in the level tabs so the worksheet appears in the right
          place.
        </div>
      </label>

      <datalist id="topic-suggestions">
        {topicList.map((value) => (
          <option key={value} value={value} />
        ))}
      </datalist>

      <label className="block">
        <span className="text-sm">Title</span>
        <input
          className="mt-1 w-full rounded-md border p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Worksheet title"
        />
      </label>

      <label className="block">
        <span className="text-sm">Description</span>
        <textarea
          className="mt-1 w-full rounded-md border p-2 min-h-[100px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short summary of the worksheet."
        />
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-sm">Thumbnail image</span>
          <input
            className="mt-1 w-full rounded-md border p-2"
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
          />
        </label>
        <label className="block">
          <span className="text-sm">
            {isEdit ? "Replace worksheet file (PDF)" : "Worksheet file (PDF)"}
          </span>
          <input
            className="mt-1 w-full rounded-md border p-2"
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-sm">Thumbnail URL (optional)</span>
          <input
            className="mt-1 w-full rounded-md border p-2"
            value={thumbnailUrlInput}
            onChange={(e) => setThumbnailUrlInput(e.target.value)}
            placeholder="https://..."
          />
        </label>
        <label className="block">
          <span className="text-sm">Worksheet file URL (optional)</span>
          <input
            className="mt-1 w-full rounded-md border p-2"
            value={fileUrlInput}
            onChange={(e) => setFileUrlInput(e.target.value)}
            placeholder="https://..."
          />
        </label>
      </div>

      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-xs text-[color:var(--muted-foreground)]">
        Upload once in <span className="font-semibold text-[color:var(--foreground)]">Admin → Media</span> and
        paste the URLs here to reuse thumbnails/files.
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        <span className="text-sm">Published</span>
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-sm">Publish at (optional)</span>
          <input
            className="mt-1 w-full rounded-md border p-2"
            type="datetime-local"
            value={publishAt}
            onChange={(e) => setPublishAt(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-sm">Unpublish at (optional)</span>
          <input
            className="mt-1 w-full rounded-md border p-2"
            type="datetime-local"
            value={unpublishAt}
            onChange={(e) => setUnpublishAt(e.target.value)}
          />
        </label>
      </div>
      <p className="text-xs text-[color:var(--muted-foreground)]">
        Tip: set Published on and choose future dates to schedule automatically.
      </p>

      <button
        className="rounded-md border px-3 py-2"
        onClick={saveWorkbook}
        disabled={loading || !title.trim()}
      >
        {loading ? "Saving..." : isEdit ? "Save changes" : "Create worksheet"}
      </button>

      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
