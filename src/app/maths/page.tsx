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

  const topics = [
    {
      title: "Number and Place Value",
      description:
        "Resources and activities that build confidence with numbers, digit value, and ordering.",
      imageTitle: "Place Value",
      href: "/maths/levels",
      imageClass: "from-[#0b2a4a] via-[#12355f] to-[#1f4c7e]",
    },
    {
      title: "Addition and Subtraction",
      description:
        "Guided practice, worked examples, and fluency packs for all key strategies.",
      imageTitle: "Addition and Subtraction",
      href: "/maths/levels",
      imageClass: "from-[#0b2a4a] via-[#1a3f6e] to-[#2b5a95]",
    },
    {
      title: "Multiplication and Division",
      description:
        "Times tables, division facts, and short methods with clear step-by-step visuals.",
      imageTitle: "Multiplication and Division",
      href: "/maths/levels",
      imageClass: "from-[#0b2a4a] via-[#163862] to-[#254f85]",
    },
    {
      title: "Fractions and Decimals",
      description:
        "Equivalents, conversions, and real-world examples to strengthen fraction sense.",
      imageTitle: "Fractions and Decimals",
      href: "/maths/levels",
      imageClass: "from-[#0b2a4a] via-[#1b3f6a] to-[#2f5d94]",
    },
    {
      title: "Measures, Shape and Space",
      description:
        "Length, area, perimeter, time, and geometry packs with diagrams and practice.",
      imageTitle: "Measures and Shape",
      href: "/maths/levels",
      imageClass: "from-[#0b2a4a] via-[#14355f] to-[#214a7b]",
    },
    {
      title: "Handling Data",
      description:
        "Charts, tables, and data interpretation tasks for real-world problem solving.",
      imageTitle: "Data and Graphs",
      href: "/maths/levels",
      imageClass: "from-[#0b2a4a] via-[#193e69] to-[#2b5a8d]",
    },
  ];

  return (
    <main className="space-y-10">
      <section className="space-y-4 max-w-4xl">
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Maths
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Functional Skills Maths Resource Library
        </h1>
        <p className="apple-subtle">
          Find everything you need to teach, revise, and practise across the
          Functional Skills Maths curriculum.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link className="apple-button" href="/maths/levels">
            Browse levels
          </Link>
          <Link className="apple-pill" href="/contact">
            Request a resource
          </Link>
          <div className="apple-pill inline-flex">
            {hasAccess ? "Full access" : "Learning access"}
          </div>
        </div>
      </section>

      <section className="space-y-8">
        {topics.map((topic) => (
          <article key={topic.title} className="apple-card p-6 lg:p-8">
            <div className="grid gap-6 lg:grid-cols-[380px_1fr] items-center">
              <div
                className={`relative h-56 w-full rounded-2xl border border-white/20 overflow-hidden bg-gradient-to-br ${topic.imageClass}`}
              >
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_40%)]" />
                <div className="relative h-full w-full flex flex-col items-start justify-end p-6 text-white">
                  <div className="text-xs uppercase tracking-[0.28em] opacity-80">
                    Topic
                  </div>
                  <div className="text-2xl sm:text-3xl font-semibold leading-tight">
                    {topic.imageTitle}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">{topic.title}</h2>
                <p className="apple-subtle">{topic.description}</p>
                <Link className="apple-button inline-flex" href={topic.href}>
                  Go to resources
                </Link>
              </div>
            </div>
          </article>
        ))}
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
