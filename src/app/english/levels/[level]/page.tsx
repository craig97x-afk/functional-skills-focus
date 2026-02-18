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
          "Say the names of the letters of the alphabet",
          "Identify and extract the main information from short statements and explanations",
          "Follow single-step instructions, asking for them to be repeated if necessary",
          "Make requests and ask straightforward questions using appropriate terms and registers",
          "Respond to questions about specific information",
          "Make clear statements about basic information, and communicate their feelings and opinions on straightforward topics",
          "Understand and participate in simple discussions or exchanges with another person about a straightforward topic",
        ],
      },
      {
        title: "Reading",
        topics: [
          "Read correctly words designated for Entry Level 1 (see appendix)",
          "Read simple sentences containing one clause",
          "Understand a short piece of text on a simple subject",
        ],
      },
      {
        title: "Writing",
        topics: [
          "Punctuate simple sentences with a capital letter and a full stop",
          "Use a capital letter for the personal pronoun 'I' and the first letter of proper nouns",
          "Use lower-case letters when there is no reason to use capital letters",
          "Write the letters of the alphabet in sequence and in both upper and lower case",
          "Spell correctly words designated for Entry Level 1 (see appendix)",
          "Communicate information in words, phrases and simple sentences",
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
          "Identify and extract the main information and detail from short explanations",
          "Make requests and ask clear questions appropriately in different contexts",
          "Respond appropriately to straightforward questions",
          "Follow the gist of discussions",
          "Clearly express straightforward information and communicate feelings and opinions on a range of straightforward topics",
          "Make appropriate contributions to simple group discussions with others about straightforward topics",
        ],
      },
      {
        title: "Reading",
        topics: [
          "Read correctly words designated for Entry Level 2 (see appendix)",
          "Understand the main points in texts",
          "Understand organisational markers in short, straightforward texts",
          "Use effective strategies to find the meaning of words and check their spelling (e.g. a simple dictionary, a spell-checker)",
          "Read and understand sentences with more than one clause",
          "Use illustrations, images and captions to locate information",
        ],
      },
      {
        title: "Writing",
        topics: [
          "Use basic punctuation correctly (e.g. full stops, capital letters, question and exclamation marks)",
          "Form regular plurals",
          "Use the first and second letters to sequence words in alphabetical order",
          "Spell correctly words designated for Entry Level 2 (see appendix)",
          "Communicate information using words and phrases appropriate to the purpose and audience",
          "Complete a form asking for personal information (e.g. first name, surname, address, postcode, age, date of birth)",
          "Write in compound sentences, using common conjunctions (e.g. 'or', 'and', 'but') to connect clauses",
          "Use adjectives and simple linking words in the appropriate way",
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
          "Identify and extract relevant information and detail in straightforward explanations",
          "Make requests and ask concise questions using appropriate language in different contexts",
          "Communicate information and opinions clearly on a range of topics",
          "Respond appropriately to questions on a range of straightforward topics",
          "Follow and understand the main points of discussions",
          "Make relevant contributions to group discussions about straightforward topics",
          "Listen to and respond appropriately to other points of view, respecting the conventions of turn-taking",
        ],
      },
      {
        title: "Reading",
        topics: [
          "Read correctly words designated for Entry Level 3 (see appendix)",
          "Identify, understand and extract the main points and ideas in and from texts",
          "Identify the different purposes of straightforward texts",
          "Use effective strategies to find the meaning of words (e.g. a dictionary, working out the meaning from the context, using their knowledge of different word types)",
          "Understand organisational features and use them to locate relevant information (e.g. contents, index, menus, tabs, links)",
        ],
      },
      {
        title: "Writing",
        topics: [
          "Use a range of punctuation correctly (e.g. full stops, question marks, exclamation marks, commas)",
          "Form irregular plurals",
          "Use mostly correct grammar (e.g. subject-verb agreement, consistent use of tense, definite and indefinite articles)",
          "Use the first, second and third letters in a word to sequence words in alphabetical order",
          "Spell correctly words designated for Entry Level 3 (see appendix)",
          "Communicate information, ideas and opinions clearly and in a logical sequence (e.g. chronologically, by task)",
          "Write text of an appropriate level of detail and of appropriate length (including where this is specified)",
          "Use an appropriate format and structure when writing straightforward texts, including the appropriate use of headings and bullet points",
          "Write in compound sentences and paragraphs where appropriate",
          "Use language appropriate to the purpose and audience",
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
          "Identify relevant information and lines of argument in explanations or presentations",
          "Make requests and ask relevant questions to obtain specific information in different contexts",
          "Respond effectively to detailed questions",
          "Communicate information, ideas and opinions clearly and accurately on a range of topics",
          "Express opinions and arguments, and support them with evidence",
          "Follow and understand discussions and make contributions relevant to the situation and subject",
          "Use appropriate phrases and registers, and adapt contributions to take account of purpose, audience and medium",
          "Respect the turn-taking rights of others during discussions, using the appropriate language for interjections",
        ],
      },
      {
        title: "Reading",
        topics: [
          "Identify and understand the main points, ideas and details in texts",
          "Compare information, ideas and opinions in different texts",
          "Identify meanings in texts, and distinguish between fact and opinion",
          "Recognise that language and other textual features can be varied to suit different audiences and purposes",
          "Use reference materials and appropriate strategies (e.g. using knowledge of different word types) for a range of purposes, including to find the meaning of words",
          "Understand organisational and structural features, and use them to locate relevant information (e.g. index, menus, subheadings, paragraphs)",
          "Infer from images meanings not explicit in the accompanying text",
          "Recognise vocabulary typically associated with specific types and purposes of texts (e.g. formal, informal, instructional, descriptive, explanatory, persuasive)",
          "Read and understand a range of specialist words in context",
          "Use their knowledge of punctuation to aid understanding of straightforward texts",
        ],
      },
      {
        title: "Writing",
        topics: [
          "Use a range of punctuation correctly (e.g. full stops, question marks, exclamation marks, commas, possessive apostrophes)",
          "Use correct grammar (e.g. subject-verb agreement, consistent use of different tenses, definite and indefinite articles)",
          "Spell words used most often in work, study and daily life, including specialist words",
          "Communicate information, ideas and opinions clearly, coherently and accurately",
          "Write text of an appropriate level of detail and of appropriate length (including where this is specified) to meet the needs of the purpose and audience",
          "Use format, structure and language appropriate for the audience and purpose",
          "Write consistently and accurately in complex sentences, using paragraphs where appropriate",
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
          "Identify relevant information from extended explanations or presentations",
          "Follow narratives and lines of argument",
          "Respond effectively to detailed or extended questions and feedback",
          "Make requests and ask detailed and pertinent questions to obtain specific information in a range of contexts",
          "Communicate information, ideas and opinions clearly and effectively, providing further detail and development if required",
          "Express opinions and arguments, and support them with relevant and persuasive evidence",
          "Use language that is effective, accurate and appropriate to the context and situation",
          "Make relevant and constructive contributions to move a discussion forward",
          "Adapt their contributions to suit the audience, purpose and medium",
          "Interject and redirect a discussion using appropriate language and register",
        ],
      },
      {
        title: "Reading",
        topics: [
          "Identify different contexts when the main points are sufficient and when it is important to have specific details",
          "Compare information, ideas and opinions in different texts, including how they are conveyed",
          "Identify implicit and inferred meaning",
          "Understand the relationship between textual features and devices, and how they can be used to shape meaning for different audiences and purposes",
          "Use a range of reference materials and appropriate resources (e.g. glossaries, legends or keys) for different purposes, including to find the meanings of words in straightforward and complex sources",
          "Understand organisational features and use them to locate relevant information in a range of straightforward and complex sources",
          "Analyse texts of different levels of complexity, recognising their use of vocabulary and identifying levels of formality and bias",
          "Follow an argument, identifying different points of view and distinguishing fact from opinion",
          "Identify different styles of writing and the writer's voice",
        ],
      },
      {
        title: "Writing",
        topics: [
          "Punctuate correctly, using a wide range of punctuation markers (e.g. colons, commas, inverted commas, apostrophes, quotation marks)",
          "Use correct grammar (e.g. subject-verb agreement, consistent use of a range of tenses, definite and indefinite articles) and modality devices (e.g. to express probability or desirability)",
          "Spell words used in work, study and daily life, including a range of specialist words",
          "Communicate information, ideas and opinions clearly, coherently and effectively",
          "Write text of an appropriate level of detail and of appropriate length (including where this is specified) to meet the needs of the purpose and audience",
          "Organise writing for different purposes using the appropriate format and structure (e.g. standard templates, paragraphs, bullet points, tables)",
          "Convey clear meaning and establish cohesion using organisational markers effectively",
          "Use different language and register (e.g. persuasive techniques, supporting evidence, specialist words) suited to the audience and purpose",
          "Construct complex sentences consistently and accurately, using paragraphs where appropriate",
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
          <- Back to levels
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
