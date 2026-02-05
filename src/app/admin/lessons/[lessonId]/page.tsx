import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import LessonEditForm from "./lesson-edit-form";

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
  body: string | null;
  sort_order: number;
  published: boolean;
};

export default async function AdminLessonEditPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  await requireAdmin();
  const { lessonId } = await params;

  const supabase = await createClient();

  const { data: rawLesson } = (await supabase
    .from("lessons")
    .select("id, topic_id, title, body, sort_order, published")
    .eq("id", lessonId)
    .single()) as { data: LessonRow | null };

  if (!rawLesson) redirect("/admin/lessons");

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

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Lesson</h1>
      <LessonEditForm topics={topics} initialLesson={rawLesson} />
    </main>
  );
}
