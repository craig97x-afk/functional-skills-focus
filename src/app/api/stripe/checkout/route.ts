import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getUser } from "@/lib/auth/get-user";

export async function POST(req: Request) {
  const session = await getUser();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { origin } = new URL(req.url);

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: session.user.email ?? undefined,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${origin}/billing/success`,
    cancel_url: `${origin}/pricing`,
    metadata: {
      user_id: session.user.id,
    },
  });

  return NextResponse.json({ url: checkout.url });
}
