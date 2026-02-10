import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import ExamMockForm from "./exam-mock-form";
import ExamMockRowActions from "./exam-mock-row-actions";
import QuestionSetForm from "./question-set-form";
import QuestionSetRowActions from "./question-set-row-actions";

type ExamMock = {
  id: string;
  subject: string;
  level_slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  file_url: string | null;
  is_published: boolean;
};

type QuestionSet = {
  id: string;
  subject: string;
  level_slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  resource_url: string | null;
  is_published: boolean;
};

export default async function AdminResourcesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: examMocks } = (await supabase
    .from("exam_mocks")
    .select(
      "id, subject, level_slug, title, description, cover_url, file_url, is_published"
    )
    .order("created_at", { ascending: false })) as { data: ExamMock[] | null };

  const { data: questionSets } = (await supabase
    .from("question_sets")
    .select(
      "id, subject, level_slug, title, description, cover_url, resource_url, is_published"
    )
    .order("created_at", { ascending: false })) as { data: QuestionSet[] | null };

  return (
    <main className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Resources
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">
          Exam mocks & question banks
        </h1>
        <p className="apple-subtle mt-2">
          Upload mocks and question sets by level. These appear under each level’s Resources tab.
        </p>
      </div>

      <section className="apple-card p-6">
        <h2 className="font-semibold mb-4">Create an exam mock</h2>
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
            <div className="text-sm text-slate-500">
              No exam mocks yet. Add your first one above.
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
            <div className="text-sm text-slate-500">
              No question sets yet. Add your first one above.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
