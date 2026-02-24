import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";

export type ResourceFilters = {
  boardSlug?: string | null;
  paperType?: string | null;
  paperYear?: number | null;
  tag?: string | null;
};

export type ResourceEventStats = {
  opens: number;
  downloads: number;
  last_opened_at: string | null;
  last_downloaded_at: string | null;
};

export type ExamMockResource = {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  file_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  exam_board: string | null;
  paper_type: string | null;
  paper_year: number | null;
  tags: string[];
  stats: ResourceEventStats | null;
};

export type QuestionSetResource = {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  resource_url: string | null;
  content: string | null;
  is_published: boolean;
  exam_board: string | null;
  paper_type: string | null;
  paper_year: number | null;
  tags: string[];
  stats: ResourceEventStats | null;
};

export type ExamResourceLinkResource = {
  id: string;
  title: string;
  description: string | null;
  link_url: string;
  link_type: string | null;
  is_published: boolean;
  exam_board: string | null;
  paper_type: string | null;
  paper_year: number | null;
  tags: string[];
  health_status: "unchecked" | "ok" | "broken" | null;
  last_checked_at: string | null;
  last_status_code: number | null;
  last_error: string | null;
  stats: ResourceEventStats | null;
};

export type ResourceFilterOptions = {
  paperTypes: string[];
  years: number[];
  tags: string[];
};

export type LevelResourcesResult = {
  mocks: ExamMockResource[];
  sets: QuestionSetResource[];
  links: ExamResourceLinkResource[];
  linksFallbackUsed: boolean;
  linksLoadError: string | null;
  filterOptions: ResourceFilterOptions;
};

type ResourceType = "exam_mock" | "question_set" | "exam_resource_link";

const sanitizeTag = (value?: string | null) => value?.trim().toLowerCase() || null;

type MetadataFilterQuery = {
  eq: (column: string, value: unknown) => unknown;
  contains: (column: string, value: unknown) => unknown;
};

function applyMetadataFilters<TQuery>(
  query: TQuery,
  filters: ResourceFilters
): TQuery {
  let nextQuery = query as unknown as MetadataFilterQuery;

  if (filters.paperType) {
    nextQuery = nextQuery.eq("paper_type", filters.paperType) as MetadataFilterQuery;
  }

  if (typeof filters.paperYear === "number") {
    nextQuery = nextQuery.eq("paper_year", filters.paperYear) as MetadataFilterQuery;
  }

  const tag = sanitizeTag(filters.tag);
  if (tag) {
    nextQuery = nextQuery.contains("tags", [tag]) as MetadataFilterQuery;
  }

  return nextQuery as unknown as TQuery;
}

function toStatsMap(
  rows: Array<{
    resource_id: string;
    opens: number | null;
    downloads: number | null;
    last_opened_at: string | null;
    last_downloaded_at: string | null;
  }>
) {
  const map = new Map<string, ResourceEventStats>();
  rows.forEach((row) => {
    map.set(row.resource_id, {
      opens: row.opens ?? 0,
      downloads: row.downloads ?? 0,
      last_opened_at: row.last_opened_at,
      last_downloaded_at: row.last_downloaded_at,
    });
  });
  return map;
}

async function loadStats(
  supabase: SupabaseClient,
  resourceType: ResourceType,
  ids: string[]
) {
  if (!ids.length) return new Map<string, ResourceEventStats>();

  const { data } = (await supabase
    .from("exam_resource_event_stats")
    .select("resource_id, opens, downloads, last_opened_at, last_downloaded_at")
    .eq("resource_type", resourceType)
    .in("resource_id", ids)) as {
    data:
      | Array<{
          resource_id: string;
          opens: number | null;
          downloads: number | null;
          last_opened_at: string | null;
          last_downloaded_at: string | null;
        }>
      | null;
  };

  return toStatsMap(data ?? []);
}

function buildFilterOptions(
  mocks: ExamMockResource[],
  sets: QuestionSetResource[],
  links: ExamResourceLinkResource[]
): ResourceFilterOptions {
  const paperTypes = new Set<string>();
  const years = new Set<number>();
  const tags = new Set<string>();

  const addMetadata = (
    row: { paper_type: string | null; paper_year: number | null; tags: string[] }
  ) => {
    if (row.paper_type) paperTypes.add(row.paper_type);
    if (typeof row.paper_year === "number") years.add(row.paper_year);
    row.tags.forEach((tag) => tags.add(tag));
  };

  mocks.forEach(addMetadata);
  sets.forEach(addMetadata);
  links.forEach(addMetadata);

  return {
    paperTypes: [...paperTypes].sort((a, b) => a.localeCompare(b)),
    years: [...years].sort((a, b) => b - a),
    tags: [...tags].sort((a, b) => a.localeCompare(b)),
  };
}

