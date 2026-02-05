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
  params: Promise<{ level: string; topicId: string; lessonId: string }>;
}) {
  const { level, topicId, lessonId } = await params;

  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, body, published")
    .eq("id", lessonId)
    .maybeSingle<LessonRow>();

  // If lesson missing/unpublished, go back to the topic page (and DO NOT use params.* here)
  if (!lesson || !lesson.published) {
    redirect(`/maths/${level}/${topicId}`);
  }

  return (
    <main className="p-6 space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">{lesson.title}</h1>

      <article className="prose max-w-none">
        {lesson.body ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {lesson.body}
          </ReactMarkdown>
        ) : (
          <p>No content yet.</p>
        )}
      </article>
    </main>
  );
}
