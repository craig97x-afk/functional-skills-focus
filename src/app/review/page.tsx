import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

type AttemptRow = {
  question_id: string;
  created_at: string;
};

type QuestionRow = {
  id: string;
  prompt: string;
  topic_id: string;
};

type TopicRow = {
  id: string;
  title: string;
};

export default async function ReviewMistakesPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  const profile = session.profile;
  const hasAccess = Boolean(
    profile?.role === "admin" || profile?.is_subscribed || profile?.access_override
  );

  if (!hasAccess) redirect("/pricing");

  const supabase = await createClient();

  const { data: attemptsRaw } = await supabase
    .from("practice_attempts")
    .select("question_id, created_at")
    .eq("user_id", session.user.id)
    .eq("is_correct", false)
    .order("created_at", { ascending: false })
    .limit(50);

  const attempts = (attemptsRaw ?? []) as AttemptRow[];
  const questionIds = Array.from(new Set(attempts.map((a) => a.question_id)));

  const { data: questionsRaw } =
    questionIds.length > 0
      ? await supabase
          .from("questions")
          .select("id, prompt, topic_id")
          .in("id", questionIds)
      : { data: [] as any[] };

  const questions = (questionsRaw ?? []) as QuestionRow[];
  const topicIds = Array.from(new Set(questions.map((q) => q.topic_id)));

  const { data: topicsRaw } =
    topicIds.length > 0
      ? await supabase.from("topics").select("id, title").in("id", topicIds)
      : { data: [] as any[] };

  const topics = (topicsRaw ?? []) as TopicRow[];

  const qMap = new Map(questions.map((q) => [q.id, q]));
  const tMap = new Map(topics.map((t) => [t.id, t]));

  return (
    <main className="space-y-8">
      <div className="space-y-3">
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Review
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Review mistakes
        </h1>
        <p className="apple-subtle">
          Revisit the questions you recently got wrong and practise those topics.
        </p>
      </div>

      <section className="apple-card p-6 space-y-4">
        {attempts.length === 0 && (
          <div className="text-sm text-[color:var(--muted-foreground)]">
            No incorrect attempts yet. Keep practising!
          </div>
        )}

        {attempts.map((a) => {
          const q = qMap.get(a.question_id);
          if (!q) return null;
          const topic = tMap.get(q.topic_id);
          const when = new Date(a.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          });

          return (
            <div key={`${a.question_id}-${a.created_at}`} className="border-b last:border-b-0 pb-4 last:pb-0">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                {topic?.title ?? "Topic"} · {when}
              </div>
              <div className="font-medium mt-2">{q.prompt}</div>
              <div className="mt-3">
                <Link className="apple-pill" href={`/practice/${q.topic_id}`}>
                  Practise this topic
                </Link>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
