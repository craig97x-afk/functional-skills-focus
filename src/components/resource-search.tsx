"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SearchResult = {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  href: string;
  meta: string;
  external?: boolean;
};

export default function ResourceSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placeholder, setPlaceholder] = useState("Search for resources...");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused) {
      return;
    }

    const phrases = [
      "Search for resources...",
      "Try “Entry Level 3 fractions”",
      "Search exam mocks",
      "Search question sets",
      "Search workbooks",
      "Search guides",
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let direction: "forward" | "back" = "forward";
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      const phrase = phrases[phraseIndex];
      if (direction === "forward") {
        charIndex += 1;
        if (charIndex >= phrase.length) {
          direction = "back";
          timeoutId = setTimeout(tick, 1200);
          setPlaceholder(phrase);
          return;
        }
      } else {
        charIndex -= 1;
        if (charIndex <= 0) {
          direction = "forward";
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
      }

      setPlaceholder(phrase.slice(0, Math.max(charIndex, 0)));
      timeoutId = setTimeout(tick, direction === "forward" ? 70 : 30);
    };

    timeoutId = setTimeout(tick, 400);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isFocused]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const handle = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error("Search failed");
        }
        const data = (await res.json()) as { results?: SearchResult[] };
        setResults(data.results ?? []);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setError("Search failed. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(handle);
      controller.abort();
    };
  }, [query]);

  return (
    <section className="space-y-3" aria-label="Search resources">
      <div className="apple-card px-5 py-4 flex flex-col gap-2">
        <label className="text-xs uppercase tracking-[0.22em] text-slate-400">
          Search resources
        </label>
        <input
          className="w-full bg-transparent text-lg text-[color:var(--foreground)] placeholder:text-slate-400/70 focus:outline-none"
          placeholder={placeholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          type="search"
        />
      </div>

      {loading && (
        <div className="text-sm text-[color:var(--muted-foreground)]">
          Searching resources…
        </div>
      )}

      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}

      {!loading && query.trim().length >= 2 && results.length === 0 && !error && (
        <div className="apple-card px-5 py-4 text-sm text-[color:var(--muted-foreground)]">
          No results yet. Try a different keyword or level.
        </div>
      )}

      {results.length > 0 && (
        <div className="apple-card divide-y divide-[color:var(--border)]">
          {results.map((result) => (
            <div key={`${result.type}-${result.id}`} className="p-5 flex flex-col gap-2">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                {result.type}
              </div>
              <div className="text-lg font-semibold">{result.title}</div>
              {result.description && (
                <div className="text-sm text-[color:var(--muted-foreground)]">
                  {result.description}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-[color:var(--muted-foreground)]">
                <span>{result.meta}</span>
                {result.external ? (
                  <a
                    href={result.href}
                    target="_blank"
                    rel="noreferrer"
                    className="apple-pill inline-flex"
                  >
                    Open
                  </a>
                ) : (
                  <Link href={result.href} className="apple-pill inline-flex">
                    View
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
