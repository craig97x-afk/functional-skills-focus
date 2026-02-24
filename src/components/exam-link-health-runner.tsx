"use client";

import { useEffect, useMemo, useState } from "react";

const AUTO_CHECK_WINDOW_MS = 6 * 60 * 60 * 1000;

export default function ExamLinkHealthRunner({
  subject,
  levelSlug,
}: {
  subject: "english" | "maths";
  levelSlug: string;
}) {
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const storageKey = useMemo(
    () => `exam-link-health:last-run:${subject}:${levelSlug}`,
    [subject, levelSlug]
  );

  const runHealthCheck = async (force = false) => {
    if (running) return;

    if (!force) {
      const lastRunRaw = window.localStorage.getItem(storageKey);
      const lastRun = lastRunRaw ? Number(lastRunRaw) : 0;
      if (lastRun && Date.now() - lastRun < AUTO_CHECK_WINDOW_MS) {
        return;
      }
    }

    setRunning(true);
    try {
      const res = await fetch("/api/admin/exam-resource-links/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, levelSlug, maxLinks: 40 }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || "Failed to run health check.");
      }

      const body = (await res.json()) as {
        checked: number;
        broken: number;
        ok: number;
      };

      window.localStorage.setItem(storageKey, String(Date.now()));
      setMessage(
        `Health check complete: ${body.checked} checked, ${body.ok} ok, ${body.broken} broken.`
      );
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : "Health check failed.";
      setMessage(messageText);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    void runHealthCheck(false);
    // Run once per subject/level scope.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-[color:var(--muted-foreground)]">
      <span>Link health auto-check runs in admin view.</span>
      <button
        type="button"
        className="rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.16em]"
        onClick={() => void runHealthCheck(true)}
        disabled={running}
      >
        {running ? "Checking..." : "Run now"}
      </button>
      {message && <span>{message}</span>}
    </div>
  );
}
