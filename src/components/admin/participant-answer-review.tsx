import { SessionStatus, SubmissionStatus, type Prisma } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { formatDate, formatScore } from "@/lib/utils";
import { gradeSubmission, type DraftAnswers, type ExamSnapshot } from "@/lib/exam";

type SessionAnswerView = {
  questionId: string;
  prompt: string;
  response: Prisma.JsonValue;
  feedback?: string;
  finalScore: number;
  maxScore: number;
  isCorrect: boolean | null;
  requiresManualReview: boolean;
};

type ParticipantReviewSession = {
  id: string;
  status: SessionStatus;
  createdAt: Date;
  startedAt: Date | null;
  submittedAt: Date | null;
  examSnapshot: Prisma.JsonValue;
  draftAnswers: Prisma.JsonValue | null;
  exam: { title: string };
  submission: {
    status: SubmissionStatus;
    score: number;
    maxScore: number;
    percentage: number;
    answers: Array<{
      questionId: string;
      response: Prisma.JsonValue;
      feedback: string | null;
      finalScore: number;
      maxScore: number;
      isCorrect: boolean | null;
      requiresManualReview: boolean;
      question: { prompt: string };
    }>;
  } | null;
};

export type ParticipantReviewParticipant = {
  id: string;
  user: { name: string; email: string };
  gradeLevel: string;
  createdAt: Date;
  examSessions: ParticipantReviewSession[];
};

function formatResponse(response: Prisma.JsonValue) {
  if (response === null || response === undefined) return "No answer";
  if (typeof response === "string" || typeof response === "number" || typeof response === "boolean") {
    return String(response);
  }
  if (Array.isArray(response)) {
    if (response.length === 0) return "No answer";
    return response.map((item) => String(item)).join(" | ");
  }

  return JSON.stringify(response);
}

function getAnswerTone(answer: SessionAnswerView) {
  if (answer.requiresManualReview || answer.isCorrect === null) {
    return {
      badge: "Needs review",
      className: "border-amber-200 bg-amber-50 text-amber-800",
    };
  }

  if (answer.isCorrect) {
    return {
      badge: "Correct",
      className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    };
  }

  return {
    badge: "Wrong",
    className: "border-rose-200 bg-rose-50 text-rose-800",
  };
}

function getStatusLabel(status: SessionStatus, submissionStatus?: SubmissionStatus) {
  if (status === SessionStatus.EXPIRED) return "Time finished";
  if (status === SessionStatus.SUBMITTED) return "Submitted";
  if (status === SessionStatus.IN_PROGRESS) return "In progress";
  if (status === SessionStatus.NOT_STARTED) return "Not started";
  if (submissionStatus === SubmissionStatus.NEEDS_REVIEW) return "Needs review";
  return status;
}

type ParticipantAnswerReviewProps = {
  participant: ParticipantReviewParticipant;
  sessionId?: string;
};

