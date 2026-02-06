import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";

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
    summary: "Entry Level 1 content will be added soon.",
    comingSoon: true,
  },
  "entry-2": {
    title: "Entry Level 2",
    summary: "Entry Level 2 content will be added soon.",
    comingSoon: true,
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
  "fs-3": {
    title: "Functional Skills Level 3",
    summary: "Functional Skills Level 3 content will be added soon.",
    comingSoon: true,
  },
};

export default async function MathsLevelDetailPage({
  params,
}: {
  params: { level: string };
}) {
  const session = await getUser();
  if (!session) redirect("/login");

  const level = levelContent[params.level];
  if (!level) notFound();

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
        <div className="grid gap-6 lg:grid-cols-3">
          {(level.categories ?? []).map((category) => (
            <section key={category.title} className="apple-card p-6 space-y-4">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                {category.title}
              </div>
              <div className="grid gap-2">
                {category.topics.map((topic) => (
                  <div
                    key={topic}
                    className="rounded-xl border border-[color:var(--border)] px-3 py-2 text-sm"
                  >
                    {topic}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
