"use client";

import { useState } from "react";

export default function AccountDeleteButton() {
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function del() {
    setLoading(true);
    setMsg(null);

    const res = await fetch("/api/account/delete", { method: "POST" });
    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setMsg(data?.error ?? "Failed");
      return;
    }

    // After deletion, user will be logged out. Send them to login.
    window.location.href = "/login";
  }

  const enabled = confirm.trim().toLowerCase() === "delete";

  return (
    <div className="space-y-3">
      <div className="text-sm">
        Type <span className="font-semibold">delete</span> to confirm:
      </div>

      <input
        className="w-full rounded-md border p-2"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder='Type "delete"'
      />

      <button
        className="rounded-md border px-3 py-2"
        disabled={!enabled || loading}
        onClick={del}
      >
        {loading ? "Deleting..." : "Permanently delete account"}
      </button>

      {msg && <p className="text-sm text-red-600">{msg}</p>}
    </div>
  );
}
