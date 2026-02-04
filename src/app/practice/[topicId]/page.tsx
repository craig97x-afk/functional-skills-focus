import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import PracticeClient from "./practice-client";

export default async function PracticePage({ params }: { params: { topicId: string } }) {
  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: topic } = await supabase.from("topics").select("title").eq("id", params.topicId).single();
  if (!topic) redirect("/maths");

  const { data: questions } = await supabase
    .from("questions")
    .select("id, type, prompt, hint, solution_explainer")
    .eq("topic_id", params.topicId)
    .eq("published", true)
    .order("created_at");

  const qIds = (questions ?? []).map((q) => q.id);
  const { data: options } =
    qIds.length > 0
      ? await supabase.from("question_options").select("id, question_id, label").in("question_id", qIds)
      : { data: [] as any[] };

  const optionsByQ = new Map<string, any[]>();
  (options ?? []).forEach((o) => {
    const arr = optionsByQ.get(o.question_id) ?? [];
    arr.push(o);
    optionsByQ.set(o.question_id, arr);
  });

  const hydrated = (questions ?? []).map((q) => ({ ...q, options: optionsByQ.get(q.id) ?? [] }));

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Practice: {topic.title}</h1>
      <PracticeClient topicId={params.topicId} userId={session.user.id} questions={hydrated} />
    </main>
  );
}
