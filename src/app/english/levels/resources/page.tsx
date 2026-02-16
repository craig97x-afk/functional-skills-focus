import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const levels = [
  { slug: "entry-1", label: "Entry Level 1" },
  { slug: "entry-2", label: "Entry Level 2" },
  { slug: "entry-3", label: "Entry Level 3" },
  { slug: "fs-1", label: "Functional Skills Level 1" },
  { slug: "fs-2", label: "Functional Skills Level 2" },
];

export default async function EnglishResourcesLevelsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };
  const isAdmin = profile?.role === "admin";

  return (
    <main className="space-y-8">
      <div className="space-y-3">
        <Link className="apple-subtle inline-flex" href="/english">
          ← English hub
        </Link>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          English resources
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Resources by level
        </h1>
        <p className="apple-subtle">
          Exam mocks, reading packs, and question resources organised by level.
        </p>
        {isAdmin && (
          <Link
            className="inline-flex rounded-full border px-4 py-2 text-xs transition border-[color:var(--accent)] bg-[color:var(--accent)] text-white hover:text-white"
            href="/admin/questions"
          >
            Manage resources
          </Link>
        )}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map((level) => (
          <Link
            key={level.slug}
            href={`/english/levels/${level.slug}/resources`}
            className="apple-card p-5 hover:shadow-md transition"
          >
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Level</div>
            <div className="text-lg font-semibold mt-2">{level.label}</div>
            <div className="apple-subtle mt-2">Exam mocks and question banks</div>
          </Link>
        ))}
      </section>
    </main>
  );
}
