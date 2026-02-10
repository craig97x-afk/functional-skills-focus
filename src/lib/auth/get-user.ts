import { createClient } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = await createClient();

  // Server-side auth fetch for session + profile (used in layout/pages).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile };
}
