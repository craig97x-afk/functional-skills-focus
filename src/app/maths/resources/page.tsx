import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";

export default async function MathsResourcesPage() {
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
          Resources
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Revision resources
        </h1>
        <p className="apple-subtle">
          Work sheets, study tips, and revision packs designed to boost exam
          confidence.
        </p>
      </div>

      <section className="apple-card p-6 space-y-3">
        <div className="text-lg font-semibold">Find the right resource</div>
        <ul className="apple-subtle list-disc list-inside space-y-2">
          <li>Guides and worksheets live in the Guides library.</li>
          <li>Subscribers access everything. Non-subscribers can purchase items.</li>
          <li>Admins can upload new resources from Admin → Guides.</li>
        </ul>
        <div className="flex gap-3 flex-wrap mt-3">
          <Link className="apple-pill" href="/guides">
            Go to Guides
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
