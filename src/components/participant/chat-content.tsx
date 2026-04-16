"use client";

import { ChatPanel } from "@/components/chat/chat-panel";
import { PageHeader } from "@/components/shared/page-header";
import { useParticipantLanguage } from "@/components/participant/participant-language";

type ChatContentProps = {
  conversationId: string;
  initialMessages: Array<{
    id: string;
    body: string;
    senderRole: "ADMIN" | "PARTICIPANT";
    createdAt: string;
    sender: { name: string };
  }>;
};

export function ParticipantChatContent({ conversationId, initialMessages }: ChatContentProps) {
  const { dictionary } = useParticipantLanguage();

  return (
    <div className="space-y-6">
      <PageHeader title={dictionary.chatTitle} description={dictionary.chatDescription} />
      <ChatPanel
        conversationId={conversationId}
        title={dictionary.chatPanelTitle}
        initialMessages={initialMessages}
        hint={dictionary.chatHint}
        placeholder={dictionary.chatPlaceholder}
        sendingLabel={dictionary.sending}
        sendLabel={dictionary.sendMessage}
      />
    </div>
  );
}
