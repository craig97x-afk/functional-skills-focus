"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Supabase sets a temporary session when user visits reset link.
  // We just need to update the password.
  async function updatePassword() {
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg("Password updated. You can now log in.");
    // optional redirect after a moment:
    // window.location.href = "/login";
  }

  useEffect(() => {
    // If there's no session, user probably opened the page directly.
    // Not fatal. They'll get an error on update. We'll keep UX simple.
  }, []);

  return (
    <main className="p-6 max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Reset password</h1>
      <p className="text-sm text-gray-600">
        Enter a new password for your account.
      </p>

      <input
        className="w-full rounded-md border p-2"
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="rounded-md border px-4 py-2"
        onClick={updatePassword}
        disabled={loading || password.length < 8}
      >
        {loading ? "Updating..." : "Update password"}
      </button>

      <p className="text-xs text-gray-500">Minimum 8 characters.</p>
      {msg && <p className="text-sm">{msg}</p>}
    </main>
  );
}
