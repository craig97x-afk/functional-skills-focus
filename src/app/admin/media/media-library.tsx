"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type MediaAsset = {
  id: string;
  title: string | null;
  file_name: string | null;
  media_type: string;
  bucket_id: string;
  file_path: string;
  file_url: string;
  created_at: string;
};

export default function MediaLibrary({
  initialAssets,
}: {
  initialAssets: MediaAsset[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [assets, setAssets] = useState<MediaAsset[]>(initialAssets);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadAsset = async () => {
    if (!file) {
      setMsg("Select a file to upload.");
      return;
    }
    setLoading(true);
    setMsg(null);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `media/${Date.now()}-${safeName}`;
    const { error: uploadErr } = await supabase.storage
      .from("media")
      .upload(path, file, { upsert: false });

    if (uploadErr) {
      setMsg(uploadErr.message);
      setLoading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(path);
    const mediaType = file.type.startsWith("image/") ? "image" : "file";
    const { data, error } = await supabase
      .from("media_assets")
      .insert({
        title: title.trim() || null,
        file_name: file.name,
        media_type: mediaType,
        bucket_id: "media",
        file_path: path,
        file_url: publicUrl.publicUrl,
      })
      .select("id, title, file_name, media_type, bucket_id, file_path, file_url, created_at")
      .single();

    if (error) {
      setMsg(error.message);
    } else if (data) {
      setAssets((prev) => [data as MediaAsset, ...prev]);
      setTitle("");
      setFile(null);
      setMsg("Uploaded.");
    }
    setLoading(false);
  };

  const deleteAsset = async (asset: MediaAsset) => {
    if (!confirm("Delete this media asset?")) return;
    setLoading(true);
    await supabase.storage.from(asset.bucket_id).remove([asset.file_path]);
    await supabase.from("media_assets").delete().eq("id", asset.id);
    setAssets((prev) => prev.filter((item) => item.id !== asset.id));
    setLoading(false);
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setMsg("URL copied to clipboard.");
    } catch {
      setMsg("Copy failed.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_auto]">
        <label className="block">
          <span className="text-sm">Title (optional)</span>
          <input
            className="mt-1 w-full rounded-md border p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Worksheet thumbnails, exam covers..."
          />
        </label>
        <label className="block">
          <span className="text-sm">Upload file</span>
          <input
            className="mt-1 w-full rounded-md border p-2"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <button
          className="rounded-md border px-3 py-2 text-sm self-end"
          onClick={uploadAsset}
          disabled={loading || !file}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {msg && <div className="text-xs text-[color:var(--muted-foreground)]">{msg}</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <div key={asset.id} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 space-y-3">
            <div className="h-36 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] overflow-hidden flex items-center justify-center">
              {asset.media_type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset.file_url} alt={asset.title ?? "Media"} className="h-full w-full object-cover" />
              ) : (
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">File</div>
              )}
            </div>
            <div>
              <div className="font-medium">{asset.title ?? asset.file_name ?? "Untitled"}</div>
              <div className="text-xs text-[color:var(--muted-foreground)]">
                {new Date(asset.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-full border px-3 py-1 text-xs"
                onClick={() => copyUrl(asset.file_url)}
              >
                Copy URL
              </button>
              <button
                className="rounded-full border px-3 py-1 text-xs text-red-500"
                onClick={() => deleteAsset(asset)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {assets.length === 0 && (
          <div className="text-sm text-[color:var(--muted-foreground)]">
            No media uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
}
