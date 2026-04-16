"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { useParticipantLanguage } from "@/components/participant/participant-language";

export function ParticipantTutorialContent() {
  const { dictionary } = useParticipantLanguage();

  return (
    <div className="space-y-6">
      <PageHeader title={dictionary.tutorialTitle} description={dictionary.tutorialDescription} />
      <Card className="space-y-4">
        <div className="aspect-video overflow-hidden rounded-3xl bg-slate-900">
          <iframe
            className="h-full w-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"
            title="Tutorial video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
        <p className="text-sm leading-7 text-slate-700">{dictionary.tutorialCaption}</p>
      </Card>
    </div>
  );
}
