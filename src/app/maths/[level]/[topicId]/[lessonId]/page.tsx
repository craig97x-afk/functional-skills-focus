import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { WidgetBlock } from "./lesson-widgets";

type LessonRow = {
  id: string;
  title: string;
  body: string | null;
  published: boolean;
};

export default async function LessonPage({
  params,
}: {
  params: Promise<{ level: string; topicId: string; lessonId: string }>;
}) {
  const { level, topicId, lessonId } = await params;

  const session = await getUser();
  if (!session) redirect("/login");

  const profile = session.profile;
  const hasAccess = Boolean(
    profile?.role === "admin" || profile?.is_subscribed || profile?.access_override
  );

  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, body, published")
    .eq("id", lessonId)
    .maybeSingle<LessonRow>();

  if (!lesson || !lesson.published) {
    redirect(`/maths/${level}/${topicId}`);
  }

  const lessonBody = lesson.body
    ? lesson.body.includes("\\n")
      ? lesson.body.replace(/\\n/g, "\n\n")
      : lesson.body
    : null;

  return (
    <main className="space-y-8 max-w-3xl">
      <Link className="apple-subtle inline-flex" href={`/maths/${level}/${topicId}`}>
        ← Back to topic
      </Link>

      <div className="space-y-3">
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Lesson
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{lesson.title}</h1>
        <p className="apple-subtle">
          Read through the explanation and examples, then practise the topic.
        </p>
        <div className="flex flex-wrap gap-3">
          {hasAccess ? (
            <Link className="apple-button" href={`/practice/${topicId}`}>
              Practice this topic
            </Link>
          ) : (
            <Link className="apple-pill" href="/pricing">
              Unlock practice
            </Link>
          )}
        </div>
      </div>

      <article className="prose max-w-none">
        {lessonBody ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const content = String(children).trim();
                const isWidget = className?.includes("language-widget");
                const isBlock = Boolean(className);

                if (isWidget) {
                  return <WidgetBlock value={content} />;
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
            {lessonBody}
          </ReactMarkdown>
        ) : (
          <p>No content yet.</p>
        )}
      </article>
    </main>
  );
}
