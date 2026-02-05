"use client";

import { useState } from "react";

export default function ResyncButton({
  userId,
  disabled,
}: {
  userId: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function resync() {
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch("/api/admin/billing/resync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error ?? "Resync failed");
      } else {
        setMsg(`Status: ${data.status}`);
        window.location.reload();
      }
    } catch {
      setMsg("Resync failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <button
        className="rounded-md border px-2 py-1 text-xs"
        onClick={resync}
        disabled={loading || disabled}
      >
        {loading ? "Syncing..." : "Resync"}
      </button>
      {msg && <div className="text-xs text-gray-400">{msg}</div>}
    </div>
  );
}
