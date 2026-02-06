import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import LessonForm from "./lesson-form";
import LessonRowActions from "./lesson-row-actions";
import LessonFilters from "./lesson-filters";

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
    <main className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
          Lessons
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">
          Manage Lessons
        </h1>
      </div>

      <section className="apple-card p-6">
        <h2 className="font-semibold mb-4">Create a new lesson</h2>
        <LessonForm topics={topics} />
      </section>

      <section className="apple-card p-6">
        <h2 className="font-semibold mb-4">Existing lessons</h2>
        <LessonFilters topics={topics} status={status} topic={topicFilter} />

        <div className="space-y-2">
          {lessons.map((l) => (
            <div key={l.id} className="apple-card flex items-start justify-between p-4">
              <div>
                <div className="font-medium">{l.title}</div>
                <div className="text-xs text-[color:var(--muted-foreground)]">
                  Topic: {l.topics?.title ?? "?"} · Order: {l.sort_order} ·{" "}
                  {l.published ? "Published" : "Draft"}
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-2">
                <Link
                  className="text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                  href={`/admin/lessons/${l.id}`}
                >
                  Edit
                </Link>
                <LessonRowActions lessonId={l.id} initialPublished={l.published} />
              </div>
            </div>
          ))}

          {lessons.length === 0 && (
            <div className="text-sm text-[color:var(--muted-foreground)]">
              No lessons yet. Create your first one above.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
