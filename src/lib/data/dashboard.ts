import { SessionStatus } from "@prisma/client";
import { db } from "@/lib/db";

export async function getAdminMetrics() {
  const [participantCount, activeSessions, examCount, submissionAgg, exams, chats] = await Promise.all([
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
    db.chatConversation.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        participant: { include: { user: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
  ]);

  return {
    participantCount,
    activeSessions,
    examCount,
    submissionCount: submissionAgg._count,
    averageScore: Math.round(submissionAgg._avg.percentage ?? 0),
    exams,
    chats,
  };
}

export async function getParticipantDashboard(participantId: string) {
  const [sessions, summaries, conversation] = await Promise.all([
    db.examSession.findMany({
      where: { participantId },
      include: { exam: true, submission: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.learningSummary.findMany({
      where: { isPublished: true },
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
    db.chatConversation.findUnique({
      where: { participantId },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
  ]);

  return { sessions, summaries, conversation };
}
