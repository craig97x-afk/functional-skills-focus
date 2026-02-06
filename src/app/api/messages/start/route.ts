import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST() {
  const session = await getUser();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  const { data: existing } = await adminClient
    .from("support_conversations")
    .select("id")
    .eq("student_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    return NextResponse.json({ conversationId: existing.id });
  }

  const { data: adminProfile } = await adminClient
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .order("id")
    .limit(1)
    .maybeSingle();

  if (!adminProfile?.id) {
    return NextResponse.json({ error: "No admin available" }, { status: 400 });
  }

  const { data: created, error } = await adminClient
    .from("support_conversations")
    .insert({
      student_id: session.user.id,
      admin_id: adminProfile.id,
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !created) {
    return NextResponse.json({ error: error?.message ?? "Failed to start chat" }, { status: 500 });
  }

  return NextResponse.json({ conversationId: created.id });
}
