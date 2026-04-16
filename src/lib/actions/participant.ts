"use server";

import { Prisma, Role, SessionStatus, SubmissionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { buildExamSnapshot, gradeSubmission, type DraftAnswers } from "@/lib/exam";
import { minutesFromNow } from "@/lib/utils";
import { redeemCodeSchema } from "@/lib/validations";

type ActionState = { success: boolean; message: string; redirectTo?: string };

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value));
}

export async function redeemExamCodeAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole(Role.PARTICIPANT);
  const participantId = session.user.participantProfileId;

  if (!participantId) {
    return { success: false, message: "Participant profile not found." };
  }

  const parsed = redeemCodeSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return { success: false, message: "Enter a valid exam code." };
  }

  const accessCode = await db.examAccessCode.findUnique({
    where: { code: parsed.data.code.toUpperCase() },
    include: {
      exam: {
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
        },
      },
    },
  });

  if (!accessCode || !accessCode.isActive || accessCode.exam.status !== "PUBLISHED") {
    return { success: false, message: "This access code is not available." };
  }

  if (accessCode.expiresAt && accessCode.expiresAt < new Date()) {
    return { success: false, message: "This access code has expired." };
  }

  const snapshot = buildExamSnapshot(accessCode.exam);
  const existing = await db.examSession.findFirst({
    where: {
      participantId,
      examId: accessCode.examId,
      status: { in: [SessionStatus.NOT_STARTED, SessionStatus.IN_PROGRESS] },
    },
  });

  const currentSession =
    existing ??
    (await db.examSession.create({
      data: {
        participantId,
        examId: accessCode.examId,
        accessCodeId: accessCode.id,
        status: SessionStatus.NOT_STARTED,
        expiresAt: minutesFromNow(accessCode.exam.durationMinutes),
        examSnapshot: toJson(snapshot),
        draftAnswers: {},
      },
    }));

  await db.examAccessCode.update({
    where: { id: accessCode.id },
    data: { usedCount: { increment: existing ? 0 : 1 } },
  });

  revalidatePath("/participant");
  return {
    success: true,
    message: "Code accepted.",
    redirectTo: `/participant/sessions/${currentSession.id}`,
  };
}

export async function submitSessionAction(sessionId: string, answers: DraftAnswers, autoSubmitted = false) {
  const session = await requireRole(Role.PARTICIPANT);
  const participantId = session.user.participantProfileId;

  if (!participantId) throw new Error("Participant profile missing");

  const examSession = await db.examSession.findFirst({
    where: { id: sessionId, participantId },
  });

  if (!examSession) throw new Error("Exam session not found");

  const snapshot = examSession.examSnapshot as unknown as Parameters<typeof gradeSubmission>[0];
  const grading = gradeSubmission(snapshot, answers);

  await db.$transaction(async (tx) => {
    await tx.examSession.update({
      where: { id: sessionId },
      data: {
        status: autoSubmitted ? SessionStatus.EXPIRED : SessionStatus.SUBMITTED,
        submittedAt: new Date(),
        autoSubmittedAt: autoSubmitted ? new Date() : undefined,
        draftAnswers: toJson(answers),
      },
    });

    const submission = await tx.submission.upsert({
      where: { sessionId },
      create: {
        sessionId,
        participantId,
        status: grading.status as SubmissionStatus,
        score: grading.totalScore,
        maxScore: grading.maxScore,
        percentage: grading.percentage,
        autoGradedAt: new Date(),
        gradedAt: grading.status === "GRADED" ? new Date() : undefined,
        submittedAt: new Date(),
        correctionsVisible: snapshot.allowResultReview,
        answersSnapshot: toJson(answers),
        sectionBreakdown: toJson(grading.sectionBreakdown),
      },
      update: {
        status: grading.status as SubmissionStatus,
        score: grading.totalScore,
        maxScore: grading.maxScore,
        percentage: grading.percentage,
        autoGradedAt: new Date(),
        gradedAt: grading.status === "GRADED" ? new Date() : undefined,
        submittedAt: new Date(),
        answersSnapshot: toJson(answers),
        sectionBreakdown: toJson(grading.sectionBreakdown),
      },
    });

      await tx.submissionAnswer.deleteMany({ where: { submissionId: submission.id } });
      await tx.submissionAnswer.createMany({
        data: grading.gradedAnswers.map((answer) => ({
          submissionId: submission.id,
          questionId: answer.questionId,
          response: answer.response === null ? Prisma.JsonNull : toJson(answer.response),
          autoScore: answer.autoScore,
          finalScore: answer.finalScore,
          maxScore: answer.maxScore,
        isCorrect: answer.isCorrect,
        feedback: answer.feedback,
        requiresManualReview: answer.requiresManualReview,
      })),
    });
  });

  revalidatePath("/participant");
  revalidatePath(`/participant/results/${sessionId}`);
}
