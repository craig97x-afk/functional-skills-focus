"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GuardianLoginPage() {
  const [studentName, setStudentName] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fieldClass =
    "mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 " +
    "bg-[color:var(--surface-muted)] text-[color:var(--foreground)] border-[color:var(--border)]";

  async function handleLogin() {
    setLoading(true);
    setMsg(null);

    // Guardian login is name + access code; session cookie is set server-side.
    const res = await fetch("/api/guardian/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentName, code }),
    });

    const result = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMsg(result?.error ?? "Unable to sign in.");
      return;
    }

    router.push("/guardian/dashboard");
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <section className="apple-card p-8 space-y-6">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Guardian access
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mt-2">
            View learner progress
          </h1>
          <p className="apple-subtle mt-2">
            Enter the learner’s full name and the access code sent by email.
          </p>
        </div>

        <label className="block">
          <span className="text-sm text-slate-600">Learner full name</span>
          <input
            className={fieldClass}
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            type="text"
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-600">Access code</span>
          <input
            className={fieldClass}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            type="text"
            inputMode="numeric"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="apple-button"
            onClick={handleLogin}
            disabled={loading || !studentName || !code}
          >
            {loading ? "Checking..." : "View progress"}
          </button>
        </div>

        {msg && <p className="text-sm text-slate-600">{msg}</p>}
      </section>
    </main>
  );
}
