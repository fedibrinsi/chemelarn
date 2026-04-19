"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { formatScore } from "@/lib/utils";
import { useParticipantLanguage } from "@/components/participant/participant-language";

type ResultsContentProps = {
  examTitle: string;
  reviewOnly?: boolean;
  submission:
    | {
        score: number;
        maxScore: number;
        percentage: number;
        answers: Array<{
          id: string;
          prompt: string;
          feedback: string | null;
          finalScore: number;
          maxScore: number;
        }>;
      }
    | null;
};

export function ParticipantResultsContent({ examTitle, submission, reviewOnly }: ResultsContentProps) {
  const { dictionary } = useParticipantLanguage();

  return (
    <div className="space-y-6">
      <PageHeader title={dictionary.resultsTitle} description={dictionary.resultsDescription} />
      <Card className="space-y-4">
        <p className="font-display text-3xl text-slate-900">{examTitle}</p>
        {reviewOnly ? (
          <p className="text-sm text-slate-600">
            Your answers were submitted successfully. The admin will review your submission soon.
          </p>
        ) : submission ? (
          <>
            <p className="text-lg font-medium text-slate-700">
              {dictionary.scoreLabel}: {formatScore(submission.score, submission.maxScore)} ({submission.percentage}%)
            </p>
            {submission.answers.map((answer) => (
              <div key={answer.id} className="rounded-3xl bg-[var(--panel-soft)] p-4">
                <p className="font-semibold text-slate-900">{answer.prompt}</p>
                <p className="text-sm text-slate-500">
                  {answer.feedback ?? dictionary.noFeedback} • {answer.finalScore}/{answer.maxScore}
                </p>
              </div>
            ))}
          </>
        ) : (
          <p className="text-sm text-slate-500">{dictionary.notSubmitted}</p>
        )}
      </Card>
    </div>
  );
}
