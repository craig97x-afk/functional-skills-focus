"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type DashboardWidgetOption = {
  key: string;
  label: string;
};

export default function DashboardWidgetPicker({
  userId,
  options,
  enabledKeys,
}: {
  userId: string;
  options: DashboardWidgetOption[];
  enabledKeys: string[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(enabledKeys)
  );

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    // Persist one row per widget so toggles are user-specific.
    const rows = options.map((opt) => ({
      user_id: userId,
      widget_key: opt.key,
      is_enabled: selected.has(opt.key),
    }));
    const { error } = await supabase
      .from("user_dashboard_widgets")
      .upsert(rows, { onConflict: "user_id,widget_key" });

    setSaving(false);
    if (!error) {
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <>
      <button
        className="apple-pill inline-flex items-center gap-2"
        onClick={() => setOpen(true)}
      >
        <span className="text-lg font-semibold leading-none">+</span>
        Manage widgets
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="apple-card w-full max-w-lg p-6 space-y-4">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Widgets
              </div>
              <h2 className="text-xl font-semibold mt-2">
                Choose your dashboard widgets
              </h2>
            </div>

            <div className="space-y-3">
              {options.map((opt) => (
                <label
                  key={opt.key}
                  className="flex items-center justify-between rounded-xl border border-[color:var(--border)]/60 px-4 py-3"
                >
                  <span className="font-medium">{opt.label}</span>
                  <input
                    type="checkbox"
                    checked={selected.has(opt.key)}
                    onChange={() => toggle(opt.key)}
                    className="h-4 w-4"
                  />
                </label>
              ))}
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                className="apple-pill"
                onClick={() => setOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="apple-button"
                onClick={save}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
