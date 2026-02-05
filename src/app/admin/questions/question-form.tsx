"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Topic = {
  id: string;
  title: string;
  levels?: { code: string }[];
};

type Lesson = {
  id: string;
  title: string;
  topic_id: string;
  published: boolean;
};

export default function QuestionForm({ topics, lessons }: { topics: Topic[]; lessons: Lesson[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [topicId, setTopicId] = useState(topics[0]?.id ?? "");
  const [lessonId, setLessonId] = useState<string>("");
  const [type, setType] = useState<"mcq" | "short">("mcq");
  const [prompt, setPrompt] = useState("");
  const [hint, setHint] = useState("");
  const [solution, setSolution] = useState("");
  const [published, setPublished] = useState(false);

  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctIndex, setCorrectIndex] = useState(0);

  const [shortAnswer, setShortAnswer] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const topicLessons = lessons.filter((l) => l.topic_id === topicId);

  async function createQuestion() {
    setLoading(true);
    setMsg(null);

    const { data: q, error } = await supabase
      .from("questions")
      .insert({
        topic_id: topicId,
        lesson_id: lessonId || null,
        type,
        prompt,
        hint: hint || null,
        solution_explainer: solution || null,
        published,
      })
      .select("*")
      .single();

    if (error || !q) {
      setLoading(false);
      setMsg(error?.message ?? "Failed to create question");
      return;
    }

    if (type === "mcq") {
      const opts = [optA, optB, optC, optD]
        .map((label, i) => ({
          question_id: q.id,
          label,
          is_correct: i === correctIndex,
        }))
        .filter((o) => o.label.trim().length > 0);

      const { error: optErr } = await supabase.from("question_options").insert(opts);
      if (optErr) {
        setLoading(false);
        setMsg(optErr.message);
        return;
      }
    } else {
      // v1: store correct short answer inside solution_explainer if teacher didn't write one
      if (!solution && shortAnswer.trim().length > 0) {
        const { error: updErr } = await supabase
          .from("questions")
          .update({ solution_explainer: `Correct answer: ${shortAnswer}` })
          .eq("id", q.id);

        if (updErr) {
          setLoading(false);
          setMsg(updErr.message);
          return;
        }
      }
    }

    setLoading(false);
    setMsg("Question created. Refreshing...");
    window.location.reload();
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-sm">Topic</span>
          <select
            className="mt-1 w-full rounded-md border p-2"
            value={topicId}
            onChange={(e) => {
              setTopicId(e.target.value);
              setLessonId("");
            }}
          >
            {topics.map((t) => {
              const code = t.levels?.[0]?.code;
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
          <span className="text-sm">Lesson (optional)</span>
          <select
            className="mt-1 w-full rounded-md border p-2"
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
          <span className="text-sm">Type</span>
          <select
            className="mt-1 w-full rounded-md border p-2"
            value={type}
            onChange={(e) => setType(e.target.value as "mcq" | "short")}
          >
            <option value="mcq">MCQ</option>
            <option value="short">Short answer</option>
          </select>
        </label>

        <label className="flex items-center gap-2 mt-6">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          <span className="text-sm">Published</span>
        </label>
      </div>

      <label className="block">
        <span className="text-sm">Prompt</span>
        <textarea
          className="mt-1 w-full rounded-md border p-2 min-h-[90px]"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-sm">Hint (optional)</span>
        <input className="mt-1 w-full rounded-md border p-2" value={hint} onChange={(e) => setHint(e.target.value)} />
      </label>

      <label className="block">
        <span className="text-sm">Solution explainer (optional)</span>
        <textarea
          className="mt-1 w-full rounded-md border p-2 min-h-[70px]"
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
        />
      </label>

      {type === "mcq" ? (
        <div className="rounded-md border p-3 space-y-2">
          <div className="text-sm font-semibold">Options</div>
          <input className="w-full rounded-md border p-2" placeholder="A" value={optA} onChange={(e) => setOptA(e.target.value)} />
          <input className="w-full rounded-md border p-2" placeholder="B" value={optB} onChange={(e) => setOptB(e.target.value)} />
          <input className="w-full rounded-md border p-2" placeholder="C" value={optC} onChange={(e) => setOptC(e.target.value)} />
          <input className="w-full rounded-md border p-2" placeholder="D" value={optD} onChange={(e) => setOptD(e.target.value)} />

          <label className="block">
            <span className="text-sm">Correct option index (0=A, 1=B, 2=C, 3=D)</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              type="number"
              value={correctIndex}
              onChange={(e) => setCorrectIndex(Number(e.target.value))}
            />
          </label>
        </div>
      ) : (
        <div className="rounded-md border p-3 space-y-2">
          <div className="text-sm font-semibold">Short answer</div>
          <input
            className="w-full rounded-md border p-2"
            placeholder="Correct answer (exact match for v1)"
            value={shortAnswer}
            onChange={(e) => setShortAnswer(e.target.value)}
          />
          <p className="text-xs text-gray-500">v1 uses exact match. We’ll add tolerant marking (spaces/commas/units) next.</p>
        </div>
      )}

      <button className="rounded-md border px-3 py-2" onClick={createQuestion} disabled={loading || !topicId || !prompt}>
        {loading ? "Creating..." : "Create question"}
      </button>

      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
