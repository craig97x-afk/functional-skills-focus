"use client";

import { useState } from "react";

export default function ToggleOverrideButton({
  userId,
  current,
}: {
  userId: string;
  current: boolean;
}) {
  const [value, setValue] = useState(current);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const next = !value;

    const res = await fetch("/api/admin/users/toggle-override", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, value: next }),
    });

    setLoading(false);

    if (!res.ok) {
      const txt = await res.text();
      alert(txt);
      return;
    }

    setValue(next);
  }

  return (
    <button
      className="rounded-md border px-3 py-2 text-sm"
      onClick={toggle}
      disabled={loading}
    >
      {value ? "Disable" : "Enable"}
    </button>
  );
}
