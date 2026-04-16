import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";

export default async function ParticipantLearningPage() {
  const summaries = await db.learningSummary.findMany({
    where: { isPublished: true },
    include: { exam: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Summary of what you learned"
        description="Review concise notes and linked videos published by the admin team."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        {summaries.map((summary) => (
          <Card key={summary.id} className="space-y-3">
            <p className="font-display text-2xl text-slate-900">{summary.title}</p>
            <p className="text-sm text-slate-500">{summary.exam?.title ?? "General learning summary"}</p>
            {summary.videoUrl ? (
              <div className="aspect-video overflow-hidden rounded-3xl bg-slate-900">
                <iframe className="h-full w-full" src={summary.videoUrl.replace("watch?v=", "embed/")} title={summary.title} />
              </div>
            ) : null}
            <p className="text-sm leading-7 text-slate-700">{summary.content}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
