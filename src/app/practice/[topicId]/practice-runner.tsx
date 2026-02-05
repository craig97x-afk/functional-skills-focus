"use client";

import { useMemo, useState } from "react";

type OptionRow = {
  id: string;
  label: string;
  is_correct: boolean;
};

type QuestionRow = {
  id: string;
  type: "mcq" | "short";
  prompt: string;
  hint: string | null;
  solution_explainer: string | null;
  question_options: OptionRow[] | null;
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export default function PracticeRunner({ questions }: { questions: QuestionRow[] }) {
  const [index, setIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const [selectedOpt, setSelectedOpt] = useState<string>("");
  const [shortAnswer, setShortAnswer] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const [correctCount, setCorrectCount] = useState(0);

  const q = questions[index];

  const options = useMemo(() => {
    const opts = q.question_options ?? [];
    return opts.filter((o) => (o.label ?? "").trim().length > 0);
  }, [q]);

  const correctOption = useMemo(() => options.find((o) => o.is_correct), [options]);

  const shortAnswerExpected = useMemo(() => {
    const txt = q.solution_explainer ?? "";
    const m = txt.match(/Correct answer:\s*(.+)$/i);
    return m?.[1]?.trim() ?? "";
  }, [q.solution_explainer]);

  function resetForQuestion() {
    setShowHint(false);
    setShowSolution(false);
    setSelectedOpt("");
    setShortAnswer("");
    setSubmitted(false);
    setIsCorrect(null);
  }

  function submit() {
    if (submitted) return;

    if (q.type === "mcq") {
      const picked = options.find((o) => o.id === selectedOpt);
      const ok = Boolean(picked?.is_correct);
      setSubmitted(true);
      setIsCorrect(ok);
      if (ok) setCorrectCount((c) => c + 1);
      return;
    }

    const user = normalize(shortAnswer);
    const expected = normalize(shortAnswerExpected);

    let ok = false;
    if (expected.length > 0) ok = user === expected;
    else ok = user.length > 0;

    setSubmitted(true);
    setIsCorrect(ok);
    if (ok) setCorrectCount((c) => c + 1);
  }

  function retry() {
    setSubmitted(false);
    setIsCorrect(null);
    setShowHint(true);
    setShowSolution(false);
    if (q.type === "mcq") setSelectedOpt("");
    else setShortAnswer("");
  }

  function next() {
    if (index >= questions.length - 1) return;
    setIndex((i) => i + 1);
    resetForQuestion();
  }

  function restart() {
    setIndex(0);
    setCorrectCount(0);
    resetForQuestion();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-sm text-gray-600">
          Question <span className="font-medium">{index + 1}</span> / {questions.length}
        </div>
        <div className="text-sm text-gray-600">
          Correct: <span className="font-medium">{correctCount}</span> / {questions.length}
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold whitespace-pre-wrap">{q.prompt}</div>

        {q.type === "mcq" ? (
          <div className="space-y-2">
            {options.map((o, idx) => {
              const chosen = selectedOpt === o.id;
              const border =
                submitted && chosen
                  ? o.is_correct
                    ? "border-green-600"
                    : "border-red-600"
                  : "border-gray-300";

              return (
                <button
                  key={o.id}
                  className={`w-full text-left rounded-md border p-3 ${border}`}
                  onClick={() => !submitted && setSelectedOpt(o.id)}
                  disabled={submitted}
                >
                  <div className="text-sm">
                    <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                    {o.label}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <label className="block">
            <span className="text-sm">Your answer</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={shortAnswer}
              onChange={(e) => setShortAnswer(e.target.value)}
              disabled={submitted}
            />
          </label>
        )}

        <div className="flex gap-2 flex-wrap">
          <button
            className="rounded-md border px-3 py-2"
            onClick={submit}
            disabled={submitted || (q.type === "mcq" ? !selectedOpt : !shortAnswer.trim())}
          >
            Submit
          </button>

          <button
            className="rounded-md border px-3 py-2"
            onClick={() => setShowHint((v) => !v)}
            disabled={!q.hint}
          >
            Hint
          </button>

          {submitted && isCorrect === false && (
            <button className="rounded-md border px-3 py-2" onClick={retry}>
              Retry
            </button>
          )}

          <button
            className="rounded-md border px-3 py-2"
            onClick={next}
            disabled={!submitted || index >= questions.length - 1}
          >
            Next
          </button>

          {index === questions.length - 1 && submitted && (
            <button className="rounded-md border px-3 py-2" onClick={restart}>
              Restart
            </button>
          )}
        </div>

        {showHint && q.hint && (
          <div className="rounded-md border p-3 text-sm">
            <div className="font-medium mb-1">Hint</div>
            {q.hint}
          </div>
        )}

        {submitted && isCorrect !== null && (
          <div className="text-sm">
            {isCorrect ? "Correct" : "Incorrect"}
          </div>
        )}
      </div>
    </div>
  );
}
