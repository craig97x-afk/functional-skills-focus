import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";

export default async function MathsHubPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  const profile = session.profile;
  const hasAccess = Boolean(
    profile?.role === "admin" || profile?.is_subscribed || profile?.access_override
  );

  return (
    <main className="space-y-10">
      <div className="max-w-3xl space-y-3">
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Maths
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Functional Skills Maths
        </h1>
        <p className="apple-subtle">
          Pick a pathway: learn the content, practise questions, or review mock
          materials.
        </p>
        <div className="apple-pill inline-flex">
          {hasAccess ? "Full access" : "Learning access"}
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <Link className="apple-card p-6 hover:shadow-md transition" href="/maths/learn">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Learn
          </div>
          <div className="text-lg font-semibold mt-2">Learning materials</div>
          <p className="apple-subtle mt-2">
            Lessons, examples, and topic explanations at each level.
          </p>
        </Link>

        <Link
          className="apple-card p-6 hover:shadow-md transition"
          href="/maths/practice"
        >
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Practice
          </div>
          <div className="text-lg font-semibold mt-2">Practice questions</div>
          <p className="apple-subtle mt-2">
            Drill topics with instant feedback and hints.
          </p>
        </Link>

        <Link className="apple-card p-6 hover:shadow-md transition" href="/maths/mocks">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Mocks
          </div>
          <div className="text-lg font-semibold mt-2">Exam mock papers</div>
          <p className="apple-subtle mt-2">
            Timed practice papers and exam-style tasks.
          </p>
        </Link>

        <Link
          className="apple-card p-6 hover:shadow-md transition"
          href="/maths/resources"
        >
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Resources
          </div>
          <div className="text-lg font-semibold mt-2">Study resources</div>
          <p className="apple-subtle mt-2">
            Revision guides, worksheets, and study tips.
          </p>
        </Link>
      </section>

      <section className="apple-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Progress
          </div>
          <div className="text-lg font-semibold mt-2">Track your mastery</div>
          <p className="apple-subtle mt-2">
            Review accuracy trends and mastery bands by topic.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {hasAccess ? (
            <>
              <Link className="apple-pill" href="/progress">
                View progress
              </Link>
              <Link className="apple-pill" href="/mastery">
                View mastery
              </Link>
            </>
          ) : (
            <Link className="apple-pill" href="/pricing">
              Unlock practice + progress
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
