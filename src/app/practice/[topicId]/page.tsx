import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import PracticeRunner from "./practice-runner";

type QuestionOptionRow = { id: string; question_id: string; label: string; is_correct: boolean };
type QuestionRow = {
  id: string;
  type: "mcq" | "short";
  prompt: string;
  hint: string | null;
  solution_explainer: string | null;
  options?: { id: string; label: string; is_correct?: boolean }[];
};

export default async function PracticePage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;

  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: topic } = await supabase
    .from("topics")
    .select("title")
    .eq("id", topicId)
    .single();

  if (!topic) redirect("/maths");

  const { data: questions } = await supabase
    .from("questions")
    .select("id, type, prompt, hint, solution_explainer")
    .eq("topic_id", topicId)
    .eq("published", true)
    .order("created_at");

  const qIds = (questions ?? []).map((q) => q.id);

  const { data: options } =
    qIds.length > 0
      ? await supabase
          .from("question_options")
          .select("id, question_id, label, is_correct")
          .in("question_id", qIds)
      : { data: [] as any[] };

  const optionsByQ = new Map<string, QuestionOptionRow[]>();
  (options ?? []).forEach((o: QuestionOptionRow) => {
    const arr = optionsByQ.get(o.question_id) ?? [];
    arr.push(o);
    optionsByQ.set(o.question_id, arr);
  });

  const hydrated: QuestionRow[] = (questions ?? []).map((q: any) => ({
    ...q,
    options: (optionsByQ.get(q.id) ?? []).map((o) => ({
      id: o.id,
      label: o.label,
      is_correct: o.is_correct,
    })),
  }));

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Practice: {topic.title}</h1>
      <PracticeRunner topicTitle={topic.title} questions={hydrated} />
    </main>
  );
}
