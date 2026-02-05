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
    <main className="p-6 max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Pricing</h1>

      <div className="rounded-lg border p-6 space-y-4">
        <div className="text-lg font-semibold">Student Membership</div>

        <p className="text-sm text-gray-600">
          Full access to maths lessons, practice, progress and mastery tracking.
        </p>

        {session ? (
          hasAccess ? (
            <div className="space-y-3">
              <div className="font-semibold">You already have access.</div>

              <form action="/api/stripe/portal" method="post">
                <button className="rounded-md border px-4 py-2">
                  Manage subscription
                </button>
              </form>

              <div className="flex gap-2 flex-wrap">
                <a className="rounded-md border px-4 py-2" href="/maths">
                  Go to Maths
                </a>
                <a className="rounded-md border px-4 py-2" href="/mastery">
                  View Mastery
                </a>
              </div>
            </div>
          ) : (
            <form action="/api/stripe/checkout" method="post">
              <button className="rounded-md border px-4 py-2">
                Subscribe
              </button>
            </form>
          )
        ) : (
          <a className="rounded-md border px-4 py-2 inline-block" href="/login">
            Log in to subscribe
          </a>
        )}

        <p className="text-xs text-gray-500">
          If you’ve just paid, refresh once. Webhooks can take a moment.
        </p>
      </div>
    </main>
  );
}
