"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LessonSectionBuilder from "../lessons/lesson-section-builder";
import LessonWidgetBuilder from "../lessons/lesson-widget-builder";

const levelOptions = [
  { value: "entry-1", label: "Entry Level 1" },
  { value: "entry-2", label: "Entry Level 2" },
  { value: "entry-3", label: "Entry Level 3" },
  { value: "fs-1", label: "Functional Skills Level 1" },
  { value: "fs-2", label: "Functional Skills Level 2" },
];

export default function QuestionSetForm() {
  const supabase = useMemo(() => createClient(), []);
  const [subject, setSubject] = useState("maths");
  const [levelSlug, setLevelSlug] = useState("entry-3");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [published, setPublished] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createSet() {
    setLoading(true);
    setMsg(null);

    if (!title.trim()) {
      setMsg("Add a title.");
      setLoading(false);
      return;
    }

    let coverUrl: string | null = null;
    let finalResourceUrl: string | null = resourceUrl.trim() || null;

    if (cover) {
      const safeName = cover.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `exam-mocks/question-set-covers/${Date.now()}-${safeName}`;
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

    if (resourceFile) {
      const safeName = resourceFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `exam-mocks/question-sets/${Date.now()}-${safeName}`;
      const { error: uploadErr } = await supabase.storage
        .from("exam-mocks")
        .upload(path, resourceFile, { upsert: false });

      if (uploadErr) {
        setMsg(uploadErr.message);
        setLoading(false);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("exam-mocks")
        .getPublicUrl(path);
      finalResourceUrl = publicUrl.publicUrl;
    }

    const { error } = await supabase.from("question_sets").insert({
      subject,
      level_slug: levelSlug,
      title: title.trim(),
      description: description || null,
      cover_url: coverUrl,
      content: content.trim() || null,
      resource_url: finalResourceUrl,
      is_published: published,
    });

    setLoading(false);
    setMsg(error ? error.message : "Question set created. Refreshing...");
    if (!error) window.location.reload();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-sm">Subject</span>
          <select
            className="mt-1 w-full rounded-md border p-2"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
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
          >
            {levelOptions.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
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
          placeholder="Question set title"
        />
      </label>

      <label className="block">
        <span className="text-sm">Description</span>
        <textarea
          className="mt-1 w-full rounded-md border p-2 min-h-[100px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short summary of the question set."
        />
      </label>

      <div className="space-y-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
        <div>
          <div className="text-sm font-semibold">Interactive content (optional)</div>
          <p className="text-xs text-[color:var(--muted-foreground)]">
            Use Markdown and widgets to build an interactive question set. Leave blank
            if you only want to link a PDF/CSV resource.
          </p>
        </div>
        <textarea
          className="mt-1 w-full rounded-md border p-2 min-h-[180px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write questions here. Use widget blocks for charts, clocks, tables, etc."
        />
        <div className="grid gap-3 md:grid-cols-2">
          <LessonSectionBuilder body={content} onInsert={(next) => setContent(next)} />
          <LessonWidgetBuilder body={content} onInsert={(next) => setContent(next)} />
        </div>
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
          <span className="text-sm">Question set file (JSON/CSV)</span>
          <input
            className="mt-1 w-full rounded-md border p-2"
            type="file"
            accept="application/json,.json,text/csv,.csv"
            onChange={(e) => setResourceFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm">Resource link (optional)</span>
        <input
          className="mt-1 w-full rounded-md border p-2"
          value={resourceUrl}
          onChange={(e) => setResourceUrl(e.target.value)}
          placeholder="https://..."
        />
        <div className="text-xs text-[color:var(--muted-foreground)] mt-1">
          Use this for a hosted resource or leave blank when uploading a JSON/CSV file.
        </div>
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
        onClick={createSet}
        disabled={loading || !title.trim()}
      >
        {loading ? "Saving..." : "Create question set"}
      </button>

      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
