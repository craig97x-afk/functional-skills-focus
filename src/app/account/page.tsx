import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import ExamCountdownManager from "@/app/account/exam-countdown-manager";

export default async function AccountPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_subscribed, stripe_customer_id")
    .eq("id", session.user.id)
    .maybeSingle();

  const { data: examsRaw } = await supabase
    .from("user_exams")
    .select("id, exam_name, exam_date, show_on_dashboard")
    .eq("user_id", session.user.id)
    .order("exam_date", { ascending: true });

  const exams = (examsRaw ?? []) as {
    id: string;
    exam_name: string;
    exam_date: string;
    show_on_dashboard: boolean;
  }[];

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

  return (
    <main className="space-y-8 max-w-2xl">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Account
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">
          Your details
        </h1>
        <p className="apple-subtle mt-2">
          Manage your subscription and dashboard preferences.
        </p>
      </div>

      <section className="apple-card p-6 space-y-2">
        <div className="text-sm text-gray-400">Email</div>
        <div className="font-medium">{session.user.email}</div>
      </section>

      <section className="apple-card p-6 space-y-4">
        <div className="font-semibold">Subscription</div>

        <div className="text-sm">
          Status:{" "}
          {profile?.is_subscribed ? (
            <span className="font-semibold">Active</span>
          ) : (
            <span className="font-semibold">Not active</span>
          )}
        </div>

        {profile?.stripe_customer_id ? (
          <form action="/api/stripe/portal" method="post">
            <button className="apple-pill" type="submit">
              Manage subscription
            </button>
          </form>
        ) : (
          <a className="apple-pill inline-flex" href="/pricing">
            Subscribe
          </a>
        )}

        <p className="text-xs text-gray-500">
          If you’ve just paid, refresh once. Webhooks can take a moment.
        </p>
      </section>

      <section className="apple-card p-6 space-y-4">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Exam countdown
          </div>
          <h2 className="text-lg font-semibold mt-2">Exam dates</h2>
          <p className="apple-subtle mt-2">
            Add multiple exams, name them, and choose which countdowns to show
            on your dashboard.
          </p>
        </div>
        <ExamCountdownManager initialExams={exams} />
      </section>

      <section className="apple-card p-6 space-y-4">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Achievements
          </div>
          <h2 className="text-lg font-semibold mt-2">Your badges</h2>
          <p className="apple-subtle mt-2">
            Earn badges as you complete practice questions and set exam goals.
          </p>
        </div>

        {achievements.length === 0 ? (
          <p className="text-sm text-[color:var(--muted-foreground)]">
            No badges yet. Complete a practice question or add an exam to unlock
            your first badge.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {achievements.map((row) => {
              const badge = row.achievement;
              if (!badge) return null;
              return (
                <div
                  key={`${badge.id}-${row.earned_at}`}
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{badge.icon ?? "🏅"}</div>
                    <div>
                      <div className="font-semibold">{badge.title}</div>
                      {badge.description && (
                        <div className="text-sm text-[color:var(--muted-foreground)]">
                          {badge.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-[color:var(--muted-foreground)]">
                    Earned {new Date(row.earned_at).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="flex gap-2 flex-wrap">
        <a className="apple-pill" href="/progress">
          Progress
        </a>
        <a className="apple-pill" href="/mastery">
          Mastery
        </a>
      </div>
    </main>
  );
}
