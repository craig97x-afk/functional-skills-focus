"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type ExamRow = {
  id: string;
  exam_name: string;
  exam_date: string;
  show_on_dashboard: boolean;
};

type Props = {
  initialExams: ExamRow[];
};

function sortByDate(rows: ExamRow[]) {
  return [...rows].sort((a, b) => {
    const aDate = new Date(`${a.exam_date}T00:00:00`).getTime();
    const bDate = new Date(`${b.exam_date}T00:00:00`).getTime();
    return aDate - bDate;
  });
}

export default function ExamCountdownManager({ initialExams }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [exams, setExams] = useState<ExamRow[]>(() => sortByDate(initialExams));
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [showOnDashboard, setShowOnDashboard] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function addExam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage(null);

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      setStatus("error");
      setMessage("Please sign in again to add an exam.");
      return;
    }

    const { data, error } = await supabase
      .from("user_exams")
      .insert({
        user_id: authData.user.id,
        exam_name: examName.trim(),
        exam_date: examDate,
        show_on_dashboard: showOnDashboard,
        updated_at: new Date().toISOString(),
      })
      .select("id, exam_name, exam_date, show_on_dashboard")
      .single();

    if (error || !data) {
      setStatus("error");
      setMessage(error?.message ?? "Failed to add exam.");
      return;
    }

    try {
      const { count } = await supabase
        .from("user_exams")
        .select("id", { count: "exact", head: true })
        .eq("user_id", authData.user.id);

      if (count === 1) {
        await supabase
          .from("user_achievements")
          .upsert(
            [
              {
                user_id: authData.user.id,
                achievement_id: "first_exam",
              },
            ],
            { onConflict: "user_id,achievement_id" }
          );
      }
    } catch {
      // Optional achievement tracking; ignore failures.
    }

    setExams((prev) => sortByDate([...prev, data as ExamRow]));
    setExamName("");
    setExamDate("");
    setShowOnDashboard(true);
    setStatus("saved");
    setMessage("Exam added.");
  }

  async function saveExam(updated: ExamRow) {
    setStatus("saving");
    setMessage(null);

    const { error } = await supabase
      .from("user_exams")
      .update({
        exam_name: updated.exam_name.trim(),
        exam_date: updated.exam_date,
        show_on_dashboard: updated.show_on_dashboard,
        updated_at: new Date().toISOString(),
      })
      .eq("id", updated.id);

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setExams((prev) =>
      sortByDate(prev.map((exam) => (exam.id === updated.id ? updated : exam)))
    );
    setStatus("saved");
    setMessage("Exam updated.");
  }

  async function deleteExam(id: string) {
    if (!confirm("Delete this exam countdown?")) return;
    setStatus("saving");
    setMessage(null);

    const { error } = await supabase.from("user_exams").delete().eq("id", id);

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setExams((prev) => prev.filter((exam) => exam.id !== id));
    setStatus("saved");
    setMessage("Exam removed.");
  }

  function updateExamState(id: string, patch: Partial<ExamRow>) {
    setExams((prev) =>
      prev.map((exam) =>
        exam.id === id ? { ...exam, ...patch } : exam
      )
    );
  }

  return (
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={addExam}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            Exam name
            <input
              className="apple-input"
              value={examName}
              onChange={(event) => setExamName(event.target.value)}
              placeholder="e.g. Functional Skills Maths Exam"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Exam date
            <input
              className="apple-input"
              type="date"
              value={examDate}
              onChange={(event) => setExamDate(event.target.value)}
            />
          </label>
        </div>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={showOnDashboard}
            onChange={(event) => setShowOnDashboard(event.target.checked)}
            className="h-4 w-4 rounded border border-[color:var(--border)]"
          />
          Show countdown on dashboard
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="apple-button"
            type="submit"
            disabled={!examName.trim() || !examDate || status === "saving"}
          >
            {status === "saving" ? "Saving..." : "Add exam"}
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
        <div className="text-sm font-semibold">Your countdowns</div>
        {exams.length === 0 ? (
          <p className="text-sm text-[color:var(--muted-foreground)]">
            No exams yet. Add one above to show a countdown on your dashboard.
          </p>
        ) : (
          <div className="space-y-3">
            {exams.map((exam) => (
              <div key={exam.id} className="rounded-lg border p-4 space-y-3">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm">
                    Exam name
                    <input
                      className="apple-input"
                      value={exam.exam_name}
                      onChange={(event) =>
                        updateExamState(exam.id, { exam_name: event.target.value })
                      }
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    Exam date
                    <input
                      className="apple-input"
                      type="date"
                      value={exam.exam_date}
                      onChange={(event) =>
                        updateExamState(exam.id, { exam_date: event.target.value })
                      }
                    />
                  </label>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={exam.show_on_dashboard}
                      onChange={(event) =>
                        updateExamState(exam.id, {
                          show_on_dashboard: event.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border border-[color:var(--border)]"
                    />
                    Show on dashboard
                  </label>

                  <div className="flex flex-wrap gap-2">
                    <button
                      className="apple-pill"
                      type="button"
                      onClick={() => saveExam(exam)}
                      disabled={status === "saving"}
                    >
                      Save
                    </button>
                    <button
                      className="apple-pill border-red-200/60 text-red-600"
                      type="button"
                      onClick={() => deleteExam(exam.id)}
                      disabled={status === "saving"}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
