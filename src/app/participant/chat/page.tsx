import { Role } from "@prisma/client";
import { ChatPanel } from "@/components/chat/chat-panel";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";

export default async function ParticipantChatPage() {
  const session = await requireRole(Role.PARTICIPANT);
  const conversation = await db.chatConversation.upsert({
    where: { participantId: session.user.participantProfileId! },
    update: {},
    create: { participantId: session.user.participantProfileId! },
    include: { messages: { include: { sender: true }, orderBy: { createdAt: "asc" } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Help chat"
        description="Ask for help if you are stuck, need clarification, or want support while using the platform."
      />
      <ChatPanel
        conversationId={conversation.id}
        title="Message the admin team"
        initialMessages={conversation.messages.map((message) => ({
          id: message.id,
          body: message.body,
          senderRole: message.senderRole,
          createdAt: message.createdAt.toISOString(),
          sender: { name: message.sender.name },
        }))}
      />
    </div>
  );
}
