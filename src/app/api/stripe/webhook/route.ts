import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function isActive(status?: string | null) {
  return status === "active" || status === "trialing";
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const supabase = await createClient();

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;

    const userId =
      (s.client_reference_id as string | null) ||
      (s.metadata?.user_id as string | undefined);

    const customerId =
      typeof s.customer === "string" ? s.customer : s.customer?.id;

    const subId =
      typeof s.subscription === "string"
        ? s.subscription
        : s.subscription?.id;

    if (userId && customerId) {
      await supabase.from("profiles").update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subId ?? null,
      }).eq("id", userId);
    }
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const customerId =
      typeof sub.customer === "string" ? sub.customer : sub.customer.id;

    await supabase.from("profiles").update({
      is_subscribed: isActive(sub.status),
      stripe_subscription_id: sub.id,
      stripe_status: sub.status,
      stripe_status_updated_at: new Date().toISOString(),
    }).eq("stripe_customer_id", customerId);
  }

  return NextResponse.json({ received: true });
}
