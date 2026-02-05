"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LessonRowActions({
  lessonId,
  initialPublished,
}: {
  lessonId: string;
  initialPublished: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [published, setPublished] = useState(initialPublished);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function togglePublished() {
    setLoading(true);
    setMsg(null);
    const next = !published;

    const { error } = await supabase
      .from("lessons")
      .update({ published: next })
      .eq("id", lessonId);

    setLoading(false);
    if (error) {
      setMsg(error.message);
      return;
    }

    setPublished(next);
    router.refresh();
  }

  async function deleteLesson() {
    if (!confirm("Delete this lesson? This cannot be undone.")) return;
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.from("lessons").delete().eq("id", lessonId);

    setLoading(false);
    if (error) {
      setMsg(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <button
          className="rounded-md border px-2 py-1 text-xs"
          onClick={togglePublished}
          disabled={loading}
        >
          {published ? "Unpublish" : "Publish"}
        </button>
        <button
          className="rounded-md border px-2 py-1 text-xs text-red-600"
          onClick={deleteLesson}
          disabled={loading}
        >
          Delete
        </button>
      </div>
      {msg ? <div className="text-xs text-red-500">{msg}</div> : null}
    </div>
  );
}
