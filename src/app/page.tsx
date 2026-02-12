import Link from "next/link";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import ShopRotator from "@/components/shop-rotator";
import ResourceSearch from "@/components/resource-search";
import DashboardWidgetPicker from "@/components/dashboard-widget-picker";

function formatPrice(priceCents: number, currency: string) {
  if (!priceCents) return "Free";
  const formatter = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  });
  return formatter.format(priceCents / 100);
}

export default async function HomePage() {
  const session = await getUser();
  const supabase = await createClient();

  type ProfileRow = {
    role: string | null;
    is_subscribed: boolean | null;
    access_override: boolean | null;
  };

  type GuideRow = {
    id: string;
    title: string;
    description: string | null;
    type: "pdf" | "markdown" | "video";
    price_cents: number;
    currency: string;
    cover_url: string | null;
  };

  type WidgetPrefRow = {
    widget_key: string;
    is_enabled: boolean | null;
  };

  type AchievementRow = {
    earned_at: string;
    achievement: { id: string; title: string; icon: string | null } | null;
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
  let widgetPrefsRaw: WidgetPrefRow[] | null = null;
  let recentAchievementsRaw: AchievementRow[] | null = null;
  let streakDays = 0;
  let attemptCount = 0;

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

    const { data: widgetPrefData } = await supabase
      .from("user_dashboard_widgets")
      .select("widget_key, is_enabled")
      .eq("user_id", session.user.id);
    widgetPrefsRaw = widgetPrefData as WidgetPrefRow[] | null;

    const streakStart = new Date();
    streakStart.setDate(streakStart.getDate() - 6);
    const { data: attemptRows } = await supabase
      .from("practice_attempts")
      .select("created_at")
      .eq("user_id", session.user.id)
      .gte("created_at", streakStart.toISOString());
    if (attemptRows) {
      attemptCount = attemptRows.length;
      const uniqueDays = new Set(
        attemptRows.map((row) => String(row.created_at).slice(0, 10))
      );
      streakDays = uniqueDays.size;
    }

    const { data: achievementRows } = await supabase
      .from("user_achievements")
      .select("earned_at, achievement:achievements(id, title, icon)")
      .eq("user_id", session.user.id)
      .order("earned_at", { ascending: false })
      .limit(1);
    recentAchievementsRaw = achievementRows as AchievementRow[] | null;
  }

  const { data: guidesData } = await supabase
    .from("guides")
    .select("id, title, description, type, price_cents, currency, cover_url")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(6);
  const guides = (guidesData ?? []) as GuideRow[];

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

  const widgetPrefs = (widgetPrefsRaw ?? []) as WidgetPrefRow[];
  const recentAchievement = recentAchievementsRaw?.[0] ?? null;

  // Flatten guide rows into the rotator-friendly shape.
  const shopItems = guides.map((guide) => ({
    id: guide.id,
    title: guide.title,
    description: guide.description,
    cover_url: guide.cover_url,
    priceLabel: formatPrice(guide.price_cents, guide.currency),
    type: guide.type,
  }));

  // Widget registry for the dashboard picker UI.
  const widgetOptions = [
    { key: "account", label: "Account" },
    { key: "quick_actions", label: "Quick actions" },
    { key: "exam_countdowns", label: "Exam countdowns" },
    { key: "flashcards", label: "Flashcards" },
    { key: "study_streak", label: "Study streak" },
    { key: "achievements", label: "Achievements" },
    { key: "shop", label: "Shop" },
  ];

  const defaultWidgetKeys = [
    "account",
    "quick_actions",
    "exam_countdowns",
    "shop",
  ];
  // If user hasn't customized widgets, show default essentials.
  const enabledWidgetKeys = new Set(
    widgetPrefs.length
      ? widgetPrefs
          .filter((pref) => pref.is_enabled !== false)
          .map((pref) => pref.widget_key)
      : defaultWidgetKeys
  );

  const profileSafe = profile as ProfileRow | null;
  const role = profileSafe?.role ?? (session ? "student" : "guest");
  const roleLabel = role ? `${role[0].toUpperCase()}${role.slice(1)}` : "";
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
    <main className="space-y-0">
      <section className="dashboard-banner relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw] -mt-10 mb-6">
        <div className="mx-auto max-w-6xl px-6 py-5 min-h-[270px] md:min-h-[306px] flex flex-col items-center justify-center text-center gap-0">
          <div className="flex flex-col items-center text-center gap-0 translate-y-6">
            <img
              src="/brand/logo-mark.png"
              alt="Functional Skills Focus"
              className="dashboard-banner-logo"
            />
            <div style={{ marginTop: "-2rem" }}>
              <div className="text-3xl font-semibold tracking-tight leading-tight">
                Functional Skills Focus
              </div>
              <div className="mt-0 text-sm text-white/80 leading-snug">
                Learn, practise, and build confidence with structured Functional Skills
                support.
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-6 mb-10">
        <ResourceSearch />
      </div>

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

      {!session ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="space-y-6">
            <section className="apple-card p-6 space-y-3">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Account
              </div>
              <div className="text-lg font-semibold">{roleLabel}</div>
              <div className="apple-subtle">
                Sign in to manage your account and unlock full access.
              </div>
              <Link href="/login" className="apple-pill mt-2 inline-flex">
                Log in
              </Link>
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
                <Link href="/login" className="apple-pill">
                  Log in
                </Link>
              </div>
            </section>

            <section className="apple-card p-6 space-y-3">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Exam countdowns
              </div>
              <div className="space-y-3">
                <div className="apple-subtle">
                  Log in to add exam countdowns to your dashboard.
                </div>
                <Link className="apple-pill inline-flex" href="/login">
                  Log in
                </Link>
              </div>
            </section>
          </div>

          {shopItems.length > 0 && (
            <div>
              <ShopRotator items={shopItems} />
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Widgets
              </div>
              <div className="apple-subtle mt-2">
                Choose which widgets show on your dashboard.
              </div>
            </div>
            <DashboardWidgetPicker
              userId={session.user.id}
              options={widgetOptions}
              enabledKeys={[...enabledWidgetKeys]}
            />
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enabledWidgetKeys.has("account") && (
              <section className="apple-card p-6 space-y-3">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Account
                </div>
                <div className="text-lg font-semibold">{roleLabel}</div>
                <div className="apple-subtle">
                  {hasAccess
                    ? "You have access to lessons, practice, progress and mastery."
                    : "Practice, progress, and mastery require a subscription."}
                </div>
                <Link href="/account" className="apple-pill mt-2 inline-flex">
                  Manage account
                </Link>
              </section>
            )}

            {enabledWidgetKeys.has("quick_actions") && (
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
                </div>
              </section>
            )}

            {enabledWidgetKeys.has("exam_countdowns") && (
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
            )}

            {enabledWidgetKeys.has("flashcards") && (
              <section className="apple-card p-6 space-y-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Flashcards
                </div>
                {flashcards.length > 0 ? (
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
                    Pin flashcards to your dashboard from the Flashcards page.
                  </p>
                )}
                <Link href="/flashcards" className="apple-pill inline-flex">
                  Manage flashcards
                </Link>
              </section>
            )}

            {enabledWidgetKeys.has("study_streak") && (
              <section className="apple-card p-6 space-y-3">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Study streak
                </div>
                <div className="text-2xl font-semibold">{streakDays} days</div>
                <div className="apple-subtle">
                  {attemptCount > 0
                    ? `${attemptCount} practice attempts in the last 7 days.`
                    : "Start practising to build your streak."}
                </div>
                <Link href="/maths/practice" className="apple-pill inline-flex">
                  Start practice
                </Link>
              </section>
            )}

            {enabledWidgetKeys.has("achievements") && (
              <section className="apple-card p-6 space-y-3">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Achievements
                </div>
                {recentAchievement?.achievement ? (
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">
                      {recentAchievement.achievement.icon ?? "🏅"}
                    </div>
                    <div>
                      <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
                        Latest
                      </div>
                      <div className="text-lg font-semibold">
                        {recentAchievement.achievement.title}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="apple-subtle">
                    Earn achievements by completing practice.
                  </div>
                )}
                <Link href="/account" className="apple-pill inline-flex">
                  View badges
                </Link>
              </section>
            )}

            {enabledWidgetKeys.has("shop") && shopItems.length > 0 && (
              <div className="lg:col-span-2">
                <ShopRotator items={shopItems} />
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
