import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import PracticeRunner from "./practice-runner";

type OptionRow = {
  id: string;
  label: string;
  is_correct: boolean;
};

type QuestionRow = {
  id: string;
  type: "mcq" | "short";
  prompt: string;
  hint: string | null;
  solution_explainer: string | null;
  published: boolean;
  question_options: OptionRow[] | null;
};

export default async function PracticePage({
  params,
}: {
  params: { topicId: string };
}) {
  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: topic } = await supabase
    .from("topics")
    .select("title")
    .eq("id", params.topicId)
    .single();

  if (!topic) redirect("/maths");

  const { data: questionsRaw } = await supabase
    .from("questions")
    .select(`
      id,
      type,
      prompt,
      hint,
      solution_explainer,
      published,
      question_options (
        id,
        label,
        is_correct
      )
    `)
    .eq("topic_id", params.topicId)
    .eq("published", true)
    .order("created_at");

  const questions = (questionsRaw ?? []) as QuestionRow[];

  return (
    <main className="p-6 space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">
        Practice: {topic.title}
      </h1>

      {questions.length === 0 ? (
        <p className="text-sm text-gray-600">
          No published questions for this topic yet.
        </p>
      ) : (
        <PracticeRunner questions={questions} />
      )}
    </main>
  );
}
