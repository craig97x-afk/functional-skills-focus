import Link from "next/link";
import { redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/server";
import { WidgetBlock } from "@/components/widget-block";

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

export default async function MathsQuestionSetPage({
  params,
  searchParams,
}: {
  params: Promise<{ level: string; setId: string }>;
  searchParams?: { board?: string };
}) {
  const { level, setId } = await params;
  const boardQuery = searchParams?.board ? `?board=${searchParams.board}` : "";
  const supabase = await createClient();

  const { data: set } = await supabase
    .from("question_sets")
    .select(
      "id, subject, level_slug, title, description, cover_url, content, resource_url, is_published"
    )
    .eq("id", setId)
    .eq("subject", "maths")
    .eq("level_slug", level)
    .eq("is_published", true)
    .maybeSingle<QuestionSet>();

  if (!set) {
    redirect(`/maths/levels/${level}/resources${boardQuery}`);
  }

  const content = set.content
    ? set.content.replace(/\\\\n/g, "\n\n").replace(/\\n/g, "\n\n")
    : null;

  return (
    <main className="space-y-8 max-w-4xl">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link
          className="apple-subtle inline-flex"
          href={`/maths/levels/${level}/resources${boardQuery}`}
        >
          ← Back to resources
        </Link>
        {set.resource_url && (
          <a
            className="apple-subtle inline-flex"
            href={set.resource_url}
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
