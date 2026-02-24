import Link from "next/link";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import WorkbookForm from "@/app/admin/workbooks/workbook-form";
import LevelTabs from "@/components/level-tabs";

export const dynamic = "force-dynamic";

const englishLevelContent: Record<
  string,
  {
    title: string;
    summary: string;
    categories: {
      title: string;
      topics: string[];
    }[];
  }
> = {
  "entry-1": {
    title: "Entry Level 1",
    summary: "Entry Level 1 English topics aligned to official statements.",
    categories: [
      {
        title: "Speaking, Listening and Communicating",
        topics: [
          "Name alphabet letters",
          "Main info from short statements",
          "Follow single-step instructions (ask repeat)",
          "Make requests and clear questions",
          "Answer questions about specifics",
          "Share basic info, feelings, opinions",
          "Join simple discussions/exchanges",
        ],
      },
      {
        title: "Reading",
        topics: [
          "Read E1 words accurately",
          "Read simple one-clause sentences",
          "Understand short simple texts",
        ],
      },
      {
        title: "Writing",
        topics: [
          "Capital letters + full stops",
          "Capital I and proper nouns",
          "Use lower-case appropriately",
          "Alphabet in order (upper/lower)",
          "Spell E1 words correctly",
          "Words, phrases, simple sentences",
        ],
      },
    ],
  },
  "entry-2": {
    title: "Entry Level 2",
    summary: "Entry Level 2 English topics aligned to official statements.",
    categories: [
      {
        title: "Speaking, Listening and Communicating",
        topics: [
          "Main info/detail in short explanations",
          "Requests and clear questions (contexts)",
          "Respond to straightforward questions",
          "Follow discussion gist",
          "Express info, feelings, opinions clearly",
          "Contribute to simple group discussions",
        ],
      },
      {
        title: "Reading",
        topics: [
          "Read E2 words accurately",
          "Understand main points in texts",
          "Organisational markers in short texts",
          "Strategies for word meaning/spelling",
          "Read sentences with multiple clauses",
          "Use images/captions to locate info",
        ],
      },
      {
        title: "Writing",
        topics: [
          "Use basic punctuation correctly",
          "Form regular plurals",
          "Alphabetical order (first/second letters)",
          "Spell E2 words correctly",
          "Words/phrases for purpose/audience",
          "Complete personal info forms",
          "Compound sentences with conjunctions",
          "Use adjectives and linking words",
        ],
      },
    ],
  },
  "entry-3": {
    title: "Entry Level 3",
    summary: "Entry Level 3 English topics aligned to official statements.",
    categories: [
      {
        title: "Speaking, Listening and Communicating",
        topics: [
          "Relevant info/detail in explanations",
          "Concise requests/questions (contexts)",
          "Communicate info/opinions clearly",
          "Respond to straightforward questions",
          "Follow main points in discussions",
          "Contribute to group discussions",
          "Turn-taking and responding to views",
        ],
      },
      {
        title: "Reading",
        topics: [
          "Read E3 words accurately",
          "Main points/ideas in texts",
          "Identify text purposes",
          "Strategies for word meanings",
          "Use structure to find info",
        ],
      },
      {
        title: "Writing",
        topics: [
          "Use a range of punctuation",
          "Form irregular plurals",
          "Use mostly correct grammar",
          "Alphabetical order (1st-3rd letters)",
          "Spell E3 words correctly",
          "Communicate ideas in logical order",
          "Write appropriate detail/length",
          "Format/structure (headings/bullets)",
          "Compound sentences and paragraphs",
          "Language for purpose/audience",
        ],
      },
    ],
  },
  "fs-1": {
    title: "Functional Skills Level 1",
    summary: "Functional Skills English Level 1 topics aligned to official statements.",
    categories: [
      {
        title: "Speaking, Listening and Communicating",
        topics: [
          "Relevant info/arguments in presentations",
          "Requests/questions for specific info",
          "Respond to detailed questions",
          "Communicate info/ideas/opinions clearly",
          "Support opinions with evidence",
          "Follow discussions; contribute relevantly",
          "Adapt language to purpose/audience",
          "Respect turn-taking and interjections",
        ],
      },
      {
        title: "Reading",
        topics: [
          "Main points, ideas, details",
          "Compare info/ideas/opinions across texts",
          "Distinguish fact vs opinion",
          "Language/features for audience/purpose",
          "Use reference materials/strategies",
          "Use structure to find info",
          "Infer meaning from images",
          "Vocabulary for text types/purposes",
          "Read specialist words in context",
          "Use punctuation to aid reading",
        ],
      },
      {
        title: "Writing",
        topics: [
          "Use a range of punctuation",
          "Use correct grammar",
          "Spell common and specialist words",
          "Communicate clearly and accurately",
          "Write suitable detail/length for audience",
          "Format/structure for audience",
          "Complex sentences with paragraphs",
        ],
      },
    ],
  },
  "fs-2": {
    title: "Functional Skills Level 2",
    summary: "Functional Skills English Level 2 topics aligned to official statements.",
    categories: [
      {
        title: "Speaking, Listening and Communicating",
        topics: [
          "Relevant info in extended presentations",
          "Follow narratives and arguments",
          "Respond to detailed questions/feedback",
          "Detailed questions for specific info",
          "Communicate clearly with detail",
          "Persuasive evidence for arguments",
          "Use accurate language for context",
          "Contribute constructively to discussions",
          "Adapt to audience/purpose/medium",
          "Interject/redirect discussions appropriately",
        ],
      },
      {
        title: "Reading",
        topics: [
          "Know when details matter",
          "Compare ideas and how conveyed",
          "Identify implicit/inferred meaning",
          "Text features shape meaning",
          "Use references to find meanings",
          "Use structure to find info",
          "Analyse vocab, formality, bias",
          "Follow arguments; fact vs opinion",
          "Identify writing styles and voice",
        ],
      },
      {
        title: "Writing",
        topics: [
          "Use wide range of punctuation",
          "Grammar and modality devices",
          "Spell common and specialist words",
          "Communicate clearly and effectively",
          "Write suitable detail/length for audience",
          "Organise writing by purpose",
          "Cohesion using organisational markers",
          "Language/register for audience",
          "Complex sentences with paragraphs",
        ],
      },
    ],
  },
};

