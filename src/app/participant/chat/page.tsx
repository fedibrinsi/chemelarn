import { Role } from "@prisma/client";
import { ParticipantChatContent } from "@/components/participant/chat-content";
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
    <ParticipantChatContent
      conversationId={conversation.id}
      initialMessages={conversation.messages.map((message) => ({
        id: message.id,
        body: message.body,
        senderRole: message.senderRole,
        createdAt: message.createdAt.toISOString(),
        sender: { name: message.sender.name },
      }))}
    />
  );
}
