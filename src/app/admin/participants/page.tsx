import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { ParticipantAnswerReview } from "@/components/admin/participant-answer-review";

export default async function ParticipantsPage({
  searchParams,
}: {
  searchParams?: Promise<{ participantId?: string; sessionId?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const selectedParticipantId = resolvedSearchParams?.participantId;
  const selectedSessionId = resolvedSearchParams?.sessionId;

  const participants = await db.participantProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      examSessions: { include: { submission: true }, orderBy: { createdAt: "desc" } },
    },
  });

  const activeParticipant = selectedParticipantId
    ? await db.participantProfile.findUnique({
        where: { id: selectedParticipantId },
        include: {
          user: true,
          examSessions: {
            orderBy: { createdAt: "desc" },
            include: {
              exam: true,
              submission: {
                include: {
                  answers: {
                    include: { question: true },
                    orderBy: { createdAt: "asc" },
                  },
                },
              },
            },
          },
        },
      })
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Participants"
        description="Browse student activity, session history, and graded performance."
      />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Filter by student</p>
            <p className="mt-1 text-sm text-slate-600">Pick a student to review only that student's answers.</p>
          </div>
          <form method="get" className="space-y-3">
            <label className="block text-sm font-medium text-slate-700" htmlFor="participantId">
              Student
            </label>
            <select
              id="participantId"
              name="participantId"
              defaultValue={selectedParticipantId ?? ""}
              className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-slate-700"
            >
              <option value="">Select a student</option>
              {participants.map((participant) => (
                <option key={participant.id} value={participant.id}>
                  {participant.user.name} • {participant.gradeLevel}
                </option>
              ))}
            </select>

            {activeParticipant ? (
              <>
                <label className="block text-sm font-medium text-slate-700" htmlFor="sessionId">
                  Session
                </label>
                <select
                  id="sessionId"
                  name="sessionId"
                  defaultValue={selectedSessionId ?? ""}
                  className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-slate-700"
                >
                  <option value="">All sessions</option>
                  {activeParticipant.examSessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.exam.title} • {formatDate(session.createdAt)}
                    </option>
                  ))}
                </select>
              </>
            ) : null}

            <button type="submit" className="inline-flex rounded-2xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white">
              Apply filter
            </button>
          </form>

          <div className="space-y-3 pt-2">
            {participants.map((participant) => (
              <Link
                key={participant.id}
                href={`/admin/participants?participantId=${participant.id}`}
                className="block rounded-3xl bg-[var(--panel-soft)] p-5"
              >
                <p className="font-semibold text-slate-900">{participant.user.name}</p>
                <p className="text-sm text-slate-500">
                  {participant.gradeLevel} • {participant.examSessions.length} sessions • joined {formatDate(participant.createdAt)}
                </p>
              </Link>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          {activeParticipant ? (
            <ParticipantAnswerReview participant={activeParticipant} sessionId={selectedSessionId} />
          ) : (
            <Card className="flex min-h-[320px] items-center justify-center rounded-[2rem] text-center text-sm text-slate-500">
              Choose a student to review their answers individually.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
