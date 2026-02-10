import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import QuestionForm from "./question-form";
import QuestionRowActions from "./question-row-actions";
import QuestionFilters from "./question-filters";
import ExamMockForm from "./exam-mock-form";
import ExamMockRowActions from "./exam-mock-row-actions";
import QuestionSetForm from "./question-set-form";
import QuestionSetRowActions from "./question-set-row-actions";

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

type ExamMockRow = {
  id: string;
  subject: string;
  level_slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  file_url: string | null;
  is_published: boolean;
};

type QuestionSetRow = {
  id: string;
  subject: string;
  level_slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  resource_url: string | null;
  content: string | null;
  is_published: boolean;
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

  const { data: examMocks } = (await supabase
    .from("exam_mocks")
    .select("id, subject, level_slug, title, description, cover_url, file_url, is_published")
    .order("created_at", { ascending: false })) as { data: ExamMockRow[] | null };

  const { data: questionSets } = (await supabase
    .from("question_sets")
    .select("id, subject, level_slug, title, description, cover_url, resource_url, content, is_published")
    .order("created_at", { ascending: false })) as { data: QuestionSetRow[] | null };

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
        <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
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
        <h2 className="font-semibold mb-4">Upload an exam mock</h2>
        <ExamMockForm />
      </section>

      <section className="apple-card p-6">
        <h2 className="font-semibold mb-4">Existing exam mocks</h2>
        <div className="space-y-3">
          {(examMocks ?? []).map((mock) => (
            <div key={mock.id} className="apple-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-24 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] overflow-hidden">
                    {mock.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mock.cover_url}
                        alt={mock.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] uppercase tracking-[0.2em] text-slate-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {mock.subject} · {mock.level_slug}
                    </div>
                    <div className="font-medium mt-1">{mock.title}</div>
                    {mock.description && (
                      <div className="text-sm text-slate-500 mt-2">
                        {mock.description}
                      </div>
                    )}
                    {mock.file_url && (
                      <a
                        className="text-xs text-[color:var(--accent)] mt-2 inline-block"
                        href={mock.file_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View file
                      </a>
                    )}
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="text-xs text-slate-500">
                    {mock.is_published ? "Published" : "Draft"}
                  </div>
                  <ExamMockRowActions
                    mockId={mock.id}
                    initialPublished={mock.is_published}
                  />
                </div>
              </div>
            </div>
          ))}

          {(!examMocks || examMocks.length === 0) && (
            <div className="text-sm text-[color:var(--muted-foreground)]">
              No exam mocks yet. Upload your first one above.
            </div>
          )}
        </div>
      </section>

      <section className="apple-card p-6">
        <h2 className="font-semibold mb-4">Create a question set</h2>
        <QuestionSetForm />
      </section>

      <section className="apple-card p-6">
        <h2 className="font-semibold mb-4">Existing question sets</h2>
        <div className="space-y-3">
          {(questionSets ?? []).map((set) => (
            <div key={set.id} className="apple-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-24 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] overflow-hidden">
                    {set.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={set.cover_url}
                        alt={set.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] uppercase tracking-[0.2em] text-slate-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {set.subject} · {set.level_slug}
                    </div>
                    <div className="font-medium mt-1">{set.title}</div>
                    {set.description && (
                      <div className="text-sm text-slate-500 mt-2">
                        {set.description}
                      </div>
                    )}
                    {set.resource_url && (
                      <a
                        className="text-xs text-[color:var(--accent)] mt-2 inline-block"
                        href={set.resource_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View resource
                      </a>
                    )}
                    {set.content && (
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-2">
                        Interactive content
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="text-xs text-slate-500">
                    {set.is_published ? "Published" : "Draft"}
                  </div>
                  <QuestionSetRowActions
                    setId={set.id}
                    initialPublished={set.is_published}
                  />
                </div>
              </div>
            </div>
          ))}

          {(!questionSets || questionSets.length === 0) && (
            <div className="text-sm text-[color:var(--muted-foreground)]">
              No question sets yet. Create your first one above.
            </div>
          )}
        </div>
      </section>

      <section className="apple-card p-6">
        <h2 className="font-semibold mb-4">Existing questions</h2>
        <QuestionFilters
          topics={topics ?? []}
          status={status}
          type={typeFilter}
          topic={topicFilter}
        />

        <div className="space-y-2">
          {(questions ?? []).map((q) => (
            <div key={q.id} className="apple-card flex items-start justify-between p-4">
              <div>
                <div className="font-medium">{q.prompt}</div>
                <div className="text-xs text-[color:var(--muted-foreground)] mt-1">
                  Type: {q.type.toUpperCase()} · {q.published ? "Published" : "Draft"}
                  {" · "}
                  Topic: {q.topics?.title ?? "?"}
                  {" · "}
                  Lesson: {q.lessons?.title ?? "None"}
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-2">
                <Link
                  className="text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
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
            <div className="text-sm text-[color:var(--muted-foreground)]">
              No questions yet. Create your first one above.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
