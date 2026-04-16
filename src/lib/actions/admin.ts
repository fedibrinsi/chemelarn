"use server";

import { Prisma, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { buildExamSnapshot } from "@/lib/exam";
import { requireRole } from "@/lib/auth/session";
import { examBuilderSchema, learningSummarySchema } from "@/lib/validations";
import { randomCode } from "@/lib/utils";

type ActionState = { success: boolean; message: string };

function normalizeOptionalDate(value?: string) {
  return value ? new Date(value) : null;
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value));
}

async function logAdminAction(actorId: string, action: string, entityType: string, entityId: string, metadata?: unknown) {
  await db.auditLog.create({
    data: {
      actorId,
      action,
      entityType,
      entityId,
      metadata: metadata ? toJson(metadata) : undefined,
    },
  });
}

export async function saveExamAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole(Role.ADMIN);
  const rawPayload = formData.get("payload");
  const examId = formData.get("examId")?.toString();

  if (!rawPayload || typeof rawPayload !== "string") {
    return { success: false, message: "Missing exam payload." };
  }

  const parsed = examBuilderSchema.safeParse(JSON.parse(rawPayload));
  if (!parsed.success) {
    return { success: false, message: "Exam data is invalid. Please check the builder fields." };
  }

  const payload = parsed.data;

  const exam = await db.exam.upsert({
    where: { id: examId || "missing" },
    create: {
      title: payload.title,
      description: payload.description,
      durationMinutes: payload.durationMinutes,
      status: payload.status,
      availableFrom: normalizeOptionalDate(payload.availableFrom) ?? undefined,
      availableUntil: normalizeOptionalDate(payload.availableUntil) ?? undefined,
      allowResultReview: payload.allowResultReview,
      allowPastSubmissions: payload.allowPastSubmissions,
      instructions: payload.instructions,
      createdById: session.user.id,
      sections: {
        create: payload.sections.map((section, sectionIndex) => ({
          title: section.title,
          description: section.description,
          position: sectionIndex,
          questions: {
            create: section.questions.map((question, questionIndex) => ({
              type: question.type,
              prompt: question.prompt,
              explanation: question.explanation,
              placeholder: question.placeholder,
              points: question.points,
              position: questionIndex,
              isCaseSensitive: question.isCaseSensitive ?? false,
              config: question.config ? toJson(question.config) : Prisma.JsonNull,
              answerKey: question.answerKey ? toJson(question.answerKey) : Prisma.JsonNull,
              choiceOptions: question.options?.length
                ? {
                    create: question.options.map((option, optionIndex) => ({
                      ...option,
                      isCorrect: option.isCorrect ?? false,
                      position: optionIndex,
                    })),
                  }
                : undefined,
              matchingPairs: question.pairs?.length
                ? {
                    create: question.pairs.map((pair, pairIndex) => ({
                      ...pair,
                      position: pairIndex,
                    })),
                  }
                : undefined,
            })),
          },
        })),
      },
    },
    update: {
      title: payload.title,
      description: payload.description,
      durationMinutes: payload.durationMinutes,
      status: payload.status,
      availableFrom: normalizeOptionalDate(payload.availableFrom) ?? undefined,
      availableUntil: normalizeOptionalDate(payload.availableUntil) ?? undefined,
      allowResultReview: payload.allowResultReview,
      allowPastSubmissions: payload.allowPastSubmissions,
      instructions: payload.instructions,
      version: { increment: 1 },
      sections: {
        deleteMany: {},
        create: payload.sections.map((section, sectionIndex) => ({
          title: section.title,
          description: section.description,
          position: sectionIndex,
          questions: {
            create: section.questions.map((question, questionIndex) => ({
              type: question.type,
              prompt: question.prompt,
              explanation: question.explanation,
              placeholder: question.placeholder,
              points: question.points,
              position: questionIndex,
              isCaseSensitive: question.isCaseSensitive ?? false,
              config: question.config ? toJson(question.config) : Prisma.JsonNull,
              answerKey: question.answerKey ? toJson(question.answerKey) : Prisma.JsonNull,
              choiceOptions: question.options?.length
                ? {
                    create: question.options.map((option, optionIndex) => ({
                      ...option,
                      isCorrect: option.isCorrect ?? false,
                      position: optionIndex,
                    })),
                  }
                : undefined,
              matchingPairs: question.pairs?.length
                ? {
                    create: question.pairs.map((pair, pairIndex) => ({
                      ...pair,
                      position: pairIndex,
                    })),
                  }
                : undefined,
            })),
          },
        })),
      },
    },
    include: {
      sections: {
        include: { questions: { include: { choiceOptions: true, matchingPairs: true } } },
      },
    },
  });

  await logAdminAction(session.user.id, examId ? "exam.updated" : "exam.created", "Exam", exam.id, {
    title: exam.title,
    version: exam.version,
    snapshot: buildExamSnapshot(exam),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/exams");
  revalidatePath(`/admin/exams/${exam.id}`);

  return { success: true, message: examId ? "Exam updated." : "Exam created." };
}

export async function generateExamCodeAction(examId: string) {
  const session = await requireRole(Role.ADMIN);
  const code = await db.examAccessCode.create({
    data: {
      examId,
      code: randomCode("CHEM"),
      generatedById: session.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await logAdminAction(session.user.id, "exam.code.generated", "ExamAccessCode", code.id, { examId, code: code.code });

  revalidatePath(`/admin/exams/${examId}`);
}

export async function saveLearningSummaryAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole(Role.ADMIN);
  const parsed = learningSummarySchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    videoUrl: formData.get("videoUrl"),
    examId: formData.get("examId") || undefined,
  });

  if (!parsed.success) {
    return { success: false, message: "Learning summary is incomplete." };
  }

  const summary = await db.learningSummary.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      videoUrl: parsed.data.videoUrl || undefined,
      examId: parsed.data.examId || undefined,
    },
  });

  await logAdminAction(session.user.id, "summary.created", "LearningSummary", summary.id);
  revalidatePath("/admin/learning");
  revalidatePath("/participant/learning");
  return { success: true, message: "Summary published." };
}

export async function reviewShortAnswerAction(answerId: string, score: number, feedback: string) {
  const session = await requireRole(Role.ADMIN);
  const answer = await db.submissionAnswer.findUnique({
    where: { id: answerId },
    include: { submission: true },
  });

  if (!answer) return;

  await db.submissionAnswer.update({
    where: { id: answerId },
    data: {
      finalScore: score,
      feedback,
      requiresManualReview: false,
      reviewedAt: new Date(),
      reviewedById: session.user.id,
    },
  });

  const answers = await db.submissionAnswer.findMany({ where: { submissionId: answer.submissionId } });
  const totalScore = answers.reduce((sum, item) => sum + item.finalScore, 0);
  const maxScore = answers.reduce((sum, item) => sum + item.maxScore, 0);
  const needsReview = answers.some((item) => item.requiresManualReview);

  await db.submission.update({
    where: { id: answer.submissionId },
    data: {
      score: totalScore,
      maxScore,
      percentage: maxScore ? Math.round((totalScore / maxScore) * 100) : 0,
      status: needsReview ? "NEEDS_REVIEW" : "GRADED",
      gradedAt: new Date(),
    },
  });

  revalidatePath("/admin/participants");
}
