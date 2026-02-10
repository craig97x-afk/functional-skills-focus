import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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
};

type QuestionSet = {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  resource_url: string | null;
};

export default async function MathsLevelResourcesPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;
  const label = levelLabels[level] ?? "Level";
  const supabase = await createClient();

  const { data: mocksRaw } = (await supabase
    .from("exam_mocks")
    .select("id, title, description, cover_url, file_url")
    .eq("subject", "maths")
    .eq("level_slug", level)
    .eq("is_published", true)
    .order("created_at", { ascending: false })) as {
    data: ExamMock[] | null;
  };

  const { data: setsRaw } = (await supabase
    .from("question_sets")
    .select("id, title, description, cover_url, resource_url")
    .eq("subject", "maths")
    .eq("level_slug", level)
    .eq("is_published", true)
    .order("created_at", { ascending: false })) as {
    data: QuestionSet[] | null;
  };

  const mocks = mocksRaw ?? [];
  const sets = setsRaw ?? [];
  const basePath = `/maths/levels/${level}`;

  return (
    <main className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link className="apple-subtle inline-flex" href="/maths/levels">
            ← Back to levels
          </Link>
          <span className="text-slate-400">/</span>
          <Link className="apple-subtle inline-flex" href={basePath}>
            {label}
          </Link>
        </div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Maths</div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {label} resources
        </h1>
        <p className="apple-subtle">
          Exam mocks and question packs matched to this level. All mocks are free for now.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            className="rounded-full border px-4 py-2 text-sm transition border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]"
            href={basePath}
          >
            Workbooks
          </Link>
          <Link
            className="rounded-full border px-4 py-2 text-sm transition border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
            href={`${basePath}/resources`}
          >
            Resources
          </Link>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Exam mocks</div>
            <h2 className="text-2xl font-semibold mt-2">Practice papers</h2>
            <p className="apple-subtle mt-1">
              Printable exam papers and mock assessments aligned to this level.
            </p>
          </div>
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
                      File coming soon
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
            Short question packs that focus on one skill at a time.
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
                  {set.resource_url ? (
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
                      Resource coming soon
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
