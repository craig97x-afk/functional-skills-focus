import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_subscribed, stripe_customer_id")
    .eq("id", session.user.id)
    .maybeSingle();

  async function createPortal() {
    "use server";
    // Server Action: call your portal route
    // (We redirect from the client via a normal POST below instead of needing server action plumbing)
  }

  return (
    <main className="p-6 space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">Account</h1>

      <div className="rounded-lg border p-4 space-y-2">
        <div className="text-sm text-gray-400">Email</div>
        <div className="font-medium">{session.user.email}</div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
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
            <button className="rounded-md border px-4 py-2">
              Manage subscription
            </button>
          </form>
        ) : (
          <a className="underline text-sm" href="/pricing">
            Subscribe
          </a>
        )}

        <p className="text-xs text-gray-500">
          If you’ve just paid, refresh once. Webhooks can take a moment.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <a className="rounded-md border px-4 py-2" href="/progress">
          Progress
        </a>
        <a className="rounded-md border px-4 py-2" href="/mastery">
          Mastery
        </a>
      </div>
    </main>
  );
}
