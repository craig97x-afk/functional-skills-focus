"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function QuestionRowActions({
  questionId,
  initialPublished,
  type,
}: {
  questionId: string;
  initialPublished: boolean;
  type: "mcq" | "short";
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
      .from("questions")
      .update({ published: next })
      .eq("id", questionId);

    setLoading(false);
    if (error) {
      setMsg(error.message);
      return;
    }

    setPublished(next);
    router.refresh();
  }

  async function deleteQuestion() {
    if (!confirm("Delete this question? This cannot be undone.")) return;
    setLoading(true);
    setMsg(null);

    if (type === "mcq") {
      await supabase.from("question_options").delete().eq("question_id", questionId);
    }

    const { error } = await supabase.from("questions").delete().eq("id", questionId);

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
          onClick={deleteQuestion}
          disabled={loading}
        >
          Delete
        </button>
      </div>
      {msg ? <div className="text-xs text-red-500">{msg}</div> : null}
    </div>
  );
}
