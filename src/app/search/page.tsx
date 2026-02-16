import SearchResultsPage from "@/components/search-results-page";

export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <main className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Search</div>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">Search results</h1>
        <p className="apple-subtle mt-2">
          Browse worksheets, mocks, guides, and question sets across all levels.
        </p>
      </div>
      <SearchResultsPage />
    </main>
  );
}
