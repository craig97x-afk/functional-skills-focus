"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getExamBoardsForLevel } from "@/lib/exam-boards";
import { paperTypeOptions, parseTagsInput } from "@/lib/exam-resources/metadata";

const levelOptions = [
  { value: "entry-1", label: "Entry Level 1" },
  { value: "entry-2", label: "Entry Level 2" },
  { value: "entry-3", label: "Entry Level 3" },
  { value: "fs-1", label: "Functional Skills Level 1" },
  { value: "fs-2", label: "Functional Skills Level 2" },
];

type ExamMockFormProps = {
  defaultSubject?: string;
  defaultLevel?: string;
  lockSubjectLevel?: boolean;
};

export default function ExamMockForm({
  defaultSubject = "maths",
  defaultLevel = "entry-3",
  lockSubjectLevel = false,
}: ExamMockFormProps) {
  const supabase = useMemo(() => createClient(), []);
  const [subject, setSubject] = useState(defaultSubject);
  const [levelSlug, setLevelSlug] = useState(defaultLevel);
  const [examBoard, setExamBoard] = useState("all");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [paperType, setPaperType] = useState("");
  const [paperYear, setPaperYear] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [coverUrlInput, setCoverUrlInput] = useState("");
  const [fileUrlInput, setFileUrlInput] = useState("");
  const [published, setPublished] = useState(false);
  const [publishAt, setPublishAt] = useState("");
  const [unpublishAt, setUnpublishAt] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const availableBoards = useMemo(
    () => getExamBoardsForLevel(subject, levelSlug),
    [subject, levelSlug]
  );
  const normalizedExamBoard =
    examBoard === "all" || availableBoards.some((board) => board.slug === examBoard)
      ? examBoard
      : (availableBoards[0]?.slug ?? "all");

  const toIsoValue = (value: string) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  };

  async function createMock() {
    // Upload assets first so we can store public URLs in exam_mocks.
    setLoading(true);
    setMsg(null);

    if (!title.trim()) {
      setMsg("Add a title.");
      setLoading(false);
      return;
    }

    const parsedPaperYear = paperYear.trim() ? Number.parseInt(paperYear.trim(), 10) : null;
    if (
      paperYear.trim() &&
      (!Number.isFinite(parsedPaperYear) || (parsedPaperYear ?? 0) < 2000 || (parsedPaperYear ?? 0) > 2100)
    ) {
      setMsg("Paper year must be between 2000 and 2100.");
      setLoading(false);
      return;
    }

    let coverUrl: string | null = coverUrlInput.trim() || null;
    let filePath: string | null = null;
    let fileUrl: string | null = fileUrlInput.trim() || null;

    if (cover) {
      // Cover images live in storage; only the public URL is saved.
      const safeName = cover.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `exam-mocks/covers/${Date.now()}-${safeName}`;
      const { error: uploadErr } = await supabase.storage
        .from("exam-mocks")
        .upload(path, cover, { upsert: false });

      if (uploadErr) {
        setMsg(uploadErr.message);
        setLoading(false);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("exam-mocks")
        .getPublicUrl(path);
      coverUrl = publicUrl.publicUrl;
    }

    if (file) {
      // Store the mock PDF/DOC in storage for download.
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `exam-mocks/files/${Date.now()}-${safeName}`;
      const { error: uploadErr } = await supabase.storage
        .from("exam-mocks")
        .upload(path, file, { upsert: false });

      if (uploadErr) {
        setMsg(uploadErr.message);
        setLoading(false);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("exam-mocks")
        .getPublicUrl(path);
      filePath = path;
      fileUrl = publicUrl.publicUrl;
    }

    const { error } = await supabase.from("exam_mocks").insert({
      subject,
      level_slug: levelSlug,
      exam_board: normalizedExamBoard === "all" ? null : normalizedExamBoard,
      title: title.trim(),
      description: description || null,
      cover_url: coverUrl,
      file_path: filePath,
      file_url: fileUrl,
      paper_type: paperType || null,
      paper_year: parsedPaperYear,
      tags: parseTagsInput(tagsInput),
      is_published: published,
      publish_at: toIsoValue(publishAt),
      unpublish_at: toIsoValue(unpublishAt),
    });

    setLoading(false);
    setMsg(error ? error.message : "Exam mock created. Refreshing...");
    if (!error) window.location.reload();
  }

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
          <span className="text-sm">Exam board</span>
          <select
            className="mt-1 w-full rounded-md border p-2"
            value={normalizedExamBoard}
            onChange={(e) => setExamBoard(e.target.value)}
          >
            <option value="all">All boards (general)</option>
            {availableBoards.map((board) => (
              <option key={board.slug} value={board.slug}>
                {board.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm">Title</span>
        <input
          className="mt-1 w-full rounded-md border p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Mock paper title"
        />
      </label>

      <label className="block">
        <span className="text-sm">Description</span>
        <textarea
          className="mt-1 w-full rounded-md border p-2 min-h-[100px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short summary of the mock paper."
        />
      </label>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="block">
          <span className="text-sm">Paper type</span>
          <select
            className="mt-1 w-full rounded-md border p-2"
            value={paperType}
            onChange={(e) => setPaperType(e.target.value)}
          >
            <option value="">Not set</option>
            {paperTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm">Paper year</span>
          <input
            className="mt-1 w-full rounded-md border p-2"
            inputMode="numeric"
            pattern="[0-9]*"
            value={paperYear}
            onChange={(e) => setPaperYear(e.target.value)}
            placeholder="2024"
          />
        </label>
        <label className="block">
          <span className="text-sm">Tags</span>
          <input
            className="mt-1 w-full rounded-md border p-2"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="calculator, non-calculator"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-sm">Cover image</span>
          <input
            className="mt-1 w-full rounded-md border p-2"
            type="file"
            accept="image/*"
            onChange={(e) => setCover(e.target.files?.[0] ?? null)}
          />
        </label>
        <label className="block">
          <span className="text-sm">Mock file (PDF or Word)</span>
          <input
            className="mt-1 w-full rounded-md border p-2"
            type="file"
            accept="application/pdf,.pdf,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-sm">Cover URL (optional)</span>
          <input
            className="mt-1 w-full rounded-md border p-2"
            value={coverUrlInput}
            onChange={(e) => setCoverUrlInput(e.target.value)}
            placeholder="https://..."
          />
        </label>
        <label className="block">
          <span className="text-sm">Mock file URL (optional)</span>
          <input
            className="mt-1 w-full rounded-md border p-2"
            value={fileUrlInput}
            onChange={(e) => setFileUrlInput(e.target.value)}
            placeholder="https://..."
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

      <button
        className="rounded-md border px-3 py-2"
        onClick={createMock}
        disabled={loading || !title.trim()}
      >
        {loading ? "Saving..." : "Create exam mock"}
      </button>

      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
