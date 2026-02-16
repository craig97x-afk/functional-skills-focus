"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import TopicRowActions from "./topic-row-actions";

type TopicRow = {
  id: string;
  title: string;
  description?: string | null;
  sort_order: number | null;
  level?: { code?: string } | null;
  subject?: { slug?: string } | null;
};

export default function TopicOrderList({ topics }: { topics: TopicRow[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<TopicRow[]>(topics);
  const [dragId, setDragId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const moveItem = (list: TopicRow[], fromIndex: number, toIndex: number) => {
    const next = [...list];
    const [removed] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, removed);
    return next;
  };

  const handleDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const dragIndex = items.findIndex((item) => item.id === dragId);
    const dropIndex = items.findIndex((item) => item.id === targetId);
    if (dragIndex === -1 || dropIndex === -1) return;
    const next = moveItem(items, dragIndex, dropIndex);
    setItems(next);
    setDragId(null);
    setSaving(true);
    await Promise.all(
      next.map((item, index) =>
        supabase.from("topics").update({ sort_order: index + 1 }).eq("id", item.id)
      )
    );
    setSaving(false);
  };

  return (
    <div className="space-y-2">
      <div className="text-xs text-[color:var(--muted-foreground)]">
        Drag to reorder topics. Changes save instantly.
        {saving ? " Saving…" : ""}
      </div>
      {items.map((topic) => (
        <div
          key={topic.id}
          className="flex items-start justify-between rounded-md border p-3 bg-[color:var(--surface)]"
          draggable
          onDragStart={() => setDragId(topic.id)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => handleDrop(topic.id)}
          onDragEnd={() => setDragId(null)}
        >
          <div>
            <div className="font-medium flex items-center gap-2">
              <span className="text-[color:var(--muted-foreground)] cursor-grab">⋮⋮</span>
              {topic.title}
            </div>
            <div className="text-xs text-gray-500">
              Level: {topic.level?.code ?? "?"} · Subject: {topic.subject?.slug ?? "?"} ·
              Order: {topic.sort_order ?? "—"}
            </div>
            {topic.description ? (
              <div className="text-sm mt-1">{topic.description}</div>
            ) : null}
          </div>
          <div className="shrink-0 flex flex-col items-end gap-2">
            <Link className="text-sm underline" href={`/admin/topics/${topic.id}`}>
              Edit
            </Link>
            <TopicRowActions topicId={topic.id} />
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div className="text-sm text-gray-500">No topics yet. Create your first one above.</div>
      )}
    </div>
  );
}
