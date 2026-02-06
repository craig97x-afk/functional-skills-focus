import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import QuestionEditForm from "./question-edit-form";

type Topic = {
  id: string;
  title: string;
  level: { code: string } | null;
};

type Lesson = {
  id: string;
  title: string;
  topic_id: string;
  published: boolean;
};

type QuestionRow = {
  id: string;
  topic_id: string;
  lesson_id: string | null;
  type: "mcq" | "short";
  prompt: string;
  hint: string | null;
  solution_explainer: string | null;
  published: boolean;
};

type OptionRow = {
  id: string;
  label: string;
  is_correct: boolean;
};

export default async function AdminQuestionEditPage({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  await requireAdmin();
  const { questionId } = await params;

  const supabase = await createClient();

  const { data: question } = (await supabase
    .from("questions")
    .select(
      "id, topic_id, lesson_id, type, prompt, hint, solution_explainer, published"
    )
    .eq("id", questionId)
    .single()) as { data: QuestionRow | null };

  if (!question) redirect("/admin/questions");

  const { data: topics } = (await supabase
    .from("topics")
    .select("id, title, level:level_id(code)")
    .order("title")) as { data: Topic[] | null };

  const { data: lessons } = (await supabase
    .from("lessons")
    .select("id, title, topic_id, published")
    .order("title")) as { data: Lesson[] | null };

  const { data: options } =
    question.type === "mcq"
      ? ((await supabase
          .from("question_options")
          .select("id, label, is_correct")
          .eq("question_id", questionId)
          .order("id")) as { data: OptionRow[] | null })
      : { data: [] as OptionRow[] };

  return (
    <main className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
          Questions
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">
          Edit Question
        </h1>
      </div>
      <section className="apple-card p-6">
        <QuestionEditForm
          initialQuestion={question}
          initialOptions={options ?? []}
          topics={topics ?? []}
          lessons={lessons ?? []}
        />
      </section>
    </main>
  );
}
