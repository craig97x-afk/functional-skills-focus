import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

const COOKIE_NAME = "guardian_session";

export async function getGuardianSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(COOKIE_NAME)?.value;
  if (!sessionId) return null;

  const supabase = createAdminClient();
  const { data: session, error } = await supabase
    .from("guardian_sessions")
    .select("id, guardian_link_id, expires_at")
    .eq("id", sessionId)
    .maybeSingle();

  if (error || !session) return null;
  if (new Date(session.expires_at) < new Date()) return null;

  const { data: link } = await supabase
    .from("guardian_links")
    .select("id, student_id, student_name, guardian_name, guardian_email")
    .eq("id", session.guardian_link_id)
    .maybeSingle();

  if (!link) return null;

  return { sessionId: session.id, link };
}
