import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import StudyPlanManager from "./study-plan-manager";

export default async function StudyPlanPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: itemsRaw } = await supabase
    .from("study_plan_items")
    .select("id, title, target_date, completed")
    .eq("user_id", session.user.id)
    .order("target_date", { ascending: true })
    .order("created_at", { ascending: false });

  const items = (itemsRaw ?? []) as {
    id: string;
    title: string;
    target_date: string | null;
    completed: boolean;
  }[];

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;

  return (
    <main className="space-y-8 max-w-3xl">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Study plan
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">
          Weekly plan and goals
        </h1>
        <p className="apple-subtle mt-2">
          Create a focused plan for the week and tick off each goal as you go.
        </p>
      </div>

      <section className="apple-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm text-[color:var(--muted-foreground)]">
            Completion
          </div>
          <div className="text-2xl font-semibold">
            {completedCount}/{totalCount}
          </div>
          <div className="apple-subtle">
            {totalCount === 0
              ? "Add your first plan item to get started."
              : "Keep the momentum going."}
          </div>
        </div>
        <div className="w-40">
          <div className="h-2 w-full rounded bg-[color:var(--surface-muted)]">
            <div
              className="h-2 rounded bg-[color:var(--accent)]"
              style={{
                width:
                  totalCount === 0
                    ? "0%"
                    : `${Math.round((completedCount / totalCount) * 100)}%`,
              }}
            />
          </div>
        </div>
      </section>

      <section className="apple-card p-6">
        <StudyPlanManager initialItems={items} />
      </section>
    </main>
  );
}
