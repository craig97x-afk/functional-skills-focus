import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import ToggleOverrideButton from "./toggle-override-button";

// Simple admin view to flip access_override for any user.
// Note: RLS must allow admins to select/update profiles.
type Profile = {
  id: string;
  role: string | null;
  is_subscribed: boolean | null;
  access_override: boolean | null;
};

export default async function AdminUsersPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, role, is_subscribed, access_override")
    .order("id");

  if (error) {
    return (
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-red-500">Failed to load users: {error.message}</p>
      </main>
    );
  }

  const rows: Profile[] = profiles ?? [];

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="text-sm text-gray-500">Toggle manual access override for support or testing.</p>

      <div className="rounded-lg border overflow-hidden">
        <div className="grid grid-cols-5 gap-2 px-4 py-3 text-xs text-gray-500 border-b">
          <div>ID</div>
          <div>Role</div>
          <div>Subscribed</div>
          <div>Override</div>
          <div>Actions</div>
        </div>

        <div className="divide-y">
          {rows.map((p) => (
            <div key={p.id} className="grid grid-cols-5 gap-2 px-4 py-3 text-sm items-center">
              <div className="truncate" title={p.id}>{p.id}</div>
              <div>{p.role ?? "student"}</div>
              <div>{p.is_subscribed ? "Yes" : "No"}</div>
              <div>{p.access_override ? "Yes" : "No"}</div>
              <div>
                <ToggleOverrideButton userId={p.id} current={Boolean(p.access_override)} />
              </div>
            </div>
          ))}

          {rows.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">No users found.</div>
          )}
        </div>
      </div>
    </main>
  );
}
