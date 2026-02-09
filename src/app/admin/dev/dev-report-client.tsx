"use client";

import { useMemo, useState } from "react";
import type { CheckItem, CheckStatus, DevCheckResult } from "@/lib/admin/dev-checks-types";

function statusBadge(status: CheckStatus) {
  if (status === "ok") return "bg-emerald-500/15 text-emerald-300";
  if (status === "warn") return "bg-amber-500/15 text-amber-300";
  return "bg-rose-500/15 text-rose-300";
}

function countStatuses(items: CheckItem[]) {
  return items.reduce(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    { ok: 0, warn: 0, error: 0 }
  );
}

export default function DevReportClient({ initial }: { initial: DevCheckResult }) {
  const [data, setData] = useState<DevCheckResult>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => {
    const env = countStatuses(data.envChecks);
    const tables = countStatuses(data.tableChecks);
    const storage = countStatuses(data.storageChecks);
    const content = countStatuses(data.contentChecks);
    const misc = countStatuses(data.miscChecks);
    return {
      ok: env.ok + tables.ok + storage.ok + content.ok + misc.ok,
      warn: env.warn + tables.warn + storage.warn + content.warn + misc.warn,
      error: env.error + tables.error + storage.error + content.error + misc.error,
    };
  }, [data]);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/dev/run", { method: "POST" });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to run checks");
      }
      const json = (await res.json()) as DevCheckResult;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run checks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Admin
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mt-2">
            Dev report
          </h1>
          <p className="apple-subtle mt-2">
            Runtime checks and recommended manual tests. Generated {data.generatedAt}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400">Last run: {data.generatedAt}</div>
          <button
            type="button"
            onClick={handleRun}
            className="apple-button"
            disabled={loading}
          >
            {loading ? "Running..." : "Run checks"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="apple-card p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
            OK
          </div>
          <div className="mt-2 text-2xl font-semibold text-emerald-300">
            {summary.ok}
          </div>
        </div>
        <div className="apple-card p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Warnings
          </div>
          <div className="mt-2 text-2xl font-semibold text-amber-300">
            {summary.warn}
          </div>
        </div>
        <div className="apple-card p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Errors
          </div>
          <div className="mt-2 text-2xl font-semibold text-rose-300">
            {summary.error}
          </div>
        </div>
      </section>

      <section className="apple-card p-6 space-y-4">
        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Environment
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.envChecks.map((check) => (
            <div
              key={check.label}
              className="flex items-center justify-between rounded-2xl border border-slate-200/20 bg-white/5 px-4 py-3"
            >
              <div>
                <div className="text-sm font-medium">{check.label}</div>
                {check.detail && (
                  <div className="text-xs text-slate-400">{check.detail}</div>
                )}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                  check.status
                )}`}
              >
                {check.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="apple-card p-6 space-y-4">
        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Database tables
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.tableChecks.map((check) => (
            <div
              key={check.label}
              className="flex items-center justify-between rounded-2xl border border-slate-200/20 bg-white/5 px-4 py-3"
            >
              <div>
                <div className="text-sm font-medium">{check.label}</div>
                {check.detail && (
                  <div className="text-xs text-slate-400">{check.detail}</div>
                )}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                  check.status
                )}`}
              >
                {check.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="apple-card p-6 space-y-4">
        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Content coverage
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.contentChecks.map((check) => (
            <div
              key={check.label}
              className="flex items-center justify-between rounded-2xl border border-slate-200/20 bg-white/5 px-4 py-3"
            >
              <div>
                <div className="text-sm font-medium">{check.label}</div>
                {check.detail && (
                  <div className="text-xs text-slate-400">{check.detail}</div>
                )}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                  check.status
                )}`}
              >
                {check.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="apple-card p-6 space-y-4">
        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Storage
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.storageChecks.map((check) => (
            <div
              key={check.label}
              className="flex items-center justify-between rounded-2xl border border-slate-200/20 bg-white/5 px-4 py-3"
            >
              <div>
                <div className="text-sm font-medium">{check.label}</div>
                {check.detail && (
                  <div className="text-xs text-slate-400">{check.detail}</div>
                )}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                  check.status
                )}`}
              >
                {check.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="apple-card p-6 space-y-4">
        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Misc
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.miscChecks.map((check) => (
            <div
              key={check.label}
              className="flex items-center justify-between rounded-2xl border border-slate-200/20 bg-white/5 px-4 py-3"
            >
              <div>
                <div className="text-sm font-medium">{check.label}</div>
                {check.detail && (
                  <div className="text-xs text-slate-400">{check.detail}</div>
                )}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                  check.status
                )}`}
              >
                {check.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="apple-card p-6 space-y-4">
        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Manual checks
        </div>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>Run a production build: `npm run build`.</li>
          <li>Sign in as admin, open /admin/users, toggle override, verify access gate.</li>
          <li>Sign in as student (subscribed), open /practice, /progress, /mastery.</li>
          <li>Checkout a subscription in Stripe test mode and confirm webhook updates profiles.</li>
          <li>Purchase a guide and confirm access to the guide assets.</li>
          <li>Send a support message and verify unread badges in header.</li>
        </ul>
      </section>
    </main>
  );
}
