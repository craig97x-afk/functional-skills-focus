import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import QuestionForm from "./question-form";
import QuestionRowActions from "./question-row-actions";

type Topic = {
  id: string;
  title: string;
  level: { code: string } | null;
};

type Lesson = {
  id: string;
  title: string;
  topic_id: string;
  published: boolean;
};

type QuestionRow = {
  id: string;
  topic_id: string;
  type: "mcq" | "short";
  prompt: string;
  published: boolean;
  topics: { title: string } | null;
  lessons: { title: string } | null;
};

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams?: { status?: string; type?: string; topic?: string };
}) {
  await requireAdmin();
  const supabase = await createClient();

  const status = searchParams?.status ?? "all";
  const typeFilter = searchParams?.type ?? "all";
  const topicFilter = searchParams?.topic ?? "all";

  const { data: topics } = (await supabase
    .from("topics")
    .select("id, title, level:level_id(code)")
    .order("title")) as { data: Topic[] | null };
  const { data: lessons } = (await supabase
    .from("lessons")
    .select("id, title, topic_id, published")
    .order("title")) as { data: Lesson[] | null };

  let questionQuery = supabase
    .from("questions")
    .select("id, topic_id, type, prompt, published, topics(title), lessons(title)")
    .order("created_at", { ascending: false });

  if (status === "published") {
    questionQuery = questionQuery.eq("published", true);
  } else if (status === "draft") {
    questionQuery = questionQuery.eq("published", false);
  }

  if (typeFilter === "mcq" || typeFilter === "short") {
    questionQuery = questionQuery.eq("type", typeFilter);
  }

  if (topicFilter && topicFilter !== "all") {
    questionQuery = questionQuery.eq("topic_id", topicFilter);
  }

  const { data: questions } = (await questionQuery) as { data: QuestionRow[] | null };

  return (
    <main className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Questions
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">
          Manage Questions
        </h1>
      </div>

      <section className="apple-card p-6">
        <h2 className="font-semibold mb-4">Create a question</h2>
        <QuestionForm topics={topics ?? []} lessons={lessons ?? []} />
      </section>

      <section className="apple-card p-6">
        <h2 className="font-semibold mb-4">Existing questions</h2>
        <form className="flex flex-wrap items-end gap-2 mb-4" method="get">
          <label className="text-xs text-slate-500">
            Status
            <select
              name="status"
              defaultValue={status}
              className="ml-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm"
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>

          <label className="text-xs text-slate-500">
            Type
            <select
              name="type"
              defaultValue={typeFilter}
              className="ml-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm"
            >
              <option value="all">All</option>
              <option value="mcq">MCQ</option>
              <option value="short">Short</option>
            </select>
          </label>

          <label className="text-xs text-slate-500">
            Topic
            <select
              name="topic"
              defaultValue={topicFilter}
              className="ml-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm"
            >
              <option value="all">All topics</option>
              {(topics ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>

          <button className="apple-pill" type="submit">
            Apply
          </button>
          <Link className="apple-pill" href="/admin/questions">
            Reset
          </Link>
        </form>

        <div className="space-y-2">
          {(questions ?? []).map((q) => (
            <div
              key={q.id}
              className="flex items-start justify-between rounded-2xl border border-black/5 bg-white/80 p-4"
            >
              <div>
                <div className="font-medium">{q.prompt}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Type: {q.type.toUpperCase()} · {q.published ? "Published" : "Draft"}
                  {" · "}
                  Topic: {q.topics?.title ?? "?"}
                  {" · "}
                  Lesson: {q.lessons?.title ?? "None"}
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-2">
                <Link
                  className="text-sm text-slate-600 hover:text-slate-900"
                  href={`/admin/questions/${q.id}`}
                >
                  Edit
                </Link>
                <QuestionRowActions
                  questionId={q.id}
                  initialPublished={q.published}
                  type={q.type}
                />
              </div>
            </div>
          ))}

          {(!questions || questions.length === 0) && (
            <div className="text-sm text-slate-500">
              No questions yet. Create your first one above.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
