import Link from "next/link";
import { redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/server";
import { WidgetBlock } from "@/components/widget-block";
import { buildTrackedResourceUrl } from "@/lib/exam-resources/tracking";

export const dynamic = "force-dynamic";

type QuestionSet = {
  id: string;
  subject: string;
  level_slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  content: string | null;
  resource_url: string | null;
  is_published: boolean;
};

export default async function EnglishQuestionSetPage({
  params,
  searchParams,
}: {
  params: Promise<{ level: string; setId: string }>;
  searchParams?: {
    board?: string;
    paperType?: string;
    year?: string;
    tag?: string;
  };
}) {
  const { level, setId } = await params;
  const activeSearch = new URLSearchParams();
  if (searchParams?.board) activeSearch.set("board", searchParams.board);
  if (searchParams?.paperType) activeSearch.set("paperType", searchParams.paperType);
  if (searchParams?.year) activeSearch.set("year", searchParams.year);
  if (searchParams?.tag) activeSearch.set("tag", searchParams.tag);
  const activeQuery = activeSearch.toString();
  const resourcesHref = activeQuery
    ? `/english/levels/${level}/resources?${activeQuery}`
    : `/english/levels/${level}/resources`;
  const supabase = await createClient();

  const { data: set } = await supabase
    .from("question_sets")
    .select(
      "id, subject, level_slug, title, description, cover_url, content, resource_url, is_published"
    )
    .eq("id", setId)
    .eq("subject", "english")
    .eq("level_slug", level)
    .eq("is_published", true)
    .maybeSingle<QuestionSet>();

  if (!set) {
    redirect(resourcesHref);
  }

  const trackedDownloadUrl = set.resource_url
    ? buildTrackedResourceUrl({
        resourceType: "question_set",
        resourceId: set.id,
        eventType: "download",
        subject: "english",
        levelSlug: level,
        targetUrl: set.resource_url,
      })
    : null;

  const content = set.content
    ? set.content.replace(/\\\\n/g, "\n\n").replace(/\\n/g, "\n\n")
    : null;

  return (
    <main className="space-y-8 max-w-4xl">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link
          className="apple-subtle inline-flex"
          href={resourcesHref}
        >
          ← Back to resources
        </Link>
        {trackedDownloadUrl && (
          <a
            className="apple-subtle inline-flex"
            href={trackedDownloadUrl}
            target="_blank"
            rel="noreferrer"
          >
            Download PDF
          </a>
        )}
      </div>

      <header className="space-y-3">
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Question set
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{set.title}</h1>
        {set.description && <p className="apple-subtle">{set.description}</p>}
        {set.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={set.cover_url}
            alt={set.title}
            className="w-full max-h-[320px] object-cover rounded-2xl border border-[color:var(--border)]"
          />
        )}
      </header>

      <article className="prose max-w-none">
        {content ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const value = String(children).trim();
                const isWidget = className?.includes("language-widget");
                const isBlock = Boolean(className);

                if (isWidget) {
                  return <WidgetBlock value={value} />;
                }

                if (!isBlock) {
                  return (
                    <code className="rounded bg-slate-100 px-1 py-0.5" {...props}>
                      {children}
                    </code>
                  );
                }

                return (
                  <pre className="rounded-lg bg-slate-100 p-4 overflow-x-auto">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        ) : (
          <div className="apple-card p-6 text-sm text-[color:var(--muted-foreground)]">
            This question set is available as a PDF download.
          </div>
        )}
      </article>
    </main>
  );
}
