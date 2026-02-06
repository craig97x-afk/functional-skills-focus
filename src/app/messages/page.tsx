import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import MessagesClient from "./messages-client";

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export default async function MessagesPage({
  searchParams,
}: {
  searchParams?: { conversationId?: string };
}) {
  const session = await getUser();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from("support_conversations")
    .select("id, admin_id, last_message_at, created_at")
    .eq("student_id", session.user.id)
    .order("last_message_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const conversationId = searchParams?.conversationId ?? conversation?.id ?? null;

  const { data: messagesRaw } = conversationId
    ? await supabase
        .from("support_messages")
        .select("id, sender_id, body, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
    : { data: [] as any[] };

  const messages = (messagesRaw ?? []) as Message[];

  if (conversationId) {
    await supabase
      .from("support_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", session.user.id)
      .is("read_at", null);
  }

  return (
    <main className="space-y-6 max-w-4xl">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Support
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">
          Messages
        </h1>
        <p className="apple-subtle mt-2">
          Ask your teacher a question and track replies here.
        </p>
      </div>

      <MessagesClient
        conversationId={conversationId}
        currentUserId={session.user.id}
        initialMessages={messages}
      />
    </main>
  );
}
