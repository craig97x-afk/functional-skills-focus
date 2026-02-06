import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function MathsLearnPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();
  const { data: levels } = await supabase.from("levels").select("*").order("sort_order");

  return (
    <main className="space-y-8">
      <div className="space-y-3">
        <Link className="apple-subtle inline-flex" href="/maths">
          ← Maths hub
        </Link>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Maths learning
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Choose your level
        </h1>
        <p className="apple-subtle">
          Start with lessons and revision material at the right level for you.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(levels ?? []).map((level) => (
          <Link
            key={level.id}
            href={`/maths/${level.code}`}
            className="apple-card p-5 hover:shadow-md transition"
          >
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Level
            </div>
            <div className="text-lg font-semibold mt-2">{level.code}</div>
            <div className="apple-subtle mt-2">Maths lessons</div>
          </Link>
        ))}
        {(!levels || levels.length === 0) && (
          <div className="text-sm text-slate-500">No levels available yet.</div>
        )}
      </div>
    </main>
  );
}
