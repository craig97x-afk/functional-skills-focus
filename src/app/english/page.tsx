import Link from "next/link";
import { getUser } from "@/lib/auth/get-user";

export default async function EnglishPage() {
  const session = await getUser();

  const topics = [
    {
      title: "Reading Comprehension",
      description:
        "Guided reading passages, retrieval tasks, and inference practice packs.",
      imageTitle: "Reading",
      href: "/english/levels",
      imageClass: "from-[#0b2a4a] via-[#143761] to-[#255185]",
    },
    {
      title: "Grammar and Punctuation",
      description:
        "Clear explanations with practice activities on grammar, spelling, and punctuation.",
      imageTitle: "Grammar",
      href: "/english/levels",
      imageClass: "from-[#0b2a4a] via-[#1b3d69] to-[#2d5b92]",
    },
    {
      title: "Writing Skills",
      description:
        "Planning tools, model answers, and structured writing support for assessments.",
      imageTitle: "Writing",
      href: "/english/levels",
      imageClass: "from-[#0b2a4a] via-[#17385f] to-[#244e83]",
    },
    {
      title: "Speaking and Listening",
      description:
        "Discussion prompts, presentation guidance, and communication checklists.",
      imageTitle: "Speaking",
      href: "/english/levels",
      imageClass: "from-[#0b2a4a] via-[#1a3c66] to-[#2a568c]",
    },
  ];

  return (
    <main className="space-y-10">
      <section className="space-y-4 max-w-4xl">
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          English
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Functional Skills English Resource Library
        </h1>
        <p className="apple-subtle">
          Explore reading, writing, and communication resources as they are
          released.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link className="apple-button" href="/english/levels">
            Browse levels
          </Link>
          <Link className="apple-pill" href="/contact">
            Request a resource
          </Link>
          {session ? (
            <span className="apple-pill inline-flex">You are on the list</span>
          ) : (
            <Link className="apple-pill inline-flex" href="/login">
              Log in for updates
            </Link>
          )}
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
    </main>
  );
}
