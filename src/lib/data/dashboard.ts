import { SessionStatus } from "@prisma/client";
import { db } from "@/lib/db";

export async function getAdminMetrics() {
  const [participantCount, activeSessions, examCount, submissionAgg, exams] = await Promise.all([
    db.participantProfile.count(),
    db.examSession.count({ where: { status: SessionStatus.IN_PROGRESS } }),
    db.exam.count(),
    db.submission.aggregate({
      _count: true,
      _avg: { percentage: true },
    }),
    db.exam.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { sessions: true, accessCodes: true },
    }),
  ]);

  return {
    participantCount,
    activeSessions,
    examCount,
    submissionCount: submissionAgg._count,
    averageScore: Math.round(submissionAgg._avg.percentage ?? 0),
    exams,
  };
}

export async function getParticipantDashboard(participantId: string) {
  const [sessions] = await Promise.all([
    db.examSession.findMany({
      where: { participantId },
      include: { exam: true, submission: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  return { sessions };
}
