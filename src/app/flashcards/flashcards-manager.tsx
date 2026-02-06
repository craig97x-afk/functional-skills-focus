"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export type Flashcard = {
  id: string;
  front: string;
  back: string;
  tags: string | null;
};

type Props = {
  initialCards: Flashcard[];
};

export default function FlashcardsManager({ initialCards }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [cards, setCards] = useState<Flashcard[]>(initialCards);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  async function addCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage(null);

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      setStatus("error");
      setMessage("Please sign in again.");
      return;
    }

    const { data, error } = await supabase
      .from("flashcards")
      .insert({
        user_id: authData.user.id,
        front: front.trim(),
        back: back.trim(),
        tags: tags.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .select("id, front, back, tags")
      .single();

    if (error || !data) {
      setStatus("error");
      setMessage(error?.message ?? "Failed to add card.");
      return;
    }

    setCards((prev) => [data as Flashcard, ...prev]);
    setFront("");
    setBack("");
    setTags("");
    setStatus("saved");
    setMessage("Card added.");
  }

  async function saveCard(card: Flashcard) {
    setStatus("saving");
    setMessage(null);

    const { error } = await supabase
      .from("flashcards")
      .update({
        front: card.front.trim(),
        back: card.back.trim(),
        tags: card.tags?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", card.id);

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("saved");
    setMessage("Card updated.");
  }

  async function deleteCard(id: string) {
    if (!confirm("Delete this flashcard?")) return;
    setStatus("saving");
    setMessage(null);

    const { error } = await supabase.from("flashcards").delete().eq("id", id);

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setCards((prev) => prev.filter((card) => card.id !== id));
    setStatus("saved");
    setMessage("Card removed.");
  }

  function updateCard(id: string, patch: Partial<Flashcard>) {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...patch } : card))
    );
  }

  function toggleReveal(id: string) {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={addCard}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            Front
            <input
              className="apple-input"
              value={front}
              onChange={(event) => setFront(event.target.value)}
              placeholder="e.g. What is a prime number?"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Back
            <input
              className="apple-input"
              value={back}
              onChange={(event) => setBack(event.target.value)}
              placeholder="e.g. A number with exactly two factors."
            />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm">
          Tags (optional)
          <input
            className="apple-input"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="e.g. fractions, algebra"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="apple-button"
            type="submit"
            disabled={!front.trim() || !back.trim() || status === "saving"}
          >
            {status === "saving" ? "Saving..." : "Add flashcard"}
          </button>
          {message && (
            <span
              className={
                status === "error"
                  ? "text-sm text-red-500"
                  : "text-sm text-emerald-600"
              }
            >
              {message}
            </span>
          )}
        </div>
      </form>

      <div className="space-y-3">
        <div className="text-sm font-semibold">Your cards</div>
        {cards.length === 0 ? (
          <p className="text-sm text-[color:var(--muted-foreground)]">
            No flashcards yet. Create a few to start revising.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {cards.map((card) => (
              <div
                key={card.id}
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Flashcard
                  </div>
                  <button
                    className="apple-pill"
                    type="button"
                    onClick={() => toggleReveal(card.id)}
                  >
                    {revealed[card.id] ? "Hide answer" : "Show answer"}
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-[color:var(--muted-foreground)]">
                    Front
                  </div>
                  <input
                    className="apple-input"
                    value={card.front}
                    onChange={(event) =>
                      updateCard(card.id, { front: event.target.value })
                    }
                  />
                </div>

                {revealed[card.id] && (
                  <div className="space-y-2">
                    <div className="text-sm text-[color:var(--muted-foreground)]">
                      Back
                    </div>
                    <input
                      className="apple-input"
                      value={card.back}
                      onChange={(event) =>
                        updateCard(card.id, { back: event.target.value })
                      }
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-sm text-[color:var(--muted-foreground)]">
                    Tags
                  </div>
                  <input
                    className="apple-input"
                    value={card.tags ?? ""}
                    onChange={(event) =>
                      updateCard(card.id, { tags: event.target.value })
                    }
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    className="apple-pill"
                    type="button"
                    onClick={() => saveCard(card)}
                    disabled={status === "saving"}
                  >
                    Save
                  </button>
                  <button
                    className="apple-pill"
                    type="button"
                    onClick={() => deleteCard(card.id)}
                    disabled={status === "saving"}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
