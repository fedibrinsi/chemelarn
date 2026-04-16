import { ChatPanel } from "@/components/chat/chat-panel";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";

export default async function AdminChatPage() {
  const conversations = await db.chatConversation.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      participant: { include: { user: true } },
      messages: { include: { sender: true }, orderBy: { createdAt: "asc" } },
    },
  });
  const active = conversations[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support chat"
        description="Reply to participant questions with a Vercel-friendly polling chat flow."
      />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="space-y-3">
          {conversations.map((conversation) => (
            <div key={conversation.id} className="rounded-3xl bg-[var(--panel-soft)] p-4 text-sm font-medium text-slate-700">
              {conversation.participant.user.name}
            </div>
          ))}
        </Card>
        {active ? (
          <ChatPanel
            conversationId={active.id}
            title={`Conversation with ${active.participant.user.name}`}
            initialMessages={active.messages.map((message) => ({
              id: message.id,
              body: message.body,
              senderRole: message.senderRole,
              createdAt: message.createdAt.toISOString(),
              sender: { name: message.sender.name },
            }))}
          />
        ) : null}
      </div>
    </div>
  );
}
