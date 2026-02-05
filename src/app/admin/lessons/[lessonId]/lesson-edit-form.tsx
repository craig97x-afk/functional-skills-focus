"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Topic = {
  id: string;
  title: string;
  sort_order: number;
  levels?: { code: string }[];
};

type Lesson = {
  id: string;
  topic_id: string;
  title: string;
  body: string | null;
  sort_order: number;
  published: boolean;
};

export default function LessonEditForm({
  topics,
  initialLesson,
}: {
  topics: Topic[];
  initialLesson: Lesson;
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [topicId, setTopicId] = useState(initialLesson.topic_id);
  const [title, setTitle] = useState(initialLesson.title);
  const [body, setBody] = useState(initialLesson.body ?? "");
  const [sortOrder, setSortOrder] = useState(initialLesson.sort_order);
  const [published, setPublished] = useState(initialLesson.published);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setMsg(null);

    const { error } = await supabase
      .from("lessons")
      .update({
        topic_id: topicId,
        title,
        body: body || null,
        sort_order: sortOrder,
        published,
      })
      .eq("id", initialLesson.id);

    setLoading(false);
    setMsg(error ? error.message : "Lesson updated.");
  }

  async function deleteLesson() {
    if (!confirm("Delete this lesson? This cannot be undone.")) return;
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.from("lessons").delete().eq("id", initialLesson.id);

    setLoading(false);
    if (error) {
      setMsg(error.message);
      return;
    }

    router.push("/admin/lessons");
    router.refresh();
  }

  return (
    <div className="rounded-lg border p-4 space-y-4">
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
        />
      </label>

      <label className="block">
        <span className="text-sm">Lesson content</span>
        <textarea
          className="mt-1 w-full rounded-md border p-2 min-h-[140px]"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </label>

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

      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-md border px-3 py-2"
          onClick={save}
          disabled={loading || !topicId || !title}
        >
          {loading ? "Saving..." : "Save changes"}
        </button>
        <button
          className="rounded-md border px-3 py-2 text-red-600"
          onClick={deleteLesson}
          disabled={loading}
        >
          Delete lesson
        </button>
      </div>

      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
