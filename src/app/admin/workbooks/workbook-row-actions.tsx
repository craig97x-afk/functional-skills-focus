"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function WorkbookRowActions({
  workbookId,
  initialPublished,
}: {
  workbookId: string;
  initialPublished: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [published, setPublished] = useState(initialPublished);
  const [loading, setLoading] = useState(false);

  async function togglePublished() {
    setLoading(true);
    const next = !published;
    const { error } = await supabase
      .from("workbooks")
      .update({ is_published: next })
      .eq("id", workbookId);

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
