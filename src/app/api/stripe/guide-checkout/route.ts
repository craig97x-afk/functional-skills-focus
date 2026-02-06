import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const contentType = req.headers.get("content-type") ?? "";
  let guideId: string | null = null;

  if (contentType.includes("application/json")) {
    const body = await req.json();
    guideId = (body?.guideId as string | undefined) ?? null;
  } else {
    const form = await req.formData();
    guideId = form.get("guideId")?.toString() ?? null;
  }

  if (!guideId) {
    return NextResponse.json({ error: "Missing guideId" }, { status: 400 });
  }

  const { data: guide } = await supabase
    .from("guides")
    .select("id, title, price_cents, currency, stripe_price_id, is_published")
    .eq("id", guideId)
    .maybeSingle();

  if (!guide || !guide.is_published) {
    return NextResponse.json({ error: "Guide not found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_subscribed, access_override, stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const hasAccess = Boolean(
    profile?.role === "admin" || profile?.is_subscribed || profile?.access_override
  );

  if (hasAccess || guide.price_cents === 0) {
    return NextResponse.redirect(new URL(`/guides/${guide.id}`, req.url));
  }

  if (!guide.stripe_price_id) {
    return NextResponse.json(
      { error: "Guide is not purchasable yet" },
      { status: 400 }
    );
  }

  const origin = req.headers.get("origin") ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price: guide.stripe_price_id,
        quantity: 1,
      },
    ],
    success_url: `${origin}/guides/${guide.id}?success=1`,
    cancel_url: `${origin}/guides/${guide.id}?cancel=1`,
    client_reference_id: user.id,
    metadata: {
      user_id: user.id,
      guide_id: guide.id,
      purchase_type: "guide",
    },
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id ? undefined : user.email ?? undefined,
  });

  return NextResponse.redirect(session.url!, { status: 303 });
}
