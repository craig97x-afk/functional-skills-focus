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
  return (
    <div className="space-y-4">
      {questions.map((q, idx) => (
        <QuestionCard key={q.id} q={q} idx={idx} />
      ))}
    </div>
  );
}

function QuestionCard({ q, idx }: { q: Question; idx: number }) {
  const [selectedOpt, setSelectedOpt] = useState<string>("");
  const [shortAnswer, setShortAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);

  const correctOptionId = useMemo(() => {
    const opts = q.question_options ?? [];
    const correct = opts.find((o) => o.is_correct);
    return correct?.id ?? "";
  }, [q.question_options]);

  function checkAnswer() {
    if (submitted) return;

    if (q.type === "mcq") {
      const ok = selectedOpt.length > 0 && selectedOpt === correctOptionId;

      setSubmitted(true);
      setIsCorrect(ok);
      if (!ok) setShowHint(true);

      // ✅ DEBUG: log status + response body
      fetch("/api/practice/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: q.id, isCorrect: ok }),
      })
        .then(async (res) => {
          const text = await res.text();
          console.log("attempt status:", res.status, "body:", text);
        })
        .catch((err) => console.log("attempt fetch error:", err));

      return;
    }

    // short-answer v1: can't auto-mark yet. We'll still record an attempt.
    setSubmitted(true);
    setIsCorrect(null);
    setShowHint(true);

    fetch("/api/practice/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: q.id, isCorrect: false }),
    })
      .then(async (res) => {
        const text = await res.text();
        console.log("attempt status:", res.status, "body:", text);
      })
      .catch((err) => console.log("attempt fetch error:", err));
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
      <div className="text-sm text-gray-400">Q{idx + 1}</div>

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
              <span className="whitespace-pre-wrap">{o.label}</span>
            </label>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <label className="block text-sm">
            Your answer
            <input
              className="mt-1 w-full rounded-md border p-2 bg-transparent"
              value={shortAnswer}
              onChange={(e) => setShortAnswer(e.target.value)}
              disabled={submitted}
              placeholder="Type your answer..."
            />
          </label>
          <p className="text-xs text-gray-500">
            Short-answer marking is “v1 self-check” right now (we’ll add real marking next).
          </p>
        </div>
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
            {showHint ? "Hide hint" : "Show hint"}
          </button>
        )}
      </div>

      {submitted && q.type === "mcq" && (
        <div className="text-sm">
          {isCorrect ? (
            <span className="font-semibold">✅ Correct</span>
          ) : (
            <span className="font-semibold">❌ Incorrect</span>
          )}
        </div>
      )}

      {showHint && q.hint && (
        <div className="rounded-md border p-3 text-sm">
          <div className="text-xs text-gray-400 mb-1">Hint</div>
          <div className="whitespace-pre-wrap">{q.hint}</div>
        </div>
      )}

      {submitted && q.solution_explainer && (
        <div className="rounded-md border p-3 text-sm">
          <div className="text-xs text-gray-400 mb-1">Explanation</div>
          <div className="whitespace-pre-wrap">{q.solution_explainer}</div>
        </div>
      )}
    </div>
  );
}
