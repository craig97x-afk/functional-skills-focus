"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type SearchResult = {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  href: string;
  meta: string;
  external?: boolean;
};

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`/api/search?q=${encodeURIComponent(query)}&limit=200`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Search failed");
        return res.json();
      })
      .then((data) => setResults(data.results ?? []))
      .catch((err) => {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setError("Search failed. Please try again.");
        }
      })
      .finally(() => setLoading(false));

    return () => {
      controller.abort();
    };
  }, [query]);

  if (query.length < 2) {
    return (
      <div className="apple-card px-6 py-5 text-sm text-[color:var(--muted-foreground)]">
        Enter at least 2 characters to search.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-sm text-[color:var(--muted-foreground)]">
        Searching for “{query}”…
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  if (results.length === 0) {
    return (
      <div className="apple-card px-6 py-5 text-sm text-[color:var(--muted-foreground)]">
        No results found for “{query}”. Try a different keyword or level.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-[color:var(--muted-foreground)]">
        {results.length} results for “{query}”
      </div>
      <div className="apple-card divide-y divide-[color:var(--border)]">
        {results.map((result) => (
          <div key={`${result.type}-${result.id}`} className="p-6 flex flex-col gap-2">
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
    </div>
  );
}
