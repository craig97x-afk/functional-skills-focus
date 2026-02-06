"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type ExamCountdownFormProps = {
  initialDate?: string | null;
  initialShow?: boolean | null;
};

export default function ExamCountdownForm({
  initialDate,
  initialShow,
}: ExamCountdownFormProps) {
  const supabase = useMemo(() => createClient(), []);
  const [examDate, setExamDate] = useState(
    initialDate ? initialDate.slice(0, 10) : ""
  );
  const [showCountdown, setShowCountdown] = useState(Boolean(initialShow));
  const [status, setStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("saving");
    setMessage(null);

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      setStatus("error");
      setMessage("Please sign in again to update your countdown.");
      return;
    }

    const payload = {
      user_id: authData.user.id,
      exam_date: examDate || null,
      show_exam_countdown: showCountdown,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("user_settings").upsert(payload);

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("saved");
    setMessage("Countdown saved.");
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-2 text-sm">
        Exam date
        <input
          className="apple-input"
          type="date"
          value={examDate}
          onChange={(event) => setExamDate(event.target.value)}
        />
      </label>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={showCountdown}
          onChange={(event) => setShowCountdown(event.target.checked)}
          className="h-4 w-4 rounded border border-[color:var(--border)]"
        />
        Show countdown on dashboard
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button className="apple-button" type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : "Save countdown"}
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
  );
}
