import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import PracticeRunner from "./practice-runner";
import Link from "next/link";

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
  searchParams,
}: {
  params: Promise<{ topicId: string }>;
  searchParams?: { mode?: string; count?: string };
}) {
  const { topicId } = await params;
  const mode = searchParams?.mode === "adaptive" ? "adaptive" : "all";
  const requestedCount = Number.parseInt(searchParams?.count ?? "10", 10);
  const desiredCount = Number.isFinite(requestedCount)
    ? Math.min(Math.max(requestedCount, 5), 20)
    : 10;

  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: topic } = await supabase
    .from("topics")
    .select("title")
    .eq("id", topicId)
    .single();

  if (!topic) redirect("/maths/practice");

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

  let selectedQuestions = hydrated;

  if (mode === "adaptive" && hydrated.length > 0) {
    const { data: attemptsRaw } = await supabase
      .from("practice_attempts")
      .select("question_id, is_correct")
      .eq("user_id", session.user.id)
      .in("question_id", qIds);

    const attemptStats = new Map<string, { total: number; correct: number }>();
    (attemptsRaw ?? []).forEach((attempt: any) => {
      if (attempt.is_correct === null) return;
      const stat = attemptStats.get(attempt.question_id) ?? { total: 0, correct: 0 };
      stat.total += 1;
      if (attempt.is_correct === true) stat.correct += 1;
      attemptStats.set(attempt.question_id, stat);
    });

    const ranked = [...hydrated].sort((a, b) => {
      const aStat = attemptStats.get(a.id);
      const bStat = attemptStats.get(b.id);
      const aAttempts = aStat?.total ?? 0;
      const bAttempts = bStat?.total ?? 0;
      const aAcc = aAttempts > 0 ? (aStat?.correct ?? 0) / aAttempts : -1;
      const bAcc = bAttempts > 0 ? (bStat?.correct ?? 0) / bAttempts : -1;
      if (aAcc !== bAcc) return aAcc - bAcc;
      if (aAttempts !== bAttempts) return aAttempts - bAttempts;
      return a.prompt.localeCompare(b.prompt);
    });

    selectedQuestions = ranked.slice(0, Math.min(desiredCount, ranked.length));
  }

  return (
    <main className="space-y-6">
      <Link className="apple-subtle inline-flex" href="/maths/practice">
        ← Practice topics
      </Link>
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Practice
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {topic.title} practice
        </h1>
        <p className="apple-subtle">
          Answer each question to check your understanding.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          className="apple-pill"
          href={`/practice/${topicId}`}
        >
          Full set ({hydrated.length})
        </Link>
        <Link
          className="apple-pill"
          href={`/practice/${topicId}?mode=adaptive&count=${desiredCount}`}
        >
          Adaptive set ({selectedQuestions.length})
        </Link>
      </div>
      <p className="apple-subtle">
        {mode === "adaptive"
          ? "Adaptive set prioritises weaker or unseen questions."
          : "Full set covers every published question in this topic."}
      </p>
      <PracticeRunner topicTitle={topic.title} questions={selectedQuestions} />
    </main>
  );
}
