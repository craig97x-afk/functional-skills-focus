import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import QuestionForm from "./question-form";

type Topic = {
  id: string;
  title: string;
  level: { code: string };
};

type Lesson = {
  id: string;
  title: string;
  topic_id: string;
  published: boolean;
};

type QuestionRow = {
  id: string;
  type: "mcq" | "short";
  prompt: string;
  published: boolean;
  topics: { title: string } | null;
  lessons: { title: string } | null;
};

export default async function AdminQuestionsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: topics } = (await supabase
    .from("topics")
    .select("id, title, level:level_id(code)")
    .order("title")) as { data: Topic[] | null };
  const { data: lessons } = (await supabase
    .from("lessons")
    .select("id, title, topic_id, published")
    .order("title")) as { data: Lesson[] | null };

  const { data: questions } = (await supabase
    .from("questions")
    .select("id, type, prompt, published, topics(title), lessons(title)")
    .order("created_at", { ascending: false })) as { data: QuestionRow[] | null };

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manage Questions</h1>

      <section className="rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Create question</h2>
        <QuestionForm topics={topics ?? []} lessons={lessons ?? []} />
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Existing questions</h2>

        <div className="space-y-2">
          {(questions ?? []).map((q) => (
            <div key={q.id} className="rounded-md border p-3">
              <div className="font-medium">{q.prompt}</div>
              <div className="text-xs text-gray-500 mt-1">
                Type: {q.type.toUpperCase()} · {q.published ? "Published" : "Draft"}
                {" · "}
                Topic: {q.topics?.title ?? "?"}
                {" · "}
                Lesson: {q.lessons?.title ?? "None"}
              </div>
            </div>
          ))}

          {(!questions || questions.length === 0) && (
            <div className="text-sm text-gray-500">
              No questions yet. Create your first one above.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
