import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "./print-button";

type TopicRow = { id: string; title: string; sort_order: number };
type AttemptRow = { question_id: string; is_correct: boolean | null; created_at: string };
type QuestionRow = { id: string; topic_id: string };

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

export default async function ProgressReportPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: topicsRaw } = await supabase
    .from("topics")
    .select("id, title, sort_order")
    .order("sort_order");

  const topics = (topicsRaw ?? []) as TopicRow[];

  const { data: attemptsRaw, error: attemptsErr } = await supabase
    .from("practice_attempts")
    .select("question_id, is_correct, created_at")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (attemptsErr) {
    return (
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Progress report</h1>
        <p className="text-sm text-red-400">Failed to load attempts: {attemptsErr.message}</p>
      </main>
    );
  }

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

  const stats = new Map<
    string,
    { attempts: number; correct: number; lastAttemptAt: string | null }
  >();

  for (const a of scoredAttempts) {
    const topicId = qToTopic.get(a.question_id);
    if (!topicId) continue;
    const s = stats.get(topicId) ?? { attempts: 0, correct: 0, lastAttemptAt: null };
    s.attempts += 1;
    if (a.is_correct === true) s.correct += 1;
    if (!s.lastAttemptAt) s.lastAttemptAt = a.created_at;
    stats.set(topicId, s);
  }

  const totalAttempts = scoredAttempts.length;
  const totalCorrect = scoredAttempts.filter((a) => a.is_correct === true).length;
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const mostActive = [...stats.entries()]
    .sort((a, b) => b[1].attempts - a[1].attempts)
    .slice(0, 3)
    .map(([topicId, data]) => ({
      topic: topics.find((t) => t.id === topicId)?.title ?? "Topic",
      attempts: data.attempts,
    }));

  return (
    <main className="p-6 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 print-hidden">
        <div className="space-y-1">
          <Link className="apple-subtle inline-flex" href="/progress">
            ← Back to progress
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">Progress report</h1>
          <p className="apple-subtle">Snapshot of practice accuracy and topic activity.</p>
        </div>
        <PrintButton />
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="apple-card p-5">
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Overall</div>
          <div className="mt-3 text-3xl font-semibold">{overallAccuracy}%</div>
          <div className="apple-subtle">Accuracy across scored attempts.</div>
        </div>
        <div className="apple-card p-5">
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Attempts</div>
          <div className="mt-3 text-3xl font-semibold">{totalAttempts}</div>
          <div className="apple-subtle">Total scored practice attempts.</div>
        </div>
        <div className="apple-card p-5">
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Correct</div>
          <div className="mt-3 text-3xl font-semibold">{totalCorrect}</div>
          <div className="apple-subtle">Correct answers logged.</div>
        </div>
      </section>

      <section className="apple-card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Topic breakdown</div>
            <h2 className="text-xl font-semibold mt-2">Accuracy by topic</h2>
          </div>
          {mostActive.length > 0 && (
            <div className="text-sm text-[color:var(--muted-foreground)]">
              Most active: {mostActive.map((item) => `${item.topic} (${item.attempts})`).join(", ")}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-[color:var(--border)] overflow-hidden">
          <div className="grid grid-cols-5 gap-2 px-4 py-3 text-xs text-[color:var(--muted-foreground)] border-b border-[color:var(--border)]">
            <div>Topic</div>
            <div>Attempts</div>
            <div>Correct</div>
            <div>Accuracy</div>
            <div>Last attempt</div>
          </div>
          <div className="divide-y divide-[color:var(--border)]">
            {topics.map((topic) => {
              const s = stats.get(topic.id);
              const attemptsCount = s?.attempts ?? 0;
              const correctCount = s?.correct ?? 0;
              const acc = attemptsCount > 0 ? Math.round((correctCount / attemptsCount) * 100) : 0;
              return (
                <div key={topic.id} className="grid grid-cols-5 gap-2 px-4 py-3 text-sm">
                  <div className="font-medium">{topic.title}</div>
                  <div>{attemptsCount}</div>
                  <div>{correctCount}</div>
                  <div>{attemptsCount > 0 ? `${acc}%` : "-"}</div>
                  <div className="text-xs text-[color:var(--muted-foreground)]">
                    {formatDate(s?.lastAttemptAt ?? null)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="apple-card p-6 space-y-3">
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Notes</div>
        <h2 className="text-xl font-semibold">Teacher comments</h2>
        <p className="apple-subtle">
          This section is reserved for tutor feedback. Add insights about strengths, gaps,
          and next steps when reviewing this report.
        </p>
        <div className="mt-4 h-28 rounded-xl border border-dashed border-[color:var(--border)]" />
      </section>
    </main>
  );
}
