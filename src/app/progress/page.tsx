import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type TopicStat = {
  topic_id: string;
  topic_title: string;
  level_code: string | null;
  total_attempts: number;
  correct_attempts: number;
};

export default async function ProgressPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  // Pull attempts joined to questions/topics/levels in one go
  const { data: rows, error } = await supabase
    .from("attempts")
    .select(
      `
      is_correct,
      created_at,
      questions (
        id,
        topic_id,
        prompt,
        topics (
          id,
          title,
          levels ( code )
        )
      )
    `
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Progress</h1>
        <p className="mt-3 text-sm text-red-600">{error.message}</p>
      </main>
    );
  }

  const attempts = rows ?? [];

  const total = attempts.length;
  const correct = attempts.filter((a: any) => a.is_correct).length;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;

  // Aggregate by topic
  const map = new Map<string, TopicStat>();

  for (const a of attempts as any[]) {
    const topic = a.questions?.topics;
    if (!topic?.id) continue;

    const key = topic.id as string;
    const prev = map.get(key) ?? {
      topic_id: key,
      topic_title: topic.title ?? "Untitled",
      level_code: topic.levels?.code ?? null,
      total_attempts: 0,
      correct_attempts: 0,
    };

    prev.total_attempts += 1;
    if (a.is_correct) prev.correct_attempts += 1;

    map.set(key, prev);
  }

  const topicStats = Array.from(map.values())
    .map((t) => ({
      ...t,
      accuracy: t.total_attempts ? Math.round((t.correct_attempts / t.total_attempts) * 100) : 0,
    }))
    .sort((a, b) => b.total_attempts - a.total_attempts);

  const recent = attempts.slice(0, 20);

  return (
    <main className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Progress</h1>
        <p className="text-sm text-gray-500">Based on your practice attempts.</p>
      </div>

      <section className="rounded-lg border p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md border p-3">
            <div className="text-xs text-gray-500">Total attempts</div>
            <div className="text-2xl font-bold">{total}</div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-xs text-gray-500">Correct</div>
            <div className="text-2xl font-bold">{correct}</div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-xs text-gray-500">Accuracy</div>
            <div className="text-2xl font-bold">{accuracy}%</div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="font-semibold">By topic</h2>

        {topicStats.length === 0 ? (
          <p className="text-sm text-gray-500">No practice attempts yet. Go do some questions.</p>
        ) : (
          <div className="space-y-2">
            {topicStats.map((t: any) => (
              <div key={t.topic_id} className="rounded-md border p-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">
                    {t.level_code ? `[${t.level_code}] ` : ""}{t.topic_title}
                  </div>
                  <div className="text-xs text-gray-500">
                    Attempts: {t.total_attempts} · Correct: {t.correct_attempts}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">{t.accuracy}%</div>
                  <div className="text-xs text-gray-500">Accuracy</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="font-semibold">Recent attempts</h2>

        {recent.length === 0 ? (
          <p className="text-sm text-gray-500">Nothing here yet.</p>
        ) : (
          <div className="space-y-2">
            {recent.map((a: any, idx: number) => {
              const topicTitle = a.questions?.topics?.title ?? "Topic";
              const levelCode = a.questions?.topics?.levels?.code ?? "";
              const prompt = a.questions?.prompt ?? "Question";
              return (
                <div key={idx} className="rounded-md border p-3">
                  <div className="text-xs text-gray-500">
                    {levelCode ? `[${levelCode}] ` : ""}{topicTitle} · {new Date(a.created_at).toLocaleString()}
                  </div>
                  <div className="mt-1">{prompt}</div>
                  <div className="mt-2 text-sm">
                    Result: <span className={a.is_correct ? "font-semibold" : "font-semibold"}>{a.is_correct ? "Correct" : "Incorrect"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-2">
          <Link href="/maths" className="inline-block rounded-md border px-3 py-2">
            Back to Maths
          </Link>
        </div>
      </section>
    </main>
  );
}
