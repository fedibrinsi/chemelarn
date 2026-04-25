"use server";

import { Prisma, Role, SessionStatus, SubmissionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { buildExamSnapshot, gradeSubmission, type DraftAnswers } from "@/lib/exam";
import { minutesFromNow } from "@/lib/utils";
import { redeemCodeSchema } from "@/lib/validations";
import { CONCOURS3_ACCESS_CODE } from "@/lib/constants";

type ActionState = { success: boolean; message: string; redirectTo?: string };
export type SubmitSessionResult = {
  status: "submitted" | "expired" | "already-finalized";
};

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value));
}

type ConcoursQuestion = {
  prompt: string;
  points: number;
  answerKey?: string;
};

const concoursThreeQuestions: ConcoursQuestion[] = [
  { prompt: "Question flash: L'idee principale de l'animation", points: 1, answerKey: "B" },
  { prompt: "Q1. Les ODD doivent etre compris comme:", points: 3, answerKey: "B" },
  { prompt: "Q2. Les ODD couvrent principalement:", points: 3, answerKey: "B" },
  { prompt: "Q3. Quel exemple montre le mieux l'interconnexion des ODD ?", points: 3, answerKey: "A" },
  { prompt: "Q4. Une ville durable repose surtout sur:", points: 3, answerKey: "B" },
  { prompt: "Q5. Le comportement le plus coherent avec l'ODD 12 (consommation responsable) est:", points: 3, answerKey: "B" },
  { prompt: "Q6. L'expression personne ne gagne seul met surtout en avant:", points: 3, answerKey: "A" },
  { prompt: "Q7. Quel projet de lycee correspond le mieux a une approche ODD ?", points: 3, answerKey: "B" },
  { prompt: "Q8. L'epuisement des ressources naturelles concerne:", points: 3, answerKey: "B" },
  { prompt: "Q9. Quel binome d'ODD est le plus directement mobilise par le tri, la reduction des dechets et la baisse des emissions ?", points: 3, answerKey: "A" },
  { prompt: "Q10. Dans une pedagogie ODD efficace, l'eleve doit etre:", points: 3, answerKey: "B" },
  { prompt: "Q11. Former autrement aujourd'hui pour permettre aux eleves d'agir demain signifie surtout:", points: 3, answerKey: "A" },
  { prompt: "Q12. Quelle proposition est la plus systemique ?", points: 3, answerKey: "B" },
  { prompt: "Q13. Une approche holistique des ODD signifie:", points: 4, answerKey: "A" },
  { prompt: "Q14. Quel projet evite le mieux le greenwashing ?", points: 4, answerKey: "B" },
  { prompt: "Q15. Pour un projet ODD dans un lycee, le partenariat le plus coherent est:", points: 4, answerKey: "A" },
  { prompt: "Q16. Quand un etablissement ameliore l'acces a l'eau potable, cela peut aussi ameliorer:", points: 4, answerKey: "A" },
  { prompt: "Q17. Quel ensemble d'indicateurs permet le mieux de suivre un projet ODD au lycee ?", points: 4, answerKey: "A" },
  { prompt: "Q18. Une action ecologique devient plus juste socialement quand:", points: 4, answerKey: "A" },
  { prompt: "Defi visuel 1: Carte des interconnexions", points: 20 },
  { prompt: "Defi visuel 2: Diagnostic", points: 20, answerKey: "B" },
] as const;

function applyConcoursAnswerKeys(snapshot: Parameters<typeof gradeSubmission>[0]) {
  const answerKeys = concoursThreeQuestions.map((question) => question.answerKey ?? null);
  let index = 0;
  return {
    ...snapshot,
    sections: snapshot.sections.map((section) => ({
      ...section,
      questions: section.questions.map((question) => {
        const answerKey = answerKeys[index];
        index += 1;
        if (answerKey === null || answerKey === undefined) {
          return question;
        }
        return { ...question, answerKey };
      }),
    })),
  };
}

