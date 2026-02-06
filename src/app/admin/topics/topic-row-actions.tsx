"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function TopicRowActions({ topicId }: { topicId: string }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function deleteTopic() {
    if (!confirm("Delete this topic? Lessons and questions will be removed.")) {
      return;
    }

    setLoading(true);
    setMsg(null);

    const { error } = await supabase.from("topics").delete().eq("id", topicId);

    setLoading(false);
    if (error) {
      setMsg(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        className="apple-pill px-3 py-1.5 text-xs text-red-600 border-red-200/60"
        onClick={deleteTopic}
        disabled={loading}
      >
        Delete
      </button>
      {msg ? <div className="text-xs text-red-500">{msg}</div> : null}
    </div>
  );
}
