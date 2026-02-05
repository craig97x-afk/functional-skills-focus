import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin</h1>
      <p className="text-sm text-gray-500">Create and manage Maths content.</p>

      <div className="flex gap-3">
        <Link className="rounded-md border px-3 py-2" href="/admin/topics">
          Manage Topics
        </Link>
        <Link className="rounded-md border px-3 py-2" href="/admin/lessons">
          Manage Lessons
        </Link>
        <Link className="rounded-md border px-3 py-2" href="/admin/questions">
          Manage Questions
        </Link>
        <Link className="rounded-md border px-3 py-2" href="/admin/users">
          Manage Users
        </Link>

      </div>
    </main>
  );
}