type AdminWorkbookRow = {
  id: string;
  thumbnail_url: string | null;
  file_url: string | null;
  is_published: boolean;
};

export default async function EnglishLevelDetailPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;
  const session = await getUser();
  const hasAccess = Boolean(
    session?.profile?.role === "admin" ||
      session?.profile?.is_subscribed ||
      session?.profile?.access_override
  );
  const isAdmin = session?.profile?.role === "admin";

  const supabase = await createClient();
  const { data: adminWorkbooksRaw } = isAdmin
    ? ((await supabase
        .from("workbooks")
        .select("id, thumbnail_url, file_url, is_published")
        .eq("subject", "english")
        .eq("level_slug", level)) as { data: AdminWorkbookRow[] | null })
    : { data: [] as AdminWorkbookRow[] };

  const adminWorkbooks = adminWorkbooksRaw ?? [];
  const worksheetHealth = isAdmin
    ? {
        total: adminWorkbooks.length,
        missingThumbnail: adminWorkbooks.filter((w) => !w.thumbnail_url).length,
        missingFile: adminWorkbooks.filter((w) => !w.file_url).length,
        draft: adminWorkbooks.filter((w) => !w.is_published).length,
      }
    : null;

  const levelData =
    englishLevelContent[level] ?? ({
      title: "English level",
      summary: "We are preparing content for this level.",
      categories: [],
    } as const);

  return (
    <main className="space-y-8">
      <div className="space-y-3">
        <Link className="apple-subtle inline-flex" href="/english/levels">
          Back to levels
        </Link>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">English</div>
        <h1 className="text-3xl font-semibold tracking-tight">{levelData.title}</h1>
        <p className="apple-subtle">{levelData.summary}</p>
      </div>

      {isAdmin && (
        <section className="apple-card p-6 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Admin</div>
            <h2 className="text-xl font-semibold mt-2">Manage worksheets</h2>
            <p className="apple-subtle mt-2">
              Add worksheets for this level without leaving the page.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <details className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
              <summary className="cursor-pointer text-sm font-semibold">
                Add a worksheet
              </summary>
              <div className="mt-4">
                <WorkbookForm
                  defaultSubject="english"
                  defaultLevel={level}
                  lockSubjectLevel
                />
              </div>
            </details>
          </div>
          {worksheetHealth && (
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4 text-sm">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Content health
              </div>
              <div className="mt-2 flex flex-wrap gap-4">
                <div>Total: {worksheetHealth.total}</div>
                <div>Drafts: {worksheetHealth.draft}</div>
                <div>Missing files: {worksheetHealth.missingFile}</div>
                <div>Missing thumbnails: {worksheetHealth.missingThumbnail}</div>
              </div>
            </div>
          )}
        </section>
      )}

      {levelData.categories.length > 0 ? (
        <LevelTabs
          categories={levelData.categories}
          subject="english"
          levelSlug={level}
          hasAccess={hasAccess}
          isAdmin={isAdmin}
        />
      ) : (
        <section className="apple-card p-6 space-y-3">
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Coming soon</div>
          <h2 className="text-xl font-semibold">Materials in production</h2>
          <p className="apple-subtle">
            We're preparing guided lessons, revision notes, and practice prompts for this level.
          </p>
        </section>
      )}
    </main>
  );
}
