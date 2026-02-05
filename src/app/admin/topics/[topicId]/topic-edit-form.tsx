"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Subject = { id: string; slug: string; title: string };
type Level = { id: string; code: string; sort_order: number };
type Topic = {
  id: string;
  subject_id: string;
  level_id: string;
  title: string;
  description: string | null;
  sort_order: number;
};

export default function TopicEditForm({
  initialTopic,
  subjects,
  levels,
}: {
  initialTopic: Topic;
  subjects: Subject[];
  levels: Level[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [subjectId, setSubjectId] = useState(initialTopic.subject_id);
  const [levelId, setLevelId] = useState(initialTopic.level_id);
  const [title, setTitle] = useState(initialTopic.title);
  const [description, setDescription] = useState(initialTopic.description ?? "");
  const [sortOrder, setSortOrder] = useState(initialTopic.sort_order);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setMsg(null);

    const { error } = await supabase
      .from("topics")
      .update({
        subject_id: subjectId,
        level_id: levelId,
        title,
        description: description || null,
        sort_order: sortOrder,
      })
      .eq("id", initialTopic.id);

    setLoading(false);
    setMsg(error ? error.message : "Topic updated.");
  }

  async function deleteTopic() {
    if (!confirm("Delete this topic? This cannot be undone.")) return;
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.from("topics").delete().eq("id", initialTopic.id);

    setLoading(false);
    if (error) {
      setMsg(error.message);
      return;
    }

    router.push("/admin/topics");
    router.refresh();
  }

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-sm">Subject</span>
          <select
            className="mt-1 w-full rounded-md border p-2"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm">Level</span>
          <select
            className="mt-1 w-full rounded-md border p-2"
            value={levelId}
            onChange={(e) => setLevelId(e.target.value)}
          >
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.code}
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
        />
      </label>

      <label className="block">
        <span className="text-sm">Description (optional)</span>
        <input
          className="mt-1 w-full rounded-md border p-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-sm">Sort order</span>
        <input
          className="mt-1 w-full rounded-md border p-2"
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-md border px-3 py-2"
          onClick={save}
          disabled={loading || !subjectId || !levelId || !title}
        >
          {loading ? "Saving..." : "Save changes"}
        </button>
        <button
          className="rounded-md border px-3 py-2 text-red-600"
          onClick={deleteTopic}
          disabled={loading}
        >
          Delete topic
        </button>
      </div>

      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
