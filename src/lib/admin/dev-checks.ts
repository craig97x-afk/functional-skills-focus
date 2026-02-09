import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CheckItem, DevCheckResult } from "@/lib/admin/dev-checks-types";

async function checkTable(
  supabase: SupabaseClient,
  table: string
): Promise<CheckItem> {
  const { error } = await supabase.from(table).select("*").limit(1);
  if (error) {
    return {
      label: table,
      status: "error",
      detail: error.message,
    };
  }
  return { label: table, status: "ok" };
}

async function checkContentTable(
  supabase: SupabaseClient,
  table: string,
  minRows = 1
): Promise<CheckItem> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) {
    return {
      label: table,
      status: "error",
      detail: error.message,
    };
  }
  const rows = count ?? 0;
  if (rows < minRows) {
    return {
      label: table,
      status: "warn",
      detail: `Empty (${rows} rows)`,
    };
  }
  return {
    label: table,
    status: "ok",
    detail: `${rows} rows`,
  };
}

export async function runDevChecks(
  supabase: SupabaseClient
): Promise<DevCheckResult> {
  const envKeys = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", required: true },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", required: true },
    { key: "STRIPE_SECRET_KEY", required: true },
    { key: "STRIPE_PRICE_ID", required: true },
    { key: "STRIPE_WEBHOOK_SECRET", required: true },
    { key: "NEXT_PUBLIC_SITE_URL", required: false },
    { key: "VERCEL_URL", required: false },
  ];

  const envChecks: CheckItem[] = envKeys.map((entry) => {
    const present = Boolean(process.env[entry.key]);
    if (present) {
      return { label: entry.key, status: "ok" };
    }
    return {
      label: entry.key,
      status: entry.required ? "error" : "warn",
      detail: entry.required ? "Missing" : "Optional",
    };
  });

  const tableNames = [
    "app_settings",
    "profiles",
    "subjects",
    "levels",
    "topics",
    "lessons",
    "questions",
    "question_options",
    "practice_attempts",
    "guides",
    "guide_assets",
    "guide_purchases",
    "workbooks",
    "support_conversations",
    "support_messages",
    "progress_comments",
    "achievements",
    "user_achievements",
    "guardian_links",
    "guardian_sessions",
    "lesson_views",
    "user_activity_minutes",
    "user_exams",
    "flashcards",
    "lesson_notes",
    "user_dashboard_widgets",
  ];

  const tableChecks = await Promise.all(
    tableNames.map((table) => checkTable(supabase, table))
  );

  const contentTables = ["subjects", "levels", "topics", "lessons", "guides", "workbooks"];
  const contentChecks = await Promise.all(
    contentTables.map((table) => checkContentTable(supabase, table))
  );

  const { data: guidesBucket, error: guidesBucketError } =
    await supabase.storage.getBucket("guides");
  const { data: workbooksBucket, error: workbooksBucketError } =
    await supabase.storage.getBucket("workbooks");

  const storageChecks: CheckItem[] = [
    {
      label: "storage: guides bucket",
      status: guidesBucketError || !guidesBucket ? "warn" : "ok",
      detail: guidesBucketError?.message,
    },
    {
      label: "storage: workbooks bucket",
      status: workbooksBucketError || !workbooksBucket ? "warn" : "ok",
      detail: workbooksBucketError?.message,
    },
  ];

  const { data: settingsRow, error: settingsError } = await supabase
    .from("app_settings")
    .select("id")
    .eq("id", "default")
    .maybeSingle();

  const miscChecks: CheckItem[] = [
    {
      label: "app_settings: default row",
      status: settingsError
        ? "error"
        : settingsRow
          ? "ok"
          : "warn",
      detail: settingsError?.message ?? (settingsRow ? undefined : "Missing"),
    },
  ];

  return {
    generatedAt: new Date().toLocaleString("en-GB"),
    envChecks,
    tableChecks,
    storageChecks,
    contentChecks,
    miscChecks,
  };
}
