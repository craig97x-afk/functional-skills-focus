import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import ThemeSettings from "@/app/admin/theme-settings";

export default async function AdminPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("app_settings")
    .select("accent_color, accent_strong")
    .eq("id", "default")
    .maybeSingle();

  return (
    <main className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Admin
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">
          Content control
        </h1>
        <p className="apple-subtle mt-2">
          Create and manage Maths content, guides, users and billing.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link className="apple-card p-5 hover:shadow-md transition" href="/admin/topics">
          <div className="font-semibold">Manage Topics</div>
          <div className="apple-subtle mt-1">Levels, topics and ordering.</div>
        </Link>
        <Link className="apple-card p-5 hover:shadow-md transition" href="/admin/lessons">
          <div className="font-semibold">Manage Lessons</div>
          <div className="apple-subtle mt-1">Create, publish and edit lessons.</div>
        </Link>
        <Link className="apple-card p-5 hover:shadow-md transition" href="/admin/workbooks">
          <div className="font-semibold">Manage Workbooks</div>
          <div className="apple-subtle mt-1">Upload files and thumbnails.</div>
        </Link>
        <Link className="apple-card p-5 hover:shadow-md transition" href="/admin/widgets">
          <div className="font-semibold">Widget Gallery</div>
          <div className="apple-subtle mt-1">Preview lesson visuals and templates.</div>
        </Link>
        <Link className="apple-card p-5 hover:shadow-md transition" href="/admin/questions">
          <div className="font-semibold">Manage Questions</div>
          <div className="apple-subtle mt-1">MCQs and short answers.</div>
        </Link>
        <Link className="apple-card p-5 hover:shadow-md transition" href="/admin/guides">
          <div className="font-semibold">Manage Guides</div>
          <div className="apple-subtle mt-1">Upload revision packs and pricing.</div>
        </Link>
        <Link className="apple-card p-5 hover:shadow-md transition" href="/admin/users">
          <div className="font-semibold">Manage Users</div>
          <div className="apple-subtle mt-1">Overrides and access control.</div>
        </Link>
        <Link className="apple-card p-5 hover:shadow-md transition" href="/admin/messages">
          <div className="font-semibold">Messages</div>
          <div className="apple-subtle mt-1">Reply to student questions.</div>
        </Link>
        <Link className="apple-card p-5 hover:shadow-md transition" href="/admin/billing">
          <div className="font-semibold">Billing Audit</div>
          <div className="apple-subtle mt-1">Stripe status + resync tools.</div>
        </Link>
        <Link className="apple-card p-5 hover:shadow-md transition" href="/admin/dev">
          <div className="font-semibold">Dev Report</div>
          <div className="apple-subtle mt-1">Build checks and runtime status.</div>
        </Link>
      </div>

      <ThemeSettings
        initialAccent={settings?.accent_color}
        initialAccentStrong={settings?.accent_strong}
      />
    </main>
  );
}
