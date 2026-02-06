"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export type StudyPlanItem = {
  id: string;
  title: string;
  target_date: string | null;
  completed: boolean;
};

type Props = {
  initialItems: StudyPlanItem[];
};

function sortItems(items: StudyPlanItem[]) {
  return [...items].sort((a, b) => {
    const aDate = a.target_date ? new Date(a.target_date).getTime() : Infinity;
    const bDate = b.target_date ? new Date(b.target_date).getTime() : Infinity;
    if (aDate !== bDate) return aDate - bDate;
    return a.title.localeCompare(b.title);
  });
}

export default function StudyPlanManager({ initialItems }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<StudyPlanItem[]>(() => sortItems(initialItems));
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage(null);

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      setStatus("error");
      setMessage("Please sign in again.");
      return;
    }

    const { data, error } = await supabase
      .from("study_plan_items")
      .insert({
        user_id: authData.user.id,
        title: title.trim(),
        target_date: targetDate || null,
        completed: false,
        updated_at: new Date().toISOString(),
      })
      .select("id, title, target_date, completed")
      .single();

    if (error || !data) {
      setStatus("error");
      setMessage(error?.message ?? "Failed to add item.");
      return;
    }

    setItems((prev) => sortItems([...prev, data as StudyPlanItem]));
    setTitle("");
    setTargetDate("");
    setStatus("saved");
    setMessage("Plan item added.");
  }

  async function toggleComplete(item: StudyPlanItem) {
    setStatus("saving");
    setMessage(null);

    const { error } = await supabase
      .from("study_plan_items")
      .update({
        completed: !item.completed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setItems((prev) =>
      sortItems(
        prev.map((row) =>
          row.id === item.id ? { ...row, completed: !row.completed } : row
        )
      )
    );
    setStatus("saved");
    setMessage("Plan updated.");
  }

  async function updateItem(item: StudyPlanItem) {
    setStatus("saving");
    setMessage(null);

    const { error } = await supabase
      .from("study_plan_items")
      .update({
        title: item.title.trim(),
        target_date: item.target_date || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setItems((prev) => sortItems(prev.map((row) => (row.id === item.id ? item : row))));
    setStatus("saved");
    setMessage("Plan updated.");
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this plan item?")) return;
    setStatus("saving");
    setMessage(null);

    const { error } = await supabase
      .from("study_plan_items")
      .delete()
      .eq("id", id);

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setItems((prev) => prev.filter((row) => row.id !== id));
    setStatus("saved");
    setMessage("Plan item removed.");
  }

  return (
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={addItem}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            Goal or task
            <input
              className="apple-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Complete Fractions lesson"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Target date (optional)
            <input
              className="apple-input"
              type="date"
              value={targetDate}
              onChange={(event) => setTargetDate(event.target.value)}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="apple-button"
            type="submit"
            disabled={!title.trim() || status === "saving"}
          >
            {status === "saving" ? "Saving..." : "Add plan item"}
          </button>
          {message && (
            <span
              className={
                status === "error"
                  ? "text-sm text-red-500"
                  : "text-sm text-emerald-600"
              }
            >
              {message}
            </span>
          )}
        </div>
      </form>

      <div className="space-y-3">
        <div className="text-sm font-semibold">Your plan</div>
        {items.length === 0 ? (
          <p className="text-sm text-[color:var(--muted-foreground)]">
            Add your first goal to begin building a study plan.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleComplete(item)}
                      className="h-4 w-4 rounded border border-[color:var(--border)]"
                    />
                    <span className={item.completed ? "line-through opacity-60" : ""}>
                      {item.title}
                    </span>
                  </label>
                  <div className="text-xs text-[color:var(--muted-foreground)]">
                    {item.target_date ? `Target: ${item.target_date}` : "No date"}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm">
                    Title
                    <input
                      className="apple-input"
                      value={item.title}
                      onChange={(event) =>
                        setItems((prev) =>
                          prev.map((row) =>
                            row.id === item.id
                              ? { ...row, title: event.target.value }
                              : row
                          )
                        )
                      }
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    Target date
                    <input
                      className="apple-input"
                      type="date"
                      value={item.target_date ?? ""}
                      onChange={(event) =>
                        setItems((prev) =>
                          prev.map((row) =>
                            row.id === item.id
                              ? { ...row, target_date: event.target.value || null }
                              : row
                          )
                        )
                      }
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    className="apple-pill"
                    type="button"
                    onClick={() => updateItem(item)}
                    disabled={status === "saving"}
                  >
                    Save
                  </button>
                  <button
                    className="apple-pill border-red-200/60 text-red-600"
                    type="button"
                    onClick={() => deleteItem(item.id)}
                    disabled={status === "saving"}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
