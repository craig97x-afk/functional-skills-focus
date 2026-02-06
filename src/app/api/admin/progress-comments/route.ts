import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/get-user";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  await requireAdmin();
  const supabase = await createClient();
  const session = await getUser();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const userId = body?.userId as string | undefined;
  const content = body?.content as string | undefined;
  const commentId = body?.commentId as string | undefined;

  if (!userId || !content?.trim()) {
    return NextResponse.json({ error: "Missing userId or content" }, { status: 400 });
  }

  if (commentId) {
    const { error } = await supabase
      .from("progress_comments")
      .update({ content: content.trim(), updated_at: new Date().toISOString() })
      .eq("id", commentId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, mode: "updated" });
  }

  const { error } = await supabase.from("progress_comments").insert({
    user_id: userId,
    admin_id: session.user.id,
    content: content.trim(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, mode: "created" });
}
