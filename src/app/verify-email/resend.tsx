"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResendVerification({ email }: { email: string }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function resend() {
    setLoading(true);
    setMsg(null);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/verify-email`
        : undefined;

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: redirectTo },
    });

    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg("Verification email resent.");
  }

  return (
    <div className="space-y-2">
      <button className="rounded-md border px-3 py-2" onClick={resend} disabled={loading || !email}>
        {loading ? "Sending..." : "Resend verification email"}
      </button>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
