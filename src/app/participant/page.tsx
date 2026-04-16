import { requireRole } from "@/lib/auth/session";
import { Role } from "@prisma/client";
import { ParticipantDashboardContent } from "@/components/participant/dashboard-content";
import { getParticipantDashboard } from "@/lib/data/dashboard";

export default async function ParticipantDashboardPage() {
  const session = await requireRole(Role.PARTICIPANT);
  const dashboard = await getParticipantDashboard(session.user.participantProfileId!);

  return (
    <ParticipantDashboardContent
      name={session.user.name}
      sessions={dashboard.sessions.map((item) => ({
        id: item.id,
        createdAt: item.createdAt.toISOString(),
        status: item.status,
        exam: { title: item.exam.title },
        submission: item.submission
          ? {
              score: item.submission.score,
              maxScore: item.submission.maxScore,
              percentage: item.submission.percentage,
            }
          : null,
      }))}
      summaries={dashboard.summaries.map((summary) => ({
        id: summary.id,
        title: summary.title,
        videoUrl: summary.videoUrl,
      }))}
    />
  );
}
