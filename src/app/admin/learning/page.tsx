import { LearningSummaryForm } from "@/components/forms/learning-summary-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function LearningPage() {
  const [summaries, exams] = await Promise.all([
    db.learningSummary.findMany({ orderBy: { updatedAt: "desc" }, include: { exam: true } }),
    db.exam.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning summaries"
        description="Publish recap notes and video links so students can revisit what they learned after exams."
      />
      <LearningSummaryForm examOptions={exams} />
      <Card className="space-y-4">
        {summaries.map((summary) => (
          <div key={summary.id} className="rounded-3xl bg-[var(--panel-soft)] p-5">
            <p className="font-semibold text-slate-900">{summary.title}</p>
            <p className="text-sm text-slate-500">
              {summary.exam?.title ?? "General"} • updated {formatDate(summary.updatedAt)}
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-700">{summary.content}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}
