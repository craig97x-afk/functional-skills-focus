import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const session = await getUser();
  if (!session) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  // Admins don't need billing
  if (session.profile?.role === "admin") {
    return NextResponse.json({ error: "Admins do not have subscriptions" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", session.user.id)
    .single();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: "No subscription found" }, { status: 400 });
  }

  const { origin } = new URL(req.url);

  const portal = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${origin}/dashboard`,
  });

  return NextResponse.json({ url: portal.url });
}