export function ParticipantAnswerReview({ participant, sessionId }: ParticipantAnswerReviewProps) {
  const sessions = participant.examSessions.map((session) => {
    const snapshot = session.examSnapshot as unknown as ExamSnapshot;
    const draftAnswers = ((session.draftAnswers as DraftAnswers | null) ?? {}) as DraftAnswers;

    if (session.submission) {
      const answers: SessionAnswerView[] = session.submission.answers.map((answer) => ({
        questionId: answer.questionId,
        prompt: answer.question.prompt,
        response: (answer.response as Prisma.JsonValue) ?? null,
        feedback: answer.feedback ?? undefined,
        finalScore: answer.finalScore,
        maxScore: answer.maxScore,
        isCorrect: answer.isCorrect,
        requiresManualReview: answer.requiresManualReview,
      }));

      return {
        ...session,
        computedScore: session.submission.score,
        computedMaxScore: session.submission.maxScore,
        computedPercentage: session.submission.percentage,
        answers,
      };
    }

    const grading = gradeSubmission(snapshot, draftAnswers);
    const promptMap = new Map(
      snapshot.sections.flatMap((section) =>
        section.questions.map((question) => [question.id, question.prompt] as const),
      ),
    );

    const answers: SessionAnswerView[] = grading.gradedAnswers.map((answer) => ({
      questionId: answer.questionId,
      prompt: promptMap.get(answer.questionId) ?? answer.questionId,
      response: answer.response,
      feedback: answer.feedback,
      finalScore: answer.finalScore,
      maxScore: answer.maxScore,
      isCorrect: answer.isCorrect,
      requiresManualReview: answer.requiresManualReview,
    }));

    return {
      ...session,
      computedScore: grading.totalScore,
      computedMaxScore: grading.maxScore,
      computedPercentage: grading.percentage,
      answers,
    };
  });

  const activeSession = sessions.find((session) => session.id === sessionId) ?? sessions[0];

  return (
    <div className="space-y-6">
      <Card className="space-y-3">
        <p className="font-semibold text-slate-900">{participant.user.email}</p>
        <p className="text-sm text-slate-500">
          {participant.gradeLevel} • joined {formatDate(participant.createdAt)}
        </p>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Selected session</p>
            <p className="font-display text-2xl text-slate-900">
              {activeSession?.exam.title ?? "No session selected"}
            </p>
          </div>
          {activeSession ? (
            <div className="rounded-3xl bg-[var(--panel-soft)] px-4 py-3 text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">
                {activeSession.submission ? "Recorded score" : "Live saved score"}
              </p>
              <p className="font-display text-2xl text-slate-900">
                {formatScore(activeSession.computedScore, activeSession.computedMaxScore)} ({activeSession.computedPercentage}% )
              </p>
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          {sessions.map((session) => {
            const isActive = session.id === activeSession?.id;
            return (
              <details key={session.id} className="group rounded-3xl border border-[var(--line)] bg-white/70" open={isActive}>
                <summary className="cursor-pointer list-none p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3 rounded-3xl transition group-open:bg-[var(--panel-soft)] group-open:px-4 group-open:py-3">
                    <div>
                      <p className="font-display text-2xl text-slate-900">{session.exam.title}</p>
                      <p className="text-sm text-slate-500">
                        {getStatusLabel(session.status, session.submission?.status)} • opened {formatDate(session.createdAt)} • started{" "}
                        {formatDate(session.startedAt)} • submitted {formatDate(session.submittedAt)}
                      </p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">
                        Click to show answers
                      </p>
                    </div>
                    <div className="rounded-3xl bg-[var(--panel-soft)] px-4 py-3 text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">
                        {session.submission ? "Recorded score" : "Live saved score"}
                      </p>
                      <p className="font-display text-2xl text-slate-900">
                        {formatScore(session.computedScore, session.computedMaxScore)} ({session.computedPercentage}%)
                      </p>
                    </div>
                  </div>
                </summary>

                <div className="px-4 pb-4">
                  {session.answers.length > 0 ? (
                    <div className="space-y-3">
                      {session.answers.map((answer, index) => {
                        const tone = getAnswerTone(answer);
                        return (
                          <div key={`${session.id}-${answer.questionId}-${index}`} className="rounded-3xl border border-[var(--line)] bg-[var(--panel-soft)] p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <p className="font-semibold text-slate-900">{answer.prompt}</p>
                              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.className}`}>
                                {tone.badge}
                              </span>
                            </div>
                            <p className="mt-3 text-sm text-slate-500">Participant response</p>
                            <p className="mt-1 whitespace-pre-wrap break-words rounded-2xl bg-white px-4 py-3 text-sm text-slate-700">
                              {formatResponse(answer.response)}
                            </p>
                            <p className="mt-3 text-sm font-medium text-slate-700">
                              Score: {answer.finalScore}/{answer.maxScore}
                            </p>
                            {answer.feedback ? <p className="mt-1 text-sm text-slate-500">{answer.feedback}</p> : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No saved answers yet for this session.</p>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      </Card>
    </div>
  );
}