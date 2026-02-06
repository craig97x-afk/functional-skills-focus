import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function MathsLevelPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level: levelCode } = await params;

  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: level } = await supabase
    .from("levels")
    .select("*")
    .eq("code", levelCode)
    .single();

  if (!level) redirect("/maths/learn");

  const { data: topics } = await supabase
    .from("topics")
    .select("id, title, description, sort_order")
    .eq("level_id", level.id)
    .order("sort_order");

  return (
    <main className="space-y-8">
      <div className="space-y-3">
        <Link className="apple-subtle inline-flex" href="/maths/learn">
          ← Maths learning
        </Link>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Level {level.code}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Maths topics</h1>
        <p className="apple-subtle">
          Choose a topic to view lessons, examples, and revision material.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(topics ?? []).map((t) => (
          <Link
            key={t.id}
            href={`/maths/${level.code}/${t.id}`}
            className="apple-card p-5 hover:shadow-md transition"
          >
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Topic
            </div>
            <div className="font-semibold mt-2">{t.title}</div>
            {t.description && <div className="apple-subtle mt-2">{t.description}</div>}
          </Link>
        ))}

        {(!topics || topics.length === 0) && (
          <p className="text-sm text-slate-500">No topics yet.</p>
        )}
      </div>
    </main>
  );
}
