import Link from "next/link";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import LevelTabs from "@/components/level-tabs";
import WorkbookForm from "@/app/admin/workbooks/workbook-form";

export const dynamic = "force-dynamic";

const levelContent: Record<
  string,
  {
    title: string;
    summary: string;
    comingSoon?: boolean;
    categories?: {
      title: string;
      topics: string[];
    }[];
  }
> = {
  "entry-1": {
    title: "Entry Level 1",
    summary: "Entry Level 1 topics aligned to official statements.",
    categories: [
      {
        title: "Using numbers and the number system",
        topics: [
          "Read, write, order and compare numbers up to 20",
          "Use whole numbers to count up to 20 items including zero",
          "Add numbers which total up to 20 and subtract numbers from numbers up to 20",
          "Recognise and interpret the symbols +, - and = appropriately",
        ],
      },
      {
        title: "Using common measures, shape and space",
        topics: [
          "Recognise coins and notes, and write them in numbers with the correct symbols (£ and p), where these involve numbers up to 20",
          "Read 12-hour digital and analogue clocks in hours",
          "Know the number, name and sequence of: days in a week; months; the seasons",
          "Describe and make comparisons in words between measures of items, including: size, length, width, height, weight, capacity",
          "Identify and recognise common 2-dimensional (2-D) and 3-dimensional (3-D) shapes, including a: circle, cube, rectangle (includes squares), triangle",
          "Use everyday positional vocabulary to describe position and direction, including: left, right, in front, behind, under, above",
        ],
      },
      {
        title: "Handling information and data",
        topics: [
          "Read numerical information from lists",
          "Sort and classify objects using a single criterion",
          "Read and draw simple charts and diagrams, including a: tally chart, block diagram, graph",
        ],
      },
      {
        title: "Solving mathematical problems and decision-making",
        topics: [
          "Recognise a simple mathematical problem; obtain a solution. (A simple mathematical problem is one that requires working through one step or process.)",
        ],
      },
    ],
  },
  "entry-2": {
    title: "Entry Level 2",
    summary: "Entry Level 2 topics aligned to official statements.",
    categories: [
      {
        title: "Using numbers and the number system",
        topics: [
          "Count reliably up to 100 items",
          "Read, write, order and compare numbers up to 200",
          "Recognise and sequence odd and even numbers up to 100",
          "Recognise and interpret the symbols +, -, x, ÷ and = appropriately",
          "Add and subtract 2-digit numbers",
          "Multiply whole numbers in the range 0 x 0 to 12 x 12 using times tables",
          "Know the number and sequence of: hours in a day; weeks in a year",
          "Divide 2-digit whole numbers by single-digit whole numbers and express remainders",
          "Approximate by rounding to the nearest 10, and use this rounded answer to check results",
          "Recognise simple fractions (halves, quarters and tenths) of: whole numbers; shapes",
          "Read, write and use decimals to one decimal place",
        ],
      },
      {
        title: "Using common measures, shape and space",
        topics: [
          "Calculate money with pence up to one pound and in whole pounds of multiple items, and write the value using the correct symbols (£ or p)",
          "Read and record time in common date formats, understand hours from a 24-hour digital clock, and read the time displayed on an analogue clock in: hours; half-hours; quarter-hours",
          "Use metric measures of length, including: millimetres; centimetres; metres; kilometres",
          "Use measures of weight, including: grams; kilograms",
          "Use measures of capacity, including: millilitres; litres",
          "Read and compare positive temperatures",
          "Read and use simple scales to the nearest labelled division",
          "Recognise and name 2-D and 3-D shapes, including: pentagons; hexagons; cylinders; cuboids; pyramids; spheres",
          "Describe the properties of common 2-D and 3-D shapes, including: numbers of sides; corners; edges; faces; angles; base",
          "Use appropriate positional vocabulary to describe position and direction, including: between; inside; outside; middle; below; on top; forwards; backwards",
        ],
      },
      {
        title: "Handling information and data",
        topics: [
          "Extract information from: lists; tables; diagrams; bar charts",
          "Make numerical comparisons from bar charts",
          "Sort and classify objects using 2 criteria",
          "Take information from one format and represent the information in another format, including using a bar chart",
        ],
      },
      {
        title: "Solving mathematical problems and decision-making",
        topics: [
          "Recognise a simple mathematical problem; obtain a solution. (A simple mathematical problem is one that requires working through one step or process.)",
        ],
      },
    ],
  },
  "entry-3": {
    title: "Entry Level 3",
    summary: "Core maths foundations organised by topic category.",
    categories: [
      {
        title: "Using Numbers",
        topics: [
          "Number Basics",
          "Addition and Subtraction",
          "Multiplication",
          "Division",
          "Rounding and Estimating",
          "Decimal Basics",
          "Fraction Basics",
          "Number Patterns",
        ],
      },
      {
        title: "Common Measures, Shape and Space",
        topics: [
          "Money",
          "Length",
          "Capacity",
          "Weight",
          "Time",
          "Temperature",
          "Scales",
          "Angles",
          "Symmetry and 2D Shapes",
          "3D Shape Basics",
          "Movement and Direction",
        ],
      },
      {
        title: "Handling Information and Data",
        topics: ["Lists", "Tables", "Tally Charts", "Bar Charts", "Line Graphs"],
      },
    ],
  },
  "fs-1": {
    title: "Functional Skills Maths Level 1",
    summary: "Level 1 topics across number, measures, and data handling.",
    categories: [
      {
        title: "Using Numbers",
        topics: [
          "Numbers and Place Value",
          "Ordering Numbers",
          "Addition and Subtraction",
          "Multiplication",
          "Division",
          "BIDMAS",
          "Fractions",
          "Decimals",
          "Rounding and Estimating",
          "Percentages",
          "Fractions, Decimals and Percentages",
          "Ratio",
          "Proportion",
          "Formulas",
        ],
      },
      {
        title: "Common Measures, Shape and Space",
        topics: [
          "Length",
          "Capacity",
          "Weight",
          "Time",
          "Problems Involving Money",
          "Interest",
          "Perimeter",
          "Area",
          "Circles",
          "3D Shapes",
          "Volume",
          "Using Length, Area and Volume in Calculations",
          "Nets",
          "Plans and Elevations",
          "2D Shapes",
          "Maps and Scale Drawings",
          "Angles and Bearings",
        ],
      },
      {
        title: "Handling Information and Data",
        topics: [
          "Data Tables",
          "Bar Charts",
          "Line Graphs",
          "Pie Charts",
          "Grouped Data",
          "Mean and Range",
          "Probability",
        ],
      },
    ],
  },
  "fs-2": {
    title: "Functional Skills Maths Level 2",
    summary: "Higher-level number, measure, and data topics.",
    categories: [
      {
        title: "Using Numbers",
        topics: [
          "Numbers and Place Value",
          "Ordering Numbers",
          "Addition and Subtraction",
          "Multiplication",
          "Division",
          "BIDMAS",
          "Fractions",
          "Decimals",
          "Rounding and Estimating",
          "Percentages",
          "Fractions, Decimals and Percentages",
          "Ratio",
          "Proportion",
          "Formulas",
        ],
      },
      {
        title: "Common Measures, Shape and Space",
        topics: [
          "Unit Conversions",
          "Conversion Graphs",
          "Problems Involving Money",
          "Best Buys",
          "Interest and Compound Interest",
          "Speed",
          "Density",
          "Perimeter",
          "Area",
          "Circles",
          "3D Shapes",
          "Volume",
          "Using Length, Area and Volume in Calculations",
          "Nets",
          "Surface Area",
          "Plans and Elevations",
          "Maps and Scale Drawings",
          "Coordinates",
          "Angles in 2D Shapes",
        ],
      },
      {
        title: "Handling Information and Data",
        topics: [
          "Mean, Median, Mode and Range",
          "Comparing Data Sets",
          "Estimating the Mean",
          "Probability",
          "Probability Tables",
          "Scatter Graphs",
        ],
      },
    ],
  },
};

