"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/shared/button-link";
import { formatDate, formatScore } from "@/lib/utils";
import { useParticipantLanguage } from "@/components/participant/participant-language";

type DashboardContentProps = {
  name: string;
  sessions: Array<{
    id: string;
    createdAt: string;
    status: string;
    exam: { title: string };
    submission: { score: number; maxScore: number; percentage: number } | null;
  }>;
  summaries: Array<{
    id: string;
    title: string;
    videoUrl: string | null;
  }>;
};

export function ParticipantDashboardContent({ name, sessions, summaries }: DashboardContentProps) {
  const { dictionary } = useParticipantLanguage();

  return (
    <div className="space-y-6">
      <PageHeader
        title={dictionary.dashboardTitle(name)}
        description={dictionary.dashboardDescription}
        action={<ButtonLink href="/participant/enter-code">{dictionary.enterExamCode}</ButtonLink>}
      />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <h2 className="font-display text-2xl text-slate-900">{dictionary.recentSessions}</h2>
          {sessions.map((item) => (
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
          <h2 className="font-display text-2xl text-slate-900">{dictionary.learningPicks}</h2>
          {summaries.map((summary) => (
            <div key={summary.id} className="rounded-3xl bg-[var(--panel-soft)] p-4">
              <p className="font-semibold text-slate-900">{summary.title}</p>
              <p className="text-sm text-slate-500">
                {summary.videoUrl ? dictionary.includesVideo : dictionary.textSummary}
              </p>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
