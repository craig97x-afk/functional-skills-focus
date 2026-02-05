import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

type TopicRow = { id: string; title: string; sort_order: number };
type AttemptRow = { question_id: string; is_correct: boolean; created_at: string };
type QuestionRow = { id: string; topic_id: string };

function band(score: number) {
  if (score >= 85) return "Strong";
  if (score >= 70) return "Solid";
  if (score >= 50) return "Building";
  return "Beginner";
}

export default async function MasteryPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: topicsRaw } = await supabase
    .from("topics")
    .select("id, title, sort_order")
    .order("sort_order");

  const topics = (topicsRaw ?? []) as TopicRow[];

  const { data: attemptsRaw } = await supabase
    .from("practice_attempts")
    .select("question_id, is_correct, created_at")
    .order("created_at", { ascending: false });

  const attempts = (attemptsRaw ?? []) as AttemptRow[];
  const questionIds = Array.from(new Set(attempts.map((a) => a.question_id)));

  const { data: questionsRaw } =
    questionIds.length > 0
      ? await supabase.from("questions").select("id, topic_id").in("id", questionIds)
      : { data: [] as any[] };

  const questions = (questionsRaw ?? []) as QuestionRow[];

  const qToTopic = new Map<string, string>();
  questions.forEach((q) => qToTopic.set(q.id, q.topic_id));

  // take last 20 attempts per topic
  const perTopicAttempts = new Map<string, AttemptRow[]>();
  for (const a of attempts) {
    const topicId = qToTopic.get(a.question_id);
    if (!topicId) continue;
    const arr = perTopicAttempts.get(topicId) ?? [];
    if (arr.length < 20) {
      arr.push(a);
      perTopicAttempts.set(topicId, arr);
    }
  }

  const rows = topics.map((t) => {
    const arr = perTopicAttempts.get(t.id) ?? [];
    const total = arr.length;
    const correct = arr.filter((x) => x.is_correct).length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    return {
      topicId: t.id,
      title: t.title,
      score,
      total,
      band: total === 0 ? "No data" : band(score),
    };
  });

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Mastery</h1>
      <p className="text-sm text-gray-400">
        Uses your last 20 attempts per topic (more attempts = higher confidence).
      </p>

      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.topicId} className="rounded-lg border p-4 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold">{r.title}</div>
                <div className="text-xs text-gray-400">
                  {r.band} · {r.total}/20 attempts used
                </div>
              </div>
              <div className="text-sm font-semibold">{r.total === 0 ? "-" : `${r.score}%`}</div>
            </div>

            <div className="h-2 w-full rounded bg-gray-800 overflow-hidden">
              <div
                className="h-2 bg-white"
                style={{ width: `${r.total === 0 ? 0 : r.score}%` }}
              />
            </div>

            <div className="flex gap-2">
              <a
                className="rounded-md border px-3 py-2 text-sm"
                href={`/practice/${r.topicId}`}
              >
                Practice this topic
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
