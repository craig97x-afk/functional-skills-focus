"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminRowActions from "@/components/admin-row-actions";
import WorkbookForm from "@/app/admin/workbooks/workbook-form";

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
  thumbnail_path: string | null;
  thumbnail_url: string | null;
  file_path: string | null;
  file_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number | null;
  publish_at: string | null;
  unpublish_at: string | null;
};

type DisplayWorkbook = {
  id: string;
  title: string;
  detail: string;
  description?: string | null;
  category?: string | null;
  topic?: string;
  thumbnail_path?: string | null;
  thumbnail_url?: string | null;
  file_path?: string | null;
  file_url?: string | null;
  isPlaceholder?: boolean;
  is_published?: boolean;
  is_featured?: boolean;
  publish_at?: string | null;
  unpublish_at?: string | null;
};

const worksheetTemplates = [
  { title: "Worksheet 1 - Core Skills", detail: "Key ideas and definitions." },
  { title: "Worksheet 2 - Guided Practice", detail: "Worked examples + hints." },
  { title: "Worksheet 3 - Exam Style", detail: "Exam-style questions." },
  { title: "Worksheet 4 - Mixed Revision", detail: "Short mixed practice set." },
];

const bannerGradientStyle = {
  background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
};

export default function LevelTabs({
  categories,
  subject,
  levelSlug,
  hasAccess,
  isAdmin,
}: {
  categories: Category[];
  subject: string;
  levelSlug: string;
  hasAccess: boolean;
  isAdmin: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [workbooks, setWorkbooks] = useState<WorkbookRow[]>([]);

  const activeCategory = useMemo(() => {
    if (!categories.length) return null;
    return categories[Math.min(activeIndex, categories.length - 1)];
  }, [activeIndex, categories]);

  const logWorkbookEvent = async (
    workbookId: string,
    eventType: "open" | "download"
  ) => {
    try {
      await fetch("/api/workbooks/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workbookId, eventType }),
      });
    } catch {
      // Ignore analytics failures.
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadWorkbooks() {
      let query = supabase
        .from("workbooks")
        .select(
          "id, title, description, category, topic, thumbnail_path, thumbnail_url, file_path, file_url, is_published, is_featured, sort_order, publish_at, unpublish_at"
        )
        .eq("subject", subject)
        .eq("level_slug", levelSlug)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (!isAdmin) {
        query = query.eq("is_published", true);
      }

      const { data } = await query;

      if (!ignore && data) {
        setWorkbooks(data as WorkbookRow[]);
      }
    }

    loadWorkbooks();
    return () => {
      ignore = true;
    };
  }, [supabase, subject, levelSlug, isAdmin]);

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
        {activeCategory.topics.map((topic) => {
          const key = topic.toLowerCase();
          const actual = workbooksByTopic.get(key) ?? [];
          const display: DisplayWorkbook[] =
            actual.length > 0
              ? actual.map((workbook) => ({
                  id: workbook.id,
                  title: workbook.title,
                  detail: workbook.description || "Worksheet material.",
                  description: workbook.description,
                  category: workbook.category,
                  topic: workbook.topic,
                  thumbnail_url: workbook.thumbnail_url,
                  file_url: workbook.file_url,
                  isPlaceholder: false,
                  is_published: workbook.is_published,
                  is_featured: workbook.is_featured,
                  publish_at: workbook.publish_at,
                  unpublish_at: workbook.unpublish_at,
                }))
              : isAdmin
              ? []
              : worksheetTemplates.map((workbook, templateIndex) => ({
                  id: `placeholder-${key}-${templateIndex}`,
                  title: workbook.title,
                  detail: workbook.detail,
                  category: null,
                  topic,
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
                  Worksheets, lesson packs, and revision sheets for {topic}.
                </p>
                {display.length === 0 ? (
                  <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 text-sm text-[color:var(--muted-foreground)]">
                    No worksheets yet for this topic.
                  </div>
                ) : (
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
                                Worksheet
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="text-lg font-semibold">{workbook.title}</div>
                              {workbook.is_featured && (
                                <span className="inline-flex rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                                  Featured
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-[color:var(--muted-foreground)]">
                              {workbook.detail}
                            </div>
                            {isAdmin && !workbook.isPlaceholder && (
                              <div className="pt-2 space-y-3">
                                <AdminRowActions
                                  table="workbooks"
                                  id={workbook.id}
                                  initialPublished={Boolean(workbook.is_published)}
                                  supportsFeatured
                                  initialFeatured={Boolean(workbook.is_featured)}
                                />
                                <details className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                                  <summary className="cursor-pointer text-xs font-semibold">
                                    Edit worksheet
                                  </summary>
                                  <div className="mt-4">
                                    <WorkbookForm
                                      defaultSubject={subject}
                                      defaultLevel={levelSlug}
                                      lockSubjectLevel
                                      initialWorkbook={{
                                        id: workbook.id,
                                        subject,
                                        level_slug: levelSlug,
                                        category: workbook.category ?? null,
                                        topic: workbook.topic ?? topic,
                                        title: workbook.title,
                                        description: workbook.description ?? null,
                                        thumbnail_path: workbook.thumbnail_path ?? null,
                                        thumbnail_url: workbook.thumbnail_url ?? null,
                                        file_path: workbook.file_path ?? null,
                                        file_url: workbook.file_url ?? null,
                                        is_published: workbook.is_published,
                                        is_featured: workbook.is_featured,
                                        publish_at: workbook.publish_at ?? null,
                                        unpublish_at: workbook.unpublish_at ?? null,
                                      }}
                                    />
                                  </div>
                                </details>
                              </div>
                            )}
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
                                onClick={() => logWorkbookEvent(workbook.id, "open")}
                              >
                                Open worksheet
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
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
