import Link from "next/link";
import { getUser } from "@/lib/auth/get-user";

export default async function EnglishPage() {
  const session = await getUser();

  return (
    <main className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          English
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">
          Functional Skills English
        </h1>
        <p className="apple-subtle mt-2">
          English content is coming next. This space is ready for reading,
          writing, and communication skills.
        </p>
      </div>

      <section className="apple-card p-6 space-y-3">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
          What’s planned
        </div>
        <ul className="apple-subtle space-y-2 list-disc list-inside">
          <li>Reading comprehension guides</li>
          <li>Grammar and punctuation practice</li>
          <li>Writing tasks with feedback prompts</li>
        </ul>
        {session ? (
          <Link className="apple-pill inline-flex mt-2" href="/account">
            Get notified when English launches
          </Link>
        ) : (
          <Link className="apple-pill inline-flex mt-2" href="/login">
            Log in for launch updates
          </Link>
        )}
      </section>
    </main>
  );
}
