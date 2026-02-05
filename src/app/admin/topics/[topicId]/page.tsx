import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import TopicEditForm from "./topic-edit-form";

type Subject = { id: string; slug: string; title: string };
type Level = { id: string; code: string; sort_order: number };
type Topic = {
  id: string;
  subject_id: string;
  level_id: string;
  title: string;
  description: string | null;
  sort_order: number;
};

export default async function AdminTopicEditPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  await requireAdmin();
  const { topicId } = await params;

  const supabase = await createClient();

  const { data: topic } = (await supabase
    .from("topics")
    .select("id, subject_id, level_id, title, description, sort_order")
    .eq("id", topicId)
    .single()) as { data: Topic | null };

  if (!topic) redirect("/admin/topics");

  const { data: subjects } = (await supabase
    .from("subjects")
    .select("id, slug, title")
    .order("title")) as { data: Subject[] | null };

  const { data: levels } = (await supabase
    .from("levels")
    .select("id, code, sort_order")
    .order("sort_order")) as { data: Level[] | null };

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Topic</h1>
      <TopicEditForm
        initialTopic={topic}
        subjects={subjects ?? []}
        levels={levels ?? []}
      />
    </main>
  );
}
