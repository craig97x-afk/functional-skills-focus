"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  lessonId: string;
  initialNoteId: string | null;
  initialContent: string;
};

export default function LessonNotes({
  lessonId,
  initialNoteId,
  initialContent,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [noteId, setNoteId] = useState<string | null>(initialNoteId);
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string | null>(null);

  async function saveNote() {
    setStatus("saving");
    setMessage(null);

    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData.user) {
      setStatus("error");
      setMessage("Please sign in again.");
      return;
    }

    const userId = authData.user.id;
    const payload = {
      user_id: userId,
      lesson_id: lessonId,
      content: content.trim(),
      updated_at: new Date().toISOString(),
    };

    if (!payload.content) {
      setStatus("error");
      setMessage("Write some notes before saving.");
      return;
    }

    if (noteId) {
      const { error } = await supabase
        .from("lesson_notes")
        .update(payload)
        .eq("id", noteId)
        .eq("user_id", userId);

      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }

      setStatus("saved");
      setMessage("Notes saved.");
      return;
    }

    const { data, error } = await supabase
      .from("lesson_notes")
      .insert(payload)
      .select("id")
      .single();

    if (error || !data) {
      setStatus("error");
      setMessage(error?.message ?? "Failed to save notes.");
      return;
    }

    setNoteId(data.id);
    setStatus("saved");
    setMessage("Notes saved.");
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
          Lesson notes
        </div>
        <h2 className="text-lg font-semibold mt-2">Your notes</h2>
        <p className="apple-subtle mt-2">
          Save quick reminders or worked examples. These notes stay attached to
          this lesson.
        </p>
      </div>

      <textarea
        className="apple-input min-h-[140px] w-full"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write your summary or key steps..."
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="apple-button"
          type="button"
          onClick={saveNote}
          disabled={status === "saving"}
        >
          {status === "saving" ? "Saving..." : "Save notes"}
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
    </div>
  );
}
