import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_TABLES = new Set(["workbooks", "exam_mocks", "question_sets"]);

export async function POST(req: Request) {
  const session = await getUser();
  if (session?.profile?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { logId } = (await req.json()) as { logId?: string };
  if (!logId) {
    return NextResponse.json({ error: "Missing log id." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: log, error } = await supabase
    .from("admin_audit_log")
    .select("id, action, table_name, record_id, before_data")
    .eq("id", logId)
    .single();

  if (error || !log) {
    return NextResponse.json({ error: "Log not found." }, { status: 404 });
  }

  if (!ALLOWED_TABLES.has(log.table_name)) {
    return NextResponse.json({ error: "Undo not supported for this table." }, { status: 400 });
  }

  if (!log.before_data) {
    return NextResponse.json({ error: "No rollback data available." }, { status: 400 });
  }

  const action = log.action.toUpperCase();
  if (action === "UPDATE") {
    const { error: updateError } = await supabase
      .from(log.table_name)
      .update(log.before_data)
      .eq("id", log.record_id);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }
  } else if (action === "DELETE") {
    const { error: insertError } = await supabase
      .from(log.table_name)
      .insert(log.before_data);
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "Undo not available for this action." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
