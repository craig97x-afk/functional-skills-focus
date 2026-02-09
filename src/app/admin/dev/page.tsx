import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import DevReportClient from "@/app/admin/dev/dev-report-client";
import { runDevChecks } from "@/lib/admin/dev-checks";

export default async function DevReportPage() {
  await requireAdmin();
  const supabase = await createClient();
  const initial = await runDevChecks(supabase);

  return <DevReportClient initial={initial} />;
}
