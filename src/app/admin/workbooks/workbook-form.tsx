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
    "Read, write, order and compare numbers up to 20",
    "Use whole numbers to count up to 20 items including zero",
    "Add numbers which total up to 20 and subtract numbers from numbers up to 20",
    "Recognise and interpret the symbols +, - and = appropriately",
    "Recognise coins and notes, and write them in numbers with the correct symbols (£ and p), where these involve numbers up to 20",
    "Read 12-hour digital and analogue clocks in hours",
    "Know the number, name and sequence of: days in a week; months; the seasons",
    "Describe and make comparisons in words between measures of items, including: size, length, width, height, weight, capacity",
    "Identify and recognise common 2-dimensional (2-D) and 3-dimensional (3-D) shapes, including a: circle, cube, rectangle (includes squares), triangle",
    "Use everyday positional vocabulary to describe position and direction, including: left, right, in front, behind, under, above",
    "Read numerical information from lists",
    "Sort and classify objects using a single criterion",
    "Read and draw simple charts and diagrams, including a: tally chart, block diagram, graph",
    "Recognise a simple mathematical problem; obtain a solution. (A simple mathematical problem is one that requires working through one step or process.)",
  ],
  "entry-2": [
    "Count reliably up to 100 items",
    "Read, write, order and compare numbers up to 200",
    "Recognise and sequence odd and even numbers up to 100",
    "Recognise and interpret the symbols +, -, x, ÷ and = appropriately",
    "Add and subtract 2-digit numbers",
    "Multiply whole numbers in the range 0 x 0 to 12 x 12 using times tables",
    "Know the number and sequence of: hours in a day; weeks in a year",
    "Divide 2-digit whole numbers by single-digit whole numbers and express remainders",
    "Approximate by rounding to the nearest 10, and use this rounded answer to check results",
    "Recognise simple fractions (halves, quarters and tenths) of: whole numbers; shapes",
    "Read, write and use decimals to one decimal place",
    "Calculate money with pence up to one pound and in whole pounds of multiple items, and write the value using the correct symbols (£ or p)",
    "Read and record time in common date formats, understand hours from a 24-hour digital clock, and read the time displayed on an analogue clock in: hours; half-hours; quarter-hours",
    "Use metric measures of length, including: millimetres; centimetres; metres; kilometres",
    "Use measures of weight, including: grams; kilograms",
    "Use measures of capacity, including: millilitres; litres",
    "Read and compare positive temperatures",
    "Read and use simple scales to the nearest labelled division",
    "Recognise and name 2-D and 3-D shapes, including: pentagons; hexagons; cylinders; cuboids; pyramids; spheres",
    "Describe the properties of common 2-D and 3-D shapes, including: numbers of sides; corners; edges; faces; angles; base",
    "Use appropriate positional vocabulary to describe position and direction, including: between; inside; outside; middle; below; on top; forwards; backwards",
    "Extract information from: lists; tables; diagrams; bar charts",
    "Make numerical comparisons from bar charts",
    "Sort and classify objects using 2 criteria",
    "Take information from one format and represent the information in another format, including using a bar chart",
    "Recognise a simple mathematical problem; obtain a solution. (A simple mathematical problem is one that requires working through one step or process.)",
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
    "Using Length, Area and Volume in Calculations",
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
    "Using Length, Area and Volume in Calculations",
    "Nets",
    "Surface Area",
    "Plans and Elevations",
    "Maps and Scale Drawings",
    "Coordinates",
    "Angles in 2D Shapes",
    "Mean, Median, Mode and Range",
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
      "Read, write, order and compare numbers up to 20",
      "Use whole numbers to count up to 20 items including zero",
      "Add numbers which total up to 20 and subtract numbers from numbers up to 20",
      "Recognise and interpret the symbols +, - and = appropriately",
    ],
    "Using common measures, shape and space": [
      "Recognise coins and notes, and write them in numbers with the correct symbols (£ and p), where these involve numbers up to 20",
      "Read 12-hour digital and analogue clocks in hours",
      "Know the number, name and sequence of: days in a week; months; the seasons",
      "Describe and make comparisons in words between measures of items, including: size, length, width, height, weight, capacity",
      "Identify and recognise common 2-dimensional (2-D) and 3-dimensional (3-D) shapes, including a: circle, cube, rectangle (includes squares), triangle",
      "Use everyday positional vocabulary to describe position and direction, including: left, right, in front, behind, under, above",
    ],
    "Handling information and data": [
      "Read numerical information from lists",
      "Sort and classify objects using a single criterion",
      "Read and draw simple charts and diagrams, including a: tally chart, block diagram, graph",
    ],
    "Solving mathematical problems and decision-making": [
      "Recognise a simple mathematical problem; obtain a solution. (A simple mathematical problem is one that requires working through one step or process.)",
    ],
  },
  "entry-2": {
    "Using numbers and the number system": [
      "Count reliably up to 100 items",
      "Read, write, order and compare numbers up to 200",
      "Recognise and sequence odd and even numbers up to 100",
      "Recognise and interpret the symbols +, -, x, ÷ and = appropriately",
      "Add and subtract 2-digit numbers",
      "Multiply whole numbers in the range 0 x 0 to 12 x 12 using times tables",
      "Know the number and sequence of: hours in a day; weeks in a year",
      "Divide 2-digit whole numbers by single-digit whole numbers and express remainders",
      "Approximate by rounding to the nearest 10, and use this rounded answer to check results",
      "Recognise simple fractions (halves, quarters and tenths) of: whole numbers; shapes",
      "Read, write and use decimals to one decimal place",
    ],
    "Using common measures, shape and space": [
      "Calculate money with pence up to one pound and in whole pounds of multiple items, and write the value using the correct symbols (£ or p)",
      "Read and record time in common date formats, understand hours from a 24-hour digital clock, and read the time displayed on an analogue clock in: hours; half-hours; quarter-hours",
      "Use metric measures of length, including: millimetres; centimetres; metres; kilometres",
      "Use measures of weight, including: grams; kilograms",
      "Use measures of capacity, including: millilitres; litres",
      "Read and compare positive temperatures",
      "Read and use simple scales to the nearest labelled division",
      "Recognise and name 2-D and 3-D shapes, including: pentagons; hexagons; cylinders; cuboids; pyramids; spheres",
      "Describe the properties of common 2-D and 3-D shapes, including: numbers of sides; corners; edges; faces; angles; base",
      "Use appropriate positional vocabulary to describe position and direction, including: between; inside; outside; middle; below; on top; forwards; backwards",
    ],
    "Handling information and data": [
      "Extract information from: lists; tables; diagrams; bar charts",
      "Make numerical comparisons from bar charts",
      "Sort and classify objects using 2 criteria",
      "Take information from one format and represent the information in another format, including using a bar chart",
    ],
    "Solving mathematical problems and decision-making": [
      "Recognise a simple mathematical problem; obtain a solution. (A simple mathematical problem is one that requires working through one step or process.)",
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
      "Using Length, Area and Volume in Calculations",
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
      "Using Length, Area and Volume in Calculations",
      "Nets",
      "Surface Area",
      "Plans and Elevations",
      "Maps and Scale Drawings",
      "Coordinates",
      "Angles in 2D Shapes",
    ],
    "Handling Information and Data": [
      "Mean, Median, Mode and Range",
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
      "Say the names of the letters of the alphabet",
      "Identify and extract the main information from short statements and explanations",
      "Follow single-step instructions, asking for them to be repeated if necessary",
      "Make requests and ask straightforward questions using appropriate terms and registers",
      "Respond to questions about specific information",
      "Make clear statements about basic information, and communicate their feelings and opinions on straightforward topics",
      "Understand and participate in simple discussions or exchanges with another person about a straightforward topic",
    ],
    Reading: [
      "Read correctly words designated for Entry Level 1 (see appendix)",
      "Read simple sentences containing one clause",
      "Understand a short piece of text on a simple subject",
    ],
    Writing: [
      "Punctuate simple sentences with a capital letter and a full stop",
      "Use a capital letter for the personal pronoun 'I' and the first letter of proper nouns",
      "Use lower-case letters when there is no reason to use capital letters",
      "Write the letters of the alphabet in sequence and in both upper and lower case",
      "Spell correctly words designated for Entry Level 1 (see appendix)",
      "Communicate information in words, phrases and simple sentences",
    ],
  },
  "entry-2": {
    "Speaking, Listening and Communicating": [
      "Identify and extract the main information and detail from short explanations",
      "Make requests and ask clear questions appropriately in different contexts",
      "Respond appropriately to straightforward questions",
      "Follow the gist of discussions",
      "Clearly express straightforward information and communicate feelings and opinions on a range of straightforward topics",
      "Make appropriate contributions to simple group discussions with others about straightforward topics",
    ],
    Reading: [
      "Read correctly words designated for Entry Level 2 (see appendix)",
      "Understand the main points in texts",
      "Understand organisational markers in short, straightforward texts",
      "Use effective strategies to find the meaning of words and check their spelling (e.g. a simple dictionary, a spell-checker)",
      "Read and understand sentences with more than one clause",
      "Use illustrations, images and captions to locate information",
    ],
    Writing: [
      "Use basic punctuation correctly (e.g. full stops, capital letters, question and exclamation marks)",
      "Form regular plurals",
      "Use the first and second letters to sequence words in alphabetical order",
      "Spell correctly words designated for Entry Level 2 (see appendix)",
      "Communicate information using words and phrases appropriate to the purpose and audience",
      "Complete a form asking for personal information (e.g. first name, surname, address, postcode, age, date of birth)",
      "Write in compound sentences, using common conjunctions (e.g. 'or', 'and', 'but') to connect clauses",
      "Use adjectives and simple linking words in the appropriate way",
    ],
  },
  "entry-3": {
    "Speaking, Listening and Communicating": [
      "Identify and extract relevant information and detail in straightforward explanations",
      "Make requests and ask concise questions using appropriate language in different contexts",
      "Communicate information and opinions clearly on a range of topics",
      "Respond appropriately to questions on a range of straightforward topics",
      "Follow and understand the main points of discussions",
      "Make relevant contributions to group discussions about straightforward topics",
      "Listen to and respond appropriately to other points of view, respecting the conventions of turn-taking",
    ],
    Reading: [
      "Read correctly words designated for Entry Level 3 (see appendix)",
      "Identify, understand and extract the main points and ideas in and from texts",
      "Identify the different purposes of straightforward texts",
      "Use effective strategies to find the meaning of words (e.g. a dictionary, working out the meaning from the context, using their knowledge of different word types)",
      "Understand organisational features and use them to locate relevant information (e.g. contents, index, menus, tabs, links)",
    ],
    Writing: [
      "Use a range of punctuation correctly (e.g. full stops, question marks, exclamation marks, commas)",
      "Form irregular plurals",
      "Use mostly correct grammar (e.g. subject-verb agreement, consistent use of tense, definite and indefinite articles)",
      "Use the first, second and third letters in a word to sequence words in alphabetical order",
      "Spell correctly words designated for Entry Level 3 (see appendix)",
      "Communicate information, ideas and opinions clearly and in a logical sequence (e.g. chronologically, by task)",
      "Write text of an appropriate level of detail and of appropriate length (including where this is specified)",
      "Use an appropriate format and structure when writing straightforward texts, including the appropriate use of headings and bullet points",
      "Write in compound sentences and paragraphs where appropriate",
      "Use language appropriate to the purpose and audience",
    ],
  },
  "fs-1": {
    "Speaking, Listening and Communicating": [
      "Identify relevant information and lines of argument in explanations or presentations",
      "Make requests and ask relevant questions to obtain specific information in different contexts",
      "Respond effectively to detailed questions",
      "Communicate information, ideas and opinions clearly and accurately on a range of topics",
      "Express opinions and arguments, and support them with evidence",
      "Follow and understand discussions and make contributions relevant to the situation and subject",
      "Use appropriate phrases and registers, and adapt contributions to take account of purpose, audience and medium",
      "Respect the turn-taking rights of others during discussions, using the appropriate language for interjections",
    ],
    Reading: [
      "Identify and understand the main points, ideas and details in texts",
      "Compare information, ideas and opinions in different texts",
      "Identify meanings in texts, and distinguish between fact and opinion",
      "Recognise that language and other textual features can be varied to suit different audiences and purposes",
      "Use reference materials and appropriate strategies (e.g. using knowledge of different word types) for a range of purposes, including to find the meaning of words",
      "Understand organisational and structural features, and use them to locate relevant information (e.g. index, menus, subheadings, paragraphs)",
      "Infer from images meanings not explicit in the accompanying text",
      "Recognise vocabulary typically associated with specific types and purposes of texts (e.g. formal, informal, instructional, descriptive, explanatory, persuasive)",
      "Read and understand a range of specialist words in context",
      "Use their knowledge of punctuation to aid understanding of straightforward texts",
    ],
    Writing: [
      "Use a range of punctuation correctly (e.g. full stops, question marks, exclamation marks, commas, possessive apostrophes)",
      "Use correct grammar (e.g. subject-verb agreement, consistent use of different tenses, definite and indefinite articles)",
      "Spell words used most often in work, study and daily life, including specialist words",
      "Communicate information, ideas and opinions clearly, coherently and accurately",
      "Write text of an appropriate level of detail and of appropriate length (including where this is specified) to meet the needs of the purpose and audience",
      "Use format, structure and language appropriate for the audience and purpose",
      "Write consistently and accurately in complex sentences, using paragraphs where appropriate",
    ],
  },
  "fs-2": {
    "Speaking, Listening and Communicating": [
      "Identify relevant information from extended explanations or presentations",
      "Follow narratives and lines of argument",
      "Respond effectively to detailed or extended questions and feedback",
      "Make requests and ask detailed and pertinent questions to obtain specific information in a range of contexts",
      "Communicate information, ideas and opinions clearly and effectively, providing further detail and development if required",
      "Express opinions and arguments, and support them with relevant and persuasive evidence",
      "Use language that is effective, accurate and appropriate to the context and situation",
      "Make relevant and constructive contributions to move a discussion forward",
      "Adapt their contributions to suit the audience, purpose and medium",
      "Interject and redirect a discussion using appropriate language and register",
    ],
    Reading: [
      "Identify different contexts when the main points are sufficient and when it is important to have specific details",
      "Compare information, ideas and opinions in different texts, including how they are conveyed",
      "Identify implicit and inferred meaning",
      "Understand the relationship between textual features and devices, and how they can be used to shape meaning for different audiences and purposes",
      "Use a range of reference materials and appropriate resources (e.g. glossaries, legends or keys) for different purposes, including to find the meanings of words in straightforward and complex sources",
      "Understand organisational features and use them to locate relevant information in a range of straightforward and complex sources",
      "Analyse texts of different levels of complexity, recognising their use of vocabulary and identifying levels of formality and bias",
      "Follow an argument, identifying different points of view and distinguishing fact from opinion",
      "Identify different styles of writing and the writer's voice",
    ],
    Writing: [
      "Punctuate correctly, using a wide range of punctuation markers (e.g. colons, commas, inverted commas, apostrophes, quotation marks)",
      "Use correct grammar (e.g. subject-verb agreement, consistent use of a range of tenses, definite and indefinite articles) and modality devices (e.g. to express probability or desirability)",
      "Spell words used in work, study and daily life, including a range of specialist words",
      "Communicate information, ideas and opinions clearly, coherently and effectively",
      "Write text of an appropriate level of detail and of appropriate length (including where this is specified) to meet the needs of the purpose and audience",
      "Organise writing for different purposes using the appropriate format and structure (e.g. standard templates, paragraphs, bullet points, tables)",
      "Convey clear meaning and establish cohesion using organisational markers effectively",
      "Use different language and register (e.g. persuasive techniques, supporting evidence, specialist words) suited to the audience and purpose",
      "Construct complex sentences consistently and accurately, using paragraphs where appropriate",
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
