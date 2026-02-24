import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/get-auth-context";
import { createAdminClient } from "@/lib/supabase/admin";

type HealthStatus = "ok" | "broken";

type LinkRow = {
  id: string;
  link_url: string;
  last_checked_at: string | null;
};

const MAX_LINKS = 80;
const STALE_MS = 12 * 60 * 60 * 1000;

function isHttpUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

async function checkLink(url: string): Promise<{
  healthStatus: HealthStatus;
  statusCode: number | null;
  error: string | null;
}> {
  if (!isHttpUrl(url)) {
    return {
      healthStatus: "broken",
      statusCode: null,
      error: "Invalid URL format",
    };
  }

  const runFetch = async (method: "HEAD" | "GET") => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: controller.signal,
        cache: "no-store",
      });
      return res;
    } finally {
      clearTimeout(timeout);
    }
  };

  try {
    let res = await runFetch("HEAD");

    if (res.status === 405 || res.status === 501) {
      res = await runFetch("GET");
    }

    if (res.ok || (res.status >= 300 && res.status < 400)) {
      return {
        healthStatus: "ok",
        statusCode: res.status,
        error: null,
      };
    }

    return {
      healthStatus: "broken",
      statusCode: res.status,
      error: `HTTP ${res.status}`,
    };
  } catch (error) {
    return {
      healthStatus: "broken",
      statusCode: null,
      error: error instanceof Error ? error.message : "Request failed",
    };
  }
}

export async function POST(req: Request) {
  const auth = await getAuthContext();
  if (!auth.user || !auth.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    subject?: string;
    levelSlug?: string;
    maxLinks?: number;
  };

  const subject = body.subject;
  const levelSlug = body.levelSlug;
  const maxLinks = Math.min(Math.max(body.maxLinks ?? 40, 1), MAX_LINKS);

  const supabase = createAdminClient();
  let query = supabase
    .from("exam_resource_links")
    .select("id, link_url, last_checked_at")
    .order("last_checked_at", { ascending: true, nullsFirst: true })
    .limit(maxLinks * 3);

  if (subject === "english" || subject === "maths") {
    query = query.eq("subject", subject);
  }

  if (levelSlug) {
    query = query.eq("level_slug", levelSlug);
  }

  const { data, error } = (await query) as { data: LinkRow[] | null; error: { message: string } | null };

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const now = Date.now();
  const staleCutoff = now - STALE_MS;
  const candidates = (data ?? []).filter((row) => {
    if (!row.last_checked_at) return true;
    const checkedAt = new Date(row.last_checked_at).getTime();
    if (Number.isNaN(checkedAt)) return true;
    return checkedAt < staleCutoff;
  });

  const linksToCheck = candidates.slice(0, maxLinks);
  let checked = 0;
  let ok = 0;
  let broken = 0;

  for (const row of linksToCheck) {
    const result = await checkLink(row.link_url);

    checked += 1;
    if (result.healthStatus === "ok") ok += 1;
    if (result.healthStatus === "broken") broken += 1;

    await supabase
      .from("exam_resource_links")
      .update({
        health_status: result.healthStatus,
        last_checked_at: new Date().toISOString(),
        last_status_code: result.statusCode,
        last_error: result.error,
      })
      .eq("id", row.id);
  }

  return NextResponse.json({
    checked,
    ok,
    broken,
  });
}
