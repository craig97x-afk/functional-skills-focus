"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Topic = {
  id: string;
  title: string;
  level?: { code: string } | null;
};

type Lesson = {
  id: string;
  title: string;
  topic_id: string;
  published: boolean;
};

type QuestionRow = {
  id: string;
  topic_id: string;
  lesson_id: string | null;
  type: "mcq" | "short";
  prompt: string;
  hint: string | null;
  solution_explainer: string | null;
  published: boolean;
};

type OptionRow = {
  id: string;
  label: string;
  is_correct: boolean;
};

type OptionForm = {
  label: string;
  is_correct: boolean;
};

export default function QuestionEditForm({
  initialQuestion,
  initialOptions,
  topics,
  lessons,
}: {
  initialQuestion: QuestionRow;
  initialOptions: OptionRow[];
  topics: Topic[];
  lessons: Lesson[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [topicId, setTopicId] = useState(initialQuestion.topic_id);
  const [lessonId, setLessonId] = useState(initialQuestion.lesson_id ?? "");
  const [prompt, setPrompt] = useState(initialQuestion.prompt);
  const [hint, setHint] = useState(initialQuestion.hint ?? "");
  const [solution, setSolution] = useState(initialQuestion.solution_explainer ?? "");
  const [published, setPublished] = useState(initialQuestion.published);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fieldClass =
    "mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10";
  const textareaClass = `${fieldClass} min-h-[90px]`;
  const textareaSmallClass = `${fieldClass} min-h-[70px]`;
  const panelClass = "rounded-2xl border border-black/5 bg-white/70 p-4 space-y-3";

  const [options, setOptions] = useState<OptionForm[]>(
    initialQuestion.type === "mcq" && initialOptions.length > 0
      ? initialOptions.map((o) => ({ label: o.label, is_correct: o.is_correct }))
      : [
          { label: "", is_correct: true },
          { label: "", is_correct: false },
          { label: "", is_correct: false },
          { label: "", is_correct: false },
        ]
  );

  const topicLessons = lessons.filter((l) => l.topic_id === topicId);

  function markCorrect(index: number) {
    setOptions((prev) =>
      prev.map((o, i) => ({ ...o, is_correct: i === index }))
    );
  }

  function updateOptionLabel(index: number, label: string) {
    setOptions((prev) =>
      prev.map((o, i) => (i === index ? { ...o, label } : o))
    );
  }

  function addOption() {
    setOptions((prev) => [...prev, { label: "", is_correct: false }]);
  }

  function removeOption(index: number) {
    setOptions((prev) => {
      if (prev.length <= 2) return prev;
      const next = prev.filter((_, i) => i !== index);
      if (!next.some((o) => o.is_correct)) {
        next[0].is_correct = true;
      }
      return next;
    });
  }

  async function save() {
    setLoading(true);
    setMsg(null);

    const { error: qErr } = await supabase
      .from("questions")
      .update({
        topic_id: topicId,
        lesson_id: lessonId || null,
        prompt,
        hint: hint || null,
        solution_explainer: solution || null,
        published,
      })
      .eq("id", initialQuestion.id);

    if (qErr) {
      setLoading(false);
      setMsg(qErr.message);
      return;
    }

    if (initialQuestion.type === "mcq") {
      const cleaned = options
        .map((o) => ({ ...o, label: o.label.trim() }))
        .filter((o) => o.label.length > 0);

      if (cleaned.length < 2) {
        setLoading(false);
        setMsg("Add at least two options.");
        return;
      }

      if (!cleaned.some((o) => o.is_correct)) {
        cleaned[0].is_correct = true;
      }

      const { error: delErr } = await supabase
        .from("question_options")
        .delete()
        .eq("question_id", initialQuestion.id);

      if (delErr) {
        setLoading(false);
        setMsg(delErr.message);
        return;
      }

      const { error: optErr } = await supabase.from("question_options").insert(
        cleaned.map((o) => ({
          question_id: initialQuestion.id,
          label: o.label,
          is_correct: o.is_correct,
        }))
      );

      if (optErr) {
        setLoading(false);
        setMsg(optErr.message);
        return;
      }
    }

    setLoading(false);
    setMsg("Question updated.");
  }

  async function deleteQuestion() {
    if (!confirm("Delete this question? This cannot be undone.")) return;
    setLoading(true);
    setMsg(null);

    if (initialQuestion.type === "mcq") {
      await supabase
        .from("question_options")
        .delete()
        .eq("question_id", initialQuestion.id);
    }

    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", initialQuestion.id);

    setLoading(false);
    if (error) {
      setMsg(error.message);
      return;
    }

    router.push("/admin/questions");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-600">Topic</span>
          <select
            className={fieldClass}
            value={topicId}
            onChange={(e) => {
              setTopicId(e.target.value);
              setLessonId("");
            }}
          >
            {topics.map((t) => {
              const code = t.level?.code;
              return (
                <option key={t.id} value={t.id}>
                  {code ? `[${code}] ` : ""}
                  {t.title}
                </option>
              );
            })}
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-slate-600">Lesson (optional)</span>
          <select
            className={fieldClass}
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
          >
            <option value="">None</option>
            {topicLessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-600">Type</span>
          <input
            className="mt-1 w-full rounded-xl border border-black/10 bg-slate-100/80 px-3 py-2 text-sm text-slate-600"
            value={initialQuestion.type.toUpperCase()}
            readOnly
          />
        </label>

        <label className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          <span className="text-sm text-slate-600">Published</span>
        </label>
      </div>

      <label className="block">
        <span className="text-sm text-slate-600">Prompt</span>
        <textarea
          className={textareaClass}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-sm text-slate-600">Hint (optional)</span>
        <input
          className={fieldClass}
          value={hint}
          onChange={(e) => setHint(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-sm text-slate-600">Solution explainer (optional)</span>
        <textarea
          className={textareaSmallClass}
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
        />
      </label>

      {initialQuestion.type === "mcq" ? (
        <div className={panelClass}>
          <div className="text-sm font-semibold">Options</div>
          <div className="space-y-2">
            {options.map((o, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct"
                  checked={o.is_correct}
                  onChange={() => markCorrect(idx)}
                />
                <input
                  className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                  placeholder={`Option ${idx + 1}`}
                  value={o.label}
                  onChange={(e) => updateOptionLabel(idx, e.target.value)}
                />
                <button
                  className="apple-pill px-3 py-1.5 text-xs"
                  onClick={() => removeOption(idx)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            className="apple-pill px-4 py-2 text-sm"
            onClick={addOption}
            type="button"
          >
            Add option
          </button>
        </div>
      ) : (
        <div className={panelClass}>
          <div className="text-sm text-slate-500">
          Short-answer questions are self-check for now. Update the solution explainer above.
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          className="apple-button"
          onClick={save}
          disabled={loading || !topicId || !prompt}
        >
          {loading ? "Saving..." : "Save changes"}
        </button>
        <button
          className="apple-pill text-red-600 border-red-200/60"
          onClick={deleteQuestion}
          disabled={loading}
        >
          Delete question
        </button>
      </div>

      {msg && <p className="text-sm text-slate-600">{msg}</p>}
    </div>
  );
}
