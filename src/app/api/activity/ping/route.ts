import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const today = new Date();
  const activityDate = today.toISOString().slice(0, 10);

  const { data: existing, error: existingError } = await supabase
    .from("user_activity_minutes")
    .select("minutes")
    .eq("user_id", user.id)
    .eq("activity_date", activityDate)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from("user_activity_minutes")
      .update({
        minutes: (existing.minutes ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("activity_date", activityDate);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  } else {
    const { error: insertError } = await supabase
      .from("user_activity_minutes")
      .insert({
        user_id: user.id,
        activity_date: activityDate,
        minutes: 1,
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
