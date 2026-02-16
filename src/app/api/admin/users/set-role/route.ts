import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  await requireAdmin();
  const supabase = await createClient();

  const body = await req.json().catch(() => null);
  const userId = body?.userId as string | undefined;
  const role = body?.role as string | undefined;

  if (!userId || !role) {
    return NextResponse.json({ error: "Missing userId or role" }, { status: 400 });
  }

  if (!["admin", "student"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
