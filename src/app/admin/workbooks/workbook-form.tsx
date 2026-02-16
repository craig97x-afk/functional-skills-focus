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

const categorySuggestions = [
  "Using Numbers",
  "Common Measures, Shape and Space",
  "Handling Information and Data",
];

const topicSuggestions: Record<string, string[]> = {
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
    thumbnail_url?: string | null;
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

    let thumbnailPath: string | null = null;
    let thumbnailUrl: string | null = null;
    let filePath: string | null = null;
    let fileUrl: string | null = null;

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

    if (thumbnailPath && thumbnailUrl) {
      updates.thumbnail_path = thumbnailPath;
      updates.thumbnail_url = thumbnailUrl;
    }

    if (filePath && fileUrl) {
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

  const topicList = subject === "maths" ? topicSuggestions[levelSlug] ?? [] : [];

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
        {categorySuggestions.map((value) => (
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
