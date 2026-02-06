"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fieldClass =
    "mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 " +
    "bg-[color:var(--surface-muted)] text-[color:var(--foreground)] border-[color:var(--border)]";

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
    <main className="mx-auto max-w-lg px-6 py-12">
      <section className="apple-card p-8 space-y-6">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Account
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mt-2">
            Sign in
          </h1>
        </div>

        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (!loading) {
              void signIn();
            }
          }}
        >
          <label className="block">
            <span className="text-sm text-slate-600">Email</span>
            <input
              className={fieldClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-600">Password</span>
            <input
              className={fieldClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              className="apple-button"
              type="submit"
              disabled={loading || !email || !password}
            >
              {loading ? "Working..." : "Sign in"}
            </button>

            <Link className="apple-pill" href="/create-account">
              Create account
            </Link>

            <Link href="/forgot-password" className="text-sm text-slate-600 hover:text-slate-900">
              Forgot password?
            </Link>
          </div>
        </form>

        {msg && <p className="text-sm text-slate-600">{msg}</p>}

        <p className="text-xs text-slate-500">
          Creating an account may require email verification before you can sign in.
        </p>
      </section>
    </main>
  );
}
