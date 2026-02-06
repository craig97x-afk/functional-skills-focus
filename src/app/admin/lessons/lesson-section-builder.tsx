"use client";

type Props = {
  body: string;
  onInsert: (nextBody: string) => void;
};

const templates = [
  {
    id: "objectives",
    label: "Learning objectives",
    content: `### Learning objectives
- Understand ...
- Be able to ...`,
  },
  {
    id: "vocabulary",
    label: "Key vocabulary",
    content: `### Key vocabulary
- Term: meaning`,
  },
  {
    id: "worked-example",
    label: "Worked example",
    content: `### Worked example
**Question:** ...

**Answer:** ...

**Why:** ...`,
  },
  {
    id: "quick-check",
    label: "Quick check",
    content: `### Quick check
1. ...
2. ...`,
  },
  {
    id: "tip",
    label: "Teacher tip",
    content: `> **Tip:** ...`,
  },
  {
    id: "common-mistake",
    label: "Common mistake",
    content: `> **Common mistake:** ...`,
  },
];

export default function LessonSectionBuilder({ body, onInsert }: Props) {
  function insertTemplate(content: string) {
    const nextBody = body ? `${body}\n\n${content}\n` : `${content}\n`;
    onInsert(nextBody);
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="text-sm font-semibold">Lesson section templates</div>
      <p className="text-sm text-slate-500">
        Insert structured lesson sections to keep content consistent.
      </p>
      <div className="flex flex-wrap gap-2">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            className="rounded-full border px-3 py-2 text-sm"
            onClick={() => insertTemplate(template.content)}
          >
            {template.label}
          </button>
        ))}
      </div>
    </div>
  );
}
