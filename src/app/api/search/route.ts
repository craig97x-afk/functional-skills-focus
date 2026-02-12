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

  const normalized = queryRaw.toLowerCase();
  const tokens = normalized
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => token.length >= 2);

  const synonymMap: Record<string, string[]> = {
    times: ["multiplication", "times tables"],
    multiply: ["multiplication"],
    divide: ["division"],
    add: ["addition"],
    plus: ["addition"],
    minus: ["subtraction"],
    takeaway: ["subtraction"],
    graph: ["graphs", "chart"],
    charts: ["graph"],
    percent: ["percentage", "percentages"],
    fractions: ["fraction"],
    decimals: ["decimal"],
  };

  const expandedTokens = new Set(tokens);
  tokens.forEach((token) => {
    const additions = synonymMap[token];
    if (additions) {
      additions.forEach((item) => expandedTokens.add(item));
    }
  });

  const tokenList = Array.from(expandedTokens);
  const stopTokens = new Set([
    "maths",
    "math",
    "english",
    "entry",
    "level",
    "functional",
    "skills",
    "fs",
  ]);
  const searchTokens = tokenList.filter((token) => !stopTokens.has(token));
  const isKeyword = (values: string[]) =>
    values.some((value) => normalized.includes(value));

  const wantsGuides = isKeyword(["guide", "guides", "shop", "store"]);
  const wantsWorkbooks = isKeyword(["workbook", "workbooks", "worksheet", "pack"]);
  const wantsMocks = isKeyword(["mock", "mocks", "exam", "paper", "papers", "test"]);
  const wantsQuestions = isKeyword(["question", "questions", "quiz", "practice"]);
  const wantsResources = isKeyword(["resource", "resources"]);

  const subjectFilter = normalized.includes("math")
    ? "maths"
    : normalized.includes("english")
    ? "english"
    : null;

  const levelMatch = normalized.match(
    /(entry\s*level\s*[123]|entry\s*[123]|e[123]|fs\s*[12]|functional\s*skills\s*level\s*[12])/
  );
  let levelFilter: string | null = null;
  if (levelMatch) {
    const value = levelMatch[0];
    if (value.includes("entry") || value.startsWith("e")) {
      if (value.includes("1")) levelFilter = "entry-1";
      if (value.includes("2")) levelFilter = "entry-2";
      if (value.includes("3")) levelFilter = "entry-3";
    } else if (value.includes("fs") || value.includes("functional")) {
      if (value.includes("1")) levelFilter = "fs-1";
      if (value.includes("2")) levelFilter = "fs-2";
    }
  }

  const buildOr = (fields: string[]) => {
    if (searchTokens.length === 0) {
      return null;
    }
    const conditions: string[] = [];
    searchTokens.forEach((token) => {
      const escaped = token.replace(/[%_]/g, "\\$&");
      fields.forEach((field) => {
        conditions.push(`${field}.ilike.%${escaped}%`);
      });
    });
    return conditions.join(",");
  };

  const supabase = await createClient();

  const workbookQuery = supabase
    .from("workbooks")
    .select(
      "id, subject, level_slug, title, description, topic, category, file_url"
    )
    .eq("is_published", true);
  if (subjectFilter) workbookQuery.eq("subject", subjectFilter);
  if (levelFilter) workbookQuery.eq("level_slug", levelFilter);

  const workbookOr = buildOr(["title", "description", "topic", "category"]);
  if (!(wantsWorkbooks || wantsResources || wantsGuides) && workbookOr) {
    workbookQuery.or(workbookOr);
  }

  const mockQuery = supabase
    .from("exam_mocks")
    .select("id, subject, level_slug, title, description, file_url")
    .eq("is_published", true);
  if (subjectFilter) mockQuery.eq("subject", subjectFilter);
  if (levelFilter) mockQuery.eq("level_slug", levelFilter);

  const mockOr = buildOr(["title", "description"]);
  if (!(wantsMocks || wantsResources) && mockOr) {
    mockQuery.or(mockOr);
  }

  const setQuery = supabase
    .from("question_sets")
    .select("id, subject, level_slug, title, description, resource_url")
    .eq("is_published", true);
  if (subjectFilter) setQuery.eq("subject", subjectFilter);
  if (levelFilter) setQuery.eq("level_slug", levelFilter);

  const setOr = buildOr(["title", "description"]);
  if (!(wantsQuestions || wantsResources) && setOr) {
    setQuery.or(setOr);
  }

  const guideQuery = supabase
    .from("guides")
    .select("id, title, description, category")
    .eq("is_published", true);
  const guideOr = buildOr(["title", "description", "category"]);
  if (!(wantsGuides || wantsResources) && guideOr) {
    guideQuery.or(guideOr);
  }

  workbookQuery.limit(wantsWorkbooks || wantsResources ? 20 : 12);
  mockQuery.limit(wantsMocks || wantsResources ? 16 : 10);
  setQuery.limit(wantsQuestions || wantsResources ? 16 : 10);
  guideQuery.limit(wantsGuides || wantsResources ? 20 : 10);

  const [workbooksRes, mocksRes, setsRes, guidesRes] = await Promise.all([
    workbookQuery,
    mockQuery,
    setQuery,
    guideQuery,
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
      const href = set.resource_url
        ? set.resource_url
        : `/${set.subject}/levels/${set.level_slug}/resources/questions/${set.id}`;
      return {
        id: set.id,
        type: "Question set",
        title: set.title,
        description: set.description,
        href,
        meta,
        external: Boolean(set.resource_url),
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
