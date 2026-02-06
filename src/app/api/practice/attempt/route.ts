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
  const isCorrect = body?.isCorrect as boolean | null | undefined;

  if (!questionId || (isCorrect !== true && isCorrect !== false && isCorrect !== null)) {
    return NextResponse.json(
      { error: "Missing questionId or isCorrect (boolean or null)" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("practice_attempts").insert({
    user_id: authData.user.id,
    question_id: questionId,
    is_correct: isCorrect,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    const { count } = await supabase
      .from("practice_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", authData.user.id);

    if (typeof count === "number" && count > 0) {
      const milestones = [
        { id: "first_attempt", at: 1 },
        { id: "ten_attempts", at: 10 },
        { id: "fifty_attempts", at: 50 },
        { id: "hundred_attempts", at: 100 },
      ];

      const awards = milestones
        .filter((milestone) => count >= milestone.at)
        .map((milestone) => ({
          user_id: authData.user.id,
          achievement_id: milestone.id,
        }));

      if (awards.length > 0) {
        await supabase
          .from("user_achievements")
          .upsert(awards, { onConflict: "user_id,achievement_id" });
      }
    }
  } catch {
    // Achievement tracking is optional; ignore failures.
  }

  return NextResponse.json({ ok: true });
}
