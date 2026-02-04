"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Subject = { id: string; slug: string; title: string };
type Level = { id: string; code: string; sort_order: number };

export default function TopicForm({ subjects, levels }: { subjects: Subject[]; levels: Level[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [levelId, setLevelId] = useState(levels[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createTopic() {
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.from("topics").insert({
      subject_id: subjectId,
      level_id: levelId,
      title,
      description: description || null,
      sort_order: sortOrder,
    });

    setLoading(false);
    setMsg(error ? error.message : "Topic created. Refreshing page...");
    if (!error) window.location.reload();
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-sm">Subject</span>
          <select className="mt-1 w-full rounded-md border p-2" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm">Level</span>
          <select className="mt-1 w-full rounded-md border p-2" value={levelId} onChange={(e) => setLevelId(e.target.value)}>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>{l.code}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm">Title</span>
        <input className="mt-1 w-full rounded-md border p-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fractions" />
      </label>

      <label className="block">
        <span className="text-sm">Description (optional)</span>
        <input className="mt-1 w-full rounded-md border p-2" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
      </label>

      <label className="block">
        <span className="text-sm">Sort order</span>
        <input className="mt-1 w-full rounded-md border p-2" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
      </label>

      <button className="rounded-md border px-3 py-2" onClick={createTopic} disabled={loading || !subjectId || !levelId || !title}>
        Create topic
      </button>

      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
