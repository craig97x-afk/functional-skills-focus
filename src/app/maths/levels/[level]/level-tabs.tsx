"use client";

import { useMemo, useState } from "react";

type Category = {
  title: string;
  topics: string[];
};

const workbookTemplates = [
  { title: "Workbook 1 - Core Skills", detail: "Key ideas and definitions." },
  { title: "Workbook 2 - Guided Practice", detail: "Worked examples + hints." },
  { title: "Workbook 3 - Exam Style", detail: "Exam-style questions." },
  { title: "Workbook 4 - Mixed Revision", detail: "Short mixed practice set." },
];

export default function LevelTabs({ categories }: { categories: Category[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeCategory = useMemo(() => {
    if (!categories.length) return null;
    return categories[Math.min(activeIndex, categories.length - 1)];
  }, [activeIndex, categories]);

  if (!activeCategory) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Topic categories">
        {categories.map((category, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={category.title}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveIndex(index)}
              className={[
                "rounded-full border px-4 py-2 text-sm transition",
                isActive
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                  : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]",
              ].join(" ")}
            >
              {category.title}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          {activeCategory.title}
        </div>
        <div className="text-xs text-[color:var(--muted-foreground)]">
          {activeCategory.topics.length} subjects
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {activeCategory.topics.map((topic) => (
          <article key={topic} className="apple-card p-5 space-y-4">
            <div className="text-lg font-semibold">{topic}</div>
            <div className="grid gap-2">
              {workbookTemplates.map((workbook) => (
                <div
                  key={`${topic}-${workbook.title}`}
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-sm font-medium">{workbook.title}</div>
                    <div className="text-xs text-[color:var(--muted-foreground)]">
                      {workbook.detail}
                    </div>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                    Workbook
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
