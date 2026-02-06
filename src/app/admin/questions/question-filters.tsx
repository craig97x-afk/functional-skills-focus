"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type Topic = {
  id: string;
  title: string;
};

export default function QuestionFilters({
  topics,
  status,
  type,
  topic,
}: {
  topics: Topic[];
  status: string;
  type: string;
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
      router.replace(next ? `/admin/questions?${next}` : "/admin/questions");
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
        Type
        <select
          name="type"
          value={type}
          onChange={(event) => updateParam("type", event.target.value)}
          className="ml-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-1.5 text-sm text-[color:var(--foreground)]"
        >
          <option value="all">All</option>
          <option value="mcq">MCQ</option>
          <option value="short">Short</option>
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
        onClick={() => router.replace("/admin/questions")}
        disabled={isPending}
      >
        Reset
      </button>
    </div>
  );
}
