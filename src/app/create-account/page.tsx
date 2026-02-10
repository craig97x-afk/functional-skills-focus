"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function CreateAccountPage() {
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fieldClass =
    "mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 " +
    "bg-[color:var(--surface-muted)] text-[color:var(--foreground)] border-[color:var(--border)]";

  function getAge(dateString: string) {
    if (!dateString) return null;
    const birth = new Date(dateString);
    if (Number.isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age -= 1;
    }
    return age;
  }

  const age = getAge(dob);
  // Under-16 signups require guardian details and access code flow.
  const needsGuardian = age !== null && age < 16;

  async function signUp() {
    let guardianNotice: string | null = null;
    if (password !== confirm) {
      setMsg("Passwords do not match.");
      return;
    }

    if (needsGuardian && (!guardianName || !guardianEmail)) {
      setMsg("Parent/guardian name and email are required for under 16s.");
      return;
    }

    setLoading(true);
    setMsg(null);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/verify-email`
        : undefined;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          full_name: fullName,
          date_of_birth: dob,
        },
      },
    });

    if (error) {
      setLoading(false);
      setMsg(error.message);
      return;
    }

    if (needsGuardian) {
      // Create guardian link + email code after student signup succeeds.
      const studentId = data?.user?.id;
      if (!studentId) {
        setLoading(false);
        setMsg(
          "Account created, but guardian email could not be sent (missing student ID)."
        );
        return;
      }
      const response = await fetch("/api/guardian/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          studentName: fullName,
          studentEmail: email,
          guardianName,
          guardianEmail,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setLoading(false);
        setMsg(
          result?.error ??
            "Account created, but guardian email could not be sent."
        );
        return;
      }

      guardianNotice = result.emailed
        ? "Guardian access code emailed."
        : `Guardian email not sent (email not configured). Code: ${result.code}`;
    }

    // Require verification before sign-in; clear any auto session from signUp.
    if (data?.session) {
      await supabase.auth.signOut();
    }

    setLoading(false);

    if (needsGuardian && guardianNotice) {
      setMsg(
        `Account created. ${guardianNotice} Check your email to verify, then sign in.`
      );
      return;
    }

    setMsg("Account created. Check your email to verify, then sign in.");
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <section className="apple-card p-8 space-y-6">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Create account
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mt-2">
            Start your learning journey
          </h1>
          <p className="apple-subtle mt-2">
            Set up your profile so we can tailor learning and reminders.
          </p>
        </div>

        <label className="block">
          <span className="text-sm text-slate-600">Full name</span>
          <input
            className={fieldClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            type="text"
            autoComplete="name"
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-600">Date of birth</span>
          <input
            className={fieldClass}
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            type="date"
          />
        </label>

        {needsGuardian && (
          <div className="space-y-4 rounded-2xl border border-slate-200/40 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Parent/guardian (required under 16)
            </div>
            <label className="block">
              <span className="text-sm text-slate-600">Parent/guardian name</span>
              <input
                className={fieldClass}
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                type="text"
                autoComplete="name"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-600">Parent/guardian email</span>
              <input
                className={fieldClass}
                value={guardianEmail}
                onChange={(e) => setGuardianEmail(e.target.value)}
                type="email"
                autoComplete="email"
              />
            </label>
          </div>
        )}

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
            autoComplete="new-password"
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-600">Confirm password</span>
          <input
            className={fieldClass}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            type="password"
            autoComplete="new-password"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="apple-button"
            onClick={signUp}
            disabled={
              loading ||
              !fullName ||
              !dob ||
              !email ||
              password.length < 8 ||
              !confirm
            }
            title="Password must be at least 8 characters"
          >
            {loading ? "Working..." : "Create account"}
          </button>
          <Link className="apple-pill" href="/login">
            Back to login
          </Link>
        </div>

        {msg && <p className="text-sm text-slate-600">{msg}</p>}

        <p className="text-xs text-slate-500">
          Creating an account may require email verification before you can sign
          in.
        </p>
      </section>
    </main>
  );
}
