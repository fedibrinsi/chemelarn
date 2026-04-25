import { notFound, redirect } from "next/navigation";
import { Role, SessionStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ExamRunner } from "@/components/exam/exam-runner";
import { Card } from "@/components/ui/card";
import { ConcoursThreeRunner } from "@/components/participant/concours-three-runner";
import { submitSessionAction } from "@/lib/actions/participant";
import { CONCOURS3_ACCESS_CODE } from "@/lib/constants";
import { ButtonLink } from "@/components/shared/button-link";

export default async function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = await requireRole(Role.PARTICIPANT);
  const examSession = await db.examSession.findFirst({
    where: { id: sessionId, participantId: session.user.participantProfileId! },
    include: { accessCode: true, exam: true },
  });

  if (!examSession) notFound();
  if (examSession.status === SessionStatus.SUBMITTED || examSession.status === SessionStatus.EXPIRED) {
    redirect(`/participant/results/${examSession.id}`);
  }
  if (examSession.expiresAt && examSession.expiresAt <= new Date()) {
    await submitSessionAction(
      examSession.id,
      ((examSession.draftAnswers as Record<string, unknown> | null) ?? {}) as Record<string, unknown>,
      true,
      false,
    );
    redirect(`/participant/results/${examSession.id}`);
  }

  const isConcours = examSession.accessCode.code === CONCOURS3_ACCESS_CODE;
  const waitingForStart = !examSession.exam.availableFrom || examSession.exam.availableFrom > new Date();

  if (waitingForStart) {
    return (
      <Card className="space-y-3">
        <h1 className="font-display text-3xl text-slate-900">Exam en attente</h1>
        <p className="text-sm text-slate-600">The exam will be started soon.</p>
        <div className="pt-2">
          <ButtonLink href={`/participant/sessions/${examSession.id}`} variant="secondary">
            Refresh
          </ButtonLink>
        </div>
      </Card>
    );
  }

  if (isConcours) {
    const snapshot = examSession.examSnapshot as never as {
      sections: Array<{ questions: Array<{ id: string }> }>;
    };
    const flatQuestionIds = snapshot.sections.flatMap((section) => section.questions.map((question) => question.id));

    if (flatQuestionIds.length < 21) {
      notFound();
    }

    return (
      <ConcoursThreeRunner
        sessionId={examSession.id}
        status={examSession.status}
        initialAnswers={(examSession.draftAnswers as Record<string, unknown>) ?? {}}
        ids={{
          flash: flatQuestionIds[0],
          questions: flatQuestionIds.slice(1, 19),
          challenge1: flatQuestionIds[19],
          challenge2: flatQuestionIds[20],
        }}
      />
    );
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
