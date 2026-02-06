"use client";

import { useEffect, useMemo, useState } from "react";

type AchievementToastProps = {
  achievement:
    | {
        id: string;
        title: string;
        description?: string | null;
        icon?: string | null;
        earned_at: string;
      }
    | null;
};

const STORAGE_KEY = "fsf-last-achievement";

export default function AchievementToast({ achievement }: AchievementToastProps) {
  const [visible, setVisible] = useState(false);

  const storageValue = useMemo(() => {
    if (!achievement) return "";
    return `${achievement.id}|${achievement.earned_at}`;
  }, [achievement]);

  useEffect(() => {
    if (!achievement) return;

    let timeout: ReturnType<typeof setTimeout> | undefined;

    try {
      const lastSeen = window.localStorage.getItem(STORAGE_KEY);
      if (lastSeen === storageValue) return;

      setVisible(true);
      timeout = setTimeout(() => {
        setVisible(false);
        window.localStorage.setItem(STORAGE_KEY, storageValue);
      }, 3000);
    } catch {
      setVisible(true);
      timeout = setTimeout(() => setVisible(false), 3000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [achievement, storageValue]);

  if (!achievement || !visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-md rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)] p-8 text-center shadow-2xl">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Achievement unlocked
        </div>
        <div className="mt-4 text-5xl">
          {achievement.icon ?? "🏅"}
        </div>
        <div className="mt-4 text-2xl font-semibold tracking-tight">
          {achievement.title}
        </div>
        {achievement.description && (
          <p className="apple-subtle mt-3">{achievement.description}</p>
        )}
      </div>
    </div>
  );
}
