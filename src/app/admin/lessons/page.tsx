import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import LessonForm from "./lesson-form";
import LessonRowActions from "./lesson-row-actions";

type TopicRow = {
  id: string;
  title: string;
  sort_order: number;
  levels: { code: string }[];
};

type LessonRow = {
  id: string;
  topic_id: string;
  title: string;
  sort_order: number;
  published: boolean;
  topics: { title: string } | null;
};

export default async function AdminLessonsPage({
  searchParams,
}: {
  searchParams?: { status?: string; topic?: string };
}) {
  await requireAdmin();
  const supabase = await createClient();

  const status = searchParams?.status ?? "all";
  const topicFilter = searchParams?.topic ?? "all";

  const { data: rawTopics } = await supabase
    .from("topics")
    .select("id, title, sort_order, levels(code)")
    .order("sort_order");

  const topics: TopicRow[] = (rawTopics ?? []).map((t: any) => ({
    id: t.id,
    title: t.title,
    sort_order: t.sort_order,
    levels: t.levels ?? [],
  }));

  let lessonQuery = supabase
    .from("lessons")
    .select("id, topic_id, title, sort_order, published, topics(title)")
    .order("sort_order");

  if (status === "published") {
    lessonQuery = lessonQuery.eq("published", true);
  } else if (status === "draft") {
    lessonQuery = lessonQuery.eq("published", false);
  }

  if (topicFilter && topicFilter !== "all") {
    lessonQuery = lessonQuery.eq("topic_id", topicFilter);
  }

  const { data: rawLessons } = await lessonQuery;

  const lessons: LessonRow[] = (rawLessons ?? []).map((l: any) => ({
    id: l.id,
    topic_id: l.topic_id,
    title: l.title,
    sort_order: l.sort_order,
    published: l.published,
    topics: l.topics ?? null,
  }));

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manage Lessons</h1>

      <section className="rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Create a new lesson</h2>
        <LessonForm topics={topics} />
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Existing lessons</h2>
        <form className="flex flex-wrap items-end gap-2 mb-4" method="get">
          <label className="text-xs text-gray-400">
            Status
            <select
              name="status"
              defaultValue={status}
              className="ml-2 rounded-md border px-2 py-1 text-sm"
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>

          <label className="text-xs text-gray-400">
            Topic
            <select
              name="topic"
              defaultValue={topicFilter}
              className="ml-2 rounded-md border px-2 py-1 text-sm"
            >
              <option value="all">All topics</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>

          <button className="rounded-md border px-3 py-2 text-sm" type="submit">
            Apply
          </button>
          <Link className="rounded-md border px-3 py-2 text-sm" href="/admin/lessons">
            Reset
          </Link>
        </form>

        <div className="space-y-2">
          {lessons.map((l) => (
            <div
              key={l.id}
              className="flex items-start justify-between rounded-md border p-3"
            >
              <div>
                <div className="font-medium">{l.title}</div>
                <div className="text-xs text-gray-500">
                  Topic: {l.topics?.title ?? "?"} · Order: {l.sort_order} ·{" "}
                  {l.published ? "Published" : "Draft"}
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-2">
                <Link className="text-sm underline" href={`/admin/lessons/${l.id}`}>
                  Edit
                </Link>
                <LessonRowActions lessonId={l.id} initialPublished={l.published} />
              </div>
            </div>
          ))}

          {lessons.length === 0 && (
            <div className="text-sm text-gray-500">
              No lessons yet. Create your first one above.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
