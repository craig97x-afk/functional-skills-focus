"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function GuideAdminControls({ guideId }: { guideId: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(false);

  async function deleteGuide() {
    if (!confirm("Delete this guide? This cannot be undone.")) return;
    setLoading(true);
    const { error } = await supabase.from("guides").delete().eq("id", guideId);
    setLoading(false);
    if (!error) {
      window.location.reload();
    }
  }

  return (
    <button
      type="button"
      className="text-xs uppercase tracking-[0.2em] text-red-500 hover:text-red-400"
      onClick={deleteGuide}
      disabled={loading}
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
