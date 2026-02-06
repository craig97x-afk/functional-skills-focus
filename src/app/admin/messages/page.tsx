import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import AdminMessagesClient from "./messages-client";

type Conversation = {
  id: string;
  student_id: string;
  admin_id: string;
  last_message_at: string | null;
  created_at: string;
};

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams?: { conversationId?: string; userId?: string };
}) {
  await requireAdmin();
  const session = await getUser();
  if (!session) return null;

  const supabase = await createClient();
  const userIdParam = searchParams?.userId ?? null;

  const { data: rawConversations } = await supabase
    .from("support_conversations")
    .select("id, student_id, admin_id, last_message_at, created_at")
    .order("last_message_at", { ascending: false });

  let conversations = (rawConversations ?? []) as Conversation[];

  if (userIdParam && !conversations.some((c) => c.student_id === userIdParam)) {
    const { data: created } = await supabase
      .from("support_conversations")
      .insert({
        student_id: userIdParam,
        admin_id: session.user.id,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id, student_id, admin_id, last_message_at, created_at")
      .single();

    if (created) {
      conversations = [created as Conversation, ...conversations];
    }
  }

  const selectedConversationId =
    searchParams?.conversationId ??
    conversations.find((c) => c.student_id === userIdParam)?.id ??
    conversations[0]?.id ??
    null;

  const { data: messagesRaw } = selectedConversationId
    ? await supabase
        .from("support_messages")
        .select("id, sender_id, body, created_at")
        .eq("conversation_id", selectedConversationId)
        .order("created_at", { ascending: true })
    : { data: [] as any[] };

  const messages = (messagesRaw ?? []) as Message[];

  if (selectedConversationId) {
    await supabase
      .from("support_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", selectedConversationId)
      .neq("sender_id", session.user.id)
      .is("read_at", null);
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Admin
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mt-2">
            Messages
          </h1>
          <p className="apple-subtle mt-2">
            Reply to student questions and keep conversation history in one place.
          </p>
        </div>
        <Link className="apple-pill" href="/admin/users">
          View users
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <div className="apple-card p-5 space-y-3">
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Conversations
          </div>
          {conversations.length === 0 ? (
            <p className="text-sm text-[color:var(--muted-foreground)]">
              No student conversations yet.
            </p>
          ) : (
            <div className="space-y-2">
              {conversations.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/messages?conversationId=${c.id}`}
                  className={`block rounded-xl border px-3 py-2 text-sm ${
                    selectedConversationId === c.id
                      ? "border-[color:var(--accent)] bg-[color:var(--surface-muted)]"
                      : "border-[color:var(--border)]"
                  }`}
                >
                  <div className="font-medium">Student</div>
                  <div className="text-xs text-[color:var(--muted-foreground)] truncate">
                    {c.student_id}
                  </div>
                  <div className="text-[10px] text-[color:var(--muted-foreground)] mt-1">
                    Last message{" "}
                    {c.last_message_at
                      ? new Date(c.last_message_at).toLocaleDateString()
                      : "—"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <AdminMessagesClient
          conversationId={selectedConversationId}
          currentUserId={session.user.id}
          initialMessages={messages}
        />
      </div>
    </main>
  );
}
