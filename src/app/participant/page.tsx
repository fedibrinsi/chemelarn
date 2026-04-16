import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ButtonLink } from "@/components/shared/button-link";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@prisma/client";
import { getParticipantDashboard } from "@/lib/data/dashboard";
import { formatDate, formatScore } from "@/lib/utils";

export default async function ParticipantDashboardPage() {
  const session = await requireRole(Role.PARTICIPANT);
  const dashboard = await getParticipantDashboard(session.user.participantProfileId!);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${session.user.name}`}
        description="Start an exam with a code, review available learning summaries, or continue a recent session."
        action={<ButtonLink href="/participant/enter-code">Enter exam code</ButtonLink>}
      />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <h2 className="font-display text-2xl text-slate-900">Recent sessions</h2>
          {dashboard.sessions.map((item) => (
            <Link key={item.id} href={`/participant/results/${item.id}`} className="block rounded-3xl bg-[var(--panel-soft)] p-4">
              <p className="font-semibold text-slate-900">{item.exam.title}</p>
              <p className="text-sm text-slate-500">{item.status} • {formatDate(item.createdAt)}</p>
              {item.submission ? (
                <p className="mt-2 text-sm text-slate-700">
                  {formatScore(item.submission.score, item.submission.maxScore)} ({item.submission.percentage}%)
                </p>
              ) : null}
            </Link>
          ))}
        </Card>
        <Card className="space-y-4">
          <h2 className="font-display text-2xl text-slate-900">Learning picks</h2>
          {dashboard.summaries.map((summary) => (
            <div key={summary.id} className="rounded-3xl bg-[var(--panel-soft)] p-4">
              <p className="font-semibold text-slate-900">{summary.title}</p>
              <p className="text-sm text-slate-500">{summary.videoUrl ? "Includes video" : "Text summary"}</p>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
