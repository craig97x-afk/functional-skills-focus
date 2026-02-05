import Link from "next/link";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

export default async function PricingPage() {
  const session = await getUser();
  const supabase = await createClient();

  let hasAccess = false;

  if (session) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_subscribed, access_override, role")
      .eq("id", session.user.id)
      .maybeSingle();

    hasAccess = Boolean(
      profile?.role === "admin" || profile?.is_subscribed || profile?.access_override
    );
  }

  return (
    <main className="max-w-3xl space-y-10">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Membership
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">Pricing</h1>
        <p className="apple-subtle mt-3">
          Full access to maths lessons, practice, progress and mastery tracking.
        </p>
      </div>

      <div className="apple-card p-6 space-y-5">
        <div>
          <div className="text-lg font-semibold">Student Membership</div>
          <p className="apple-subtle mt-2">
            Everything you need to build confidence and pass Functional Skills
            Maths.
          </p>
        </div>

        {session ? (
          hasAccess ? (
            <div className="space-y-4">
              <div className="font-medium">You already have access.</div>

              <form action="/api/stripe/portal" method="post">
                <button className="apple-pill" type="submit">
                  Manage subscription
                </button>
              </form>

              <div className="flex gap-3 flex-wrap">
                <Link className="apple-pill" href="/maths">
                  Go to Maths
                </Link>
                <Link className="apple-pill" href="/mastery">
                  View Mastery
                </Link>
              </div>
            </div>
          ) : (
            <form action="/api/stripe/checkout" method="post">
              <button className="apple-button" type="submit">
                Subscribe
              </button>
            </form>
          )
        ) : (
          <Link className="apple-pill inline-flex" href="/login">
            Log in to subscribe
          </Link>
        )}

        <p className="text-xs text-slate-400">
          If you’ve just paid, refresh once. Webhooks can take a moment.
        </p>
      </div>
    </main>
  );
}
