import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";

export default async function MathsMocksPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  const profile = session.profile;
  const hasAccess = Boolean(
    profile?.role === "admin" || profile?.is_subscribed || profile?.access_override
  );

  return (
    <main className="space-y-8">
      <div className="space-y-3">
        <Link className="apple-subtle inline-flex" href="/maths">
          ← Maths hub
        </Link>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Exam mocks
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Mock papers and assessments
        </h1>
        <p className="apple-subtle">
          Download or open exam-style papers and practise under timed conditions.
        </p>
      </div>

      <section className="apple-card p-6 space-y-3">
        <div className="text-lg font-semibold">How mocks work</div>
        <ul className="apple-subtle list-disc list-inside space-y-2">
          <li>Mocks are delivered as guides and worksheets.</li>
          <li>Subscribers access them free. Non-subscribers can buy individually.</li>
          <li>Upload new mocks from Admin → Guides.</li>
        </ul>
        <div className="flex gap-3 flex-wrap mt-3">
          <Link className="apple-pill" href="/guides">
            Browse mocks
          </Link>
          {!hasAccess && (
            <Link className="apple-pill" href="/pricing">
              Unlock with subscription
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
