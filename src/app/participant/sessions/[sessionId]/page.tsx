import { notFound, redirect } from "next/navigation";
import { Role, SessionStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ExamRunner } from "@/components/exam/exam-runner";

export default async function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = await requireRole(Role.PARTICIPANT);
  const examSession = await db.examSession.findFirst({
    where: { id: sessionId, participantId: session.user.participantProfileId! },
  });

  if (!examSession) notFound();
  if (examSession.status === SessionStatus.SUBMITTED || examSession.status === SessionStatus.EXPIRED) {
    redirect(`/participant/results/${examSession.id}`);
  }

  return (
    <ExamRunner
      sessionId={examSession.id}
      snapshot={examSession.examSnapshot as never}
      initialAnswers={(examSession.draftAnswers as Record<string, unknown>) ?? {}}
      expiresAt={(examSession.expiresAt ?? examSession.createdAt).toISOString()}
      status={examSession.status}
    />
  );
}
