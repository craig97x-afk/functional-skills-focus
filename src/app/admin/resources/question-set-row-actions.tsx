"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function QuestionSetRowActions({
  setId,
  initialPublished,
}: {
  setId: string;
  initialPublished: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [published, setPublished] = useState(initialPublished);
  const [loading, setLoading] = useState(false);

  async function togglePublished() {
    setLoading(true);
    const next = !published;
    const { error } = await supabase
      .from("question_sets")
      .update({ is_published: next })
      .eq("id", setId);

    if (!error) setPublished(next);
    setLoading(false);
  }

  return (
    <button
      className="text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
      onClick={togglePublished}
      disabled={loading}
    >
      {published ? "Unpublish" : "Publish"}
    </button>
  );
}
