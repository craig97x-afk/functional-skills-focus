"use client";

import { useState } from "react";

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setMsg(null);

    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setMsg(data?.error ?? "Failed");
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div className="space-y-2">
      <button className="rounded-md border px-4 py-2" onClick={go} disabled={loading}>
        {loading ? "Loading..." : "Subscribe"}
      </button>
      {msg && <p className="text-sm text-red-600">{msg}</p>}
    </div>
  );
}
