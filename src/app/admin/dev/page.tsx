import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

type CheckStatus = "ok" | "warn" | "error";

type CheckItem = {
  label: string;
  status: CheckStatus;
  detail?: string;
};

function statusBadge(status: CheckStatus) {
  if (status === "ok") return "bg-emerald-500/15 text-emerald-300";
  if (status === "warn") return "bg-amber-500/15 text-amber-300";
  return "bg-rose-500/15 text-rose-300";
}

async function checkTable(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string
) {
  const { error } = await supabase.from(table).select("*").limit(1);
  if (error) {
    return {
      label: table,
      status: "error" as const,
      detail: error.message,
    };
  }
  return { label: table, status: "ok" as const };
}

export default async function DevReportPage() {
  await requireAdmin();
  const supabase = await createClient();

  const envKeys = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", required: true },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", required: true },
    { key: "STRIPE_SECRET_KEY", required: true },
    { key: "STRIPE_PRICE_ID", required: true },
    { key: "STRIPE_WEBHOOK_SECRET", required: true },
  ];

  const envChecks: CheckItem[] = envKeys.map((entry) => {
    const present = Boolean(process.env[entry.key]);
    if (present) {
      return { label: entry.key, status: "ok" };
    }
    return {
      label: entry.key,
      status: entry.required ? "error" : "warn",
      detail: entry.required ? "Missing" : "Optional",
    };
  });

  const tableNames = [
    "app_settings",
    "profiles",
    "subjects",
    "levels",
    "topics",
    "lessons",
    "questions",
    "question_options",
    "practice_attempts",
    "guides",
    "guide_assets",
    "guide_purchases",
    "workbooks",
    "support_conversations",
    "support_messages",
    "progress_comments",
    "achievements",
    "user_achievements",
    "user_exams",
    "flashcards",
    "lesson_notes",
    "user_dashboard_widgets",
  ];

  const tableChecks = await Promise.all(
    tableNames.map((table) => checkTable(supabase, table))
  );

  const { data: guidesBucket, error: guidesBucketError } =
    await supabase.storage.getBucket("guides");
  const { data: workbooksBucket, error: workbooksBucketError } =
    await supabase.storage.getBucket("workbooks");

  const storageChecks: CheckItem[] = [
    {
      label: "storage: guides bucket",
      status: guidesBucketError || !guidesBucket ? "warn" : "ok",
      detail: guidesBucketError?.message,
    },
    {
      label: "storage: workbooks bucket",
      status: workbooksBucketError || !workbooksBucket ? "warn" : "ok",
      detail: workbooksBucketError?.message,
    },
  ];

  const now = new Date().toLocaleString("en-GB");

  return (
    <main className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Admin
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">
          Dev report
        </h1>
        <p className="apple-subtle mt-2">
          Runtime checks and recommended manual tests. Generated {now}.
        </p>
      </div>

      <section className="apple-card p-6 space-y-4">
        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Environment
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {envChecks.map((check) => (
            <div
              key={check.label}
              className="flex items-center justify-between rounded-2xl border border-slate-200/20 bg-white/5 px-4 py-3"
            >
              <div>
                <div className="text-sm font-medium">{check.label}</div>
                {check.detail && (
                  <div className="text-xs text-slate-400">{check.detail}</div>
                )}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                  check.status
                )}`}
              >
                {check.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="apple-card p-6 space-y-4">
        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Database tables
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tableChecks.map((check) => (
            <div
              key={check.label}
              className="flex items-center justify-between rounded-2xl border border-slate-200/20 bg-white/5 px-4 py-3"
            >
              <div>
                <div className="text-sm font-medium">{check.label}</div>
                {check.detail && (
                  <div className="text-xs text-slate-400">{check.detail}</div>
                )}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                  check.status
                )}`}
              >
                {check.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="apple-card p-6 space-y-4">
        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Storage
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {storageChecks.map((check) => (
            <div
              key={check.label}
              className="flex items-center justify-between rounded-2xl border border-slate-200/20 bg-white/5 px-4 py-3"
            >
              <div>
                <div className="text-sm font-medium">{check.label}</div>
                {check.detail && (
                  <div className="text-xs text-slate-400">{check.detail}</div>
                )}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                  check.status
                )}`}
              >
                {check.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="apple-card p-6 space-y-4">
        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Manual checks
        </div>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>Run a production build: `npm run build`.</li>
          <li>Sign in as admin, open /admin/users, toggle override, verify access gate.</li>
          <li>Sign in as student (subscribed), open /practice, /progress, /mastery.</li>
          <li>Checkout a subscription in Stripe test mode and confirm webhook updates profiles.</li>
          <li>Purchase a guide and confirm access to the guide assets.</li>
          <li>Send a support message and verify unread badges in header.</li>
        </ul>
      </section>
    </main>
  );
}
