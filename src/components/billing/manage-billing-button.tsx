"use client";

import { useState } from "react";

export default function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function openPortal() {
    setLoading(true);
    setMsg(null);

    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setMsg(data?.error ?? "Failed to open billing portal");
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div className="space-y-2">
      <button
        onClick={openPortal}
        disabled={loading}
        className="rounded-md border px-3 py-2"
      >
        {loading ? "Loading..." : "Manage billing"}
      </button>
      {msg && <p className="text-sm text-red-600">{msg}</p>}
    </div>
  );
}
