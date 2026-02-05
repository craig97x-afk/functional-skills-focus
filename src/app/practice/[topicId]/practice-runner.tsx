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

function normalizeText(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
}

// Very light “unit stripping” so "12 cm" matches "12"
function stripUnits(s: string) {
  return s.replace(/[a-z%£$]+/gi, "").trim();
}

// Parse fraction like "3/4" -> 0.75
function parseFraction(s: string): number | null {
  const m = s.match(/^\s*(-?\d+)\s*\/\s*(-?\d+)\s*$/);
  if (!m) return null;
  const num = Number(m[1]);
  const den = Number(m[2]);
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
  return num / den;
}

function parseNumberLoose(s: string): number | null {
  const cleaned = stripUnits(s)
    .replace(/,/g, "") // "1,000" -> "1000"
    .trim();

  if (!cleaned) return null;

  // fraction?
  const frac = parseFraction(cleaned);
  if (frac !== null) return frac;

  // normal number?
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function nearlyEqual(a: number, b: number) {
  // tolerate tiny float differences
  const diff = Math.abs(a - b);
  return diff <= 1e-9 || diff <= Math.max(Math.abs(a), Math.abs(b)) * 1e-9;
}

// Extract expected short answer if teacher stored "Correct answer: X" in solution_explainer
function extractExpected(solutionExplainer: string | null) {
  const txt = solutionExplainer ?? "";
  const m = txt.match(/Correct answer:\s*(.+)$/i);
  return (m?.[1] ?? "").trim();
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

  const expectedShort = useMemo(() => extractExpected(q.solution_explainer), [q.solution_explainer]);

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
    if (!ok) setShowHint(true);

    // fire-and-forget save
    fetch("/api/practice/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: q.id,
        isCorrect: ok,
      }),
    }).catch(() => {});

    return;
  } 

    // SHORT ANSWER: tolerant marking
    const userRaw = shortAnswer;
    const expectedRaw = expectedShort;

    let ok = false;

    // If teacher provided expected answer, try numeric match first
    if (expectedRaw.trim().length > 0) {
      const userNum = parseNumberLoose(userRaw);
      const expNum = parseNumberLoose(expectedRaw);

      if (userNum !== null && expNum !== null) {
        ok = nearlyEqual(userNum, expNum);
      } else {
        // fallback to normalized text match
        const u = normalizeText(stripUnits(userRaw)).replace(/,/g, "");
        const e = normalizeText(stripUnits(expectedRaw)).replace(/,/g, "");
        ok = u === e;
      }
    } else {
      // no expected answer stored: accept non-empty for v1
      ok = userRaw.trim().length > 0;
    }

    setSubmitted(true);
    setIsCorrect(ok);
    if (ok) setCorrectCount((c) => c + 1);
    if (!ok) setShowHint(true);
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
              placeholder="Type your answer..."
            />
            {expectedShort ? (
              <p className="mt-1 text-xs text-gray-500">Marking: tolerant (numbers, fractions, spaces, units).</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">Teacher hasn’t set an exact answer yet.</p>
            )}
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
            {showHint ? "Hide hint" : "Show hint"}
          </button>

          <button
            className="rounded-md border px-3 py-2"
            onClick={() => setShowSolution((v) => !v)}
            disabled={!q.solution_explainer}
          >
            {showSolution ? "Hide explanation" : "Show explanation"}
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
            <div className="whitespace-pre-wrap">{q.hint}</div>
          </div>
        )}

        {submitted && isCorrect !== null && (
          <div className="text-sm">
            {isCorrect ? (
              <span className="font-medium text-green-700">Correct.</span>
            ) : (
              <span className="font-medium text-red-700">
                Incorrect
                {q.type === "mcq" && correctOption?.label ? ` (Answer: ${correctOption.label})` : "."}
              </span>
            )}
          </div>
        )}

        {showSolution && q.solution_explainer && (
          <div className="rounded-md border p-3 text-sm">
            <div className="font-medium mb-1">Explanation</div>
            <div className="whitespace-pre-wrap">{q.solution_explainer}</div>
          </div>
        )}
      </div>
    </div>
  );
}
