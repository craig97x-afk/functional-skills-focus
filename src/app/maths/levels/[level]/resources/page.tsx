import Link from "next/link";
import ExamMockForm from "@/app/admin/questions/exam-mock-form";
import QuestionSetForm from "@/app/admin/questions/question-set-form";
import ExamResourceLinkForm from "@/app/admin/questions/exam-resource-link-form";
import AdminRowActions from "@/components/admin-row-actions";
import ExamResourceFilters from "@/components/exam-resource-filters";
import ExamLinkHealthRunner from "@/components/exam-link-health-runner";
import { getAuthContext } from "@/lib/auth/get-auth-context";
import { getExamBoardBySlug, getExamBoardLabel } from "@/lib/exam-boards";
import { loadLevelResources } from "@/lib/exam-resources/load-level-resources";
import { getPaperTypeLabel } from "@/lib/exam-resources/metadata";
import { buildTrackedResourceUrl } from "@/lib/exam-resources/tracking";

export const revalidate = 300;

const levelLabels: Record<string, string> = {
  "entry-1": "Entry Level 1",
  "entry-2": "Entry Level 2",
  "entry-3": "Entry Level 3",
  "fs-1": "Functional Skills Level 1",
  "fs-2": "Functional Skills Level 2",
};

export default async function MathsLevelResourcesPage({
  params,
  searchParams,
}: {
  params: Promise<{ level: string }>;
  searchParams?: {
    board?: string;
    paperType?: string;
    year?: string;
    tag?: string;
  };
}) {
  const { level } = await params;
  const label = levelLabels[level] ?? "Level";
  const selectedBoard = getExamBoardBySlug("maths", level, searchParams?.board);
  const boardLabel = getExamBoardLabel(selectedBoard?.slug);
  const paperType = searchParams?.paperType?.trim() || null;
  const parsedYear = searchParams?.year ? Number.parseInt(searchParams.year, 10) : null;
  const paperYear = typeof parsedYear === "number" && Number.isFinite(parsedYear) ? parsedYear : null;
  const tag = searchParams?.tag?.trim().toLowerCase() || null;

  const activeSearch = new URLSearchParams();
  if (selectedBoard?.slug) activeSearch.set("board", selectedBoard.slug);
  if (paperType) activeSearch.set("paperType", paperType);
  if (paperYear) activeSearch.set("year", String(paperYear));
  if (tag) activeSearch.set("tag", tag);
  const activeQuery = activeSearch.toString();

  const { isAdmin } = await getAuthContext();
  const {
    mocks,
    sets,
    links,
    linksFallbackUsed,
    linksLoadError,
    filterOptions,
  } = await loadLevelResources({
    subject: "maths",
    levelSlug: level,
    isAdmin,
    filters: {
      boardSlug: selectedBoard?.slug ?? null,
      paperType,
      paperYear,
      tag,
    },
  });

  const mockHealth = isAdmin
    ? {
        total: mocks.length,
        draft: mocks.filter((mock) => !mock.is_published).length,
        missingCover: mocks.filter((mock) => !mock.cover_url).length,
        missingFile: mocks.filter((mock) => !mock.file_url).length,
      }
    : null;
  const setHealth = isAdmin
    ? {
        total: sets.length,
        draft: sets.filter((set) => !set.is_published).length,
        missingCover: sets.filter((set) => !set.cover_url).length,
        missingResource: sets.filter((set) => !set.content && !set.resource_url).length,
      }
    : null;
  const basePath = `/maths/levels/${level}`;

  return (
    <main className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link className="apple-subtle inline-flex" href="/maths/levels">
            ← Back to levels
          </Link>
          <span className="text-slate-400">/</span>
          <Link className="apple-subtle inline-flex" href={basePath}>
            {label}
          </Link>
        </div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Maths</div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {label} resources
        </h1>
        <p className="apple-subtle">
          Exam mocks and question packs matched to this level. All mocks are free for now.
        </p>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Exam board: {boardLabel}
        </div>
        <ExamResourceFilters
          basePath={basePath}
          selectedBoard={selectedBoard?.slug ?? null}
          paperType={paperType}
          paperYear={paperYear}
          tag={tag}
          options={filterOptions}
        />
        {isAdmin && (
          <section className="apple-card p-6 space-y-4">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Admin
              </div>
              <h2 className="text-xl font-semibold mt-2">Add resources</h2>
              <p className="apple-subtle mt-2">
                Upload new exam mocks, question sets, or add external sample links.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <details className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                <summary className="cursor-pointer text-sm font-semibold">
                  Add exam mock
                </summary>
                <div className="mt-4">
                  <ExamMockForm
                    defaultSubject="maths"
                    defaultLevel={level}
                    lockSubjectLevel
                  />
                </div>
              </details>
              <details className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                <summary className="cursor-pointer text-sm font-semibold">
                  Add question set
                </summary>
                <div className="mt-4">
                  <QuestionSetForm
                    defaultSubject="maths"
                    defaultLevel={level}
                    lockSubjectLevel
                  />
                </div>
              </details>
              <details className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                <summary className="cursor-pointer text-sm font-semibold">
                  Add external link
                </summary>
                <div className="mt-4">
                  <ExamResourceLinkForm
                    defaultSubject="maths"
                    defaultLevel={level}
                    lockSubjectLevel
                  />
                </div>
              </details>
            </div>
            <Link
              className="inline-flex rounded-full border px-4 py-2 text-xs transition border-[color:var(--accent)] bg-[color:var(--accent)] text-white hover:text-white !text-white"
              href="/admin/questions"
            >
              Open full resources manager
            </Link>
          </section>
        )}
        {isAdmin && (mockHealth || setHealth) && (
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4 text-sm">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Content health
            </div>
            <div className="mt-2 flex flex-wrap gap-4">
              {mockHealth && (
                <>
                  <div>Mocks: {mockHealth.total}</div>
                  <div>Mock drafts: {mockHealth.draft}</div>
                  <div>Mocks missing covers: {mockHealth.missingCover}</div>
                  <div>Mocks missing files: {mockHealth.missingFile}</div>
                </>
              )}
              {setHealth && (
                <>
                  <div>Question sets: {setHealth.total}</div>
                  <div>Set drafts: {setHealth.draft}</div>
                  <div>Sets missing covers: {setHealth.missingCover}</div>
                  <div>Sets missing resources: {setHealth.missingResource}</div>
                </>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Link
            className="rounded-full border px-4 py-2 text-sm transition border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]"
            href={basePath}
          >
            Worksheets
          </Link>
          <Link
            className="rounded-full border px-4 py-2 text-sm transition border-[color:var(--accent)] bg-[color:var(--accent)] text-white hover:text-white !text-white"
            href={activeQuery ? `${basePath}/resources?${activeQuery}` : `${basePath}/resources`}
          >
            Resources
          </Link>
          <Link
            className="rounded-full border px-4 py-2 text-sm transition border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]"
            href={`${basePath}/resources/boards`}
          >
            Change exam board
          </Link>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Official links
          </div>
          <h2 className="text-2xl font-semibold mt-2">External sample links</h2>
          <p className="apple-subtle mt-1">
            Direct links to sample papers, mark schemes, and specs from awarding bodies.
          </p>
          {isAdmin && <ExamLinkHealthRunner subject="maths" levelSlug={level} />}
          {linksFallbackUsed && (
            <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
              No board-specific links for {boardLabel} yet, so showing all boards for this
              level.
            </p>
          )}
          {isAdmin && linksLoadError && (
            <p className="mt-2 text-xs text-red-500">
              Could not load external links: {linksLoadError}
            </p>
          )}
        </div>

        {links.length === 0 ? (
          <div className="apple-card p-6 text-sm text-[color:var(--muted-foreground)]">
            No external sample links yet for this level.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {links.map((link) => {
              const trackedLinkUrl = buildTrackedResourceUrl({
                resourceType: "exam_resource_link",
                resourceId: link.id,
                eventType: "open",
                subject: "maths",
                levelSlug: level,
                targetUrl: link.link_url,
              });

              return (
                <article key={link.id} className="apple-card p-5 flex flex-col gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-lg font-semibold">{link.title}</div>
                      {link.link_type && (
                        <span className="inline-flex rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                          {link.link_type}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {link.paper_type && (
                        <span className="inline-flex rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                          {getPaperTypeLabel(link.paper_type)}
                        </span>
                      )}
                      {link.paper_year && (
                        <span className="inline-flex rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                          {link.paper_year}
                        </span>
                      )}
                      {link.tags.map((tagItem) => (
                        <span
                          key={`${link.id}-${tagItem}`}
                          className="inline-flex rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[10px] lowercase tracking-[0.08em] text-[color:var(--muted-foreground)]"
                        >
                          {tagItem}
                        </span>
                      ))}
                      {isAdmin && (
                        <span
                          className={[
                            "inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]",
                            link.health_status === "broken"
                              ? "border-red-400 text-red-500"
                              : link.health_status === "ok"
                              ? "border-emerald-400 text-emerald-500"
                              : "border-[color:var(--border)] text-[color:var(--muted-foreground)]",
                          ].join(" ")}
                        >
                          {link.health_status ?? "unchecked"}
                        </span>
                      )}
                    </div>
                    {link.description && (
                      <p className="text-sm text-[color:var(--muted-foreground)]">
                        {link.description}
                      </p>
                    )}
                    {isAdmin && link.stats && (
                      <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                        Opens {link.stats.opens} · Downloads {link.stats.downloads}
                      </div>
                    )}
                    {isAdmin && link.last_error && (
                      <div className="text-[10px] text-red-500">{link.last_error}</div>
                    )}
                    <a
                      className="inline-flex rounded-full border px-4 py-2 text-xs text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]"
                      href={trackedLinkUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open link
                    </a>
                    {isAdmin && (
                      <div className="pt-2">
                        <AdminRowActions
                          table="exam_resource_links"
                          id={link.id}
                          initialPublished={link.is_published}
                        />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Exam mocks</div>
            <h2 className="text-2xl font-semibold mt-2">Practice papers</h2>
            <p className="apple-subtle mt-1">
              Printable exam papers and mock assessments aligned to this level.
            </p>
          </div>
        </div>

        {mocks.length === 0 ? (
          <div className="apple-card p-6 text-sm text-[color:var(--muted-foreground)]">
            No exam mocks published yet for this level.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {mocks.map((mock) => {
              const trackedMockUrl = mock.file_url
                ? buildTrackedResourceUrl({
                    resourceType: "exam_mock",
                    resourceId: mock.id,
                    eventType: "download",
                    subject: "maths",
                    levelSlug: level,
                    targetUrl: mock.file_url,
                  })
                : null;

              return (
                <article key={mock.id} className="apple-card p-5 flex flex-col gap-4">
                  <div className="h-40 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] overflow-hidden">
                    {mock.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mock.cover_url}
                        alt={mock.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs uppercase tracking-[0.2em] text-slate-400">
                        Exam Mock
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-lg font-semibold">{mock.title}</div>
                      {mock.is_featured && (
                        <span className="inline-flex rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {mock.paper_type && (
                        <span className="inline-flex rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                          {getPaperTypeLabel(mock.paper_type)}
                        </span>
                      )}
                      {mock.paper_year && (
                        <span className="inline-flex rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                          {mock.paper_year}
                        </span>
                      )}
                      {mock.tags.map((tagItem) => (
                        <span
                          key={`${mock.id}-${tagItem}`}
                          className="inline-flex rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[10px] lowercase tracking-[0.08em] text-[color:var(--muted-foreground)]"
                        >
                          {tagItem}
                        </span>
                      ))}
                    </div>
                    {mock.description && (
                      <p className="text-sm text-[color:var(--muted-foreground)]">
                        {mock.description}
                      </p>
                    )}
                    {isAdmin && mock.stats && (
                      <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                        Opens {mock.stats.opens} · Downloads {mock.stats.downloads}
                      </div>
                    )}
                    {trackedMockUrl ? (
                      <a
                        className="inline-flex rounded-full border px-4 py-2 text-xs text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]"
                        href={trackedMockUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open mock
                      </a>
                    ) : (
                      <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                        {mock.is_published ? "File coming soon" : "Draft"}
                      </div>
                    )}
                    {isAdmin && (
                      <div className="pt-2">
                        <AdminRowActions
                          table="exam_mocks"
                          id={mock.id}
                          initialPublished={mock.is_published}
                          supportsFeatured
                          initialFeatured={mock.is_featured}
                          cloneData={{
                            subject: "maths",
                            level_slug: level,
                            exam_board: mock.exam_board,
                            paper_type: mock.paper_type,
                            paper_year: mock.paper_year,
                            tags: mock.tags,
                            title: `${mock.title} (copy)`,
                            description: mock.description,
                            cover_url: mock.cover_url,
                            file_url: mock.file_url,
                            is_published: false,
                            is_featured: false,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Question banks
          </div>
          <h2 className="text-2xl font-semibold mt-2">Topic question sets</h2>
          <p className="apple-subtle mt-1">
            Short question packs that focus on one skill at a time.
          </p>
        </div>

        {sets.length === 0 ? (
          <div className="apple-card p-6 text-sm text-[color:var(--muted-foreground)]">
            No question sets published yet for this level.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {sets.map((set) => {
              const questionSetPath = activeQuery
                ? `${basePath}/resources/questions/${set.id}?${activeQuery}`
                : `${basePath}/resources/questions/${set.id}`;

              const trackedQuestionSetOpenUrl = buildTrackedResourceUrl({
                resourceType: "question_set",
                resourceId: set.id,
                eventType: "open",
                subject: "maths",
                levelSlug: level,
                targetUrl: questionSetPath,
              });

              const trackedQuestionSetDownloadUrl = set.resource_url
                ? buildTrackedResourceUrl({
                    resourceType: "question_set",
                    resourceId: set.id,
                    eventType: "download",
                    subject: "maths",
                    levelSlug: level,
                    targetUrl: set.resource_url,
                  })
                : null;

              return (
                <article key={set.id} className="apple-card p-5 flex flex-col gap-4">
                  <div className="h-32 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] overflow-hidden">
                    {set.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={set.cover_url}
                        alt={set.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs uppercase tracking-[0.2em] text-slate-400">
                        Question Set
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="text-lg font-semibold">{set.title}</div>
                    <div className="flex flex-wrap items-center gap-2">
                      {set.paper_type && (
                        <span className="inline-flex rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                          {getPaperTypeLabel(set.paper_type)}
                        </span>
                      )}
                      {set.paper_year && (
                        <span className="inline-flex rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                          {set.paper_year}
                        </span>
                      )}
                      {set.tags.map((tagItem) => (
                        <span
                          key={`${set.id}-${tagItem}`}
                          className="inline-flex rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[10px] lowercase tracking-[0.08em] text-[color:var(--muted-foreground)]"
                        >
                          {tagItem}
                        </span>
                      ))}
                    </div>
                    {set.description && (
                      <p className="text-sm text-[color:var(--muted-foreground)]">
                        {set.description}
                      </p>
                    )}
                    {isAdmin && set.stats && (
                      <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                        Opens {set.stats.opens} · Downloads {set.stats.downloads}
                      </div>
                    )}
                    {set.content ? (
                      <div className="flex flex-wrap gap-2">
                        <a
                          className="inline-flex rounded-full border px-4 py-2 text-xs text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]"
                          href={trackedQuestionSetOpenUrl}
                        >
                          Open question set
                        </a>
                        {trackedQuestionSetDownloadUrl && (
                          <a
                            className="inline-flex rounded-full border px-4 py-2 text-xs text-[color:var(--muted-foreground)] hover:bg-[color:var(--surface-muted)]"
                            href={trackedQuestionSetDownloadUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Download PDF
                          </a>
                        )}
                      </div>
                    ) : trackedQuestionSetDownloadUrl ? (
                      <a
                        className="inline-flex rounded-full border px-4 py-2 text-xs text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]"
                        href={trackedQuestionSetDownloadUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open question set
                      </a>
                    ) : (
                      <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                        {set.is_published ? "Resource coming soon" : "Draft"}
                      </div>
                    )}
                    {isAdmin && (
                      <div className="pt-2">
                        <AdminRowActions
                          table="question_sets"
                          id={set.id}
                          initialPublished={set.is_published}
                        />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
