import Link from "next/link";
import { getPaperTypeLabel } from "@/lib/exam-resources/metadata";
import type { ResourceFilterOptions } from "@/lib/exam-resources/load-level-resources";

export default function ExamResourceFilters({
  basePath,
  selectedBoard,
  paperType,
  paperYear,
  tag,
  options,
}: {
  basePath: string;
  selectedBoard?: string | null;
  paperType?: string | null;
  paperYear?: number | null;
  tag?: string | null;
  options: ResourceFilterOptions;
}) {
  const clearSearch = new URLSearchParams();
  if (selectedBoard) clearSearch.set("board", selectedBoard);

  const clearHref = clearSearch.toString()
    ? `${basePath}/resources?${clearSearch.toString()}`
    : `${basePath}/resources`;

  return (
    <form method="get" action={`${basePath}/resources`} className="apple-card p-4">
      <div className="flex flex-wrap items-end gap-3">
        {selectedBoard && <input type="hidden" name="board" value={selectedBoard} />}

        <label className="block">
          <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
            Paper type
          </span>
          <select
            name="paperType"
            defaultValue={paperType ?? ""}
            className="mt-1 rounded-md border p-2 text-sm"
          >
            <option value="">All</option>
            {options.paperTypes.map((value) => (
              <option key={value} value={value}>
                {getPaperTypeLabel(value)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
            Year
          </span>
          <select
            name="year"
            defaultValue={paperYear ? String(paperYear) : ""}
            className="mt-1 rounded-md border p-2 text-sm"
          >
            <option value="">All</option>
            {options.years.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
            Tag
          </span>
          <select
            name="tag"
            defaultValue={tag ?? ""}
            className="mt-1 rounded-md border p-2 text-sm"
          >
            <option value="">All</option>
            {options.tags.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="rounded-full border px-4 py-2 text-xs border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
        >
          Apply filters
        </button>

        <Link
          href={clearHref}
          className="rounded-full border px-4 py-2 text-xs border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)]"
        >
          Clear filters
        </Link>
      </div>
    </form>
  );
}
