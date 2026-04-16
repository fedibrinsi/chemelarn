import { NextResponse } from "next/server";
import { Role, SenderRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import { chatMessageSchema } from "@/lib/validations";

const requestMap = new Map<string, { count: number; resetAt: number }>();

function checkLimit(key: string, limit = 30, windowMs = 60_000) {
  const now = Date.now();
  const record = requestMap.get(key);
  if (!record || record.resetAt < now) {
    requestMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= limit) return false;
  record.count += 1;
  return true;
}

export async function GET(_: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { conversationId } = await params;
  const conversation = await db.chatConversation.findUnique({
    where: { id: conversationId },
    include: {
      participant: true,
      messages: { include: { sender: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) return NextResponse.json({ message: "Not found" }, { status: 404 });
  if (session.user.role === Role.PARTICIPANT && conversation.participantId !== session.user.participantProfileId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    messages: conversation.messages.map((message) => ({
      id: message.id,
      body: message.body,
      senderRole: message.senderRole,
      createdAt: message.createdAt.toISOString(),
      sender: { name: message.sender.name },
    })),
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!checkLimit(session.user.id)) return NextResponse.json({ message: "Rate limited" }, { status: 429 });

  const { conversationId } = await params;
  const body = await request.json();
  const parsed = chatMessageSchema.safeParse({ conversationId, body: body.body });
  if (!parsed.success) return NextResponse.json({ message: "Invalid payload" }, { status: 400 });

  const conversation = await db.chatConversation.findUnique({ where: { id: conversationId } });
  if (!conversation) return NextResponse.json({ message: "Not found" }, { status: 404 });
  if (session.user.role === Role.PARTICIPANT && conversation.participantId !== session.user.participantProfileId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await db.chatMessage.create({
    data: {
      conversationId,
      senderId: session.user.id,
      senderRole: session.user.role === Role.ADMIN ? SenderRole.ADMIN : SenderRole.PARTICIPANT,
      body: parsed.data.body,
    },
  });

  await db.chatConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  const messages = await db.chatMessage.findMany({
    where: { conversationId },
    include: { sender: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    success: true,
    messages: messages.map((message) => ({
      id: message.id,
      body: message.body,
      senderRole: message.senderRole,
      createdAt: message.createdAt.toISOString(),
      sender: { name: message.sender.name },
    })),
  });
}
