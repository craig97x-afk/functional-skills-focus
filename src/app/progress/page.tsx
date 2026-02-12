import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

type TopicRow = { id: string; title: string; sort_order: number };
type AttemptRow = { question_id: string; is_correct: boolean | null; created_at: string };
type QuestionRow = { id: string; topic_id: string };

export default async function ProgressPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: topicsRaw } = await supabase
    .from("topics")
    .select("id, title, sort_order")
    .order("sort_order");

  const topics = (topicsRaw ?? []) as TopicRow[];

  const { data: achievementsRaw } = await supabase
    .from("user_achievements")
    .select(
      "earned_at, achievement:achievement_id (id, title, description, icon, points)"
    )
    .eq("user_id", session.user.id)
    .order("earned_at", { ascending: false });

  type AchievementInfo = {
    id: string;
    title: string;
    description?: string | null;
    icon?: string | null;
    points?: number | null;
  };

  type RawAchievementRow = {
    earned_at: string;
    achievement: AchievementInfo | AchievementInfo[] | null;
  };

  const achievements = ((achievementsRaw ?? []) as RawAchievementRow[]).map(
    (row) => ({
      earned_at: row.earned_at,
      achievement: Array.isArray(row.achievement)
        ? row.achievement[0] ?? null
        : row.achievement ?? null,
    })
  );

  // Pull attempts for THIS user only (RLS enforces it anyway)
  const { data: attemptsRaw, error: attemptsErr } = await supabase
    .from("practice_attempts")
    .select("question_id, is_correct, created_at")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (attemptsErr) {
    return (
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Progress</h1>
        <p className="text-sm text-red-400">Failed to load attempts: {attemptsErr.message}</p>
      </main>
    );
  }

  const attempts = (attemptsRaw ?? []) as AttemptRow[];
  const scoredAttempts = attempts.filter((a) => a.is_correct !== null);
  const questionIds = Array.from(new Set(scoredAttempts.map((a) => a.question_id)));

  // Map question_id -> topic_id
  const { data: questionsRaw } =
    questionIds.length > 0
      ? await supabase.from("questions").select("id, topic_id").in("id", questionIds)
      : { data: [] as any[] };

  const questions = (questionsRaw ?? []) as QuestionRow[];

  const qToTopic = new Map<string, string>();
  questions.forEach((q) => qToTopic.set(q.id, q.topic_id));

  // Aggregate per topic
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
    if (!s.lastAttemptAt) s.lastAttemptAt = a.created_at; // attempts already sorted desc
    stats.set(topicId, s);
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Progress</h1>
        <div className="flex flex-wrap gap-2">
          <span
            className="apple-pill border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
            aria-current="page"
          >
            Overview
          </span>
          <Link className="apple-pill" href="/mastery">
            Mastery
          </Link>
          <Link className="apple-pill" href="/progress/report">
            Progress report
          </Link>
          <Link className="apple-pill" href="/review">
            Review mistakes
          </Link>
        </div>
      </div>

      <section className="apple-card p-8 space-y-4">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Achievements
          </div>
          <h2 className="text-xl font-semibold mt-2">Latest badges</h2>
          <p className="apple-subtle mt-2">
            Keep building momentum. These badges reflect your recent progress.
          </p>
        </div>

        {achievements.length === 0 ? (
          <p className="text-sm text-[color:var(--muted-foreground)]">
            No badges yet. Complete a practice question or add an exam to unlock
            your first badge.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {achievements.map((row) => {
              const badge = row.achievement;
              if (!badge) return null;
              return (
                <div
                  key={`${badge.id}-${row.earned_at}`}
                  className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{badge.icon ?? "🏅"}</div>
                    <div>
                      <div className="text-lg font-semibold">{badge.title}</div>
                      {badge.description && (
                        <div className="text-sm text-[color:var(--muted-foreground)]">
                          {badge.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-[color:var(--muted-foreground)]">
                    Earned {new Date(row.earned_at).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {attempts.length === 0 ? (
        <p className="text-sm text-gray-400">No attempts yet. Do some practice and come back.</p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="grid grid-cols-5 gap-2 px-4 py-3 text-xs text-gray-400 border-b">
            <div>Topic</div>
            <div>Attempts</div>
            <div>Correct</div>
            <div>Accuracy</div>
            <div>Last attempt</div>
          </div>

          <div className="divide-y">
            {topics.map((t) => {
              const s = stats.get(t.id);
              const attemptsCount = s?.attempts ?? 0;
              const correctCount = s?.correct ?? 0;
              const acc = attemptsCount > 0 ? Math.round((correctCount / attemptsCount) * 100) : 0;

              return (
                <div key={t.id} className="grid grid-cols-5 gap-2 px-4 py-3 text-sm">
                  <div className="font-medium">{t.title}</div>
                  <div>{attemptsCount}</div>
                  <div>{correctCount}</div>
                  <div>{attemptsCount > 0 ? `${acc}%` : "-"}</div>
                  <div className="text-xs text-gray-400">
                    {s?.lastAttemptAt ? new Date(s.lastAttemptAt).toLocaleString() : "-"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
