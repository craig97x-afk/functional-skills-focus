"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getExamBoardsForLevel } from "@/lib/exam-boards";

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
  const [published, setPublished] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const availableBoards = useMemo(
    () => getExamBoardsForLevel(subject, levelSlug),
    [subject, levelSlug]
  );

  useEffect(() => {
    if (examBoard === "all") return;
    if (availableBoards.some((board) => board.slug === examBoard)) return;
    setExamBoard(availableBoards[0]?.slug ?? "all");
  }, [availableBoards, examBoard]);

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

    const { error } = await supabase.from("exam_resource_links").insert({
      subject,
      level_slug: levelSlug,
      exam_board: examBoard === "all" ? null : examBoard,
      title: title.trim(),
      description: description || null,
      link_url: linkUrl.trim(),
      link_type: linkType.trim() || null,
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
            value={examBoard}
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
