import { notFound } from "next/navigation";
import { generateExamCodeAction } from "@/lib/actions/admin";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExamBuilderForm } from "@/components/exam/exam-builder-form";
import type { BuilderQuestion } from "@/components/exam/exam-builder-form";
import { formatDate } from "@/lib/utils";

function toBuilderLabConfig(value: unknown): BuilderQuestion["config"] | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;

  const config = value as Record<string, unknown>;
  if (
    typeof config.experimentTitle !== "string" ||
    typeof config.vesselLabel !== "string" ||
    typeof config.resultLabel !== "string" ||
    !Array.isArray(config.components)
  ) {
    return undefined;
  }

  const components = config.components
    .map((component) => {
      if (!component || typeof component !== "object" || Array.isArray(component)) return null;
      const item = component as Record<string, unknown>;
      if (
        typeof item.label !== "string" ||
        typeof item.value !== "string" ||
        typeof item.color !== "string" ||
        typeof item.effect !== "string"
      ) {
        return null;
      }

      return {
        label: item.label,
        value: item.value,
        color: item.color,
        effect: item.effect,
      };
    })
    .filter((component): component is NonNullable<typeof component> => Boolean(component));

  return {
    experimentTitle: config.experimentTitle,
    vesselLabel: config.vesselLabel,
    resultLabel: config.resultLabel,
    components,
  };
}

export default async function ExamDetailPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  const exam = await db.exam.findUnique({
    where: { id: examId },
    include: {
      sections: {
        orderBy: { position: "asc" },
        include: {
          questions: {
            orderBy: { position: "asc" },
            include: { choiceOptions: true, matchingPairs: true },
          },
        },
      },
      accessCodes: { orderBy: { createdAt: "desc" } },
      sessions: { orderBy: { createdAt: "desc" }, take: 10, include: { participant: { include: { user: true } } } },
    },
  });

  if (!exam) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={exam.title}
        description="Edit the full exam blueprint, then generate secure access codes for student sessions."
        action={
          <form action={generateExamCodeAction.bind(null, exam.id)}>
            <Button type="submit">Generate access code</Button>
          </form>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ExamBuilderForm
          examId={exam.id}
          initialValue={{
            title: exam.title,
            description: exam.description ?? "",
            durationMinutes: exam.durationMinutes,
            status: exam.status,
            availableFrom: exam.availableFrom?.toISOString().slice(0, 16),
            availableUntil: exam.availableUntil?.toISOString().slice(0, 16),
            allowResultReview: exam.allowResultReview,
            allowPastSubmissions: exam.allowPastSubmissions,
            instructions: exam.instructions ?? "",
            sections: exam.sections.map((section) => ({
              title: section.title,
              description: section.description ?? "",
              questions: section.questions.map((question) => ({
                prompt: question.prompt,
                explanation: question.explanation ?? "",
                placeholder: question.placeholder ?? "",
                type: question.type,
                points: question.points,
                isCaseSensitive: question.isCaseSensitive,
                config: toBuilderLabConfig(question.config),
                answerKey: question.answerKey ?? "",
                options: question.choiceOptions.map((option) => ({
                  label: option.label,
                  value: option.value,
                  isCorrect: option.isCorrect,
                })),
                pairs: question.matchingPairs.map((pair) => ({
                  leftLabel: pair.leftLabel,
                  rightLabel: pair.rightLabel,
                  correctMatch: pair.correctMatch,
                })),
              })),
            })),
          }}
        />
        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="font-display text-2xl text-slate-900">Access codes</h2>
            {exam.accessCodes.map((code) => (
              <div key={code.id} className="rounded-3xl bg-[var(--panel-soft)] p-4">
                <p className="font-semibold tracking-[0.24em] text-slate-900">{code.code}</p>
                <p className="text-sm text-slate-500">Uses: {code.usedCount} • Expires {formatDate(code.expiresAt)}</p>
              </div>
            ))}
          </Card>
          <Card className="space-y-4">
            <h2 className="font-display text-2xl text-slate-900">Recent sessions</h2>
            {exam.sessions.map((item) => (
              <div key={item.id} className="rounded-3xl bg-[var(--panel-soft)] p-4">
                <p className="font-semibold text-slate-900">{item.participant.user.name}</p>
                <p className="text-sm text-slate-500">{item.status} • created {formatDate(item.createdAt)}</p>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
