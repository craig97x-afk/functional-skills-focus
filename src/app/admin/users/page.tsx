import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import UserManagementTable, { AdminUserRow } from "./user-management-table";

// Simple admin view to flip access_override for any user.
// Note: RLS must allow admins to select/update profiles.
type Profile = {
  id: string;
  role: string | null;
  is_subscribed: boolean | null;
  access_override: boolean | null;
};

export default async function AdminUsersPage() {
  const session = await requireAdmin();
  const supabase = await createClient();
  const admin = createAdminClient();

  const [{ data: profiles, error }, { data: authData, error: authError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, role, is_subscribed, access_override")
        .order("id"),
      admin.auth.admin.listUsers({ perPage: 1000 }),
    ]);

  if (error) {
    return (
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-red-500">Failed to load users: {error.message}</p>
      </main>
    );
  }

  const rows: Profile[] = profiles ?? [];
  const authUsers = authData?.users ?? [];
  const profileIds = new Set(rows.map((profile) => profile.id));
  const authById = new Map(authUsers.map((user) => [user.id, user]));

  const mergedRows: AdminUserRow[] = [
    ...rows.map((profile) => {
      const authUser = authById.get(profile.id);
      return {
        id: profile.id,
        role: profile.role,
        is_subscribed: profile.is_subscribed,
        access_override: profile.access_override,
        email: authUser?.email ?? null,
        created_at: authUser?.created_at ?? null,
        last_sign_in_at: authUser?.last_sign_in_at ?? null,
        email_confirmed_at: authUser?.email_confirmed_at ?? null,
      };
    }),
    ...authUsers
      .filter((user) => !profileIds.has(user.id))
      .map((user) => ({
        id: user.id,
        role: null,
        is_subscribed: null,
        access_override: null,
        email: user.email ?? null,
        created_at: user.created_at ?? null,
        last_sign_in_at: user.last_sign_in_at ?? null,
        email_confirmed_at: user.email_confirmed_at ?? null,
      })),
  ].sort((a, b) => {
    const aKey = (a.email ?? a.id).toLowerCase();
    const bKey = (b.email ?? b.id).toLowerCase();
    return aKey.localeCompare(bKey);
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="text-sm text-gray-500">
        Search users, change roles, toggle access overrides, and remove accounts.
      </p>
      {authError && (
        <p className="text-xs text-orange-500">
          User email data not available: {authError.message}
        </p>
      )}
      <UserManagementTable users={mergedRows} currentUserId={session.user.id} />
    </main>
  );
}
