import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import TopicForm from "./topic-form";

export default async function AdminTopicsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: subjects } = await supabase.from("subjects").select("*").order("title");
  const { data: levels } = await supabase.from("levels").select("*").order("sort_order");
  const { data: topics } = await supabase
    .from("topics")
    .select("id, title, description, sort_order, level:level_id(code), subject:subject_id(slug)")
    .order("sort_order");

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manage Topics</h1>

      <section className="rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Create a new topic</h2>
        <TopicForm subjects={subjects ?? []} levels={levels ?? []} />
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Existing topics</h2>
        <div className="space-y-2">
          {(topics ?? []).map((t: any) => (
            <div key={t.id} className="flex items-start justify-between rounded-md border p-3">
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-xs text-gray-500">
                  Level: {t.level?.code ?? "?"} · Subject: {t.subject?.slug ?? "?"} · Order: {t.sort_order}
                </div>
                {t.description ? <div className="text-sm mt-1">{t.description}</div> : null}
              </div>
            </div>
          ))}
          {(!topics || topics.length === 0) && (
            <div className="text-sm text-gray-500">No topics yet. Create your first one above.</div>
          )}
        </div>
      </section>
    </main>
  );
}
