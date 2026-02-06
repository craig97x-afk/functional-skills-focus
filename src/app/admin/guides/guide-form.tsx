"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type GuideType = "pdf" | "markdown" | "video";

export default function GuideForm() {
  const supabase = useMemo(() => createClient(), []);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<GuideType>("pdf");
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("9.99");
  const [stripePriceId, setStripePriceId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [published, setPublished] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createGuide() {
    setLoading(true);
    setMsg(null);

    const priceNumber = Number(price);
    const priceCents = Number.isFinite(priceNumber)
      ? Math.max(0, Math.round(priceNumber * 100))
      : 0;

    if (priceCents > 0 && !stripePriceId.trim()) {
      setMsg("Add a Stripe price ID for paid guides.");
      setLoading(false);
      return;
    }

    let filePath: string | null = null;
    let fileUrl: string | null = null;

    if (type !== "markdown") {
      if (!file) {
        setMsg("Upload a PDF or video file.");
        setLoading(false);
        return;
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `guides/${Date.now()}-${safeName}`;
      const { error: uploadErr } = await supabase.storage
        .from("guides")
        .upload(path, file, { upsert: false });

      if (uploadErr) {
        setMsg(uploadErr.message);
        setLoading(false);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("guides")
        .getPublicUrl(path);
      filePath = path;
      fileUrl = publicUrl.publicUrl;
    }

    const { error } = await supabase.from("guides").insert({
      title,
      description: description || null,
      type,
      content: type === "markdown" ? content : null,
      file_path: filePath,
      file_url: fileUrl,
      price_cents: priceCents,
      currency: "gbp",
      stripe_price_id: stripePriceId.trim() || null,
      is_published: published,
    });

    setLoading(false);
    setMsg(error ? error.message : "Guide created. Refreshing...");
    if (!error) window.location.reload();
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm">Title</span>
        <input
          className="mt-1 w-full rounded-md border p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Fractions Revision Pack"
        />
      </label>

      <label className="block">
        <span className="text-sm">Description</span>
        <textarea
          className="mt-1 w-full rounded-md border p-2 min-h-[100px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short summary of what the guide contains."
        />
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-sm">Guide type</span>
          <select
            className="mt-1 w-full rounded-md border p-2"
            value={type}
            onChange={(e) => setType(e.target.value as GuideType)}
          >
            <option value="pdf">PDF</option>
            <option value="markdown">Markdown</option>
            <option value="video">Video</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm">Price (GBP)</span>
          <input
            className="mt-1 w-full rounded-md border p-2"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm">Stripe price ID</span>
        <input
          className="mt-1 w-full rounded-md border p-2"
          value={stripePriceId}
          onChange={(e) => setStripePriceId(e.target.value)}
          placeholder="price_..."
        />
      </label>

      {type === "markdown" ? (
        <label className="block">
          <span className="text-sm">Markdown content</span>
          <textarea
            className="mt-1 w-full rounded-md border p-2 min-h-[180px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your guide content here."
          />
        </label>
      ) : (
        <label className="block">
          <span className="text-sm">Upload file</span>
          <input
            className="mt-1 w-full rounded-md border p-2"
            type="file"
            accept={type === "pdf" ? "application/pdf" : "video/*"}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      )}

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        <span className="text-sm">Published</span>
      </label>

      <button
        className="rounded-md border px-3 py-2"
        onClick={createGuide}
        disabled={loading || !title}
      >
        {loading ? "Saving..." : "Create guide"}
      </button>

      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
