import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import GuideForm from "./guide-form";
import GuideRowActions from "./guide-row-actions";

type Guide = {
  id: string;
  title: string;
  description: string | null;
  type: "pdf" | "markdown" | "video";
  price_cents: number;
  currency: string;
  stripe_price_id: string | null;
  is_published: boolean;
};

function formatPrice(priceCents: number, currency: string) {
  if (!priceCents) return "Free";
  const formatter = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  });
  return formatter.format(priceCents / 100);
}

export default async function AdminGuidesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: guides } = (await supabase
    .from("guides")
    .select(
      "id, title, description, type, price_cents, currency, stripe_price_id, is_published"
    )
    .order("created_at", { ascending: false })) as { data: Guide[] | null };

  return (
    <main className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Guides
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">
          Manage Guides
        </h1>
        <p className="apple-subtle mt-2">
          Upload revision guides and set pricing for non-subscribers.
        </p>
      </div>

      <section className="apple-card p-6">
        <h2 className="font-semibold mb-4">Create a guide</h2>
        <GuideForm />
      </section>

      <section className="apple-card p-6">
        <h2 className="font-semibold mb-4">Existing guides</h2>
        <div className="space-y-3">
          {(guides ?? []).map((guide) => (
            <div key={guide.id} className="apple-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {guide.type}
                  </div>
                  <div className="font-medium mt-1">{guide.title}</div>
                  {guide.description && (
                    <div className="text-sm text-slate-500 mt-1">
                      {guide.description}
                    </div>
                  )}
                  <div className="text-xs text-slate-500 mt-2">
                    {formatPrice(guide.price_cents, guide.currency)}
                    {" · "}
                    {guide.stripe_price_id ? "Stripe price linked" : "No Stripe price"}
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="text-xs text-slate-500">
                    {guide.is_published ? "Published" : "Draft"}
                  </div>
                  <GuideRowActions
                    guideId={guide.id}
                    initialPublished={guide.is_published}
                  />
                </div>
              </div>
            </div>
          ))}

          {(!guides || guides.length === 0) && (
            <div className="text-sm text-slate-500">
              No guides yet. Upload your first guide above.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
