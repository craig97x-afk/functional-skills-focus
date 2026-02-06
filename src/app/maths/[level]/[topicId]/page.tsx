import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function TopicLessonsPage({
  params,
}: {
  params: Promise<{ level: string; topicId: string }>;
}) {
  const { level, topicId } = await params;

  const session = await getUser();
  if (!session) redirect("/login");

  const profile = session.profile;
  const hasAccess = Boolean(
    profile?.role === "admin" || profile?.is_subscribed || profile?.access_override
  );

  const supabase = await createClient();

  const { data: topic } = await supabase
    .from("topics")
    .select("title")
    .eq("id", topicId)
    .single();

  if (!topic) redirect(`/maths/levels`);

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, sort_order")
    .eq("topic_id", topicId)
    .eq("published", true)
    .order("sort_order");

  return (
    <main className="space-y-8">
      <Link className="apple-subtle inline-flex" href={`/maths/${level}`}>
        ← Back to {level} topics
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Topic
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{topic.title}</h1>
          <p className="apple-subtle">
            Lessons, worked examples, and revision notes for this topic.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
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

      <section className="grid gap-4 md:grid-cols-2">
        {(lessons ?? []).map((l) => (
          <Link
            key={l.id}
            href={`/maths/${level}/${topicId}/${l.id}`}
            className="apple-card p-5 hover:shadow-md transition"
          >
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Lesson
            </div>
            <div className="font-semibold mt-2">{l.title}</div>
          </Link>
        ))}

        {(!lessons || lessons.length === 0) && (
          <p className="text-sm text-slate-500">No lessons published yet.</p>
        )}
      </section>
    </main>
  );
}
