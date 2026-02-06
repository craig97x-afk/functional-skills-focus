import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import FlashcardsManager from "./flashcards-manager";

export default async function FlashcardsPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: cardsRaw } = await supabase
    .from("flashcards")
    .select("id, front, back, tags, show_on_dashboard")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  const cards = (cardsRaw ?? []) as {
    id: string;
    front: string;
    back: string;
    tags: string | null;
    show_on_dashboard: boolean;
  }[];

  return (
    <main className="space-y-8 max-w-4xl">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Flashcards
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">
          Revision cards
        </h1>
        <p className="apple-subtle mt-2">
          Create quick recall cards for definitions, formulas, and key facts.
        </p>
      </div>

      <section className="apple-card p-6">
        <FlashcardsManager initialCards={cards} />
      </section>
    </main>
  );
}
