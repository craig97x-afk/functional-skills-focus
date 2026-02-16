"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type TableName = "workbooks" | "exam_mocks" | "question_sets";

export default function AdminRowActions({
  table,
  id,
  initialPublished,
  supportsFeatured = false,
  initialFeatured = false,
  cloneData,
  onDone,
}: {
  table: TableName;
  id: string;
  initialPublished: boolean;
  supportsFeatured?: boolean;
  initialFeatured?: boolean;
  cloneData?: Record<string, unknown>;
  onDone?: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [published, setPublished] = useState(initialPublished);
  const [featured, setFeatured] = useState(initialFeatured);
  const [loading, setLoading] = useState(false);

  async function togglePublished() {
    setLoading(true);
    const next = !published;
    const { error } = await supabase
      .from(table)
      .update({ is_published: next })
      .eq("id", id);

    if (!error) setPublished(next);
    setLoading(false);
  }

  async function toggleFeatured() {
    if (!supportsFeatured) return;
    setLoading(true);
    const next = !featured;
    const { error } = await supabase
      .from(table)
      .update({ is_featured: next })
      .eq("id", id);
    if (!error) setFeatured(next);
    setLoading(false);
  }

  async function duplicateRow() {
    if (!cloneData) return;
    setLoading(true);
    const { error } = await supabase.from(table).insert(cloneData);
    setLoading(false);
    if (!error) {
      if (onDone) onDone();
      else window.location.reload();
    }
  }

  async function deleteRow() {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    setLoading(true);
    const { error } = await supabase.from(table).delete().eq("id", id);
    setLoading(false);
    if (!error) {
      if (onDone) onDone();
      else window.location.reload();
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      <button
        type="button"
        className="text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
        onClick={togglePublished}
        disabled={loading}
      >
        {published ? "Unpublish" : "Publish"}
      </button>
      {supportsFeatured && (
        <button
          type="button"
          className="text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
          onClick={toggleFeatured}
          disabled={loading}
        >
          {featured ? "Unfeature" : "Feature"}
        </button>
      )}
      {cloneData && (
        <button
          type="button"
          className="text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
          onClick={duplicateRow}
          disabled={loading}
        >
          Duplicate
        </button>
      )}
      <button
        type="button"
        className="text-red-500 hover:text-red-400"
        onClick={deleteRow}
        disabled={loading}
      >
        Delete
      </button>
    </div>
  );
}
