"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LessonRowActions from "./lesson-row-actions";

type LessonRow = {
  id: string;
  topic_id: string;
  title: string;
  sort_order: number | null;
  published: boolean;
  topics: { title: string } | null;
};

export default function LessonOrderList({ lessons }: { lessons: LessonRow[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<LessonRow[]>(lessons);
  const [dragId, setDragId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const moveItem = (list: LessonRow[], fromIndex: number, toIndex: number) => {
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
        supabase.from("lessons").update({ sort_order: index + 1 }).eq("id", item.id)
      )
    );
    setSaving(false);
  };

  return (
    <div className="space-y-2">
      <div className="text-xs text-[color:var(--muted-foreground)]">
        Drag to reorder lessons. Changes save instantly.
        {saving ? " Saving…" : ""}
      </div>
      {items.map((lesson) => (
        <div
          key={lesson.id}
          className="apple-card flex items-start justify-between p-4"
          draggable
          onDragStart={() => setDragId(lesson.id)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => handleDrop(lesson.id)}
          onDragEnd={() => setDragId(null)}
        >
          <div>
            <div className="font-medium flex items-center gap-2">
              <span className="text-[color:var(--muted-foreground)] cursor-grab">⋮⋮</span>
              {lesson.title}
            </div>
            <div className="text-xs text-[color:var(--muted-foreground)]">
              Topic: {lesson.topics?.title ?? "?"} · Order: {lesson.sort_order ?? "—"} ·{" "}
              {lesson.published ? "Published" : "Draft"}
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-2">
            <Link
              className="text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
              href={`/admin/lessons/${lesson.id}`}
            >
              Edit
            </Link>
            <LessonRowActions lessonId={lesson.id} initialPublished={lesson.published} />
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="text-sm text-[color:var(--muted-foreground)]">
          No lessons yet. Create your first one above.
        </div>
      )}
    </div>
  );
}
