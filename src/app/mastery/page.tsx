import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

type TopicRow = { id: string; title: string; sort_order: number };
type AttemptRow = { question_id: string; is_correct: boolean | null; created_at: string };
type QuestionRow = { id: string; topic_id: string };

function band(score: number) {
  if (score >= 85) return "Strong";
  if (score >= 70) return "Solid";
  if (score >= 50) return "Building";
  return "Beginner";
}

function confidence(total: number) {
  if (total >= 15) return "High";
  if (total >= 8) return "Medium";
  if (total >= 1) return "Low";
  return "No data";
}

function bandClasses(label: string, total: number) {
  if (total === 0) return { badge: "bg-gray-800 text-gray-300", bar: "bg-gray-700" };
  if (label === "Strong") return { badge: "bg-emerald-900 text-emerald-200", bar: "bg-emerald-400" };
  if (label === "Solid") return { badge: "bg-sky-900 text-sky-200", bar: "bg-sky-400" };
  if (label === "Building") return { badge: "bg-amber-900 text-amber-200", bar: "bg-amber-400" };
  return { badge: "bg-rose-900 text-rose-200", bar: "bg-rose-400" };
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
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  const attempts = (attemptsRaw ?? []) as AttemptRow[];
  const scoredAttempts = attempts.filter((a) => a.is_correct !== null);
  const questionIds = Array.from(new Set(scoredAttempts.map((a) => a.question_id)));

  const { data: questionsRaw } =
    questionIds.length > 0
      ? await supabase.from("questions").select("id, topic_id").in("id", questionIds)
      : { data: [] as any[] };

  const questions = (questionsRaw ?? []) as QuestionRow[];

  const qToTopic = new Map<string, string>();
  questions.forEach((q) => qToTopic.set(q.id, q.topic_id));

  // take last 20 attempts per topic
  const perTopicAttempts = new Map<string, AttemptRow[]>();
  for (const a of scoredAttempts) {
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
    const correct = arr.filter((x) => x.is_correct === true).length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const bandLabel = total === 0 ? "No data" : band(score);
    const confidenceLabel = confidence(total);
    return {
      topicId: t.id,
      title: t.title,
      score,
      total,
      band: bandLabel,
      confidence: confidenceLabel,
    };
  });

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Mastery</h1>
      <p className="text-sm text-gray-400">
        Uses your last 20 attempts per topic (more attempts = higher confidence).
      </p>

      <div className="space-y-3">
        {rows.map((r) => {
          const classes = bandClasses(r.band, r.total);
          const scoreLabel = r.total === 0 ? "-" : `${r.score}%`;

          return (
            <div key={r.topicId} className="rounded-lg border p-4 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold">{r.title}</div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                  <span className={`rounded-full px-2 py-0.5 ${classes.badge}`}>
                    {r.band}
                  </span>
                  <span>{r.total}/20 attempts used</span>
                  <span>Confidence: {r.confidence}</span>
                </div>
              </div>
              <div className="text-sm font-semibold">{scoreLabel}</div>
            </div>

            <div className="h-2 w-full rounded bg-gray-800 overflow-hidden">
              <div
                className={`h-2 ${classes.bar}`}
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
          );
        })}
      </div>
    </main>
  );
}
