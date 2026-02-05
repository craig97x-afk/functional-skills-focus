import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

const supabaseAdmin = createAdminClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const session = await getUser();
  if (!session || session.profile?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { userId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const userId = body.userId;
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const { data: profile, error: profileErr } = await supabaseAdmin
    .from("profiles")
    .select("stripe_subscription_id")
    .eq("id", userId)
    .single();

  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 500 });
  }

  if (!profile?.stripe_subscription_id) {
    return NextResponse.json({ error: "No subscription id" }, { status: 404 });
  }

  const subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);
  const isSubscribed = subscription.status === "active" || subscription.status === "trialing";

  const { error: updateErr } = await supabaseAdmin
    .from("profiles")
    .update({ is_subscribed: isSubscribed })
    .eq("id", userId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: subscription.status, is_subscribed: isSubscribed });
}
