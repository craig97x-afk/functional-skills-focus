"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "fsf-theme";

function getSystemTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const initial = stored ?? getSystemTheme();
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const next = theme === "light" ? "dark" : "light";
  const isDark = theme === "dark";

  return (
    <button
      className="apple-switch"
      type="button"
      role="switch"
      aria-checked={isDark}
      data-state={isDark ? "on" : "off"}
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
    >
      <span className="apple-switch-thumb" />
    </button>
  );
}
