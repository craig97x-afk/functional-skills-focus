import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const levelLabels: Record<string, string> = {
  "entry-1": "Entry Level 1",
  "entry-2": "Entry Level 2",
  "entry-3": "Entry Level 3",
  "fs-1": "Functional Skills Level 1",
  "fs-2": "Functional Skills Level 2",
};

const toTitle = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const labelLevel = (slug: string) => levelLabels[slug] ?? slug;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryRaw = searchParams.get("q")?.trim() ?? "";
  if (queryRaw.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const query = queryRaw.replace(/[%_]/g, "\\$&");
  const like = `%${query}%`;
  const supabase = await createClient();

  const [workbooksRes, mocksRes, setsRes, guidesRes] = await Promise.all([
    supabase
      .from("workbooks")
      .select(
        "id, subject, level_slug, title, description, topic, category, file_url"
      )
      .eq("is_published", true)
      .or(
        `title.ilike.${like},description.ilike.${like},topic.ilike.${like},category.ilike.${like}`
      )
      .limit(8),
    supabase
      .from("exam_mocks")
      .select("id, subject, level_slug, title, description, file_url")
      .eq("is_published", true)
      .or(`title.ilike.${like},description.ilike.${like}`)
      .limit(6),
    supabase
      .from("question_sets")
      .select("id, subject, level_slug, title, description")
      .eq("is_published", true)
      .or(`title.ilike.${like},description.ilike.${like}`)
      .limit(6),
    supabase
      .from("guides")
      .select("id, title, description, category")
      .eq("is_published", true)
      .or(`title.ilike.${like},description.ilike.${like},category.ilike.${like}`)
      .limit(6),
  ]);

  const results = [
    ...(workbooksRes.data ?? []).map((workbook) => {
      const subjectLabel = toTitle(workbook.subject ?? "Subject");
      const levelLabel = labelLevel(workbook.level_slug ?? "");
      const topicLabel = workbook.topic ? ` · ${workbook.topic}` : "";
      const categoryLabel = workbook.category ? ` · ${workbook.category}` : "";
      const meta = `${subjectLabel} · ${levelLabel} · Workbook${topicLabel}${categoryLabel}`;
      const href =
        workbook.file_url || `/${workbook.subject}/levels/${workbook.level_slug}`;
      return {
        id: workbook.id,
        type: "Workbook",
        title: workbook.title,
        description: workbook.description,
        href,
        meta,
        external: Boolean(workbook.file_url),
      };
    }),
    ...(mocksRes.data ?? []).map((mock) => {
      const subjectLabel = toTitle(mock.subject ?? "Subject");
      const levelLabel = labelLevel(mock.level_slug ?? "");
      const meta = `${subjectLabel} · ${levelLabel} · Exam mock`;
      const href =
        mock.file_url || `/${mock.subject}/levels/${mock.level_slug}/resources`;
      return {
        id: mock.id,
        type: "Exam mock",
        title: mock.title,
        description: mock.description,
        href,
        meta,
        external: Boolean(mock.file_url),
      };
    }),
    ...(setsRes.data ?? []).map((set) => {
      const subjectLabel = toTitle(set.subject ?? "Subject");
      const levelLabel = labelLevel(set.level_slug ?? "");
      const meta = `${subjectLabel} · ${levelLabel} · Question set`;
      const href = `/${set.subject}/levels/${set.level_slug}/resources/questions/${set.id}`;
      return {
        id: set.id,
        type: "Question set",
        title: set.title,
        description: set.description,
        href,
        meta,
      };
    }),
    ...(guidesRes.data ?? []).map((guide) => ({
      id: guide.id,
      type: "Guide",
      title: guide.title,
      description: guide.description,
      href: `/guides/${guide.id}`,
      meta: guide.category ? `Shop · ${guide.category}` : "Shop",
    })),
  ];

  return NextResponse.json({ results });
}
