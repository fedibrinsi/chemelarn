import { notFound } from "next/navigation";
import { Role, SessionStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ParticipantResultsContent } from "@/components/participant/results-content";
import { CONCOURS3_ACCESS_CODE } from "@/lib/constants";

export default async function ResultsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = await requireRole(Role.PARTICIPANT);
  const result = await db.examSession.findFirst({
    where: { id: sessionId, participantId: session.user.participantProfileId! },
    include: {
      exam: true,
      accessCode: true,
      submission: { include: { answers: { include: { question: true } } } },
    },
  });

  if (!result) notFound();

  const isConcours = result.accessCode.code === CONCOURS3_ACCESS_CODE;

  return (
    <ParticipantResultsContent
      examTitle={result.exam.title}
      examOver={result.status === SessionStatus.EXPIRED}
      reviewOnly={isConcours}
      submission={
        isConcours
          ? null
          :
        result.submission
          ? {
              score: result.submission.score,
              maxScore: result.submission.maxScore,
              percentage: result.submission.percentage,
              answers: result.submission.answers.map((answer) => ({
                id: answer.id,
                prompt: answer.question.prompt,
                feedback: answer.feedback,
                finalScore: answer.finalScore,
                maxScore: answer.maxScore,
              })),
            }
          : null
      }
    />
  );
}
