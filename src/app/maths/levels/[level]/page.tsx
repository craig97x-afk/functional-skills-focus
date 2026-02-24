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
          "Read/write/order numbers to 20",
          "Count to 20 (incl. zero)",
          "Add/subtract within 20",
          "Symbols +, - and =",
        ],
      },
      {
        title: "Using common measures, shape and space",
        topics: [
          "Coins/notes and £/p to 20",
          "Read 12-hour clocks (hours)",
          "Days, months, seasons order",
          "Compare size/length/weight/capacity",
          "Identify common 2D/3D shapes",
          "Positional language (left/right/etc.)",
        ],
      },
      {
        title: "Handling information and data",
        topics: [
          "Read numbers in lists",
          "Sort by one criterion",
          "Simple charts: tally/block/graph",
        ],
      },
      {
        title: "Solving mathematical problems and decision-making",
        topics: [
          "Solve simple one-step problems",
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
          "Count to 100",
          "Read/write/order numbers to 200",
          "Odd/even numbers to 100",
          "Symbols +, -, x, ÷, =",
          "Add/subtract 2-digit numbers",
          "Times tables to 12x12",
          "Hours/day; weeks/year order",
          "Divide 2-digit with remainders",
          "Round to nearest 10 (check)",
          "Simple fractions (1/2, 1/4, 1/10)",
          "Decimals to 1 d.p.",
        ],
      },
      {
        title: "Using common measures, shape and space",
        topics: [
          "Money to £1 (pence/£)",
          "Time: dates, 24h, analogue",
          "Metric length (mm–km)",
          "Mass: grams and kilograms",
          "Capacity: ml and litres",
          "Read/compare temperatures",
          "Use scales to nearest label",
          "Name 2D/3D shapes",
          "Describe shape properties",
          "Positional language (between/etc.)",
        ],
      },
      {
        title: "Handling information and data",
        topics: [
          "Extract info from tables/charts",
          "Compare numbers on bar charts",
          "Sort by two criteria",
          "Convert info between formats",
        ],
      },
      {
        title: "Solving mathematical problems and decision-making",
        topics: [
          "Solve simple one-step problems",
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
          "Length/area/volume calculations",
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
          "Length/area/volume calculations",
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
          "Mean/median/mode/range",
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
