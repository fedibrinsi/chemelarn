import { NextResponse } from "next/server";
import { Prisma, Role, SessionStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import { minutesFromNow } from "@/lib/utils";
import { submitSessionAction } from "@/lib/actions/participant";

const autosaveLimit = new Map<string, { count: number; resetAt: number }>();

function allowed(key: string, limit = 40, windowMs = 60_000) {
  const now = Date.now();
  const value = autosaveLimit.get(key);
  if (!value || value.resetAt < now) {
    autosaveLimit.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (value.count >= limit) return false;
  value.count += 1;
  return true;
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value));
}

export async function PUT(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.PARTICIPANT) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!allowed(session.user.id)) return NextResponse.json({ message: "Rate limited" }, { status: 429 });

  const { sessionId } = await params;
  const body = (await request.json()) as { answers: Record<string, unknown>; start?: boolean };

  const examSession = await db.examSession.findFirst({
    where: { id: sessionId, participantId: session.user.participantProfileId! },
    include: { exam: { select: { durationMinutes: true, availableFrom: true } } },
  });

  if (!examSession) return NextResponse.json({ message: "Not found" }, { status: 404 });
  if (
    examSession.status === SessionStatus.SUBMITTED ||
    examSession.status === SessionStatus.EXPIRED
  ) {
    return NextResponse.json(
      { message: "Session already closed", expired: true, redirectTo: `/participant/results/${sessionId}` },
      { status: 409 },
    );
  }
  if (!examSession.exam.availableFrom || examSession.exam.availableFrom > new Date()) {
    return NextResponse.json({ message: "Exam not started" }, { status: 409 });
  }
  if (examSession.expiresAt && examSession.expiresAt <= new Date()) {
    await submitSessionAction(sessionId, body.answers, true, false);
    return NextResponse.json({
      success: true,
      expired: true,
      redirectTo: `/participant/results/${sessionId}`,
    });
  }

  await db.examSession.update({
    where: { id: sessionId },
    data: {
      draftAnswers: toJson(body.answers),
      lastSavedAt: new Date(),
      startedAt: body.start && !examSession.startedAt ? new Date() : examSession.startedAt ?? undefined,
      expiresAt:
        body.start && !examSession.startedAt && !examSession.expiresAt
          ? minutesFromNow(examSession.exam.durationMinutes)
          : examSession.expiresAt ?? undefined,
      status: examSession.status === SessionStatus.NOT_STARTED ? SessionStatus.IN_PROGRESS : examSession.status,
    },
  });

  return NextResponse.json({ success: true });
}
