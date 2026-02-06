import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";

const levels = [
  { slug: "entry-1", label: "Entry Level 1", status: "Coming soon" },
  { slug: "entry-2", label: "Entry Level 2", status: "Coming soon" },
  { slug: "entry-3", label: "Entry Level 3", status: "Available" },
  { slug: "fs-1", label: "Functional Skills Level 1", status: "Available" },
  { slug: "fs-2", label: "Functional Skills Level 2", status: "Available" },
];

export default async function MathsLevelsPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  return (
    <main className="space-y-8">
      <div className="space-y-3">
        <Link className="apple-subtle inline-flex" href="/maths">
          ← Maths hub
        </Link>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Maths levels
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Choose your level</h1>
        <p className="apple-subtle">
          Levels are organised into topic categories so you can find the right material quickly.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map((level) => (
          <Link
            key={level.slug}
            href={`/maths/levels/${level.slug}`}
            className="apple-card p-5 hover:shadow-md transition"
          >
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Level</div>
            <div className="text-lg font-semibold mt-2">{level.label}</div>
            <div className="apple-subtle mt-2">Maths learning topics</div>
            <div className="mt-3 inline-flex rounded-full border px-3 py-1 text-xs text-[color:var(--muted-foreground)]">
              {level.status}
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
