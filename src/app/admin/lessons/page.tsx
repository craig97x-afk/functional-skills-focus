import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import LessonForm from "./lesson-form";
import LessonFilters from "./lesson-filters";
import LessonOrderList from "./lesson-order-list";

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

        <LessonOrderList lessons={lessons} />
      </section>
    </main>
  );
}
