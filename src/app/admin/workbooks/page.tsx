import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import WorkbookForm from "./workbook-form";
import WorkbookRowActions from "./workbook-row-actions";

type Workbook = {
  id: string;
  subject: string;
  level_slug: string;
  category: string | null;
  topic: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  file_url: string | null;
  is_published: boolean;
};

export default async function AdminWorkbooksPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: workbooks } = (await supabase
    .from("workbooks")
    .select(
      "id, subject, level_slug, category, topic, title, description, thumbnail_url, file_url, is_published"
    )
    .order("created_at", { ascending: false })) as { data: Workbook[] | null };

  return (
    <main className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Worksheets
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">
          Manage Worksheets
        </h1>
        <p className="apple-subtle mt-2">
          Upload worksheet files, thumbnails, and publish them into the level tabs.
        </p>
      </div>

      <section className="apple-card p-6">
        <h2 className="font-semibold mb-4">Create a worksheet</h2>
        <WorkbookForm />
      </section>

      <section className="apple-card p-6">
        <h2 className="font-semibold mb-4">Existing worksheets</h2>
        <div className="space-y-3">
          {(workbooks ?? []).map((workbook) => (
            <div key={workbook.id} className="apple-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-24 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] overflow-hidden">
                    {workbook.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={workbook.thumbnail_url}
                        alt={workbook.title}
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
                      {workbook.subject} · {workbook.level_slug}
                    </div>
                    <div className="font-medium mt-1">{workbook.title}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {workbook.category ?? "Category"} · {workbook.topic}
                    </div>
                    {workbook.description && (
                      <div className="text-sm text-slate-500 mt-2">
                        {workbook.description}
                      </div>
                    )}
                    {workbook.file_url && (
                      <a
                        className="text-xs text-[color:var(--accent)] mt-2 inline-block"
                        href={workbook.file_url}
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
                    {workbook.is_published ? "Published" : "Draft"}
                  </div>
                  <WorkbookRowActions
                    workbookId={workbook.id}
                    initialPublished={workbook.is_published}
                  />
                </div>
              </div>
            </div>
          ))}

          {(!workbooks || workbooks.length === 0) && (
            <div className="text-sm text-slate-500">
              No worksheets yet. Add your first one above.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
