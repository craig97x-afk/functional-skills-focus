import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import QuestionForm from "./question-form";

export default async function AdminQuestionsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: topics } = await supabase
    .from("topics")
    .select("id, title, levels(code)")
    .order("sort_order");

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, topic_id, published")
    .order("sort_order");

  const { data: questions } = await supabase
    .from("questions")
    .select("id, type, prompt, published, topics(title)")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manage Questions</h1>

      <section className="rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Create question</h2>
        <QuestionForm topics={topics ?? []} lessons={lessons ?? []} />
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Latest questions</h2>
        <div className="space-y-2">
          {(questions ?? []).map((q: any) => (
            <div key={q.id} className="rounded-md border p-3">
              <div className="text-xs text-gray-500">
                {q.published ? "Published" : "Draft"} · {q.type.toUpperCase()} · Topic: {q.topics?.title ?? "?"}
              </div>
              <div className="font-medium mt-1">{q.prompt}</div>
            </div>
          ))}
          {(!questions || questions.length === 0) && (
            <div className="text-sm text-gray-500">No questions yet.</div>
          )}
        </div>
      </section>
    </main>
  );
}
