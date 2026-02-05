import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type LessonRow = {
  id: string;
  title: string;
  body: string | null;
  published: boolean;
};

export default async function LessonPage({
  params,
}: {
  params: { level: string; topicId: string; lessonId: string };
}) {
  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select("id, title, body, published")
    .eq("id", params.lessonId)
    .maybeSingle<LessonRow>();

  // DEBUG: show what's happening instead of silently redirecting
  if (error || !lesson) {
    return (
      <main className="p-6 space-y-3 max-w-3xl">
        <div className="rounded-md border p-2 text-xs">
          DEBUG LESSON PAGE HIT ✅ (if you can see this, routing is correct) <br />
          lessonId: {params.lessonId} <br />
          topicId: {params.topicId} <br />
          level: {params.level}
        </div>

        <h1 className="text-2xl font-bold">Lesson not available</h1>
        <p className="text-sm text-gray-600">
          Supabase didn’t return the lesson row. Usually wrong ID or RLS blocked it.
        </p>

        <div className="rounded-md border p-3 text-sm">
          <b>Error:</b> {error ? error.message : "null (no row returned)"}
        </div>

        <a className="underline text-sm" href={`/maths/${params.level}/${params.topicId}`}>
          Back to topic
        </a>
      </main>
    );
  }

  if (!lesson.published) {
    return (
      <main className="p-6 space-y-3 max-w-3xl">
        <div className="rounded-md border p-2 text-xs">
          DEBUG LESSON PAGE HIT ✅ <br />
          lessonId: {params.lessonId}
        </div>

        <h1 className="text-2xl font-bold">Lesson is not published</h1>
        <p className="text-sm text-gray-600">
          Admin must mark this lesson as published before students can view it.
        </p>

        <a className="underline text-sm" href={`/maths/${params.level}/${params.topicId}`}>
          Back to topic
        </a>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-4 max-w-3xl">
      <div className="rounded-md border p-2 text-xs">
        DEBUG LESSON PAGE HIT ✅ <br />
        lessonId: {params.lessonId} <br />
        topicId: {params.topicId} <br />
        level: {params.level}
      </div>

      <h1 className="text-2xl font-bold">{lesson.title}</h1>

      <article className="prose max-w-none">
        {lesson.body ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.body}</ReactMarkdown>
        ) : (
          <p>No content yet.</p>
        )}
      </article>
    </main>
  );
}
