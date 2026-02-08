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

const topicGradients = [
  "from-[#0b2a4a] via-[#12355f] to-[#1f4c7e]",
  "from-[#102d52] via-[#18406f] to-[#2a5c94]",
  "from-[#0c2847] via-[#16395f] to-[#275081]",
  "from-[#0b2440] via-[#16365c] to-[#224b7a]",
  "from-[#0f2b4f] via-[#1a406d] to-[#2a5a92]",
];

export default function LevelTabs({
  categories,
  subject,
  levelSlug,
}: {
  categories: Category[];
  subject: string;
  levelSlug: string;
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
          const gradient = topicGradients[index % topicGradients.length];

          return (
            <article key={topic} className="apple-card p-6 lg:p-8">
              <div className="grid gap-6 lg:grid-cols-[360px_1fr] items-start">
                <div
                  className={`relative h-52 lg:h-60 w-full rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br ${gradient}`}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0)_45%)]" />
                  <div className="relative h-full w-full flex flex-col items-start justify-end p-6 text-white">
                    <div className="text-xs uppercase tracking-[0.3em] opacity-80">
                      Topic
                    </div>
                    <div className="text-3xl font-semibold leading-tight">{topic}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="apple-subtle text-base">
                    Workbooks, lesson packs, and revision sheets for {topic}.
                  </p>
                  <div className="grid gap-3">
                    {display.map((workbook) => (
                      <div
                        key={workbook.id}
                        className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex flex-1 items-center gap-4">
                          <div className="h-16 w-full max-w-[140px] rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] overflow-hidden">
                            {workbook.thumbnail_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={workbook.thumbnail_url}
                                alt={workbook.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-gradient-to-br from-slate-700/30 to-slate-900/50 flex items-center justify-center text-[10px] uppercase tracking-[0.2em] text-slate-200">
                                Workbook
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{workbook.title}</div>
                            <div className="text-xs text-[color:var(--muted-foreground)]">
                              {workbook.detail}
                            </div>
                          </div>
                        </div>
                        {workbook.file_url ? (
                          <a
                            className="rounded-full border px-3 py-1 text-xs text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]"
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
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
