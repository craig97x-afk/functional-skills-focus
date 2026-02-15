"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type TableName = "workbooks" | "exam_mocks" | "question_sets";

export default function AdminRowActions({
  table,
  id,
  initialPublished,
}: {
  table: TableName;
  id: string;
  initialPublished: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [published, setPublished] = useState(initialPublished);
  const [loading, setLoading] = useState(false);

  async function togglePublished() {
    setLoading(true);
    const next = !published;
    const { error } = await supabase
      .from(table)
      .update({ is_published: next })
      .eq("id", id);

    if (!error) {
      setPublished(next);
    }
    setLoading(false);
  }

  async function deleteRow() {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    setLoading(true);
    const { error } = await supabase.from(table).delete().eq("id", id);
    setLoading(false);
    if (!error) {
      window.location.reload();
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
