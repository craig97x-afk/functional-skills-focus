import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/get-user";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  await requireAdmin();
  const session = await getUser();

  const body = await req.json().catch(() => null);
  const userId = body?.userId as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  if (session?.user?.id === userId) {
    return NextResponse.json(
      { error: "You cannot delete your own account." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { error: authError } = await admin.auth.admin.deleteUser(userId);
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const { error: profileError } = await admin.from("profiles").delete().eq("id", userId);
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
