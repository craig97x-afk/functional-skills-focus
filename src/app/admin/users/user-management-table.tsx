"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToggleOverrideButton from "./toggle-override-button";

export type AdminUserRow = {
  id: string;
  email: string | null;
  role: string | null;
  is_subscribed: boolean | null;
  access_override: boolean | null;
  created_at?: string | null;
  last_sign_in_at?: string | null;
  email_confirmed_at?: string | null;
};

export default function UserManagementTable({
  users,
  currentUserId,
}: {
  users: AdminUserRow[];
  currentUserId: string;
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((user) => {
      const role = (user.role ?? "student").toLowerCase();
      const matchesRole = roleFilter === "all" || role === roleFilter;
      if (!matchesRole) return false;

      if (!term) return true;
      const email = user.email?.toLowerCase() ?? "";
      return (
        user.id.toLowerCase().includes(term) ||
        email.includes(term) ||
        role.includes(term)
      );
    });
  }, [users, search, roleFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Search users
          </label>
          <input
            className="mt-2 w-full rounded-lg border px-3 py-2 text-sm md:w-80"
            placeholder="Search by email, role, or ID"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Role filter
          </div>
          <select
            className="rounded-lg border px-3 py-2 text-sm"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="all">All</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
          <div className="text-sm text-slate-500">
            {filtered.length} of {users.length}
          </div>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="grid grid-cols-7 gap-2 px-4 py-3 text-xs text-gray-500 border-b">
          <div>User</div>
          <div>Role</div>
          <div>Subscribed</div>
          <div>Override</div>
          <div>Progress</div>
          <div>Chat</div>
          <div>Actions</div>
        </div>

        <div className="divide-y">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-7 gap-2 px-4 py-3 text-sm items-center"
            >
              <div className="min-w-0">
                <div className="truncate font-medium" title={user.email ?? user.id}>
                  {user.email ?? "No email"}
                </div>
                <div className="truncate text-xs text-gray-500" title={user.id}>
                  {user.id}
                </div>
              </div>
              <div>
                <RoleSelect userId={user.id} currentRole={user.role ?? "student"} />
              </div>
              <div>{user.is_subscribed ? "Yes" : "No"}</div>
              <div>{user.access_override ? "Yes" : "No"}</div>
              <div>
                <Link
                  className="text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                  href={`/admin/users/${user.id}/progress`}
                >
                  View
                </Link>
              </div>
              <div>
                <Link
                  className="text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                  href={`/admin/messages?userId=${user.id}`}
                >
                  Message
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                <ToggleOverrideButton
                  userId={user.id}
                  current={Boolean(user.access_override)}
                />
                <DeleteUserButton
                  userId={user.id}
                  disabled={user.id === currentUserId}
                />
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function RoleSelect({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const [value, setValue] = useState(currentRole);
  const [loading, setLoading] = useState(false);

  async function onChange(next: string) {
    const previous = value;
    setValue(next);
    setLoading(true);

    const res = await fetch("/api/admin/users/set-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: next }),
    });

    setLoading(false);

    if (!res.ok) {
      const txt = await res.text();
      alert(txt);
      setValue(previous);
    }
  }

  return (
    <select
      className="rounded-md border px-2 py-1 text-sm"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={loading}
    >
      <option value="student">Student</option>
      <option value="admin">Admin</option>
    </select>
  );
}

function DeleteUserButton({
  userId,
  disabled,
}: {
  userId: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function removeUser() {
    if (disabled) return;
    const confirmed = window.confirm(
      "Delete this user account? This will remove their login and profile data."
    );
    if (!confirmed) return;

    setLoading(true);
    const res = await fetch("/api/admin/users/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setLoading(false);

    if (!res.ok) {
      const txt = await res.text();
      alert(txt);
      return;
    }

    window.location.reload();
  }

  return (
    <button
      className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600"
      onClick={removeUser}
      disabled={loading || disabled}
      title={disabled ? "You cannot delete your own account." : "Delete user"}
    >
      Delete
    </button>
  );
}
