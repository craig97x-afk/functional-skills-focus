"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ParsedRow = {
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
  publish_at: string | null;
  unpublish_at: string | null;
};

const normaliseSubject = (value: string) => {
  const lowered = value.trim().toLowerCase();
  if (lowered.startsWith("math")) return "maths";
  if (lowered.startsWith("eng")) return "english";
  return lowered;
};

const parseBoolean = (value: string | null | undefined) => {
  if (!value) return false;
  const lowered = value.trim().toLowerCase();
  return ["true", "yes", "y", "1", "published"].includes(lowered);
};

const parseNumber = (value: string | null | undefined) => {
  if (!value) return null;
  const number = Number.parseInt(value, 10);
  return Number.isNaN(number) ? null : number;
};

const parseDate = (value: string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const getValue = (row: Record<string, string>, keys: string[]) => {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && `${value}`.trim() !== "") {
      return value;
    }
  }
  return "";
};

export default function WorkbookBulkImport() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const parseCsv = (text: string) => {
    const rows: string[][] = [];
    let current: string[] = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"' && inQuotes && next === '"') {
        field += '"';
        i += 1;
        continue;
      }

      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (char === "," && !inQuotes) {
        current.push(field);
        field = "";
        continue;
      }

      if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") {
          i += 1;
        }
        current.push(field);
        field = "";
        if (current.length > 1 || current[0] !== "") {
          rows.push(current);
        }
        current = [];
        continue;
      }

      field += char;
    }

    if (field.length > 0 || current.length > 0) {
      current.push(field);
      rows.push(current);
    }

    return rows;
  };

  const handleFile = async (file: File) => {
    const text = await file.text();
    const rowsParsed = parseCsv(text);
    if (rowsParsed.length === 0) {
      setMsg("CSV looks empty.");
      setRows([]);
      return;
    }

    const headers = rowsParsed.shift()?.map((header) => header.trim().toLowerCase()) ?? [];
    const parsedRows = rowsParsed
      .filter((row) => row.some((cell) => cell.trim() !== ""))
      .map((row) => {
        const record: Record<string, string> = {};
        headers.forEach((header, index) => {
          record[header] = row[index] ?? "";
        });
        return record;
      });

    const cleaned = parsedRows
      .map((row) => {
        const subjectRaw = getValue(row, ["subject"]);
        const levelRaw = getValue(row, ["level_slug", "level", "levelslug"]);
        const topicRaw = getValue(row, ["topic"]);
        const titleRaw = getValue(row, ["title"]);
        if (!subjectRaw || !levelRaw || !topicRaw || !titleRaw) {
          return null;
        }

        return {
          subject: normaliseSubject(subjectRaw),
          level_slug: levelRaw.trim(),
          category: getValue(row, ["category"]) || null,
          topic: topicRaw.trim(),
          title: titleRaw.trim(),
          description: getValue(row, ["description"]) || null,
          thumbnail_url: getValue(row, ["thumbnail_url", "thumbnail", "thumb"]) || null,
          file_url: getValue(row, ["file_url", "file", "worksheet_url"]) || null,
          is_published: parseBoolean(getValue(row, ["is_published", "published"])),
          is_featured: parseBoolean(getValue(row, ["is_featured", "featured"])),
          sort_order: parseNumber(getValue(row, ["sort_order", "order"])),
          publish_at: parseDate(getValue(row, ["publish_at", "publish_at_iso"])),
          unpublish_at: parseDate(getValue(row, ["unpublish_at", "unpublish_at_iso"])),
        } satisfies ParsedRow;
      })
      .filter(Boolean) as ParsedRow[];

    setRows(cleaned);
    setFileName(file.name);
    setMsg(
      cleaned.length === 0
        ? "No valid rows found. Check required headers: subject, level_slug, topic, title."
        : `Loaded ${cleaned.length} rows.`
    );
  };

  const importRows = async () => {
    if (rows.length === 0) return;
    setLoading(true);
    setMsg(null);
    const chunkSize = 50;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error } = await supabase.from("workbooks").insert(chunk);
      if (error) {
        setMsg(error.message);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    setMsg("Import complete. Refreshing...");
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-[color:var(--muted-foreground)]">
        Upload a CSV with headers: subject, level_slug, category, topic, title, description,
        thumbnail_url, file_url, is_published, is_featured, sort_order, publish_at, unpublish_at.
      </div>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {fileName && (
        <div className="text-xs text-[color:var(--muted-foreground)]">
          Loaded: {fileName}
        </div>
      )}

      {rows.length > 0 && (
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
          <div className="text-sm font-semibold">Preview</div>
          <div className="text-xs text-[color:var(--muted-foreground)] mt-1">
            {rows.length} rows ready to import.
          </div>
          <div className="mt-3 grid gap-2 text-xs text-[color:var(--muted-foreground)]">
            {rows.slice(0, 3).map((row, index) => (
              <div key={`${row.title}-${index}`}>
                {row.subject} · {row.level_slug} · {row.topic} · {row.title}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        className="rounded-md border px-3 py-2 text-sm"
        onClick={importRows}
        disabled={loading || rows.length === 0}
      >
        {loading ? "Importing..." : "Import worksheets"}
      </button>

      {msg && <div className="text-xs text-[color:var(--muted-foreground)]">{msg}</div>}
    </div>
  );
}
