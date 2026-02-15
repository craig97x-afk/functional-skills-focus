import Link from "next/link";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import WorkbookForm from "@/app/admin/workbooks/workbook-form";
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

type Worksheet = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  topic: string;
  thumbnail_url: string | null;
  file_url: string | null;
  is_published: boolean;
};

export default async function EnglishLevelDetailPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;
  const session = await getUser();
  const isAdmin = session?.profile?.role === "admin";
  const supabase = await createClient();
  const { data: worksheetsRaw } = isAdmin
    ? ((await supabase
        .from("workbooks")
        .select(
          "id, title, description, category, topic, thumbnail_url, file_url, is_published"
        )
        .eq("subject", "english")
        .eq("level_slug", level)
        .order("created_at", { ascending: false })) as { data: Worksheet[] | null })
    : { data: [] as Worksheet[] };
  const worksheets = worksheetsRaw ?? [];
  const title = levelLabels[level] ?? "English Level";
  return (
    <main className="space-y-8">
      <div className="space-y-3">
        <Link className="apple-subtle inline-flex" href="/english/levels">
          ← Back to levels
        </Link>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">English</div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="apple-subtle">
          English content is being built. This level will include reading, writing, and
          communication tasks.
        </p>
      </div>

      {isAdmin && (
        <section className="apple-card p-6 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Admin</div>
            <h2 className="text-xl font-semibold mt-2">Manage worksheets & resources</h2>
            <p className="apple-subtle mt-2">
              Add worksheets, exam mocks, and question sets for this level.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <details className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
              <summary className="cursor-pointer text-sm font-semibold">
                Add a worksheet
              </summary>
              <div className="mt-4">
                <WorkbookForm
                  defaultSubject="english"
                  defaultLevel={level}
                  lockSubjectLevel
                />
              </div>
            </details>
            <details className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
              <summary className="cursor-pointer text-sm font-semibold">
                Add resources
              </summary>
              <div className="mt-4 space-y-6">
                <div>
                  <div className="text-sm font-semibold mb-2">Exam mock</div>
                  <ExamMockForm
                    defaultSubject="english"
                    defaultLevel={level}
                    lockSubjectLevel
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2">Question set</div>
                  <QuestionSetForm
                    defaultSubject="english"
                    defaultLevel={level}
                    lockSubjectLevel
                  />
                </div>
              </div>
            </details>
          </div>
          <div className="space-y-3">
            <div className="text-sm font-semibold">Existing worksheets</div>
            {worksheets.length === 0 ? (
              <div className="text-sm text-[color:var(--muted-foreground)]">
                No worksheets yet for this level.
              </div>
            ) : (
              <div className="grid gap-3">
                {worksheets.map((worksheet) => (
                  <div
                    key={worksheet.id}
                    className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 flex flex-wrap items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-24 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] overflow-hidden">
                        {worksheet.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={worksheet.thumbnail_url}
                            alt={worksheet.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] uppercase tracking-[0.2em] text-slate-400">
                            Worksheet
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{worksheet.title}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {worksheet.category ?? "Category"} · {worksheet.topic}
                        </div>
                        {worksheet.description && (
                          <div className="text-sm text-slate-500 mt-2">
                            {worksheet.description}
                          </div>
                        )}
                        {worksheet.file_url && (
                          <a
                            className="text-xs text-[color:var(--accent)] mt-2 inline-block"
                            href={worksheet.file_url}
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
                        {worksheet.is_published ? "Published" : "Draft"}
                      </div>
                      <AdminRowActions
                        table="workbooks"
                        id={worksheet.id}
                        initialPublished={worksheet.is_published}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="apple-card p-6 space-y-3">
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Coming soon</div>
        <h2 className="text-xl font-semibold">Materials in production</h2>
        <p className="apple-subtle">
          We’re preparing guided lessons, revision notes, and practice prompts for this level.
        </p>
      </section>
    </main>
  );
}
