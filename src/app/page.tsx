import Link from "next/link";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const session = await getUser();
  const supabase = await createClient();

  type ProfileRow = {
    role: string | null;
    is_subscribed: boolean | null;
    access_override: boolean | null;
  };

  let profile: ProfileRow | null = null;
  let examsRaw:
    | {
        id: string;
        exam_name: string;
        exam_date: string;
        show_on_dashboard: boolean;
      }[]
    | null = null;
  let flashcardsRaw:
    | {
        id: string;
        front: string;
        back: string;
        tags: string | null;
        show_on_dashboard: boolean;
      }[]
    | null = null;

  if (session) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role, is_subscribed, access_override")
      .eq("id", session.user.id)
      .maybeSingle();
    profile = (profileData ?? null) as ProfileRow | null;

    const { data: examsData } = await supabase
      .from("user_exams")
      .select("id, exam_name, exam_date, show_on_dashboard")
      .eq("user_id", session.user.id)
      .order("exam_date", { ascending: true });
    examsRaw = examsData as typeof examsRaw;

    const { data: flashcardsData } = await supabase
      .from("flashcards")
      .select("id, front, back, tags, show_on_dashboard")
      .eq("user_id", session.user.id)
      .eq("show_on_dashboard", true)
      .order("updated_at", { ascending: false })
      .limit(3);
    flashcardsRaw = flashcardsData as typeof flashcardsRaw;
  }

  const exams = (examsRaw ?? []) as {
    id: string;
    exam_name: string;
    exam_date: string;
    show_on_dashboard: boolean;
  }[];

  const flashcards = (flashcardsRaw ?? []) as {
    id: string;
    front: string;
    back: string;
    tags: string | null;
    show_on_dashboard: boolean;
  }[];

  const profileSafe = profile as ProfileRow | null;
  const role = profileSafe?.role ?? (session ? "student" : "guest");
  const hasAccess = Boolean(
    session &&
      (role === "admin" ||
        profileSafe?.is_subscribed ||
        profileSafe?.access_override)
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
      <section className="dashboard-banner">
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col items-center text-center gap-4">
          <img
            src="/brand/logo-mark.png"
            alt="Functional Skills Focus"
            className="dashboard-banner-logo"
          />
          <div>
            <div className="text-3xl font-semibold tracking-tight">
              Functional Skills Focus
            </div>
            <div className="mt-2 text-sm text-white/80">
              Learn, practise, and build confidence with structured Functional Skills
              support.
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Dashboard
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mt-2">
            {session ? "Welcome back" : "Welcome to your dashboard"}
          </h1>
          <p className="apple-subtle mt-2">
            {session
              ? "Pick up where you left off or jump into practice."
              : "Log in to track progress, save resources, and unlock full access."}
          </p>
        </div>
        <div className="apple-pill">
          {session ? (hasAccess ? "Full access" : "Limited access") : "Guest view"}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <section className="apple-card p-6 space-y-3">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Account
          </div>
          <div className="text-lg font-semibold">{role}</div>
          <div className="apple-subtle">
            {session
              ? hasAccess
                ? "You have access to lessons, practice, progress and mastery."
                : "Practice, progress, and mastery require a subscription."
              : "Sign in to manage your account and unlock full access."}
          </div>
          {session ? (
            <Link href="/account" className="apple-pill mt-2 inline-flex">
              Manage account
            </Link>
          ) : (
            <Link href="/login" className="apple-pill mt-2 inline-flex">
              Log in
            </Link>
          )}
        </section>

        <section className="apple-card p-6 space-y-4">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Quick actions
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/maths/levels" className="apple-pill">
              Maths levels
            </Link>
            <Link href="/english/levels" className="apple-pill">
              English levels
            </Link>
            <Link href="/guides" className="apple-pill">
              Shop
            </Link>
            {session ? (
              <>
                {hasAccess && (
                  <Link href="/maths/practice" className="apple-pill">
                    Practice
                  </Link>
                )}
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
              </>
            ) : (
              <Link href="/login" className="apple-pill">
                Log in
              </Link>
            )}
          </div>
        </section>

        <section className="apple-card p-6 space-y-4">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Exam countdowns
          </div>
          {session && examCards.length > 0 ? (
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
              {session
                ? "Add exam dates in your account to see countdowns here."
                : "Log in to add exam countdowns to your dashboard."}
            </p>
          )}
          {session ? (
            <Link href="/account" className="apple-pill inline-flex">
              Manage countdowns
            </Link>
          ) : (
            <Link href="/login" className="apple-pill inline-flex">
              Log in
            </Link>
          )}
        </section>

        <section className="apple-card p-6 space-y-4">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Flashcards
          </div>
          {session && flashcards.length > 0 ? (
            <div className="space-y-3">
              {flashcards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-xl border border-[color:var(--border)]/60 px-4 py-3 space-y-1"
                >
                  <div className="text-sm text-[color:var(--muted-foreground)]">
                    Front
                  </div>
                  <div className="font-semibold">{card.front}</div>
                  <div className="text-xs text-[color:var(--muted-foreground)] mt-2">
                    Back
                  </div>
                  <div className="text-sm text-[color:var(--foreground)]">
                    {card.back}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="apple-subtle">
              {session
                ? "Pin flashcards to your dashboard from the Flashcards page."
                : "Log in to create flashcards and pin them here."}
            </p>
          )}
          {session ? (
            <Link href="/flashcards" className="apple-pill inline-flex">
              Manage flashcards
            </Link>
          ) : (
            <Link href="/login" className="apple-pill inline-flex">
              Log in
            </Link>
          )}
        </section>
      </div>
    </main>
  );
}
