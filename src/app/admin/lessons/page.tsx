import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import LessonForm from "./lesson-form";

type Topic = {
  id: string;
  title: string;
  sort_order: number;
  levels?: { code: string }[];
};

type LessonRow = {
  id: string;
  title: string;
  sort_order: number;
  published: boolean;
  topics: { title: string } | null;
};

export default async function AdminLessonsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: rawTopics } = await supabase
    .from("topics")
    .select("id, title, sort_order, levels(code)")
    .order("sort_order");

  // 👇 make TypeScript calm down
  const topics = (rawTopics ?? []) as unknown as Topic[];

  const { data: rawLessons } = await supabase
    .from("lessons")
    .select("id, title, sort_order, published, topics(title)")
    .order("sort_order");

  const lessons = (rawLessons ?? []) as unknown as LessonRow[];

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manage Lessons</h1>

      <section className="rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Create a new lesson</h2>
        <LessonForm topics={topics} />
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Existing lessons</h2>

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
