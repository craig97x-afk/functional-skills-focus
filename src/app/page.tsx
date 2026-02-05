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
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="rounded-lg border p-4 space-y-2">
        <div className="text-sm text-gray-400">Role</div>
        <div className="font-medium">{role}</div>

        <div className="text-sm text-gray-400 mt-3">Access</div>
        <div className="font-medium">
          {hasAccess ? "Full access" : "Limited access"}
        </div>

        {!hasAccess && (
          <div className="text-sm text-gray-500">
            Practice, progress, and mastery require a subscription.
          </div>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <a href="/maths" className="rounded-md border px-4 py-2">
          Go to Maths
        </a>

        <a href="/account" className="rounded-md border px-4 py-2">
          Account
        </a>

        {hasAccess ? (
          <>
            <a href="/progress" className="rounded-md border px-4 py-2">
              Progress
            </a>
            <a href="/mastery" className="rounded-md border px-4 py-2">
              Mastery
            </a>
          </>
        ) : (
          <a href="/pricing" className="rounded-md border px-4 py-2">
            Subscribe
          </a>
        )}

        {role === "admin" && (
          <>
            <a href="/admin" className="rounded-md border px-4 py-2">
              Admin Panel
            </a>
            <a href="/admin/users" className="rounded-md border px-4 py-2">
              Users
            </a>
          </>
        )}
      </div>
    </main>
  );
}
