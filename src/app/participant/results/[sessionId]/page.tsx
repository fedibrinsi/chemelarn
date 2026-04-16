import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { formatScore } from "@/lib/utils";

export default async function ResultsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = await requireRole(Role.PARTICIPANT);
  const result = await db.examSession.findFirst({
    where: { id: sessionId, participantId: session.user.participantProfileId! },
    include: {
      exam: true,
      submission: { include: { answers: { include: { question: true } } } },
    },
  });

  if (!result) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Results"
        description="Review your score, correction summary, and any answers that still need teacher feedback."
      />
      <Card className="space-y-4">
        <p className="font-display text-3xl text-slate-900">{result.exam.title}</p>
        {result.submission ? (
          <>
            <p className="text-lg font-medium text-slate-700">
              Score: {formatScore(result.submission.score, result.submission.maxScore)} ({result.submission.percentage}%)
            </p>
            {result.submission.answers.map((answer) => (
              <div key={answer.id} className="rounded-3xl bg-[var(--panel-soft)] p-4">
                <p className="font-semibold text-slate-900">{answer.question.prompt}</p>
                <p className="text-sm text-slate-500">
                  {answer.feedback ?? "No feedback yet"} • {answer.finalScore}/{answer.maxScore}
                </p>
              </div>
            ))}
          </>
        ) : (
          <p className="text-sm text-slate-500">Your exam has not been submitted yet.</p>
        )}
      </Card>
    </div>
  );
}
