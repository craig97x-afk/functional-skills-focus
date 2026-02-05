import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const origin = req.headers.get("origin") ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],

    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!, // ← your price_...
        quantity: 1,
      },
    ],

    success_url: `${origin}/billing/success`,
    cancel_url: `${origin}/pricing`,

    client_reference_id: user.id,
    metadata: {
      user_id: user.id,
    },
  });

  return NextResponse.json({ url: session.url });
}
