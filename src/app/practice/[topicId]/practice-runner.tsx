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
  options?: Option[];
};

export default function PracticeRunner({
  topicTitle,
  questions,
}: {
  topicTitle: string;
  questions: Question[];
}) {
  const [activeQuestions, setActiveQuestions] = useState<Question[]>(questions);
  const [mode, setMode] = useState<"all" | "wrong">("all");
  const [i, setI] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string>("");
  const [shortAnswer, setShortAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [wrongIds, setWrongIds] = useState<string[]>([]);

  const q = activeQuestions[i];
  const scorableTotal = activeQuestions.filter((qq) => qq.type === "mcq").length;

  const correctOptionId = useMemo(() => {
    if (!q) return "";
    const opts = q.options ?? [];
    const correct = opts.find((o) => o.is_correct);
    return correct?.id ?? "";
  }, [q]);

  function resetForNext() {
    setSelectedOpt("");
    setShortAnswer("");
    setSubmitted(false);
    setIsCorrect(null);
    setShowHint(false);
  }

  function resetSession(nextQuestions: Question[], nextMode: "all" | "wrong") {
    setActiveQuestions(nextQuestions);
    setMode(nextMode);
    setI(0);
    setDone(false);
    setCorrectCount(0);
    setWrongIds([]);
    resetForNext();
  }

  async function saveAttempt(questionId: string, ok: boolean | null) {
    try {
      const res = await fetch("/api/practice/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, isCorrect: ok }),
      });

      void res;
    } catch {
      // ignore for v1
    }
  }

  function submit() {
    if (!q || submitted) return;

    if (q.type === "mcq") {
      const ok = selectedOpt.length > 0 && selectedOpt === correctOptionId;
      setSubmitted(true);
      setIsCorrect(ok);
      if (!ok) setShowHint(true);
      if (ok) setCorrectCount((c) => c + 1);
      if (!ok) setWrongIds((w) => (w.includes(q.id) ? w : [...w, q.id]));
      void saveAttempt(q.id, ok);
      return;
    }

    // Short answer: v1 records attempt as null (self-check)
    setSubmitted(true);
    setIsCorrect(null);
    setShowHint(true);
    setWrongIds((w) => (w.includes(q.id) ? w : [...w, q.id]));
    void saveAttempt(q.id, null);
  }

  function next() {
    if (i + 1 >= activeQuestions.length) {
      setDone(true);
      return;
    }
    setI((x) => x + 1);
    resetForNext();
  }

  function prev() {
    if (i === 0) return;
    setI((x) => x - 1);
    resetForNext();
  }

  function retryWrong() {
    const wrong = activeQuestions.filter((qq) => wrongIds.includes(qq.id));
    if (wrong.length === 0) return;
    resetSession(wrong, "wrong");
  }

  function restartAll() {
    if (questions.length === 0) return;
    resetSession(questions, "all");
  }

  if (!q) {
    return (
      <div className="rounded-lg border p-4">
        <p>No questions available.</p>
      </div>
    );
  }

  if (done) {
    const total = activeQuestions.length;
    const score =
      scorableTotal > 0 ? Math.round((correctCount / scorableTotal) * 100) : null;
    const wrongQuestions = activeQuestions.filter((qq) => wrongIds.includes(qq.id));

    return (
      <div className="rounded-lg border p-4 space-y-4">
        <div className="text-sm text-gray-400">
          {mode === "wrong" ? "Retry wrong answers complete" : "Practice complete"}
        </div>
        <div className="text-xl font-bold">{topicTitle}</div>

        <div className="text-sm">
          Score:{" "}
          {scorableTotal > 0 ? (
            <span className="font-semibold">
              {correctCount}/{scorableTotal} ({score}%)
            </span>
          ) : (
            <span className="font-semibold">N/A</span>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <a className="rounded-md border px-3 py-2 text-sm" href="/progress">
            View progress
          </a>
          <a className="rounded-md border px-3 py-2 text-sm" href="/mastery">
            View mastery
          </a>
          <button
            className="rounded-md border px-3 py-2 text-sm"
            onClick={restartAll}
          >
            Practice full set
          </button>
          <button
            className="rounded-md border px-3 py-2 text-sm"
            onClick={retryWrong}
            disabled={wrongIds.length === 0}
          >
            Retry wrong
          </button>
        </div>

        {wrongQuestions.length > 0 && (
          <div className="rounded-md border p-3 space-y-2">
            <div className="text-xs text-gray-400">Review wrong answers</div>
            <ul className="space-y-2 text-sm">
              {wrongQuestions.map((w) => (
                <li key={w.id} className="space-y-1">
                  <div className="font-medium whitespace-pre-wrap">{w.prompt}</div>
                  {w.solution_explainer && (
                    <div className="text-xs text-gray-400 whitespace-pre-wrap">
                      {w.solution_explainer}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div>
          {topicTitle} · Q{i + 1}/{activeQuestions.length}
          {mode === "wrong" ? " · retry wrong" : ""}
        </div>
        <div>
          Correct: {correctCount}
          {scorableTotal > 0 ? `/${scorableTotal}` : ""}
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-medium whitespace-pre-wrap">{q.prompt}</div>

        {q.type === "mcq" ? (
          <div className="space-y-2">
            {(q.options ?? []).map((o) => (
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
              Short-answer marking is v1 self-check. We’ll add real marking next.
            </p>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <button
            className="rounded-md border px-3 py-2 text-sm"
            onClick={submit}
            disabled={submitted || (q.type === "mcq" && !selectedOpt)}
          >
            Check answer
          </button>

          <button
            className="rounded-md border px-3 py-2 text-sm"
            onClick={() => setShowHint((s) => !s)}
            disabled={!q.hint}
          >
            {showHint ? "Hide hint" : "Show hint"}
          </button>

          <button className="rounded-md border px-3 py-2 text-sm" onClick={prev} disabled={i === 0}>
            Prev
          </button>

          <button className="rounded-md border px-3 py-2 text-sm" onClick={next} disabled={!submitted}>
            Next
          </button>
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

        {submitted && q.type === "short" && (
          <div className="text-sm font-semibold">Self-check your answer</div>
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
    </div>
  );
}
