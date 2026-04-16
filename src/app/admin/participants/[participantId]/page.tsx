import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { formatDate, formatScore } from "@/lib/utils";

export default async function ParticipantDetailPage({
  params,
}: {
  params: Promise<{ participantId: string }>;
}) {
  const { participantId } = await params;
  const participant = await db.participantProfile.findUnique({
    where: { id: participantId },
    include: {
      user: true,
      examSessions: {
        orderBy: { createdAt: "desc" },
        include: { exam: true, submission: true },
      },
    },
  });

  if (!participant) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={participant.user.name}
        description="Review this participant's exam timeline, latest submissions, and scoring detail."
      />
      <Card className="space-y-4">
        {participant.examSessions.map((session) => (
          <div key={session.id} className="rounded-3xl bg-[var(--panel-soft)] p-5">
            <p className="font-semibold text-slate-900">{session.exam.title}</p>
            <p className="text-sm text-slate-500">
              {session.status} • started {formatDate(session.startedAt)} • submitted {formatDate(session.submittedAt)}
            </p>
            {session.submission ? (
              <p className="mt-2 text-sm font-medium text-slate-700">
                Score: {formatScore(session.submission.score, session.submission.maxScore)} ({session.submission.percentage}%)
              </p>
            ) : null}
          </div>
        ))}
      </Card>
    </div>
  );
}
