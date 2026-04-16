"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { useParticipantLanguage } from "@/components/participant/participant-language";

type LearningContentProps = {
  summaries: Array<{
    id: string;
    title: string;
    content: string;
    videoUrl: string | null;
    examTitle: string | null;
  }>;
};

export function ParticipantLearningContent({ summaries }: LearningContentProps) {
  const { dictionary } = useParticipantLanguage();

  return (
    <div className="space-y-6">
      <PageHeader title={dictionary.learningTitle} description={dictionary.learningDescription} />
      <div className="grid gap-6 xl:grid-cols-2">
        {summaries.map((summary) => (
          <Card key={summary.id} className="space-y-3">
            <p className="font-display text-2xl text-slate-900">{summary.title}</p>
            <p className="text-sm text-slate-500">{summary.examTitle ?? dictionary.generalLearningSummary}</p>
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
