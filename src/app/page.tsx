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

  const role = profile?.role ?? "student";
  const hasAccess = Boolean(
    role === "admin" || profile?.is_subscribed || profile?.access_override
  );

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

      <div className="grid gap-6 md:grid-cols-2">
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
            <Link href="/maths" className="apple-button">
              Go to Maths
            </Link>
            {hasAccess ? (
              <>
                <Link href="/progress" className="apple-pill">
                  Progress
                </Link>
                <Link href="/mastery" className="apple-pill">
                  Mastery
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
      </div>
    </main>
  );
}
