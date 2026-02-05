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
  const [i, setI] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string>("");
  const [shortAnswer, setShortAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [wrongIds, setWrongIds] = useState<string[]>([]);

  const q = questions[i];

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

  async function saveAttempt(questionId: string, ok: boolean) {
    try {
      const res = await fetch("/api/practice/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, isCorrect: ok }),
      });

      // keep it quiet, but if you're debugging:
      // const txt = await res.text(); console.log(res.status, txt);
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

    // Short answer: v1 records attempt as false (we'll add marking later)
    setSubmitted(true);
    setIsCorrect(null);
    setShowHint(true);
    setWrongIds((w) => (w.includes(q.id) ? w : [...w, q.id]));
    void saveAttempt(q.id, false);
  }

  function next() {
    if (i + 1 >= questions.length) {
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
    const wrong = questions.filter((qq) => wrongIds.includes(qq.id));
    if (wrong.length === 0) return;

    // restart session with wrong-only set
    setI(0);
    setDone(false);
    setCorrectCount(0);
    setWrongIds([]);
    resetForNext();

    // hack: replace questions in-place by reloading page with query param (simple v1)
    const url = new URL(window.location.href);
    url.searchParams.set("mode", "wrong");
    window.location.href = url.toString();
  }

  if (!q) {
    return (
      <div className="rounded-lg border p-4">
        <p>No questions available.</p>
      </div>
    );
  }

  if (done) {
    const total = questions.length;
    const score = Math.round((correctCount / total) * 100);

    return (
      <div className="rounded-lg border p-4 space-y-3">
        <div className="text-sm text-gray-400">Practice complete</div>
        <div className="text-xl font-bold">{topicTitle}</div>

        <div className="text-sm">
          Score: <span className="font-semibold">{correctCount}/{total}</span> ({score}%)
        </div>

        <div className="flex gap-2 flex-wrap">
          <a className="rounded-md border px-3 py-2 text-sm" href="/progress">
            View progress
          </a>
          <a className="rounded-md border px-3 py-2 text-sm" href="/mastery">
            View mastery
          </a>
          <button className="rounded-md border px-3 py-2 text-sm" onClick={() => window.location.reload()}>
            Practice again
          </button>
        </div>

        {wrongIds.length > 0 && (
          <p className="text-xs text-gray-500">
            You got {wrongIds.length} wrong. (We’ll add a “retry wrong” mode properly next.)
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div>
          {topicTitle} · Q{i + 1}/{questions.length}
        </div>
        <div>
          Correct: {correctCount}
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

          <button className="rounded-md border px-3 py-2 text-sm" onClick={() => setShowHint((s) => !s)} disabled={!q.hint}>
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
