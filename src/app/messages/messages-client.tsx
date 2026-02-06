"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export default function MessagesClient({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string | null;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function startChat() {
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/messages/start", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(data?.error ?? "Failed to start chat");
        return;
      }
      window.location.href = `/messages?conversationId=${data.conversationId}`;
    } catch {
      setStatus("error");
      setError("Failed to start chat");
    }
  }

  async function send() {
    if (!conversationId || !body.trim()) return;
    setStatus("sending");
    setError(null);

    const payload = {
      conversation_id: conversationId,
      sender_id: currentUserId,
      body: body.trim(),
    };

    const { data, error: insertError } = await supabase
      .from("support_messages")
      .insert(payload)
      .select("id, sender_id, body, created_at")
      .single();

    if (insertError || !data) {
      setStatus("error");
      setError(insertError?.message ?? "Failed to send message");
      return;
    }

    await supabase
      .from("support_conversations")
      .update({ last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    setMessages((prev) => [...prev, data as Message]);
    setBody("");
    setStatus("idle");
  }

  return (
    <div className="space-y-4">
      {!conversationId ? (
        <div className="apple-card p-6 space-y-3">
          <div className="font-semibold text-lg">Start a support chat</div>
          <p className="apple-subtle">
            Ask your teacher a question and they’ll reply here.
          </p>
          <button className="apple-button" type="button" onClick={startChat}>
            Start chat
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      ) : (
        <>
          <div className="apple-card p-6 space-y-4">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Messages
            </div>
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
              {messages.length === 0 ? (
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  No messages yet. Start the conversation below.
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      msg.sender_id === currentUserId
                        ? "bg-[color:var(--surface-muted)] ml-auto"
                        : "bg-[color:var(--surface)]"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.body}</div>
                    <div className="mt-2 text-xs text-[color:var(--muted-foreground)]">
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="apple-card p-6 space-y-3">
            <textarea
              className="apple-input min-h-[120px]"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write your question..."
            />
            <div className="flex items-center gap-3">
              <button
                className="apple-button"
                type="button"
                onClick={send}
                disabled={status === "sending" || !body.trim()}
              >
                {status === "sending" ? "Sending..." : "Send"}
              </button>
              {error && <span className="text-sm text-red-500">{error}</span>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
