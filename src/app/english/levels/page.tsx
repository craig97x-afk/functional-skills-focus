import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";

const levels = [
  { slug: "entry-1", label: "Entry Level 1" },
  { slug: "entry-2", label: "Entry Level 2" },
  { slug: "entry-3", label: "Entry Level 3" },
  { slug: "fs-1", label: "Functional Skills Level 1" },
  { slug: "fs-2", label: "Functional Skills Level 2" },
];

export default async function EnglishLevelsPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  return (
    <main className="space-y-8">
      <div className="space-y-3">
        <Link className="apple-subtle inline-flex" href="/english">
          ← English hub
        </Link>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          English levels
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">English levels</h1>
        <p className="apple-subtle">
          English content is being prepared. Choose a level to see what’s coming next.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map((level) => (
          <Link
            key={level.slug}
            href={`/english/levels/${level.slug}`}
            className="apple-card p-5 hover:shadow-md transition"
          >
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Level</div>
            <div className="text-lg font-semibold mt-2">{level.label}</div>
            <div className="apple-subtle mt-2">Coming soon</div>
          </Link>
        ))}
      </section>
    </main>
  );
}
