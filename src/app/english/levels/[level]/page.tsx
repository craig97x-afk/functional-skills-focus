import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";

export const dynamic = "force-dynamic";

const levelLabels: Record<string, string> = {
  "entry-1": "Entry Level 1",
  "entry-2": "Entry Level 2",
  "entry-3": "Entry Level 3",
  "fs-1": "Functional Skills Level 1",
  "fs-2": "Functional Skills Level 2",
};

export default async function EnglishLevelDetailPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const session = await getUser();
  if (!session) redirect("/login");

  const { level } = await params;
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