async function loadLevelResourcesInternal(
  supabase: SupabaseClient,
  subject: "english" | "maths",
  levelSlug: string,
  isAdmin: boolean,
  filters: ResourceFilters
): Promise<LevelResourcesResult> {
  const boardSlug = filters.boardSlug ?? null;

  let mocksQuery = supabase
    .from("exam_mocks")
    .select(
      "id, title, description, cover_url, file_url, is_published, is_featured, exam_board, paper_type, paper_year, tags"
    )
    .eq("subject", subject)
    .eq("level_slug", levelSlug)
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (boardSlug) {
    mocksQuery = mocksQuery.or(`exam_board.eq.${boardSlug},exam_board.is.null`);
  }
  if (!isAdmin) {
    mocksQuery = mocksQuery.eq("is_published", true);
  }
  mocksQuery = applyMetadataFilters(mocksQuery, filters);

  let setsQuery = supabase
    .from("question_sets")
    .select(
      "id, title, description, cover_url, resource_url, content, is_published, exam_board, paper_type, paper_year, tags"
    )
    .eq("subject", subject)
    .eq("level_slug", levelSlug)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (boardSlug) {
    setsQuery = setsQuery.or(`exam_board.eq.${boardSlug},exam_board.is.null`);
  }
  if (!isAdmin) {
    setsQuery = setsQuery.eq("is_published", true);
  }
  setsQuery = applyMetadataFilters(setsQuery, filters);

  let linksQuery = supabase
    .from("exam_resource_links")
    .select(
      "id, title, description, link_url, link_type, is_published, exam_board, paper_type, paper_year, tags, health_status, last_checked_at, last_status_code, last_error"
    )
    .eq("subject", subject)
    .eq("level_slug", levelSlug)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (boardSlug) {
    linksQuery = linksQuery.or(`exam_board.eq.${boardSlug},exam_board.is.null`);
  }
  if (!isAdmin) {
    linksQuery = linksQuery.eq("is_published", true);
  }
  linksQuery = applyMetadataFilters(linksQuery, filters);

  const [mocksRes, setsRes, linksRes] = await Promise.all([mocksQuery, setsQuery, linksQuery]);

  const mocksRaw = (mocksRes.data ?? []) as Array<Omit<ExamMockResource, "stats">>;
  const setsRaw = (setsRes.data ?? []) as Array<Omit<QuestionSetResource, "stats">>;
  let linksRaw = (linksRes.data ?? []) as Array<Omit<ExamResourceLinkResource, "stats">>;

  let linksFallbackUsed = false;
  let linksLoadError = linksRes.error?.message ?? null;

  if (!linksLoadError && boardSlug && linksRaw.length === 0) {
    let fallbackLinksQuery = supabase
      .from("exam_resource_links")
      .select(
        "id, title, description, link_url, link_type, is_published, exam_board, paper_type, paper_year, tags, health_status, last_checked_at, last_status_code, last_error"
      )
      .eq("subject", subject)
      .eq("level_slug", levelSlug)
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (!isAdmin) {
      fallbackLinksQuery = fallbackLinksQuery.eq("is_published", true);
    }

    fallbackLinksQuery = applyMetadataFilters(fallbackLinksQuery, filters);

    const fallbackRes = await fallbackLinksQuery;
    if (fallbackRes.error) {
      linksLoadError = fallbackRes.error.message;
    } else if ((fallbackRes.data ?? []).length > 0) {
      linksRaw = (fallbackRes.data ?? []) as Array<Omit<ExamResourceLinkResource, "stats">>;
      linksFallbackUsed = true;
    }
  }

  let mockStatsMap = new Map<string, ResourceEventStats>();
  let setStatsMap = new Map<string, ResourceEventStats>();
  let linkStatsMap = new Map<string, ResourceEventStats>();

  if (isAdmin) {
    [mockStatsMap, setStatsMap, linkStatsMap] = await Promise.all([
      loadStats(
        supabase,
        "exam_mock",
        mocksRaw.map((row) => row.id)
      ),
      loadStats(
        supabase,
        "question_set",
        setsRaw.map((row) => row.id)
      ),
      loadStats(
        supabase,
        "exam_resource_link",
        linksRaw.map((row) => row.id)
      ),
    ]);
  }

  const mocks: ExamMockResource[] = mocksRaw.map((row) => ({
    ...row,
    tags: row.tags ?? [],
    stats: mockStatsMap.get(row.id) ?? null,
  }));

  const sets: QuestionSetResource[] = setsRaw.map((row) => ({
    ...row,
    tags: row.tags ?? [],
    stats: setStatsMap.get(row.id) ?? null,
  }));

  const links: ExamResourceLinkResource[] = linksRaw.map((row) => ({
    ...row,
    tags: row.tags ?? [],
    stats: linkStatsMap.get(row.id) ?? null,
  }));

  return {
    mocks,
    sets,
    links,
    linksFallbackUsed,
    linksLoadError,
    filterOptions: buildFilterOptions(mocks, sets, links),
  };
}

const loadPublicLevelResourcesCached = unstable_cache(
  async (
    subject: "english" | "maths",
    levelSlug: string,
    boardSlug: string | null,
    paperType: string | null,
    paperYear: number | null,
    tag: string | null
  ) => {
    const supabase = createPublicClient();
    return loadLevelResourcesInternal(supabase, subject, levelSlug, false, {
      boardSlug,
      paperType,
      paperYear,
      tag,
    });
  },
  ["level-resources-public-v1"],
  { revalidate: 300 }
);

export async function loadLevelResources({
  subject,
  levelSlug,
  isAdmin,
  filters,
}: {
  subject: "english" | "maths";
  levelSlug: string;
  isAdmin: boolean;
  filters: ResourceFilters;
}) {
  if (!isAdmin) {
    return loadPublicLevelResourcesCached(
      subject,
      levelSlug,
      filters.boardSlug ?? null,
      filters.paperType ?? null,
      typeof filters.paperYear === "number" ? filters.paperYear : null,
      sanitizeTag(filters.tag)
    );
  }

  const supabase = await createServerClient();
  return loadLevelResourcesInternal(supabase, subject, levelSlug, true, filters);
}
