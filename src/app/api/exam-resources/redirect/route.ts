import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/get-auth-context";
import { createAdminClient } from "@/lib/supabase/admin";

const allowedResourceTypes = new Set([
  "exam_mock",
  "question_set",
  "exam_resource_link",
]);

const allowedEventTypes = new Set(["open", "download"]);

function resolveTarget(raw: string | null, requestUrl: string) {
  if (!raw) return null;

  try {
    if (raw.startsWith("/")) {
      return new URL(raw, requestUrl).toString();
    }

    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const resourceType = searchParams.get("resourceType") || "";
  const resourceId = searchParams.get("resourceId") || "";
  const eventType = searchParams.get("eventType") || "";
  const subject = searchParams.get("subject") || "";
  const levelSlug = searchParams.get("levelSlug") || "";
  const target = resolveTarget(searchParams.get("target"), req.url);

  if (
    !allowedResourceTypes.has(resourceType) ||
    !allowedEventTypes.has(eventType) ||
    !resourceId ||
    !target ||
    !(subject === "english" || subject === "maths") ||
    !levelSlug
  ) {
    return NextResponse.json({ error: "Invalid tracking URL." }, { status: 400 });
  }

  try {
    const auth = await getAuthContext();
    const supabase = createAdminClient();

    await supabase.from("exam_resource_events").insert({
      resource_type: resourceType,
      resource_id: resourceId,
      subject,
      level_slug: levelSlug,
      event_type: eventType,
      user_id: auth.user?.id ?? null,
    });
  } catch {
    // Ignore analytics failures and still complete redirect.
  }

  return NextResponse.redirect(target, { status: 307 });
}
