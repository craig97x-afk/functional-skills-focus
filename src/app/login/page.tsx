"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signUp() {
    setLoading(true);
    setMsg(null);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/verify-email`
        : undefined;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo },
    });

    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg("Account created. Check your email to verify, then sign in.");
  }

  async function signIn() {
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-bold">Sign in</h1>

      <label className="block">
        <span className="text-sm">Email</span>
        <input
          className="mt-1 w-full rounded-md border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
        />
      </label>

      <label className="block">
        <span className="text-sm">Password</span>
        <input
          className="mt-1 w-full rounded-md border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="rounded-md border px-3 py-2"
          onClick={signIn}
          disabled={loading || !email || !password}
        >
          {loading ? "Working..." : "Sign in"}
        </button>

        <button
          className="rounded-md border px-3 py-2"
          onClick={signUp}
          disabled={loading || !email || password.length < 8}
          title="Password must be at least 8 characters"
        >
          Create account
        </button>

        <a href="/forgot-password" className="text-sm underline">
          Forgot password?
        </a>
      </div>

      {msg && <p className="text-sm">{msg}</p>}

      <p className="text-xs text-gray-500">
        Creating an account may require email verification before you can sign in.
      </p>
    </main>
  );
}
