import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import ExamCountdownForm from "@/app/account/exam-countdown-form";

export default async function AccountPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_subscribed, stripe_customer_id")
    .eq("id", session.user.id)
    .maybeSingle();

  const { data: userSettings } = await supabase
    .from("user_settings")
    .select("exam_date, show_exam_countdown")
    .eq("user_id", session.user.id)
    .maybeSingle();

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
          <h2 className="text-lg font-semibold mt-2">Exam date</h2>
          <p className="apple-subtle mt-2">
            Add your exam date and choose whether to show the countdown on your
            dashboard.
          </p>
        </div>
        <ExamCountdownForm
          initialDate={userSettings?.exam_date ?? null}
          initialShow={userSettings?.show_exam_countdown ?? false}
        />
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
