import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/get-user";
import ShopRotator from "@/components/shop-rotator";

type Guide = {
  id: string;
  title: string;
  description: string | null;
  type: "pdf" | "markdown" | "video";
  price_cents: number;
  currency: string;
  cover_url: string | null;
};

function formatPrice(priceCents: number, currency: string) {
  if (!priceCents) return "Free";
  const formatter = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  });
  return formatter.format(priceCents / 100);
}

export default async function GuidesPage() {
  const session = await getUser();
  const supabase = await createClient();

  const { data: guides } = await supabase
    .from("guides")
    .select("id, title, description, type, price_cents, currency, cover_url")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const isSubscriber = Boolean(
    session?.profile?.role === "admin" ||
      session?.profile?.is_subscribed ||
      session?.profile?.access_override
  );

  const { data: purchases } = session
    ? await supabase
        .from("guide_purchases")
        .select("guide_id")
        .eq("user_id", session.user.id)
    : { data: [] as { guide_id: string }[] };

  const purchasedIds = new Set((purchases ?? []).map((p) => p.guide_id));
  const rotatorItems =
    guides?.map((guide) => ({
      id: guide.id,
      title: guide.title,
      description: guide.description,
      cover_url: guide.cover_url,
      priceLabel: formatPrice(guide.price_cents, guide.currency),
      type: guide.type,
    })) ?? [];

  return (
    <main className="space-y-10">
      <div className="max-w-3xl">
        <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
          Shop
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">Shop</h1>
        <p className="apple-subtle mt-3">
          Subscribers get full access. Non-subscribers can purchase individual
          guides.
        </p>
      </div>

      <ShopRotator items={rotatorItems} />

      <section className="grid gap-6 md:grid-cols-2">
        {(guides ?? []).map((guide) => {
          const hasAccess =
            isSubscriber || guide.price_cents === 0 || purchasedIds.has(guide.id);
          const priceLabel = formatPrice(guide.price_cents, guide.currency);

          return (
            <div key={guide.id} className="apple-card p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                    {guide.type}
                  </div>
                  <h2 className="text-xl font-semibold mt-2">{guide.title}</h2>
                  {guide.description && (
                    <p className="apple-subtle mt-2">{guide.description}</p>
                  )}
                </div>
                <div className="apple-pill">{priceLabel}</div>
              </div>

              {isSubscriber && guide.price_cents > 0 && (
                <div className="text-xs text-[color:var(--muted-foreground)]">
                  Included with subscription.
                </div>
              )}

              <div>
                {hasAccess ? (
                  <Link className="apple-button" href={`/guides/${guide.id}`}>
                    Open guide
                  </Link>
                ) : session ? (
                  <form action="/api/stripe/guide-checkout" method="post">
                    <input type="hidden" name="guideId" value={guide.id} />
                    <button className="apple-button" type="submit">
                      Buy for {priceLabel}
                    </button>
                  </form>
                ) : (
                  <Link className="apple-pill" href="/login">
                    Log in to buy
                  </Link>
                )}
              </div>
            </div>
          );
        })}

        {(!guides || guides.length === 0) && (
          <div className="text-sm text-[color:var(--muted-foreground)]">
            No guides available yet. Check back soon.
          </div>
        )}
      </section>
    </main>
  );
}
