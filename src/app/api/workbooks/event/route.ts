import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const body = (await req.json()) as { workbookId?: string; eventType?: string };
  const workbookId = body.workbookId;
  const eventType = body.eventType;

  if (!workbookId || !eventType || !["open", "download"].includes(eventType)) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const session = await getUser();
  const supabase = createAdminClient();
  const { error } = await supabase.from("workbook_events").insert({
    workbook_id: workbookId,
    user_id: session?.user?.id ?? null,
    event_type: eventType,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
