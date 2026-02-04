"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendReset() {
    setLoading(true);
    setMsg(null);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg("If that email exists, a reset link has been sent.");
  }

  return (
    <main className="p-6 max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Forgot password</h1>
      <p className="text-sm text-gray-600">
        Enter your email and we’ll send a reset link.
      </p>

      <input
        className="w-full rounded-md border p-2"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        className="rounded-md border px-4 py-2"
        onClick={sendReset}
        disabled={loading || !email}
      >
        {loading ? "Sending..." : "Send reset link"}
      </button>

      {msg && <p className="text-sm">{msg}</p>}
    </main>
  );
}
