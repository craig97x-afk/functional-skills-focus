"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "fsf-theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const initial: ThemeMode = "light";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
    window.localStorage.setItem(STORAGE_KEY, initial);
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
      <span className="apple-switch-icon apple-switch-icon-moon" aria-hidden="true">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="apple-switch-icon apple-switch-icon-sun" aria-hidden="true">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle
            cx="12"
            cy="12"
            r="4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M12 3v2M12 19v2M4.22 4.22l1.41 1.41M18.36 18.36l1.41 1.41M3 12h2M19 12h2M4.22 19.78l1.41-1.41M18.36 5.64l1.41-1.41"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="apple-switch-thumb" />
    </button>
  );
}
