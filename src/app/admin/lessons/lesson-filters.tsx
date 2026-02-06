"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type TopicRow = {
  id: string;
  title: string;
};

export default function LessonFilters({
  topics,
  status,
  topic,
}: {
  topics: TopicRow[];
  status: string;
  topic: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const next = params.toString();
    startTransition(() => {
      router.replace(next ? `/admin/lessons?${next}` : "/admin/lessons");
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-2 mb-4">
      <label className="text-xs text-[color:var(--muted-foreground)]">
        Status
        <select
          name="status"
          value={status}
          onChange={(event) => updateParam("status", event.target.value)}
          className="ml-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-1.5 text-sm text-[color:var(--foreground)]"
        >
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </label>

      <label className="text-xs text-[color:var(--muted-foreground)]">
        Topic
        <select
          name="topic"
          value={topic}
          onChange={(event) => updateParam("topic", event.target.value)}
          className="ml-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-1.5 text-sm text-[color:var(--foreground)]"
        >
          <option value="all">All topics</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className="apple-pill"
        onClick={() => router.replace("/admin/lessons")}
        disabled={isPending}
      >
        Reset
      </button>
    </div>
  );
}
