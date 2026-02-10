import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

const COOKIE_NAME = "guardian_session";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(COOKIE_NAME)?.value;
  if (sessionId) {
    // Best-effort cleanup of the guardian session record.
    const supabase = createAdminClient();
    await supabase.from("guardian_sessions").delete().eq("id", sessionId);
  }

  const res = NextResponse.json({ ok: true });
  // Expire the guardian cookie client-side.
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/guardian",
    maxAge: 0,
  });
  return res;
}
