"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminRowActions from "@/components/admin-row-actions";

type Worksheet = {
  id: string;
  subject: string;
  level_slug: string;
  category: string | null;
  topic: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  file_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number | null;
};

type WorkbookStats = {
  opens: number;
  downloads: number;
  last_opened_at: string | null;
  last_downloaded_at: string | null;
};

type WorkbookVersion = {
  id: string;
  file_path: string | null;
  file_url: string | null;
  thumbnail_path: string | null;
  thumbnail_url: string | null;
  created_at: string;
};

export default function WorksheetBulkTable({
  initialWorkbooks,
  statsById = {},
}: {
  initialWorkbooks: Worksheet[];
  statsById?: Record<string, WorkbookStats>;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<Worksheet[]>(initialWorkbooks);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragGroup, setDragGroup] = useState<string | null>(null);
  const [versionsById, setVersionsById] = useState<Record<string, WorkbookVersion[]>>({});
  const [versionLoadingId, setVersionLoadingId] = useState<string | null>(null);

  const allSelected = items.length > 0 && selected.size === items.length;

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((item) => item.id)));
    }
  };

  const groupKey = (item: Worksheet) =>
    `${item.subject}|${item.level_slug}|${item.topic}`;

  const formatDate = (value: string | null) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString();
  };

  const loadVersions = async (workbookId: string) => {
    if (versionsById[workbookId]) return;
    setVersionLoadingId(workbookId);
    const { data } = await supabase
      .from("workbook_versions")
      .select("id, file_path, file_url, thumbnail_path, thumbnail_url, created_at")
      .eq("workbook_id", workbookId)
      .order("created_at", { ascending: false });
    setVersionsById((prev) => ({ ...prev, [workbookId]: data ?? [] }));
    setVersionLoadingId(null);
  };

  const restoreVersion = async (workbookId: string, version: WorkbookVersion) => {
    setLoading(true);
    const { error } = await supabase
      .from("workbooks")
      .update({
        file_path: version.file_path,
        file_url: version.file_url,
        thumbnail_path: version.thumbnail_path,
        thumbnail_url: version.thumbnail_url,
      })
      .eq("id", workbookId);
    setLoading(false);
    if (!error) {
      window.location.reload();
    }
  };

  const moveItem = (list: Worksheet[], fromIndex: number, toIndex: number) => {
    const next = [...list];
    const [removed] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, removed);
    return next;
  };

  const persistGroupOrder = async (nextItems: Worksheet[], group: string) => {
    const groupItems = nextItems.filter((item) => groupKey(item) === group);
    if (groupItems.length === 0) return;
    const updates = groupItems.map((item, index) => ({
      id: item.id,
      sort_order: index + 1,
    }));
    setLoading(true);
    await Promise.all(
      updates.map((update) =>
        supabase.from("workbooks").update({ sort_order: update.sort_order }).eq("id", update.id)
      )
    );
    setLoading(false);
  };

  const handleDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId || !dragGroup) return;
    const dragIndex = items.findIndex((item) => item.id === dragId);
    const dropIndex = items.findIndex((item) => item.id === targetId);
    if (dragIndex === -1 || dropIndex === -1) return;
    if (groupKey(items[dropIndex]) !== dragGroup) return;
    const nextItems = moveItem(items, dragIndex, dropIndex);
    setItems(nextItems);
    setDragId(null);
    await persistGroupOrder(nextItems, dragGroup);
  };

  const applyBulkUpdate = async (update: Record<string, unknown>) => {
    if (selected.size === 0) return;
    setLoading(true);
    const ids = Array.from(selected);
    const { error } = await supabase.from("workbooks").update(update).in("id", ids);
    setLoading(false);
    if (!error) {
      setItems((prev) =>
        prev.map((item) =>
          ids.includes(item.id) ? ({ ...item, ...update } as Worksheet) : item
        )
      );
      setSelected(new Set());
    }
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm("Delete selected worksheets? This cannot be undone.")) return;
    setLoading(true);
    const ids = Array.from(selected);
    const { error } = await supabase.from("workbooks").delete().in("id", ids);
    setLoading(false);
    if (!error) {
      setItems((prev) => prev.filter((item) => !ids.includes(item.id)));
      setSelected(new Set());
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded-full border px-4 py-2 text-xs"
          onClick={() => applyBulkUpdate({ is_published: true })}
          disabled={loading || selected.size === 0}
        >
          Publish selected
        </button>
        <button
          type="button"
          className="rounded-full border px-4 py-2 text-xs"
          onClick={() => applyBulkUpdate({ is_published: false })}
          disabled={loading || selected.size === 0}
        >
          Unpublish selected
        </button>
        <button
          type="button"
          className="rounded-full border px-4 py-2 text-xs text-red-500"
          onClick={bulkDelete}
          disabled={loading || selected.size === 0}
        >
          Delete selected
        </button>
        <span className="text-xs text-[color:var(--muted-foreground)]">
          {selected.size > 0 ? `${selected.size} selected` : "Select worksheets to bulk edit"}
        </span>
      </div>

      <div className="space-y-3">
        {items.map((workbook) => (
          <div
            key={workbook.id}
            className="apple-card p-4"
            draggable
            onDragStart={() => {
              setDragId(workbook.id);
              setDragGroup(groupKey(workbook));
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(workbook.id)}
            onDragEnd={() => {
              setDragId(null);
              setDragGroup(null);
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="text-lg text-[color:var(--muted-foreground)] cursor-grab px-1 select-none">
                  ⋮⋮
                </div>
                <input
                  type="checkbox"
                  checked={selected.has(workbook.id)}
                  onChange={() => toggleSelected(workbook.id)}
                  className="mt-1"
                />
                <div className="h-16 w-24 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] overflow-hidden">
                  {workbook.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={workbook.thumbnail_url}
                      alt={workbook.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      No image
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {workbook.subject} · {workbook.level_slug}
                  </div>
                  <div className="font-medium mt-1 flex items-center gap-2">
                    {workbook.title}
                    {workbook.is_featured && (
                      <span className="inline-flex rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {workbook.category ?? "Category"} · {workbook.topic}
                  </div>
                  {statsById[workbook.id] && (
                    <div className="text-xs text-[color:var(--muted-foreground)] mt-2">
                      Opens: {statsById[workbook.id].opens ?? 0} · Downloads:{" "}
                      {statsById[workbook.id].downloads ?? 0} · Last viewed:{" "}
                      {formatDate(statsById[workbook.id].last_opened_at)}
                    </div>
                  )}
                  {workbook.description && (
                    <div className="text-sm text-slate-500 mt-2">
                      {workbook.description}
                    </div>
                  )}
                  {workbook.file_url && (
                    <a
                      className="text-xs text-[color:var(--accent)] mt-2 inline-block"
                      href={workbook.file_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View file
                    </a>
                  )}
                </div>
              </div>
                <div className="text-right space-y-2">
                  <div className="text-xs text-slate-500">
                    {workbook.is_published ? "Published" : "Draft"}
                  </div>
                  <AdminRowActions
                  table="workbooks"
                  id={workbook.id}
                  initialPublished={workbook.is_published}
                  supportsFeatured
                  initialFeatured={workbook.is_featured}
                  cloneData={{
                    subject: workbook.subject,
                    level_slug: workbook.level_slug,
                    category: workbook.category,
                    topic: workbook.topic,
                    title: `${workbook.title} (copy)`,
                    description: workbook.description,
                    thumbnail_url: workbook.thumbnail_url,
                    file_url: workbook.file_url,
                    is_published: false,
                    is_featured: false,
                  }}
                  onDone={() => window.location.reload()}
                  />
                  <details
                    className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3 text-left"
                    onToggle={(event) => {
                      if (event.currentTarget.open) {
                        void loadVersions(workbook.id);
                      }
                    }}
                  >
                    <summary className="cursor-pointer text-xs font-semibold">
                      Version history
                    </summary>
                    <div className="mt-3 space-y-2 text-xs text-[color:var(--muted-foreground)]">
                      {versionLoadingId === workbook.id && <div>Loading versions…</div>}
                      {!versionLoadingId && (versionsById[workbook.id]?.length ?? 0) === 0 && (
                        <div>No versions saved yet.</div>
                      )}
                      {versionsById[workbook.id]?.map((version) => (
                        <div
                          key={version.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <div>{new Date(version.created_at).toLocaleString()}</div>
                          <button
                            type="button"
                            className="rounded-full border px-3 py-1 text-[10px]"
                            onClick={() => restoreVersion(workbook.id, version)}
                          >
                            Restore
                          </button>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            </div>
        ))}

        {items.length === 0 && (
          <div className="text-sm text-slate-500">
            No worksheets yet. Add your first one above.
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-xs text-[color:var(--muted-foreground)]">
        <input type="checkbox" checked={allSelected} onChange={toggleAll} />
        Select all
      </label>
    </div>
  );
}
