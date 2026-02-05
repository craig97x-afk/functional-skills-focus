import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

export default async function TopicLessonsPage({
  params,
}: {
  params: { level: string; topicId: string };
}) {
  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: topic } = await supabase
    .from("topics")
    .select("title")
    .eq("id", params.topicId)
    .single();

  if (!topic) redirect(`/maths/${params.level}`);

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, sort_order")
    .eq("topic_id", params.topicId)
    .eq("published", true)
    .order("sort_order");

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{topic.title}</h1>
      <a
        href={`/practice/${params.topicId}`}
        className="inline-block rounded-md border px-3 py-2"
      >
        Practice questions
      </a>

      <div className="space-y-2">
        {(lessons ?? []).map((l) => (
          <a
            key={l.id}
            href={`/maths/${params.level}/${params.topicId}/${l.id}`}
            className="block rounded-md border p-3 hover:bg-gray-50"
          >
            {l.title}
          </a>
        ))}

        {(!lessons || lessons.length === 0) && (
          <p className="text-sm text-gray-500">No lessons published yet.</p>
        )}
      </div>
    </main>
  );
}
