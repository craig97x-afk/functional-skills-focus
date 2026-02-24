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

type ExamResourceLinkFormProps = {
  defaultSubject?: string;
  defaultLevel?: string;
  lockSubjectLevel?: boolean;
};

export default function ExamResourceLinkForm({
  defaultSubject = "maths",
  defaultLevel = "entry-3",
  lockSubjectLevel = false,
}: ExamResourceLinkFormProps) {
  const supabase = useMemo(() => createClient(), []);
  const [subject, setSubject] = useState(defaultSubject);
  const [levelSlug, setLevelSlug] = useState(defaultLevel);
  const [examBoard, setExamBoard] = useState("all");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkType, setLinkType] = useState("");
  const [paperType, setPaperType] = useState("");
  const [paperYear, setPaperYear] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [published, setPublished] = useState(false);
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

  async function createLink() {
    setLoading(true);
    setMsg(null);

    if (!title.trim()) {
      setMsg("Add a title.");
      setLoading(false);
      return;
    }

    if (!linkUrl.trim()) {
      setMsg("Add a valid URL.");
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

    const { error } = await supabase.from("exam_resource_links").insert({
      subject,
      level_slug: levelSlug,
      exam_board: normalizedExamBoard === "all" ? null : normalizedExamBoard,
      title: title.trim(),
      description: description || null,
      link_url: linkUrl.trim(),
      link_type: linkType.trim() || null,
      paper_type: paperType || null,
      paper_year: parsedPaperYear,
      tags: parseTagsInput(tagsInput),
      is_published: published,
    });

    setLoading(false);
    setMsg(error ? error.message : "Link added. Refreshing...");
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
          placeholder="Sample paper pack"
        />
      </label>

      <label className="block">
        <span className="text-sm">Description (optional)</span>
        <textarea
          className="mt-1 w-full rounded-md border p-2 min-h-[100px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short note about the source or what it includes."
        />
      </label>

      <label className="block">
        <span className="text-sm">Link URL</span>
        <input
          className="mt-1 w-full rounded-md border p-2"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="https://..."
        />
      </label>

      <label className="block">
        <span className="text-sm">Link type (optional)</span>
        <input
          className="mt-1 w-full rounded-md border p-2"
          value={linkType}
          onChange={(e) => setLinkType(e.target.value)}
          placeholder="Sample paper, mark scheme, specification"
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
            placeholder="non-calculator, revision"
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

      <button
        className="rounded-md border px-3 py-2"
        onClick={createLink}
        disabled={loading || !title.trim() || !linkUrl.trim()}
      >
        {loading ? "Saving..." : "Add external link"}
      </button>

      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
