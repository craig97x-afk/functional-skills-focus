"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Opt = { id: string; label: string };
type Q = { id: string; type: "mcq" | "short"; prompt: string; hint?: string | null; solution_explainer?: string | null; options?: Opt[] };

export default function PracticeClient({
  topicId,
  userId,
  questions,
}: {
  topicId: string;
  userId: string;
  questions: Q[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [i, setI] = useState(0);
  const q = questions[i];

  const [selected, setSelected] = useState<string>("");
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!q) return <p className="text-sm text-gray-500">No published questions yet.</p>;

  async function submit() {
    setLoading(true);
    setFeedback(null);

    let isCorrect = false;

    if (q.type === "mcq") {
      const { data: opts } = await supabase
        .from("question_options")
        .select("id, is_correct")
        .eq("question_id", q.id);

      const correctId = (opts ?? []).find((o: any) => o.is_correct)?.id;
      isCorrect = Boolean(correctId && selected === correctId);

      await supabase.from("attempts").insert({
        user_id: userId,
        question_id: q.id,
        selected_option_id: selected || null,
        answer_text: null,
        is_correct: isCorrect,
      });
    } else {
      const expected = (q.solution_explainer ?? "").replace("Correct answer:", "").trim();
      isCorrect = expected.length ? text.trim() === expected : false;

      await supabase.from("attempts").insert({
        user_id: userId,
        question_id: q.id,
        selected_option_id: null,
        answer_text: text,
        is_correct: isCorrect,
      });
    }

    setLoading(false);
    setFeedback(isCorrect ? "Correct ✅" : "Not quite ❌");
  }

  function next() {
    setSelected("");
    setText("");
    setFeedback(null);
    setI((prev) => Math.min(prev + 1, questions.length - 1));
  }

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="text-xs text-gray-500">
        Question {i + 1} of {questions.length}
      </div>

      <div className="font-semibold whitespace-pre-wrap">{q.prompt}</div>

      {q.type === "mcq" ? (
        <div className="space-y-2">
          {(q.options ?? []).map((o) => (
            <label key={o.id} className="flex items-center gap-2">
              <input type="radio" name="opt" value={o.id} checked={selected === o.id} onChange={() => setSelected(o.id)} />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      ) : (
        <label className="block">
          <span className="text-sm">Your answer</span>
          <input className="mt-1 w-full rounded-md border p-2" value={text} onChange={(e) => setText(e.target.value)} />
        </label>
      )}

      <div className="flex gap-2">
        <button className="rounded-md border px-3 py-2" onClick={submit} disabled={loading}>
          Submit
        </button>
        <button className="rounded-md border px-3 py-2" onClick={next} disabled={i === questions.length - 1}>
          Next
        </button>
      </div>

      {feedback && (
        <div className="rounded-md border p-3">
          <div className="font-medium">{feedback}</div>
          {q.hint && <div className="text-sm text-gray-500 mt-1">Hint: {q.hint}</div>}
          {q.solution_explainer && <div className="text-sm mt-2 whitespace-pre-wrap">{q.solution_explainer}</div>}
        </div>
      )}
    </div>
  );
}
