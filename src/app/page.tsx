import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_subscribed, access_override")
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

  const role = profile?.role ?? "student";
  const hasAccess = Boolean(
    role === "admin" || profile?.is_subscribed || profile?.access_override
  );

  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const visibleExams = exams.filter(
    (exam) => exam.show_on_dashboard && exam.exam_date
  );

  const sortedExams = [...visibleExams].sort((a, b) => {
    const aDate = new Date(`${a.exam_date}T00:00:00`).getTime();
    const bDate = new Date(`${b.exam_date}T00:00:00`).getTime();
    return aDate - bDate;
  });

  const upcomingExams = sortedExams.filter((exam) => {
    const examDate = new Date(`${exam.exam_date}T00:00:00`).getTime();
    return examDate >= startOfToday.getTime();
  });

  const nextExams = (upcomingExams.length ? upcomingExams : sortedExams).slice(
    0,
    3
  );

  const dayMs = 1000 * 60 * 60 * 24;
  const examCards = nextExams.map((exam) => {
    const examDate = new Date(`${exam.exam_date}T00:00:00`);
    const diffDays = Math.round(
      (examDate.getTime() - startOfToday.getTime()) / dayMs
    );
    let label = `${diffDays} days`;
    if (diffDays === 0) label = "Exam day";
    if (diffDays === 1) label = "1 day";
    if (diffDays < 0) label = "Passed";

    return {
      id: exam.id,
      name: exam.exam_name,
      date: exam.exam_date,
      label,
    };
  });

  return (
    <main className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Dashboard
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mt-2">
            Welcome back
          </h1>
          <p className="apple-subtle mt-2">
            Pick up where you left off or jump into practice.
          </p>
        </div>
        <div className="apple-pill">
          {hasAccess ? "Full access" : "Limited access"}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <section className="apple-card p-6 space-y-3">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Account
          </div>
          <div className="text-lg font-semibold">{role}</div>
          <div className="apple-subtle">
            {hasAccess
              ? "You have access to lessons, practice, progress and mastery."
              : "Practice, progress, and mastery require a subscription."}
          </div>
          <Link href="/account" className="apple-pill mt-2 inline-flex">
            Manage account
          </Link>
        </section>

        <section className="apple-card p-6 space-y-4">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Quick actions
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/maths" className="apple-pill">
              Maths hub
            </Link>
            <Link href="/maths/learn" className="apple-pill">
              Learning
            </Link>
            {hasAccess && (
              <Link href="/maths/practice" className="apple-pill">
                Practice
              </Link>
            )}
            <Link href="/english" className="apple-pill">
              English
            </Link>
            <Link href="/guides" className="apple-pill">
              Guides
            </Link>
            <Link href="/study-plan" className="apple-pill">
              Study plan
            </Link>
            <Link href="/flashcards" className="apple-pill">
              Flashcards
            </Link>
            {hasAccess ? (
              <>
                <Link href="/progress" className="apple-pill">
                  Progress
                </Link>
                <Link href="/mastery" className="apple-pill">
                  Mastery
                </Link>
                <Link href="/review" className="apple-pill">
                  Review mistakes
                </Link>
              </>
            ) : (
              <Link href="/pricing" className="apple-pill">
                Subscribe
              </Link>
            )}
            {role === "admin" && (
              <>
                <Link href="/admin" className="apple-pill">
                  Admin Panel
                </Link>
                <Link href="/admin/users" className="apple-pill">
                  Users
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="apple-card p-6 space-y-4">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Exam countdowns
          </div>
          {examCards.length > 0 ? (
            <div className="space-y-3">
              {examCards.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between rounded-xl border border-[color:var(--border)]/60 px-4 py-3"
                >
                  <div>
                    <div className="font-semibold">{exam.name}</div>
                    <div className="text-sm text-[color:var(--muted-foreground)]">
                      {exam.date}
                    </div>
                  </div>
                  <span className="apple-pill">{exam.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="apple-subtle">
              Add exam dates in your account to see countdowns here.
            </p>
          )}
          <Link href="/account" className="apple-pill inline-flex">
            Manage countdowns
          </Link>
        </section>
      </div>
    </main>
  );
}
