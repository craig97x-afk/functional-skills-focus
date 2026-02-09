import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateGuardianCode, hashGuardianCode } from "@/lib/guardian/code";
import { sendGuardianInvite } from "@/lib/guardian/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const studentId = body?.studentId as string | undefined;
    const studentName = body?.studentName as string | undefined;
    const studentEmail = body?.studentEmail as string | undefined;
    const guardianName = body?.guardianName as string | undefined;
    const guardianEmail = body?.guardianEmail as string | undefined;

    if (!studentId || !studentName || !studentEmail || !guardianName || !guardianEmail) {
      return NextResponse.json({ error: "Missing guardian details." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
      studentId
    );

    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    const emailMatches =
      userData.user.email?.toLowerCase() === studentEmail.toLowerCase();
    if (!emailMatches) {
      return NextResponse.json({ error: "Student email mismatch." }, { status: 400 });
    }

    const code = generateGuardianCode();
    const codeHash = hashGuardianCode(code);
    const last4 = code.slice(-4);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

    const { error: upsertError } = await supabase
      .from("guardian_links")
      .upsert(
        {
          student_id: studentId,
          student_name: studentName,
          guardian_name: guardianName,
          guardian_email: guardianEmail,
          access_code_hash: codeHash,
          access_code_last4: last4,
          expires_at: expiresAt,
        },
        { onConflict: "student_id,guardian_email" }
      );

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    const emailResult = await sendGuardianInvite({
      guardianEmail,
      guardianName,
      studentName,
      code,
    });

    return NextResponse.json({
      ok: true,
      emailed: emailResult.sent,
      emailDetail: emailResult.detail,
      code: emailResult.sent ? undefined : code,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
