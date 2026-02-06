import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import ProgressCommentEditor from "../../progress-comment-editor";

type TopicRow = { id: string; title: string; sort_order: number };
type AttemptRow = { question_id: string; is_correct: boolean | null; created_at: string };
type QuestionRow = { id: string; topic_id: string };

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

export default async function AdminUserProgressPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireAdmin();
  const { userId } = await params;

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_subscribed, access_override")
    .eq("id", userId)
    .maybeSingle();

  const { data: topicsRaw } = await supabase
    .from("topics")
    .select("id, title, sort_order")
    .order("sort_order");

  const topics = (topicsRaw ?? []) as TopicRow[];

  const { data: attemptsRaw } = await supabase
    .from("practice_attempts")
    .select("question_id, is_correct, created_at")
    .eq("user_id", userId)
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

  const { data: latestComment } = await supabase
    .from("progress_comments")
    .select("id, content, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="p-6 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <Link className="apple-subtle inline-flex" href="/admin/users">
            ← Back to users
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">Student progress</h1>
          <p className="apple-subtle">
            User ID: {userId} · Role: {profile?.role ?? "student"} ·{" "}
            {profile?.is_subscribed || profile?.access_override ? "Access" : "No access"}
          </p>
        </div>
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
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Teacher comments
        </div>
        <ProgressCommentEditor
          userId={userId}
          commentId={latestComment?.id ?? null}
          initialContent={latestComment?.content ?? ""}
        />
        {latestComment?.created_at && (
          <div className="text-xs text-[color:var(--muted-foreground)]">
            Last updated {formatDate(latestComment.created_at)}
          </div>
        )}
      </section>

      <section className="apple-card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Topic breakdown
            </div>
            <h2 className="text-xl font-semibold mt-2">Accuracy by topic</h2>
          </div>
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
    </main>
  );
}
