import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getGuardianSession } from "@/lib/guardian/session";

export default async function GuardianDashboardPage() {
  const session = await getGuardianSession();
  if (!session) redirect("/guardian");

  const supabase = createAdminClient();
  const studentId = session.link.student_id;

  const { data: attempts } = await supabase
    .from("practice_attempts")
    .select("is_correct")
    .eq("user_id", studentId);

  const totalAttempts = attempts?.length ?? 0;
  const correctAttempts = attempts?.filter((a) => a.is_correct).length ?? 0;
  const accuracy = totalAttempts
    ? Math.round((correctAttempts / totalAttempts) * 100)
    : 0;

  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 6);
  const startDate = start.toISOString().slice(0, 10);

  const { data: minutesRows } = await supabase
    .from("user_activity_minutes")
    .select("activity_date, minutes")
    .eq("user_id", studentId)
    .gte("activity_date", startDate);

  const totalMinutes =
    minutesRows?.reduce((sum, row) => sum + (row.minutes ?? 0), 0) ?? 0;

  const { data: views } = await supabase
    .from("lesson_views")
    .select("lesson_id, lessons (id, title, topic_id, topics (id, title))")
    .eq("user_id", studentId);

  const topicMap = new Map<string, string>();
  (views ?? []).forEach((view) => {
    const lesson = Array.isArray(view.lessons)
      ? view.lessons[0]
      : view.lessons;
    const topic = lesson?.topics
      ? Array.isArray(lesson.topics)
        ? lesson.topics[0]
        : lesson.topics
      : null;
    if (topic?.id && topic?.title) {
      topicMap.set(topic.id, topic.title);
    }
  });

  const topicsRead = Array.from(topicMap.values());

  return (
    <main className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Guardian view
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">
          {session.link.student_name}
        </h1>
        <p className="apple-subtle mt-2">
          Weekly summary and learning progress.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="apple-card p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Practice attempts
          </div>
          <div className="mt-2 text-3xl font-semibold">{totalAttempts}</div>
          <div className="apple-subtle">Total attempts</div>
        </div>
        <div className="apple-card p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Accuracy
          </div>
          <div className="mt-2 text-3xl font-semibold">{accuracy}%</div>
          <div className="apple-subtle">Correct answers</div>
        </div>
        <div className="apple-card p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Time this week
          </div>
          <div className="mt-2 text-3xl font-semibold">{totalMinutes}m</div>
          <div className="apple-subtle">Last 7 days</div>
        </div>
      </section>

      <section className="apple-card p-6 space-y-4">
        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Topics read
        </div>
        {topicsRead.length ? (
          <div className="flex flex-wrap gap-2">
            {topicsRead.map((topic) => (
              <span key={topic} className="apple-pill">
                {topic}
              </span>
            ))}
          </div>
        ) : (
          <p className="apple-subtle">No lesson views yet.</p>
        )}
      </section>
    </main>
  );
}
