"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Category = {
  title: string;
  topics: string[];
};

type WorkbookRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  topic: string;
  thumbnail_url: string | null;
  file_url: string | null;
};

type DisplayWorkbook = {
  id: string;
  title: string;
  detail: string;
  thumbnail_url?: string | null;
  file_url?: string | null;
  isPlaceholder?: boolean;
};

const workbookTemplates = [
  { title: "Workbook 1 - Core Skills", detail: "Key ideas and definitions." },
  { title: "Workbook 2 - Guided Practice", detail: "Worked examples + hints." },
  { title: "Workbook 3 - Exam Style", detail: "Exam-style questions." },
  { title: "Workbook 4 - Mixed Revision", detail: "Short mixed practice set." },
];

const bannerGradientStyle = {
  background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
};

export default function LevelTabs({
  categories,
  subject,
  levelSlug,
  hasAccess,
}: {
  categories: Category[];
  subject: string;
  levelSlug: string;
  hasAccess: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [workbooks, setWorkbooks] = useState<WorkbookRow[]>([]);

  const activeCategory = useMemo(() => {
    if (!categories.length) return null;
    return categories[Math.min(activeIndex, categories.length - 1)];
  }, [activeIndex, categories]);

  useEffect(() => {
    let ignore = false;

    async function loadWorkbooks() {
      const { data } = await supabase
        .from("workbooks")
        .select("id, title, description, category, topic, thumbnail_url, file_url")
        .eq("subject", subject)
        .eq("level_slug", levelSlug)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (!ignore && data) {
        setWorkbooks(data as WorkbookRow[]);
      }
    }

    loadWorkbooks();
    return () => {
      ignore = true;
    };
  }, [supabase, subject, levelSlug]);

  const workbooksByTopic = useMemo(() => {
    const map = new Map<string, WorkbookRow[]>();
    workbooks.forEach((workbook) => {
      const key = workbook.topic.trim().toLowerCase();
      if (!key) return;
      const list = map.get(key) ?? [];
      list.push(workbook);
      map.set(key, list);
    });
    return map;
  }, [workbooks]);

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

      <div className="grid gap-6">
        {activeCategory.topics.map((topic, index) => {
          const key = topic.toLowerCase();
          const actual = workbooksByTopic.get(key) ?? [];
          const display: DisplayWorkbook[] =
            actual.length > 0
              ? actual.map((workbook) => ({
                  id: workbook.id,
                  title: workbook.title,
                  detail: workbook.description || "Workbook material.",
                  thumbnail_url: workbook.thumbnail_url,
                  file_url: workbook.file_url,
                }))
              : workbookTemplates.map((workbook, templateIndex) => ({
                  id: `placeholder-${key}-${templateIndex}`,
                  title: workbook.title,
                  detail: workbook.detail,
                  isPlaceholder: true,
                }));
          return (
            <article key={topic} className="apple-card p-6 lg:p-8">
              <div
                style={bannerGradientStyle}
                className="relative h-52 lg:h-60 w-full rounded-3xl overflow-hidden border border-white/15"
              >
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_45%)]" />
                <div className="relative h-full w-full flex flex-col items-start justify-end p-6 text-white">
                  <div className="text-xs uppercase tracking-[0.3em] opacity-80">Topic</div>
                  <div className="text-3xl font-semibold leading-tight">{topic}</div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <p className="apple-subtle text-base">
                  Workbooks, lesson packs, and revision sheets for {topic}.
                </p>
                <div className="grid gap-4">
                  {display.map((workbook, workbookIndex) => {
                    const isLocked = !hasAccess && workbookIndex >= 2;
                    return (
                    <div
                      key={workbook.id}
                      className={[
                        "rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 flex flex-col gap-4 lg:flex-row lg:items-center",
                        isLocked ? "opacity-80" : "",
                      ].join(" ")}
                    >
                      <div className="h-40 w-full lg:h-28 lg:w-64 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] overflow-hidden">
                        {workbook.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={workbook.thumbnail_url}
                            alt={workbook.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-slate-700/30 to-slate-900/50 flex items-center justify-center text-xs uppercase tracking-[0.2em] text-slate-200">
                            Workbook
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="text-lg font-semibold">{workbook.title}</div>
                        <div className="text-sm text-[color:var(--muted-foreground)]">
                          {workbook.detail}
                        </div>
                        {isLocked ? (
                          <span className="inline-flex rounded-full border border-[color:var(--border)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                            Subscription user only
                          </span>
                        ) : workbook.file_url ? (
                          <a
                            className="inline-flex rounded-full border px-4 py-2 text-xs text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]"
                            href={workbook.file_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open workbook
                          </a>
                        ) : (
                          <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                            {workbook.isPlaceholder ? "Draft" : "No file yet"}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
