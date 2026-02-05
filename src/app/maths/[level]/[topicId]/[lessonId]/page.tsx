import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import LessonQuestions from "./lesson-questions";

type LessonRow = {
  id: string;
  title: string;
  body: string | null;
  published: boolean;
};

type QuestionOptionRow = {
  id: string;
  label: string;
  is_correct: boolean;
};

type QuestionRow = {
  id: string;
  type: "mcq" | "short";
  prompt: string;
  hint: string | null;
  solution_explainer: string | null;
  published: boolean;
  question_options: QuestionOptionRow[] | null;
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

  if (!lesson || !lesson.published) {
    redirect(`/maths/${level}/${topicId}`);
  }

  const { data: questionsRaw } = await supabase
    .from("questions")
    .select(
      `
      id,
      type,
      prompt,
      hint,
      solution_explainer,
      published,
      question_options (
        id,
        label,
        is_correct
      )
    `
    )
    .eq("lesson_id", lessonId)
    .eq("published", true)
    .order("created_at");

  const questions = (questionsRaw ?? []) as QuestionRow[];

  return (
    <main className="p-6 space-y-6 max-w-3xl">
      <div>
        <a className="text-sm underline" href={`/maths/${level}/${topicId}`}>
          ← Back to topic
        </a>
      </div>

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

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Questions</h2>

        {questions.length === 0 ? (
          <p className="text-sm text-gray-600">
            No published questions linked to this lesson yet.
          </p>
        ) : (
          <LessonQuestions questions={questions} />
        )}
      </section>
    </main>
  );
}
