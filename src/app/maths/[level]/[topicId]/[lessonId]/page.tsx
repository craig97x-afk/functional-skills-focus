import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";

type LessonRow = {
  title: string;
  body: string | null;
  published: boolean;
};

export default async function LessonPage({
  params,
}: {
  params: { level: string; topicId: string; lessonId: string };
}) {
  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: lesson } = (await supabase
    .from("lessons")
    .select("title, body, published")
    .eq("id", params.lessonId)
    .single()) as { data: LessonRow | null };

  if (!lesson || !lesson.published) {
    redirect(`/maths/${params.level}/${params.topicId}`);
  }

  return (
    <main className="p-6 space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">{lesson.title}</h1>

      <article className="prose max-w-none">
        {lesson.body ? (
          lesson.body.split("\n").map((p: string, i: number) =>
            p.trim().length ? <p key={i}>{p}</p> : null
          )
        ) : (
          <p>No content yet.</p>
        )}
      </article>
    </main>
  );
}
