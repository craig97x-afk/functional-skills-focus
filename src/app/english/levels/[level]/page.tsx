import Link from "next/link";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import WorkbookForm from "@/app/admin/workbooks/workbook-form";
import AdminRowActions from "@/components/admin-row-actions";

export const dynamic = "force-dynamic";

const levelLabels: Record<string, string> = {
  "entry-1": "Entry Level 1",
  "entry-2": "Entry Level 2",
  "entry-3": "Entry Level 3",
  "fs-1": "Functional Skills Level 1",
  "fs-2": "Functional Skills Level 2",
};

const entryLevel1Outline = [
  {
    title: "Entry Level 1 (E1) Speaking, Listening and Communicating",
    items: [
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
    title: "Entry Level 1 (E1) Reading",
    items: [
      "Read correctly words designated for Entry Level 1 (see appendix)",
      "Read simple sentences containing one clause",
      "Understand a short piece of text on a simple subject",
    ],
  },
  {
    title: "Entry Level 1 (E1) Writing",
    items: [
      "Punctuate simple sentences with a capital letter and a full stop",
      "Use a capital letter for the personal pronoun 'I' and the first letter of proper nouns",
      "Use lower-case letters when there is no reason to use capital letters",
      "Write the letters of the alphabet in sequence and in both upper and lower case",
      "Spell correctly words designated for Entry Level 1 (see appendix)",
      "Communicate information in words, phrases and simple sentences",
    ],
  },
];

const entryLevel2Outline = [
  {
    title: "Entry Level 2 (E2) Speaking, Listening and Communicating",
    items: [
      "Identify and extract the main information and detail from short explanations",
      "Make requests and ask clear questions appropriately in different contexts",
      "Respond appropriately to straightforward questions",
      "Follow the gist of discussions",
      "Clearly express straightforward information and communicate feelings and opinions on a range of straightforward topics",
      "Make appropriate contributions to simple group discussions with others about straightforward topics",
    ],
  },
  {
    title: "Entry Level 2 (E2) Reading",
    items: [
      "Read correctly words designated for Entry Level 2 (see appendix)",
      "Understand the main points in texts",
      "Understand organisational markers in short, straightforward texts",
      "Use effective strategies to find the meaning of words and check their spelling (e.g. a simple dictionary, a spell-checker)",
      "Read and understand sentences with more than one clause",
      "Use illustrations, images and captions to locate information",
    ],
  },
  {
    title: "Entry Level 2 (E2) Writing",
    items: [
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
];

const entryLevel3Outline = [
  {
    title: "Entry Level 3 (E3) Speaking, Listening and Communicating",
    items: [
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
    title: "Entry Level 3 (E3) Reading",
    items: [
      "Read correctly words designated for Entry Level 3 (see appendix)",
      "Identify, understand and extract the main points and ideas in and from texts",
      "Identify the different purposes of straightforward texts",
      "Use effective strategies to find the meaning of words (e.g. a dictionary, working out the meaning from the context, using their knowledge of different word types)",
      "Understand organisational features and use them to locate relevant information (e.g. contents, index, menus, tabs, links)",
    ],
  },
  {
    title: "Entry Level 3 (E3) Writing",
    items: [
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
];

const level1Outline = [
  {
    title: "Level 1 (L1) Speaking, Listening and Communicating",
    items: [
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
    title: "Level 1 (L1) Reading",
    items: [
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
    title: "Level 1 (L1) Writing",
    items: [
      "Use a range of punctuation correctly (e.g. full stops, question marks, exclamation marks, commas, possessive apostrophes)",
      "Use correct grammar (e.g. subject-verb agreement, consistent use of different tenses, definite and indefinite articles)",
      "Spell words used most often in work, study and daily life, including specialist words",
      "Communicate information, ideas and opinions clearly, coherently and accurately",
      "Write text of an appropriate level of detail and of appropriate length (including where this is specified) to meet the needs of the purpose and audience",
      "Use format, structure and language appropriate for the audience and purpose",
      "Write consistently and accurately in complex sentences, using paragraphs where appropriate",
    ],
  },
];

const level2Outline = [
  {
    title: "Level 2 (L2) Speaking, Listening and Communicating",
    items: [
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
    title: "Level 2 (L2) Reading",
    items: [
      "Identify different contexts when the main points are sufficient and when it is important to have specific details",
      "Compare information, ideas and opinions in different texts, including how they are conveyed",
      "Identify implicit and inferred meaning",
      "Understand the relationship between textual features and devices, and how they can be used to shape meaning for different audiences and purposes",
      "Use a range of reference materials and appropriate resources (e.g. glossaries, legends or keys) for different purposes, including to find the meanings of words in straightforward and complex sources",
      "Understand organisational features and use them to locate relevant information in a range of straightforward and complex sources",
      "Analyse texts of different levels of complexity, recognising their use of vocabulary and identifying levels of formality and bias",
      "Follow an argument, identifying different points of view and distinguishing fact from opinion",
      "Identify different styles of writing and the writer’s voice",
    ],
  },
  {
    title: "Level 2 (L2) Writing",
    items: [
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
];

type Worksheet = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  topic: string;
  thumbnail_path: string | null;
  thumbnail_url: string | null;
  file_path: string | null;
  file_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number | null;
  publish_at: string | null;
  unpublish_at: string | null;
};

export default async function EnglishLevelDetailPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;
  const session = await getUser();
  const isAdmin = session?.profile?.role === "admin";
  const supabase = await createClient();
  const { data: worksheetsRaw } = isAdmin
    ? ((await supabase
        .from("workbooks")
        .select(
          "id, title, description, category, topic, thumbnail_path, thumbnail_url, file_path, file_url, is_published, is_featured, sort_order, publish_at, unpublish_at"
        )
        .eq("subject", "english")
        .eq("level_slug", level)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false })) as { data: Worksheet[] | null })
    : { data: [] as Worksheet[] };
  const worksheets = worksheetsRaw ?? [];
  const worksheetHealth = isAdmin
    ? {
        total: worksheets.length,
        missingThumbnail: worksheets.filter((w) => !w.thumbnail_url).length,
        missingFile: worksheets.filter((w) => !w.file_url).length,
        draft: worksheets.filter((w) => !w.is_published).length,
      }
    : null;
  const title = levelLabels[level] ?? "English Level";
  return (
    <main className="space-y-8">
      <div className="space-y-3">
        <Link className="apple-subtle inline-flex" href="/english/levels">
          ← Back to levels
        </Link>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">English</div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="apple-subtle">
          English content is being built. This level will include reading, writing, and
          communication tasks.
        </p>
      </div>

      {level === "entry-1" && (
        <section className="apple-card p-6 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Entry Level 1 outline
            </div>
            <h2 className="text-xl font-semibold mt-2">
              Suggested lesson titles
            </h2>
            <p className="apple-subtle mt-2">
              These lesson names map to Entry Level 1 Functional Skills English
              requirements.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {entryLevel1Outline.map((section) => (
              <div
                key={section.title}
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4"
              >
                <div className="text-sm font-semibold">{section.title}</div>
                <ul className="mt-3 space-y-2 text-sm text-[color:var(--muted-foreground)]">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {level === "entry-2" && (
        <section className="apple-card p-6 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Entry Level 2 outline
            </div>
            <h2 className="text-xl font-semibold mt-2">
              Suggested lesson titles
            </h2>
            <p className="apple-subtle mt-2">
              These lesson names map to Entry Level 2 Functional Skills English
              requirements.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {entryLevel2Outline.map((section) => (
              <div
                key={section.title}
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4"
              >
                <div className="text-sm font-semibold">{section.title}</div>
                <ul className="mt-3 space-y-2 text-sm text-[color:var(--muted-foreground)]">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {level === "entry-3" && (
        <section className="apple-card p-6 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Entry Level 3 outline
            </div>
            <h2 className="text-xl font-semibold mt-2">
              Suggested lesson titles
            </h2>
            <p className="apple-subtle mt-2">
              These lesson names map to Entry Level 3 Functional Skills English
              requirements.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {entryLevel3Outline.map((section) => (
              <div
                key={section.title}
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4"
              >
                <div className="text-sm font-semibold">{section.title}</div>
                <ul className="mt-3 space-y-2 text-sm text-[color:var(--muted-foreground)]">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {level === "fs-1" && (
        <section className="apple-card p-6 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Level 1 outline
            </div>
            <h2 className="text-xl font-semibold mt-2">
              Suggested lesson titles
            </h2>
            <p className="apple-subtle mt-2">
              These lesson names map to Functional Skills English Level 1
              requirements.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {level1Outline.map((section) => (
              <div
                key={section.title}
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4"
              >
                <div className="text-sm font-semibold">{section.title}</div>
                <ul className="mt-3 space-y-2 text-sm text-[color:var(--muted-foreground)]">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {level === "fs-2" && (
        <section className="apple-card p-6 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Level 2 outline
            </div>
            <h2 className="text-xl font-semibold mt-2">
              Suggested lesson titles
            </h2>
            <p className="apple-subtle mt-2">
              These lesson names map to Functional Skills English Level 2
              requirements.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {level2Outline.map((section) => (
              <div
                key={section.title}
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4"
              >
                <div className="text-sm font-semibold">{section.title}</div>
                <ul className="mt-3 space-y-2 text-sm text-[color:var(--muted-foreground)]">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {isAdmin && (
        <section className="apple-card p-6 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Admin</div>
            <h2 className="text-xl font-semibold mt-2">Manage worksheets</h2>
            <p className="apple-subtle mt-2">
              Add worksheets for this level.
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
          <div className="space-y-3">
            <div className="text-sm font-semibold">Existing worksheets</div>
            {worksheets.length === 0 ? (
              <div className="text-sm text-[color:var(--muted-foreground)]">
                No worksheets yet for this level.
              </div>
            ) : (
              <div className="grid gap-3">
                {worksheets.map((worksheet) => (
                  <div
                    key={worksheet.id}
                    className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 flex flex-wrap items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-24 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] overflow-hidden">
                        {worksheet.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={worksheet.thumbnail_url}
                            alt={worksheet.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] uppercase tracking-[0.2em] text-slate-400">
                            Worksheet
                          </div>
                        )}
                      </div>
                      <div>
                      <div className="font-medium">{worksheet.title}</div>
                      {worksheet.is_featured && (
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)] mt-1">
                          Featured
                        </div>
                      )}
                        <div className="text-xs text-slate-500 mt-1">
                          {worksheet.category ?? "Category"} · {worksheet.topic}
                        </div>
                        {worksheet.description && (
                          <div className="text-sm text-slate-500 mt-2">
                            {worksheet.description}
                          </div>
                        )}
                        {worksheet.file_url && (
                          <a
                            className="text-xs text-[color:var(--accent)] mt-2 inline-block"
                            href={worksheet.file_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View file
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-xs text-slate-500">
                        {worksheet.is_published ? "Published" : "Draft"}
                      </div>
                      <AdminRowActions
                        table="workbooks"
                        id={worksheet.id}
                        initialPublished={worksheet.is_published}
                        supportsFeatured
                        initialFeatured={worksheet.is_featured}
                      />
                      <details className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3 text-left">
                        <summary className="cursor-pointer text-xs font-semibold">
                          Edit worksheet
                        </summary>
                        <div className="mt-3">
                          <WorkbookForm
                            defaultSubject="english"
                            defaultLevel={level}
                            lockSubjectLevel
                            initialWorkbook={{
                              id: worksheet.id,
                              subject: "english",
                              level_slug: level,
                              category: worksheet.category ?? null,
                              topic: worksheet.topic,
                              title: worksheet.title,
                              description: worksheet.description ?? null,
                              thumbnail_path: worksheet.thumbnail_path ?? null,
                              thumbnail_url: worksheet.thumbnail_url ?? null,
                              file_path: worksheet.file_path ?? null,
                              file_url: worksheet.file_url ?? null,
                              is_published: worksheet.is_published,
                              is_featured: worksheet.is_featured,
                              publish_at: worksheet.publish_at ?? null,
                              unpublish_at: worksheet.unpublish_at ?? null,
                            }}
                          />
                        </div>
                      </details>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="apple-card p-6 space-y-3">
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Coming soon</div>
        <h2 className="text-xl font-semibold">Materials in production</h2>
        <p className="apple-subtle">
          We’re preparing guided lessons, revision notes, and practice prompts for this level.
        </p>
      </section>
    </main>
  );
}
