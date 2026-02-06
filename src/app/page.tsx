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

  const { data: userSettings } = await supabase
    .from("user_settings")
    .select("exam_date, show_exam_countdown")
    .eq("user_id", session.user.id)
    .maybeSingle();

  const role = profile?.role ?? "student";
  const hasAccess = Boolean(
    role === "admin" || profile?.is_subscribed || profile?.access_override
  );

  const examDateRaw = userSettings?.exam_date ?? null;
  const showCountdown = Boolean(userSettings?.show_exam_countdown && examDateRaw);
  let daysLeft: number | null = null;
  let examLabel: string | null = null;

  if (examDateRaw) {
    const examDate = new Date(`${examDateRaw}T00:00:00`);
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    daysLeft = Math.ceil(
      (examDate.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24)
    );
    examLabel = examDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

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

        {showCountdown && (
          <section className="apple-card p-6 space-y-3">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
              Exam countdown
            </div>
            <div className="text-3xl font-semibold tracking-tight">
              {daysLeft !== null && daysLeft > 0 && `${daysLeft} days`}
              {daysLeft === 0 && "Exam day"}
              {daysLeft !== null && daysLeft < 0 && "Exam passed"}
            </div>
            {examLabel && (
              <div className="apple-subtle">Exam date: {examLabel}</div>
            )}
            <Link href="/account" className="apple-pill inline-flex">
              Edit countdown
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
