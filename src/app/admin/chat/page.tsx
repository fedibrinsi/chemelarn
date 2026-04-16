import { ChatPanel } from "@/components/chat/chat-panel";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { cn, formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function AdminChatPage({
  searchParams,
}: {
  searchParams?: Promise<{ conversationId?: string }>;
}) {
  const conversations = await db.chatConversation.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      participant: { include: { user: true } },
      messages: { include: { sender: true }, orderBy: { createdAt: "asc" } },
    },
  });
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedConversationId = resolvedSearchParams?.conversationId;
  const active =
    conversations.find((conversation) => conversation.id === requestedConversationId) ?? conversations[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support chat"
        description="Reply to participant questions with a Vercel-friendly polling chat flow."
      />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="space-y-3">
          <div>
            <h2 className="font-display text-2xl text-slate-900">Participant chats</h2>
            <p className="text-sm text-[var(--muted)]">Choose a participant to open that private conversation.</p>
          </div>
          {conversations.length ? (
            conversations.map((conversation) => {
              const latestMessage = conversation.messages[conversation.messages.length - 1];
              const isActive = conversation.id === active?.id;

              return (
                <Link
                  key={conversation.id}
                  href={`/admin/chat?conversationId=${conversation.id}`}
                  className={cn(
                    "block rounded-3xl border p-4 transition hover:border-[var(--accent)] hover:bg-white",
                    isActive
                      ? "border-[var(--accent)] bg-white shadow-sm"
                      : "border-transparent bg-[var(--panel-soft)] text-slate-700",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{conversation.participant.user.name}</p>
                      <p className="truncate text-sm text-slate-500">
                        {latestMessage?.body ?? "No messages yet."}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">{formatDate(conversation.updatedAt)}</span>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="rounded-3xl bg-[var(--panel-soft)] p-4 text-sm text-slate-500">
              No participant chats yet.
            </div>
          )}
        </Card>
        {active ? (
          <ChatPanel
            key={active.id}
            conversationId={active.id}
            title={`Conversation with ${active.participant.user.name}`}
            initialMessages={active.messages.map((message) => ({
              id: message.id,
              body: message.body,
              senderRole: message.senderRole,
              createdAt: message.createdAt.toISOString(),
              sender: { name: message.sender.name },
            }))}
            hint="Each participant has a separate private chat. Only the admin team and that participant can see this conversation."
          />
        ) : (
          <Card className="flex min-h-[320px] items-center justify-center rounded-[2rem] text-center text-sm text-slate-500">
            Select a participant chat to start replying.
          </Card>
        )}
      </div>
    </div>
  );
}
