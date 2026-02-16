import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import AuditLogTable from "./audit-log-table";

type AuditRow = {
  id: string;
  actor_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  created_at: string;
};

export default async function AdminAuditPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: logs } = (await supabase
    .from("admin_audit_log")
    .select("id, actor_id, action, table_name, record_id, created_at")
    .order("created_at", { ascending: false })
    .limit(200)) as { data: AuditRow[] | null };

  return (
    <main className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Admin</div>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">Audit Log</h1>
        <p className="apple-subtle mt-2">
          Track admin changes and undo updates when needed.
        </p>
      </div>

      <section className="apple-card p-6">
        <AuditLogTable logs={logs ?? []} />
      </section>
    </main>
  );
}
