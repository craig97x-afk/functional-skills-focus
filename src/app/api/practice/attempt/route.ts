import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/get-user";

export async function POST(req: Request) {
  const session = await getUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { questionId, isCorrect } = await req.json();

  if (!questionId || typeof isCorrect !== "boolean") {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  const supabase = await createClient();

  const { error } = await supabase.from("practice_attempts").insert({
    user_id: session.user.id,
    question_id: questionId,
    is_correct: isCorrect,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
