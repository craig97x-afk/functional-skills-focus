"use client";

import { useState } from "react";

export default function ProgressCommentEditor({
  userId,
  commentId,
  initialContent,
}: {
  userId: string;
  commentId: string | null;
  initialContent: string | null;
}) {
  const [content, setContent] = useState(initialContent ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setStatus("saving");
    setMessage(null);

    try {
      const res = await fetch("/api/admin/progress-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          content,
          commentId: commentId ?? undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data?.error ?? "Failed to save");
        return;
      }

      setStatus("saved");
      setMessage("Comment saved.");
    } catch {
      setStatus("error");
      setMessage("Failed to save");
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        className="apple-input min-h-[120px]"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write feedback, strengths, gaps, and next steps..."
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="apple-button"
          type="button"
          onClick={save}
          disabled={status === "saving" || !content.trim()}
        >
          {status === "saving" ? "Saving..." : "Save comment"}
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
