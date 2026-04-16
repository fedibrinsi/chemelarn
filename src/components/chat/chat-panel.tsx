"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

type Message = {
  id: string;
  body: string;
  senderRole: "ADMIN" | "PARTICIPANT";
  createdAt: string;
  sender: { name: string };
};

export function ChatPanel({
  conversationId,
  title,
  initialMessages,
  hint = "Lightweight near-realtime chat with automatic polling for Vercel-friendly deployment.",
  placeholder = "Type a question or reply...",
  sendingLabel = "Sending...",
  sendLabel = "Send message",
}: {
  conversationId: string;
  title: string;
  initialMessages: Message[];
  hint?: string;
  placeholder?: string;
  sendingLabel?: string;
  sendLabel?: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void (async () => {
        const response = await fetch(`/api/chat/${conversationId}/messages`, { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { messages: Message[] };
        setMessages(payload.messages);
      })();
    }, 5000);
    return () => window.clearInterval(interval);
  }, [conversationId]);

  async function sendMessage() {
    if (!body.trim()) return;
    setPending(true);
    const response = await fetch(`/api/chat/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setPending(false);

    if (!response.ok) {
      toast.error("Message could not be sent.");
      return;
    }

    setBody("");
    const payload = (await response.json()) as { messages?: Message[] };
    if (payload.messages) {
      setMessages(payload.messages);
      return;
    }
    const refresh = await fetch(`/api/chat/${conversationId}/messages`, { cache: "no-store" });
    if (refresh.ok) {
      const refreshed = (await refresh.json()) as { messages: Message[] };
      setMessages(refreshed.messages);
    }
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="font-display text-2xl text-slate-900">{title}</h2>
        <p className="text-sm text-[var(--muted)]">{hint}</p>
      </div>
      <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-3xl bg-[var(--panel-soft)] p-4">
        {messages.map((message) => (
          <div key={message.id} className="rounded-2xl bg-white p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
              <span>{message.sender.name}</span>
              <span>{formatDate(message.createdAt)}</span>
            </div>
            <p className="text-sm leading-7 text-slate-700">{message.body}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <Textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder={placeholder} />
        <Button onClick={() => void sendMessage()} disabled={pending}>
          {pending ? sendingLabel : sendLabel}
        </Button>
      </div>
    </Card>
  );
}
