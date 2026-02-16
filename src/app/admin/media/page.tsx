import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import MediaLibrary from "./media-library";

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

export default async function AdminMediaPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: assets } = (await supabase
    .from("media_assets")
    .select("id, title, file_name, media_type, bucket_id, file_path, file_url, created_at")
    .order("created_at", { ascending: false })) as { data: MediaAsset[] | null };

  return (
    <main className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Media</div>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">Media Library</h1>
        <p className="apple-subtle mt-2">
          Upload once and reuse thumbnails/files across worksheets, mocks, and guides.
        </p>
      </div>
      <section className="apple-card p-6">
        <MediaLibrary initialAssets={assets ?? []} />
      </section>
    </main>
  );
}
