import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { formatDate } from "@/lib/utils";
import { getAdminMetrics } from "@/lib/data/dashboard";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const metrics = await getAdminMetrics();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin dashboard"
        description="Monitor activity, published exams, support messages, and scoring trends from one place."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Participants" value={metrics.participantCount} hint="Student accounts in the platform" />
        <StatCard label="Active sessions" value={metrics.activeSessions} hint="Students taking an exam now" />
        <StatCard label="Exams" value={metrics.examCount} hint="Drafts and published exams" />
        <StatCard label="Submissions" value={metrics.submissionCount} hint="Recorded submissions" />
        <StatCard label="Average score" value={`${metrics.averageScore}%`} hint="Across graded submissions" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="font-display text-2xl text-slate-900">Recent exams</h2>
          {metrics.exams.map((exam) => (
            <div key={exam.id} className="rounded-3xl bg-[var(--panel-soft)] p-4">
              <p className="font-semibold text-slate-900">{exam.title}</p>
              <p className="text-sm text-slate-500">
                {exam.sessions.length} sessions • {exam.accessCodes.length} access codes • updated {formatDate(exam.updatedAt)}
              </p>
            </div>
          ))}
        </Card>
        <Card className="space-y-4">
          <h2 className="font-display text-2xl text-slate-900">Support inbox</h2>
          {metrics.chats.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/admin/chat?conversationId=${conversation.id}`}
              className="block rounded-3xl bg-[var(--panel-soft)] p-4 transition hover:bg-white hover:shadow-sm"
            >
              <p className="font-semibold text-slate-900">{conversation.participant.user.name}</p>
              <p className="text-sm text-slate-500">{conversation.messages[0]?.body ?? "No messages yet."}</p>
            </Link>
          ))}
        </Card>
      </div>
    </div>
  );
}
