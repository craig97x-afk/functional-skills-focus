import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/get-user";

type Guide = {
  id: string;
  title: string;
  description: string | null;
  type: "pdf" | "markdown" | "video";
  price_cents: number;
  currency: string;
  is_published: boolean;
};

type GuideAsset = {
  content: string | null;
  file_path: string | null;
  file_url: string | null;
};

function formatPrice(priceCents: number, currency: string) {
  if (!priceCents) return "Free";
  const formatter = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  });
  return formatter.format(priceCents / 100);
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ guideId: string }>;
}) {
  const { guideId } = await params;
  const session = await getUser();
  const supabase = await createClient();

  const { data: guide } = (await supabase
    .from("guides")
    .select(
      "id, title, description, type, price_cents, currency, is_published"
    )
    .eq("id", guideId)
    .maybeSingle()) as { data: Guide | null };

  if (!guide || (!guide.is_published && session?.profile?.role !== "admin")) {
    notFound();
  }

  const isSubscriber = Boolean(
    session?.profile?.role === "admin" ||
      session?.profile?.is_subscribed ||
      session?.profile?.access_override
  );

  const { data: purchase } = session
    ? await supabase
        .from("guide_purchases")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("guide_id", guide.id)
        .maybeSingle()
    : { data: null as { id: string } | null };

  const hasAccess = isSubscriber || guide.price_cents === 0 || Boolean(purchase);
  const priceLabel = formatPrice(guide.price_cents, guide.currency);
  let asset: GuideAsset | null = null;
  let resolvedFileUrl: string | null = null;

  if (hasAccess) {
    const { data: assetRow } = (await supabase
      .from("guide_assets")
      .select("content, file_path, file_url")
      .eq("guide_id", guide.id)
      .maybeSingle()) as { data: GuideAsset | null };

    asset = assetRow;
    resolvedFileUrl = asset?.file_url ?? null;

    if (!resolvedFileUrl && asset?.file_path) {
      const { data: signed } = await supabase.storage
        .from("guides")
        .createSignedUrl(asset.file_path, 60 * 60);
      resolvedFileUrl = signed?.signedUrl ?? null;
    }
  }

  return (
    <main className="space-y-8">
      <div className="space-y-2">
        <Link className="apple-subtle" href="/guides">
          ← Back to guides
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">{guide.title}</h1>
        {guide.description && <p className="apple-subtle">{guide.description}</p>}
      </div>

      {!hasAccess && (
        <section className="apple-card p-6 space-y-4">
          <div className="text-lg font-semibold">Unlock this guide</div>
          <p className="apple-subtle">
            Subscribers get this guide included. Non-subscribers can purchase
            it individually.
          </p>
          {session ? (
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
        </section>
      )}

      {hasAccess && (
        <section className="apple-card p-6 space-y-4">
          {guide.type === "markdown" && asset?.content && (
            <article className="prose max-w-none prose-headings:tracking-tight">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {asset.content}
              </ReactMarkdown>
            </article>
          )}

          {guide.type === "pdf" && resolvedFileUrl && (
            <div className="space-y-3">
              <a className="apple-button" href={resolvedFileUrl} target="_blank">
                Download PDF
              </a>
              <iframe
                title={guide.title}
                src={resolvedFileUrl}
                className="w-full min-h-[600px] rounded-2xl border"
              />
            </div>
          )}

          {guide.type === "video" && resolvedFileUrl && (
            <div className="space-y-3">
              <a className="apple-button" href={resolvedFileUrl} target="_blank">
                Open video
              </a>
              <video
                controls
                className="w-full rounded-2xl border"
                src={resolvedFileUrl}
              />
            </div>
          )}

          {!resolvedFileUrl && guide.type !== "markdown" && (
            <div className="text-sm text-slate-500">
              This guide file is not available yet.
            </div>
          )}
        </section>
      )}
    </main>
  );
}
