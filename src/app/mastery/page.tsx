import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type AttemptRow = {
  is_correct: boolean;
  created_at: string;
  questions: {
    topics: {
      id: string;
      title: string;
      levels: { code: string } | null;
    } | null;
  } | null;
};

export default async function MasteryPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("attempts")
    .select(
      `
      is_correct,
      created_at,
      questions (
        topics (
          id,
          title,
          levels ( code )
        )
      )
    `
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Mastery</h1>
        <p className="mt-3 text-sm text-red-600">{error.message}</p>
      </main>
    );
  }

  const attempts = (rows ?? []) as any as AttemptRow[];

  // Group attempts by topic (newest first)
  const byTopic = new Map<string, { title: string; level: string; attempts: AttemptRow[] }>();

  for (const a of attempts) {
    const topic = a.questions?.topics;
    if (!topic?.id) continue;

    const key = topic.id;
    const entry =
      byTopic.get(key) ??
      {
        title: topic.title ?? "Untitled",
        level: topic.levels?.code ?? "",
        attempts: [],
      };

    entry.attempts.push(a);
    byTopic.set(key, entry);
  }

  const masteryRows = Array.from(byTopic.entries()).map(([topicId, entry]) => {
    const lastN = entry.attempts.slice(0, 10);
    const total = lastN.length;
    const correct = lastN.filter((x) => x.is_correct).length;
    const mastery = total ? Math.round((correct / total) * 100) : 0;

    return {
      topicId,
      title: entry.title,
      level: entry.level,
      mastery,
      lastN: total,
      totalAttempts: entry.attempts.length,
    };
  });

  masteryRows.sort((a, b) => {
    // lowest mastery first, tie-break by fewer attempts
    if (a.mastery !== b.mastery) return a.mastery - b.mastery;
    return a.totalAttempts - b.totalAttempts;
  });

  const recommended =
    masteryRows.find((t) => t.totalAttempts >= 5) ??
    masteryRows[0] ??
    null;

  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mastery</h1>
        <p className="text-sm text-gray-500">
          Calculated from your last 10 attempts per topic.
        </p>
      </div>

      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="font-semibold">Recommended next</h2>

        {!recommended ? (
          <p className="text-sm text-gray-500">No attempts yet. Go practice a topic.</p>
        ) : (
          <div className="rounded-md border p-3 flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">
                {recommended.level ? `[${recommended.level}] ` : ""}{recommended.title}
              </div>
              <div className="text-xs text-gray-500">
                Mastery: {recommended.mastery}% · Attempts: {recommended.totalAttempts}
              </div>
            </div>
            <Link
              href={`/practice/${recommended.topicId}`}
              className="rounded-md border px-3 py-2"
            >
              Practice
            </Link>
          </div>
        )}
      </section>

      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="font-semibold">All topics</h2>

        {masteryRows.length === 0 ? (
          <p className="text-sm text-gray-500">Nothing to show yet.</p>
        ) : (
          <div className="space-y-2">
            {masteryRows.map((t) => (
              <div key={t.topicId} className="rounded-md border p-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">
                    {t.level ? `[${t.level}] ` : ""}{t.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    Mastery: {t.mastery}% · Last {t.lastN} attempts · Total attempts: {t.totalAttempts}
                  </div>
                </div>
                <Link href={`/practice/${t.topicId}`} className="rounded-md border px-3 py-2">
                  Practice
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2">
          <Link href="/progress" className="inline-block rounded-md border px-3 py-2 mr-2">
            Progress
          </Link>
          <Link href="/maths" className="inline-block rounded-md border px-3 py-2">
            Maths
          </Link>
        </div>
      </section>
    </main>
  );
}
