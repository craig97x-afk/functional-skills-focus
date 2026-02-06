import { requireAdmin } from "@/lib/auth/require-admin";
import { WidgetBlock } from "@/app/maths/[level]/[topicId]/[lessonId]/lesson-widgets";

const examples = [
  {
    title: "Clock",
    description: "Analogue clock with ticks and clear hands.",
    block: `type: clock
time: 10:30
label: Half past ten`,
  },
  {
    title: "Bar chart",
    description: "Column bars with gridlines and axis labels.",
    block: `type: bar
title: Fruit sold
data: Apples=5, Bananas=3, Oranges=8
y_label: Units sold
x_label: Fruit
y_min: 0
y_max: 10
unit: 
show_values: true`,
  },
  {
    title: "Line graph",
    description: "Smooth line with grid and highlight points.",
    block: `type: line
title: Weekly temperatures
data: Mon=12, Tue=15, Wed=13, Thu=18
y_label: °C
x_label: Day
y_min: 10
y_max: 20
unit: °`,
  },
  {
    title: "Pie chart",
    description: "Donut chart with legend for proportions.",
    block: `type: pie
title: Class favourites
data: Apples=4, Bananas=6, Oranges=3
unit:`,
  },
  {
    title: "Stacked bar",
    description: "Stacked series with legend and totals.",
    block: `type: stacked_bar
title: Attendance by week
data: Mon=3|2|1, Tue=4|1|3, Wed=2|3|2
series: Maths|English|ICT
y_label: Students
x_label: Day
unit:`,
  },
  {
    title: "Scatter plot",
    description: "Relationship between two variables.",
    block: `type: scatter
title: Study vs score
data: 1|45, 2|52, 3|58, 4|70
x_label: Hours
y_label: Score
x_min: 0
x_max: 5
y_min: 40
y_max: 80
unit:`,
  },
  {
    title: "Data table",
    description: "Tabular data for quick comparisons.",
    block: `type: table
title: Assessment results
headers: Name|Score|Grade
rows: Ava|12|A; Ben|9|B; Cara|7|C`,
  },
  {
    title: "Number line",
    description: "Highlight a value on a number line.",
    block: `type: numberline
min: 0
max: 10
step: 1
highlight: 6
label: Mark the value`,
  },
  {
    title: "Fraction model",
    description: "Visual fraction with shaded parts.",
    block: `type: fraction
numerator: 3
denominator: 4
label: Three quarters`,
  },
  {
    title: "Shape diagram",
    description: "Resizable shape with label.",
    block: `type: shape
shape: rectangle
label: Rectangle 4 x 6
width: 160
height: 90`,
  },
];

export default async function AdminWidgetsPage() {
  await requireAdmin();

  return (
    <main className="space-y-8 max-w-5xl">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Admin
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">
          Widget gallery
        </h1>
        <p className="apple-subtle mt-2">
          Use these widgets inside lesson markdown. Copy the block text or use
          the Lesson Widget Builder in the admin editor.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {examples.map((example) => (
          <section key={example.title} className="space-y-3">
            <div className="apple-card p-4 space-y-2">
              <div className="text-sm font-semibold">{example.title}</div>
              <div className="text-sm text-[color:var(--muted-foreground)]">
                {example.description}
              </div>
            </div>
            <WidgetBlock value={example.block} />
            <pre className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4 text-xs overflow-x-auto">
              {example.block}
            </pre>
          </section>
        ))}
      </div>
    </main>
  );
}
