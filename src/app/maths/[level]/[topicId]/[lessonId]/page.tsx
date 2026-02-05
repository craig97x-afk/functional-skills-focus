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

  // TEMP DEBUG: show what Supabase is actually returning instead of silently redirecting
  if (error || !lesson) {
    return (
      <main className="p-6 space-y-3 max-w-3xl">
        <h1 className="text-2xl font-bold">Lesson not available</h1>
        <p className="text-sm text-gray-600">
          Supabase didn’t return the lesson row. This usually means the ID is wrong
          or Row Level Security blocked it.
        </p>

        <div className="rounded-md border p-3 text-sm">
          <div><b>lessonId</b>: {params.lessonId}</div>
          <div><b>topicId</b>: {params.topicId}</div>
          <div><b>level</b>: {params.level}</div>
          <div className="mt-2">
            <b>error</b>: {error ? error.message : "null"}
          </div>
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
        <h1 className="text-2xl font-bold">Lesson is not published</h1>
        <p className="text-sm text-gray-600">
          Admin needs to mark this lesson as published before students can view it.
        </p>
        <a className="underline text-sm" href={`/maths/${params.level}/${params.topicId}`}>
          Back to topic
        </a>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-4 max-w-3xl">
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
