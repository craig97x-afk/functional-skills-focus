import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function MathsPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();
  const { data: levels } = await supabase.from("levels").select("*").order("sort_order");

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Maths</h1>
      <p className="text-sm text-gray-500">Choose your level</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        {(levels ?? []).map((l) => (
          <Link
            key={l.id}
            href={`/maths/${l.code}`}
            className="rounded-lg border p-4 hover:bg-gray-50"
          >
            <div className="font-semibold">{l.code}</div>
            <div className="text-sm text-gray-500">Maths</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
