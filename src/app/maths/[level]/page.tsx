import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function MathsLevelPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level: levelCode } = await params;

  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: level } = await supabase
    .from("levels")
    .select("*")
    .eq("code", levelCode)
    .single();

  if (!level) redirect("/maths");

  const { data: topics } = await supabase
    .from("topics")
    .select("id, title, description, sort_order")
    .eq("level_id", level.id)
    .order("sort_order");

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Maths – {level.code}</h1>

      <div className="space-y-3">
        {(topics ?? []).map((t) => (
          <Link
            key={t.id}
            href={`/maths/${level.code}/${t.id}`}
            className="block rounded-lg border p-4 hover:bg-gray-50"
          >
            <div className="font-semibold">{t.title}</div>
            {t.description && <div className="text-sm text-gray-500 mt-1">{t.description}</div>}
          </Link>
        ))}

        {(!topics || topics.length === 0) && <p className="text-sm text-gray-500">No topics yet.</p>}
      </div>
    </main>
  );
}
