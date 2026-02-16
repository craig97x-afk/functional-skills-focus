import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ExamMockForm from "@/app/admin/questions/exam-mock-form";
import QuestionSetForm from "@/app/admin/questions/question-set-form";
import AdminRowActions from "@/components/admin-row-actions";

export const dynamic = "force-dynamic";

const levelLabels: Record<string, string> = {
  "entry-1": "Entry Level 1",
  "entry-2": "Entry Level 2",
  "entry-3": "Entry Level 3",
  "fs-1": "Functional Skills Level 1",
  "fs-2": "Functional Skills Level 2",
};

type ExamMock = {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  file_url: string | null;
  is_published: boolean;
};

type QuestionSet = {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  resource_url: string | null;
  content: string | null;
  is_published: boolean;
};

export default async function EnglishLevelResourcesPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;
  const label = levelLabels[level] ?? "Level";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };
  const isAdmin = profile?.role === "admin";

  let mocksQuery = supabase
    .from("exam_mocks")
    .select("id, title, description, cover_url, file_url, is_published")
    .eq("subject", "english")
    .eq("level_slug", level)
    .order("created_at", { ascending: false });
  if (!isAdmin) {
    mocksQuery = mocksQuery.eq("is_published", true);
  }
  const { data: mocksRaw } = (await mocksQuery) as { data: ExamMock[] | null };

  let setsQuery = supabase
    .from("question_sets")
    .select("id, title, description, cover_url, resource_url, content, is_published")
    .eq("subject", "english")
    .eq("level_slug", level)
    .order("created_at", { ascending: false });
  if (!isAdmin) {
    setsQuery = setsQuery.eq("is_published", true);
  }
  const { data: setsRaw } = (await setsQuery) as { data: QuestionSet[] | null };

  const mocks = mocksRaw ?? [];
  const sets = setsRaw ?? [];
  const basePath = `/english/levels/${level}`;

  return (
    <main className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link className="apple-subtle inline-flex" href="/english/levels">
            ← Back to levels
          </Link>
          <span className="text-slate-400">/</span>
          <Link className="apple-subtle inline-flex" href={basePath}>
            {label}
          </Link>
        </div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">English</div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {label} resources
        </h1>
        <p className="apple-subtle">
          Exam mocks, reading packs, and writing prompts for this level. Mocks are free for now.
        </p>
        {isAdmin && (
          <section className="apple-card p-6 space-y-4">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Admin
              </div>
              <h2 className="text-xl font-semibold mt-2">Add resources</h2>
              <p className="apple-subtle mt-2">
                Upload new mocks and question sets for this level.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <details className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                <summary className="cursor-pointer text-sm font-semibold">
                  Add exam mock
                </summary>
                <div className="mt-4">
                  <ExamMockForm
                    defaultSubject="english"
                    defaultLevel={level}
                    lockSubjectLevel
                  />
                </div>
              </details>
              <details className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                <summary className="cursor-pointer text-sm font-semibold">
                  Add question set
                </summary>
                <div className="mt-4">
                  <QuestionSetForm
                    defaultSubject="english"
                    defaultLevel={level}
                    lockSubjectLevel
                  />
                </div>
              </details>
            </div>
            <Link
              className="inline-flex rounded-full border px-4 py-2 text-xs transition border-[color:var(--accent)] bg-[color:var(--accent)] text-white hover:text-white"
              href="/admin/questions"
            >
              Open full resources manager
            </Link>
          </section>
        )}
        <div className="flex flex-wrap gap-2">
          <Link
            className="rounded-full border px-4 py-2 text-sm transition border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]"
            href={basePath}
          >
            Worksheets
          </Link>
          <Link
            className="rounded-full border px-4 py-2 text-sm transition border-[color:var(--accent)] bg-[color:var(--accent)] text-white hover:text-white"
            href={`${basePath}/resources`}
          >
            Resources
          </Link>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Exam mocks</div>
          <h2 className="text-2xl font-semibold mt-2">Mock papers</h2>
          <p className="apple-subtle mt-1">
            Printable papers and practice prompts aligned to this level.
          </p>
        </div>

        {mocks.length === 0 ? (
          <div className="apple-card p-6 text-sm text-[color:var(--muted-foreground)]">
            No exam mocks published yet for this level.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {mocks.map((mock) => (
              <article key={mock.id} className="apple-card p-5 flex flex-col gap-4">
                <div className="h-40 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] overflow-hidden">
                  {mock.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mock.cover_url}
                      alt={mock.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs uppercase tracking-[0.2em] text-slate-400">
                      Exam Mock
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="text-lg font-semibold">{mock.title}</div>
                  {mock.description && (
                    <p className="text-sm text-[color:var(--muted-foreground)]">
                      {mock.description}
                    </p>
                  )}
                  {mock.file_url ? (
                    <a
                      className="inline-flex rounded-full border px-4 py-2 text-xs text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]"
                      href={mock.file_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open mock
                    </a>
                  ) : (
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                      {mock.is_published ? "File coming soon" : "Draft"}
                    </div>
                  )}
                  {isAdmin && (
                    <div className="pt-2">
                      <AdminRowActions
                        table="exam_mocks"
                        id={mock.id}
                        initialPublished={mock.is_published}
                      />
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Question banks
          </div>
          <h2 className="text-2xl font-semibold mt-2">Topic question sets</h2>
          <p className="apple-subtle mt-1">
            Short exercises for comprehension, spelling, and writing practice.
          </p>
        </div>

        {sets.length === 0 ? (
          <div className="apple-card p-6 text-sm text-[color:var(--muted-foreground)]">
            No question sets published yet for this level.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {sets.map((set) => (
              <article key={set.id} className="apple-card p-5 flex flex-col gap-4">
                <div className="h-32 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] overflow-hidden">
                  {set.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={set.cover_url}
                      alt={set.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs uppercase tracking-[0.2em] text-slate-400">
                      Question Set
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="text-lg font-semibold">{set.title}</div>
                  {set.description && (
                    <p className="text-sm text-[color:var(--muted-foreground)]">
                      {set.description}
                    </p>
                  )}
                  {set.content ? (
                    <div className="flex flex-wrap gap-2">
                      <Link
                        className="inline-flex rounded-full border px-4 py-2 text-xs text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]"
                        href={`${basePath}/resources/questions/${set.id}`}
                      >
                        Open question set
                      </Link>
                      {set.resource_url && (
                        <a
                          className="inline-flex rounded-full border px-4 py-2 text-xs text-[color:var(--muted-foreground)] hover:bg-[color:var(--surface-muted)]"
                          href={set.resource_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download PDF
                        </a>
                      )}
                    </div>
                  ) : set.resource_url ? (
                    <a
                      className="inline-flex rounded-full border px-4 py-2 text-xs text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]"
                      href={set.resource_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open question set
                    </a>
                  ) : (
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                      {set.is_published ? "Resource coming soon" : "Draft"}
                    </div>
                  )}
                  {isAdmin && (
                    <div className="pt-2">
                      <AdminRowActions
                        table="question_sets"
                        id={set.id}
                        initialPublished={set.is_published}
                      />
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
