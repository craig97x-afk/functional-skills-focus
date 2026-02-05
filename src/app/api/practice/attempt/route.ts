import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authData.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const questionId = body?.questionId as string | undefined;
  const isCorrect = body?.isCorrect as boolean | undefined;

  if (!questionId || typeof isCorrect !== "boolean") {
    return NextResponse.json({ error: "Missing questionId or isCorrect" }, { status: 400 });
  }

  const { error } = await supabase.from("practice_attempts").insert({
    user_id: authData.user.id,
    question_id: questionId,
    is_correct: isCorrect,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
