"use client";

import { useMemo, useState } from "react";

type Option = {
  id: string;
  label: string;
  is_correct?: boolean;
};

type Question = {
  id: string;
  type: "mcq" | "short";
  prompt: string;
  hint: string | null;
  solution_explainer: string | null;
  question_options?: Option[] | null;
};

export default function LessonQuestions({ questions }: { questions: Question[] }) {
  const [index, setIndex] = useState(0);

  if (questions.length === 0) return null;

  const q = questions[index];

  return (
    <div className="space-y-4">
      <QuestionCard
        key={q.id}
        q={q}
        idx={index}
        total={questions.length}
        onNext={() => setIndex((i) => Math.min(i + 1, questions.length - 1))}
        onPrev={() => setIndex((i) => Math.max(i - 1, 0))}
      />
    </div>
  );
}

function QuestionCard({
  q,
  idx,
  total,
  onNext,
  onPrev,
}: {
  q: Question;
  idx: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [selectedOpt, setSelectedOpt] = useState<string>("");
  const [shortAnswer, setShortAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);

  const correctOptionId = useMemo(() => {
    const opts = q.question_options ?? [];
    return opts.find((o) => o.is_correct)?.id ?? "";
  }, [q.question_options]);

  async function checkAnswer() {
    if (submitted) return;

    let ok: boolean | null = null;

    if (q.type === "mcq") {
      ok = selectedOpt.length > 0 && selectedOpt === correctOptionId;
    }

    setSubmitted(true);
    setIsCorrect(ok);
    if (ok === false) setShowHint(true);

    // save attempt
    fetch("/api/practice/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: q.id,
        isCorrect: ok,
      }),
    }).catch(() => {});
  }

  function reset() {
    setSelectedOpt("");
    setShortAnswer("");
    setSubmitted(false);
    setIsCorrect(null);
    setShowHint(false);
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="text-sm text-gray-400">
        Question {idx + 1} of {total}
      </div>

      <div className="font-medium whitespace-pre-wrap">{q.prompt}</div>

      {q.type === "mcq" ? (
        <div className="space-y-2">
          {(q.question_options ?? []).map((o) => (
            <label key={o.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name={`q_${q.id}`}
                value={o.id}
                checked={selectedOpt === o.id}
                onChange={() => setSelectedOpt(o.id)}
                disabled={submitted}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      ) : (
        <input
          className="w-full rounded-md border p-2 bg-transparent"
          value={shortAnswer}
          onChange={(e) => setShortAnswer(e.target.value)}
          disabled={submitted}
          placeholder="Type your answer..."
        />
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          className="rounded-md border px-3 py-2 text-sm"
          onClick={checkAnswer}
          disabled={submitted || (q.type === "mcq" && !selectedOpt)}
        >
          Check answer
        </button>

        <button className="rounded-md border px-3 py-2 text-sm" onClick={reset}>
          Reset
        </button>

        {q.hint && (
          <button
            className="rounded-md border px-3 py-2 text-sm"
            onClick={() => setShowHint((s) => !s)}
          >
            Hint
          </button>
        )}
      </div>

      {submitted && q.type === "mcq" && (
        <div className="text-sm font-semibold">
          {isCorrect ? "Correct" : "Incorrect"}
        </div>
      )}

      {showHint && q.hint && (
        <div className="rounded-md border p-3 text-sm">
          {q.hint}
        </div>
      )}

      {submitted && q.solution_explainer && (
        <div className="rounded-md border p-3 text-sm">
          {q.solution_explainer}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          className="rounded-md border px-3 py-2 text-sm"
          onClick={onPrev}
          disabled={idx === 0}
        >
          Previous
        </button>

        <button
          className="rounded-md border px-3 py-2 text-sm"
          onClick={onNext}
          disabled={idx === total - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
