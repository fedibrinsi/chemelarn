import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { ParticipantAnswerReview } from "@/components/admin/participant-answer-review";

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
        include: {
          exam: true,
          submission: {
            include: {
              answers: {
                include: { question: true },
                orderBy: { createdAt: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!participant) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={participant.user.name}
        description="Review every exam session, including unfinished work saved during the exam."
      />
      <ParticipantAnswerReview participant={participant} />
    </div>
  );
}
