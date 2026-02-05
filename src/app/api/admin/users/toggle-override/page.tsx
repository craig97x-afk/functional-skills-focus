import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import ToggleOverrideButton from "./toggle-override-button";

type ProfileRow = {
  id: string;
  email: string | null;
  role: string | null;
  is_subscribed: boolean | null;
  access_override: boolean | null;
  stripe_customer_id: string | null;
};

export default async function AdminUsersPage() {
  await requireAdmin();
  const supabase = await createClient();

  // If your profiles table doesn't store email, we’ll show id only.
  const { data } = await supabase
    .from("profiles")
    .select("id, email, role, is_subscribed, access_override, stripe_customer_id")
    .order("role", { ascending: false });

  const users = (data ?? []) as ProfileRow[];

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>

      <div className="rounded-lg border overflow-hidden">
        <div className="grid grid-cols-6 gap-2 px-4 py-3 text-xs text-gray-400 border-b">
          <div>User</div>
          <div>Role</div>
          <div>Subscribed</div>
          <div>Override</div>
          <div>Stripe</div>
          <div>Action</div>
        </div>

        <div className="divide-y">
          {users.map((u) => (
            <div key={u.id} className="grid grid-cols-6 gap-2 px-4 py-3 text-sm items-center">
              <div className="truncate">
                {u.email ? u.email : u.id}
              </div>
              <div>{u.role ?? "student"}</div>
              <div>{u.is_subscribed ? "Yes" : "No"}</div>
              <div>{u.access_override ? "Yes" : "No"}</div>
              <div>{u.stripe_customer_id ? "Yes" : "No"}</div>
              <div>
                {u.role === "admin" ? (
                  <span className="text-xs text-gray-500">Admin</span>
                ) : (
                  <ToggleOverrideButton userId={u.id} current={Boolean(u.access_override)} />
                )}
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="px-4 py-6 text-sm text-gray-500">No users found.</div>
          )}
        </div>
      </div>
    </main>
  );
}
