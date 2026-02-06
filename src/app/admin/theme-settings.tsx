"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type ThemeSettingsProps = {
  initialAccent?: string | null;
  initialAccentStrong?: string | null;
};

export default function ThemeSettings({
  initialAccent,
  initialAccentStrong,
}: ThemeSettingsProps) {
  const supabase = useMemo(() => createClient(), []);
  const [accent, setAccent] = useState(initialAccent ?? "#0071e3");
  const [accentStrong, setAccentStrong] = useState(
    initialAccentStrong ?? ""
  );
  const [status, setStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("saving");
    setMessage(null);

    const strong = accentStrong || accent;

    const { error } = await supabase.from("app_settings").upsert({
      id: "default",
      accent_color: accent,
      accent_strong: strong,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.style.setProperty("--accent-strong", strong);

    setStatus("saved");
    setMessage("Theme updated.");
  };

  return (
    <section className="apple-card p-6 space-y-4">
      <div>
        <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
          Theme
        </div>
        <h2 className="text-lg font-semibold mt-2">Brand accent</h2>
        <p className="apple-subtle mt-2">
          Choose the accent color used for primary buttons and highlights. Changes
          apply immediately for everyone.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-sm">
          Primary accent
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={accent}
              onChange={(event) => setAccent(event.target.value)}
              className="h-10 w-12 rounded-md border border-[color:var(--border)] bg-transparent"
            />
            <input
              type="text"
              value={accent}
              onChange={(event) => setAccent(event.target.value)}
              className="apple-input max-w-xs"
              placeholder="#0071e3"
            />
          </div>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          Hover accent (optional)
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={accentStrong || accent}
              onChange={(event) => setAccentStrong(event.target.value)}
              className="h-10 w-12 rounded-md border border-[color:var(--border)] bg-transparent"
            />
            <input
              type="text"
              value={accentStrong}
              onChange={(event) => setAccentStrong(event.target.value)}
              className="apple-input max-w-xs"
              placeholder="Leave blank to reuse primary"
            />
          </div>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button className="apple-button" type="submit" disabled={status === "saving"}>
            {status === "saving" ? "Saving..." : "Save theme"}
          </button>
          {message && (
            <span
              className={
                status === "error"
                  ? "text-sm text-red-500"
                  : "text-sm text-emerald-600"
              }
            >
              {message}
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
