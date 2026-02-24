import Link from "next/link";
import { getExamBoardsForLevel } from "@/lib/exam-boards";

export const dynamic = "force-dynamic";

const levelLabels: Record<string, string> = {
  "entry-1": "Entry Level 1",
  "entry-2": "Entry Level 2",
  "entry-3": "Entry Level 3",
  "fs-1": "Functional Skills Level 1",
  "fs-2": "Functional Skills Level 2",
};

export default async function EnglishExamBoardPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;
  const label = levelLabels[level] ?? "Level";
  const boards = getExamBoardsForLevel("english", level);
  const basePath = `/english/levels/${level}`;

  return (
    <main className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link className="apple-subtle inline-flex" href="/english/levels/resources">
            ← Back to levels
          </Link>
          <span className="text-slate-400">/</span>
          <Link className="apple-subtle inline-flex" href={basePath}>
            {label}
          </Link>
        </div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">English</div>
        <h1 className="text-3xl font-semibold tracking-tight">{label} exam boards</h1>
        <p className="apple-subtle">
          Choose the exam board to see resources for this level.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href={`${basePath}/resources`}
          className="apple-card p-5 hover:shadow-md transition"
        >
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">All boards</div>
          <div className="text-lg font-semibold mt-2">All boards</div>
          <div className="apple-subtle mt-2">See all resources for this level.</div>
        </Link>

        {boards.map((board) => (
          <Link
            key={board.slug}
            href={`${basePath}/resources?board=${board.slug}`}
            className="apple-card p-5 hover:shadow-md transition"
          >
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Exam board</div>
            <div className="text-lg font-semibold mt-2">{board.name}</div>
            <div className="apple-subtle mt-2">Resources for {label}.</div>
          </Link>
        ))}
      </section>
    </main>
  );
}
