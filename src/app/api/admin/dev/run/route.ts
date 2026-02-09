import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/get-user";
import { runDevChecks } from "@/lib/admin/dev-checks";

export async function POST() {
  const session = await getUser();
  if (!session || session.profile?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const result = await runDevChecks(supabase);
  return NextResponse.json(result);
}
