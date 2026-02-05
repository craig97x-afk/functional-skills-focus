import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

const supabaseAdmin = createAdminClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  const session = await getUser();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  // Admin account deletion disabled (safety)
  if (session.profile?.role === "admin") {
    return NextResponse.json({ error: "Admin account deletion is disabled." }, { status: 400 });
  }

  const userId = session.user.id;

  // Cancel Stripe subscription if present
  try {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_subscription_id")
      .eq("id", userId)
      .single();

    if (profile?.stripe_subscription_id) {
      await stripe.subscriptions.cancel(profile.stripe_subscription_id);
    }
  } catch {
    // don't block deletion if Stripe cancel fails
  }

  // Delete related rows (most will cascade, but be explicit)
  await supabaseAdmin.from("practice_attempts").delete().eq("user_id", userId);
  await supabaseAdmin.from("profiles").delete().eq("id", userId);

  // Delete Auth user (this is the actual account)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
