import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

type LevelRow = { id: string; code: string; sort_order: number | null };
type TopicRow = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number | null;
  level_id: string;
};

export default async function MathsPracticePage() {
  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: levels } = (await supabase
    .from("levels")
    .select("id, code, sort_order")
    .order("sort_order")) as { data: LevelRow[] | null };

  const { data: topics } = (await supabase
    .from("topics")
    .select("id, title, description, sort_order, level_id")
    .order("sort_order")) as { data: TopicRow[] | null };

  const profile = session.profile;
  const hasAccess = Boolean(
    profile?.role === "admin" || profile?.is_subscribed || profile?.access_override
  );

  const topicsByLevel = new Map<string, TopicRow[]>();
  (topics ?? []).forEach((topic) => {
    const arr = topicsByLevel.get(topic.level_id) ?? [];
    arr.push(topic);
    topicsByLevel.set(topic.level_id, arr);
  });

  return (
    <main className="space-y-8">
      <div className="space-y-3">
        <Link className="apple-subtle inline-flex" href="/maths">
          ← Maths hub
        </Link>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Practice
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Practice by topic
        </h1>
        <p className="apple-subtle">
          Choose a topic to start practise questions with instant feedback.
        </p>
      </div>

      {!hasAccess && (
        <section className="apple-card p-6">
          <div className="text-lg font-semibold">Practice is premium</div>
          <p className="apple-subtle mt-2">
            You can browse topics, but practising requires a subscription. You
            still have full access to the learning materials.
          </p>
          <Link className="apple-pill inline-flex mt-3" href="/pricing">
            Unlock practice
          </Link>
        </section>
      )}

      <div className="space-y-8">
        {(levels ?? []).map((level) => {
          const levelTopics = topicsByLevel.get(level.id) ?? [];
          return (
            <section key={level.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Level {level.code}
                  </div>
                  <div className="text-lg font-semibold mt-1">Maths topics</div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {levelTopics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={hasAccess ? `/practice/${topic.id}` : "/pricing"}
                    className="apple-card p-5 hover:shadow-md transition"
                  >
                    <div className="font-semibold">{topic.title}</div>
                    {topic.description && (
                      <p className="apple-subtle mt-2">{topic.description}</p>
                    )}
                    {!hasAccess && (
                      <div className="text-xs text-slate-500 mt-3">
                        Subscription required for practice
                      </div>
                    )}
                  </Link>
                ))}

                {levelTopics.length === 0 && (
                  <div className="text-sm text-slate-500">
                    No practice topics available yet.
                  </div>
                )}
              </div>
            </section>
          );
        })}

        {(!levels || levels.length === 0) && (
          <div className="text-sm text-slate-500">
            No levels available yet.
          </div>
        )}
      </div>
    </main>
  );
}
