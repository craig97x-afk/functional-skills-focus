import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import WorkbookForm from "./workbook-form";
import WorksheetBulkTable from "@/components/admin/worksheet-bulk-table";

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
  is_featured: boolean;
  sort_order: number | null;
};

export default async function AdminWorkbooksPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: workbooks } = (await supabase
    .from("workbooks")
    .select(
      "id, subject, level_slug, category, topic, title, description, thumbnail_url, file_url, is_published, is_featured, sort_order"
    )
    .order("subject", { ascending: true })
    .order("level_slug", { ascending: true })
    .order("topic", { ascending: true })
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true, nullsFirst: false })
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
        <WorksheetBulkTable initialWorkbooks={workbooks ?? []} />
      </section>
    </main>
  );
}