async function ensureConcoursThreeAccessCode(currentUserId: string) {
  const existingCode = await db.examAccessCode.findUnique({
    where: { code: CONCOURS3_ACCESS_CODE },
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

  if (existingCode) {
    const concoursSection =
      existingCode.exam.sections.find((section) => section.title.toLowerCase() === "concours") ??
      existingCode.exam.sections[0] ??
      (await db.examSection.create({
        data: {
          examId: existingCode.exam.id,
          title: "Concours",
          description: "Questions et defis",
          position: 0,
        },
        include: {
          questions: {
            orderBy: { position: "asc" },
            include: { choiceOptions: true, matchingPairs: true },
          },
        },
      }));

    if (concoursSection.title !== "Concours") {
      await db.examSection.update({
        where: { id: concoursSection.id },
        data: { title: "Concours", description: "Questions et defis", position: 0 },
      });
    }

    for (const [index, question] of concoursThreeQuestions.entries()) {
      const existingQuestion = concoursSection.questions[index];
      if (existingQuestion) {
        await db.question.update({
          where: { id: existingQuestion.id },
          data: {
            type: "SHORT_ANSWER",
            prompt: question.prompt,
            points: question.points,
            position: index,
            answerKey: question.answerKey ?? Prisma.JsonNull,
            config: Prisma.JsonNull,
          },
        });
      } else {
        await db.question.create({
          data: {
            sectionId: concoursSection.id,
            type: "SHORT_ANSWER",
            prompt: question.prompt,
            points: question.points,
            position: index,
            answerKey: question.answerKey ?? Prisma.JsonNull,
            config: Prisma.JsonNull,
          },
        });
      }
    }

    return db.examAccessCode.findUnique({
      where: { code: CONCOURS3_ACCESS_CODE },
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
  }

  const exam = await db.exam.create({
    data: {
      title: "Concours 3 - ODD",
      description: "Parcours ODD avec analyse systemique et defis visuels.",
      status: "PUBLISHED",
      durationMinutes: 120,
      availableFrom: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      allowResultReview: false,
      allowPastSubmissions: false,
      instructions: "Repondez a toutes les questions puis soumettez pour evaluation.",
      createdById: currentUserId,
      sections: {
        create: [
          {
            title: "Concours",
            description: "Questions et defis",
            position: 0,
            questions: {
              create: concoursThreeQuestions.map((question, index) => ({
                type: "SHORT_ANSWER" as const,
                prompt: question.prompt,
                points: question.points,
                position: index,
                answerKey: question.answerKey ?? Prisma.JsonNull,
                config: Prisma.JsonNull,
              })),
            },
          },
        ],
      },
    },
  });

  await db.examAccessCode.create({
    data: {
      examId: exam.id,
      code: CONCOURS3_ACCESS_CODE,
      generatedById: currentUserId,
      isActive: true,
    },
  });

  return db.examAccessCode.findUnique({
    where: { code: CONCOURS3_ACCESS_CODE },
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

  const normalizedCode = parsed.data.code.toUpperCase();

  let accessCode = await db.examAccessCode.findUnique({
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

  if (normalizedCode === CONCOURS3_ACCESS_CODE) {
    accessCode = await ensureConcoursThreeAccessCode(session.user.id);
  }

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

  const now = new Date();
  const isConcours = accessCode.code === CONCOURS3_ACCESS_CODE;
  const shouldHoldConcours = isConcours && (!accessCode.exam.availableFrom || accessCode.exam.availableFrom > now);

  const currentSession =
    existing ??
    (await db.examSession.create({
      data: {
        participantId,
        examId: accessCode.examId,
        accessCodeId: accessCode.id,
        status: SessionStatus.NOT_STARTED,
        expiresAt: shouldHoldConcours
          ? null
          : accessCode.exam.availableFrom && accessCode.exam.availableFrom <= now
            ? minutesFromNow(accessCode.exam.durationMinutes)
            : null,
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

export async function submitSessionAction(
  sessionId: string,
  answers: DraftAnswers,
  autoSubmitted = false,
  shouldRevalidate = true,
): Promise<SubmitSessionResult> {
  const session = await requireRole(Role.PARTICIPANT);
  const participantId = session.user.participantProfileId;

  if (!participantId) throw new Error("Participant profile missing");

  const examSession = await db.examSession.findFirst({
    where: { id: sessionId, participantId },
    include: { accessCode: true },
  });

  if (!examSession) throw new Error("Exam session not found");
  if (
    examSession.status === SessionStatus.SUBMITTED ||
    examSession.status === SessionStatus.EXPIRED
  ) {
    return { status: "already-finalized" };
  }

  const hasExpired = Boolean(examSession.expiresAt && examSession.expiresAt <= new Date());
  const shouldExpireSession = autoSubmitted || hasExpired;
  const finalAnswers =
    shouldExpireSession && !autoSubmitted
      ? (((examSession.draftAnswers as DraftAnswers | null) ?? {}) as DraftAnswers)
      : answers;

  const snapshot = examSession.examSnapshot as unknown as Parameters<typeof gradeSubmission>[0];
  const gradingSnapshot =
    examSession.accessCode.code === CONCOURS3_ACCESS_CODE
      ? applyConcoursAnswerKeys(snapshot)
      : snapshot;

  const grading = gradeSubmission(gradingSnapshot, finalAnswers);

  await db.$transaction(async (tx) => {
    await tx.examSession.update({
      where: { id: sessionId },
      data: {
        status: shouldExpireSession ? SessionStatus.EXPIRED : SessionStatus.SUBMITTED,
        submittedAt: new Date(),
        autoSubmittedAt: shouldExpireSession ? new Date() : undefined,
        draftAnswers: toJson(finalAnswers),
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
        answersSnapshot: toJson(finalAnswers),
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
        answersSnapshot: toJson(finalAnswers),
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

  if (shouldRevalidate) {
    revalidatePath("/participant");
    revalidatePath(`/participant/results/${sessionId}`);
    revalidatePath("/admin/participants");
  }

  return { status: shouldExpireSession ? "expired" : "submitted" };
}