export default async function MathsLevelDetailPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const session = await getUser();
  const hasAccess = Boolean(
    session?.profile?.role === "admin" ||
      session?.profile?.is_subscribed ||
      session?.profile?.access_override
  );
  const isAdmin = session?.profile?.role === "admin";

  const { level: levelKey } = await params;
  const supabase = await createClient();
  const { data: adminWorkbooksRaw } = isAdmin
    ? ((await supabase
        .from("workbooks")
        .select("id, thumbnail_url, file_url, is_published")
        .eq("subject", "maths")
        .eq("level_slug", levelKey)) as {
        data:
          | {
              id: string;
              thumbnail_url: string | null;
              file_url: string | null;
              is_published: boolean;
            }[]
          | null;
      })
    : { data: [] as { id: string; thumbnail_url: string | null; file_url: string | null; is_published: boolean }[] };
  const adminWorkbooks = adminWorkbooksRaw ?? [];
  const worksheetHealth = isAdmin
    ? {
        total: adminWorkbooks.length,
        missingThumbnail: adminWorkbooks.filter((w) => !w.thumbnail_url).length,
        missingFile: adminWorkbooks.filter((w) => !w.file_url).length,
        draft: adminWorkbooks.filter((w) => !w.is_published).length,
      }
    : null;
  const level =
    levelContent[levelKey] ?? ({
      title: "Level coming soon",
      summary: "We’re preparing content for this level. Check back soon.",
      comingSoon: true,
    } as const);
  return (
    <main className="space-y-8">
      <div className="space-y-3">
        <Link className="apple-subtle inline-flex" href="/maths/levels">
          ← Back to levels
        </Link>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Maths</div>
        <h1 className="text-3xl font-semibold tracking-tight">{level.title}</h1>
        <p className="apple-subtle">{level.summary}</p>
      </div>

      {level.comingSoon ? (
        <section className="apple-card p-6 space-y-3">
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Coming soon</div>
          <h2 className="text-xl font-semibold">Content in progress</h2>
          <p className="apple-subtle">
            We’re preparing lessons and revision materials for this level. Check back soon or
            explore another level.
          </p>
        </section>
      ) : (
        <>
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
                      defaultSubject="maths"
                      defaultLevel={levelKey}
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

          <LevelTabs
            categories={level.categories ?? []}
            subject="maths"
            levelSlug={levelKey}
            hasAccess={hasAccess}
            isAdmin={isAdmin}
          />
        </>
      )}
    </main>
  );
}
