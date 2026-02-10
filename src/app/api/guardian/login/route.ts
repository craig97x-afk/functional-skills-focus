import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashGuardianCode } from "@/lib/guardian/code";

const COOKIE_NAME = "guardian_session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const studentName = body?.studentName as string | undefined;
    const code = body?.code as string | undefined;

    if (!studentName || !code) {
      return NextResponse.json({ error: "Missing details." }, { status: 400 });
    }

    const supabase = createAdminClient();
    // Hash incoming code so we can match against stored hashes.
    const hashed = hashGuardianCode(code.trim());

    const { data: links, error } = await supabase
      .from("guardian_links")
      .select("id, student_id, student_name, expires_at")
      .eq("access_code_hash", hashed)
      .limit(5);

    if (error || !links?.length) {
      return NextResponse.json({ error: "Invalid code." }, { status: 401 });
    }

    // Require full name match to reduce accidental access collisions.
    const match = links.find((link) =>
      link.student_name.toLowerCase().trim() === studentName.toLowerCase().trim()
    );

    if (!match) {
      return NextResponse.json({ error: "Name does not match code." }, { status: 401 });
    }

    if (match.expires_at && new Date(match.expires_at) < new Date()) {
      return NextResponse.json({ error: "Code expired." }, { status: 401 });
    }

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

    const { data: sessionRow, error: sessionError } = await supabase
      .from("guardian_sessions")
      .insert({
        guardian_link_id: match.id,
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (sessionError || !sessionRow) {
      return NextResponse.json({ error: "Failed to create session." }, { status: 500 });
    }

    const res = NextResponse.json({ ok: true });
    // Guardian session is a separate cookie scoped to /guardian.
    res.cookies.set({
      name: COOKIE_NAME,
      value: sessionRow.id,
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/guardian",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
