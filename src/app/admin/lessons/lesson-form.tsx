"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LessonWidgetBuilder from "./lesson-widget-builder";
import LessonSectionBuilder from "./lesson-section-builder";

type Topic = {
  id: string;
  title: string;
  sort_order: number;
  levels?: { code: string }[];
};


export default function LessonForm({ topics }: { topics: Topic[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [topicId, setTopicId] = useState(topics[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [published, setPublished] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createLesson() {
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.from("lessons").insert({
      topic_id: topicId,
      title,
      body: body || null,
      sort_order: sortOrder,
      published,
    });

    setLoading(false);
    setMsg(error ? error.message : "Lesson created. Refreshing page...");
    if (!error) window.location.reload();
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-sm">Topic</span>
        <select
          className="mt-1 w-full rounded-md border p-2"
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
        >
          {topics.map((t) => {
            const code = t.levels?.[0]?.code;
            return (
              <option key={t.id} value={t.id}>
                {code ? `[${code}] ` : ""}
                {t.title}
              </option>
            );
          })}
        </select>
      </label>

      <label className="block">
        <span className="text-sm">Lesson title</span>
        <input
          className="mt-1 w-full rounded-md border p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Equivalent Fractions"
        />
      </label>

      <label className="block">
        <span className="text-sm">Lesson content (markdown supported)</span>
        <textarea
          className="mt-1 w-full rounded-md border p-2 min-h-[140px]"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write the explanation here..."
        />
      </label>

      {/* Helpers insert structured blocks into the markdown body. */}
      <LessonSectionBuilder body={body} onInsert={setBody} />
      <LessonWidgetBuilder body={body} onInsert={setBody} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-sm">Sort order</span>
          <input
            className="mt-1 w-full rounded-md border p-2"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
        </label>

        <label className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          <span className="text-sm">Published</span>
        </label>
      </div>

      <button
        className="rounded-md border px-3 py-2"
        onClick={createLesson}
        disabled={loading || !topicId || !title}
      >
        {loading ? "Creating..." : "Create lesson"}
      </button>

      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
