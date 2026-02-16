"use client";

import { useState } from "react";

type AuditRow = {
  id: string;
  actor_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  created_at: string;
};

export default function AuditLogTable({ logs }: { logs: AuditRow[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const canUndo = (action: string) =>
    ["UPDATE", "DELETE"].includes(action.toUpperCase());

  const undoChange = async (logId: string) => {
    setLoadingId(logId);
    setMsg(null);
    const res = await fetch("/api/admin/audit/undo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logId }),
    });
    setLoadingId(null);
    if (res.ok) {
      setMsg("Undo completed. Refreshing...");
      window.location.reload();
    } else {
      const body = await res.json().catch(() => ({}));
      setMsg(body.error ?? "Undo failed.");
    }
  };

  return (
    <div className="space-y-3">
      {msg && <div className="text-xs text-[color:var(--muted-foreground)]">{msg}</div>}
      <div className="space-y-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-sm"
          >
            <div>
              <div className="font-semibold">
                {log.action} · {log.table_name}
              </div>
              <div className="text-xs text-[color:var(--muted-foreground)] mt-1">
                {log.record_id ? `Record: ${log.record_id}` : "Record: —"}
              </div>
              <div className="text-xs text-[color:var(--muted-foreground)] mt-1">
                Actor: {log.actor_id ? log.actor_id.slice(0, 8) : "Unknown"} ·{" "}
                {new Date(log.created_at).toLocaleString()}
              </div>
            </div>
            {canUndo(log.action) && (
              <button
                className="rounded-full border px-3 py-1 text-xs"
                disabled={loadingId === log.id}
                onClick={() => undoChange(log.id)}
              >
                {loadingId === log.id ? "Undoing..." : "Undo"}
              </button>
            )}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-sm text-[color:var(--muted-foreground)]">
            No audit log entries yet.
          </div>
        )}
      </div>
    </div>
  );
}
