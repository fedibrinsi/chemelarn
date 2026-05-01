"use server";

import { Prisma, Role, SessionStatus, SubmissionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { buildExamSnapshot, gradeSubmission, type DraftAnswers } from "@/lib/exam";
import { minutesFromNow } from "@/lib/utils";
import { redeemCodeSchema } from "@/lib/validations";
import { CONCOURS2_ACCESS_CODE } from "@/lib/constants";

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

const concoursTwoQuestions: ConcoursQuestion[] = [
  { prompt: "Question flash: Les microplastiques peuvent venir:", points: 1, answerKey: "B" },
  { prompt: "Q1. Les microplastiques sont:", points: 2, answerKey: "A" },
  { prompt: "Q2. Les microplastiques peuvent provenir:", points: 2, answerKey: "A" },
  { prompt: "Q3. Un megot jete dans l'environnement:", points: 2, answerKey: "A" },
  { prompt: "Q4. Selon l'OMS, l'exposition humaine aux microplastiques peut se faire notamment par:", points: 2, answerKey: "A" },
  { prompt: "Q5. Les dangers potentiels associes aux microplastiques peuvent concerner:", points: 2, answerKey: "A" },
  { prompt: "Q6. Dire \"on connait deja tous les effets sanitaires avec certitude\" est:", points: 2, answerKey: "A" },
  { prompt: "Q7. Les plastiques se recyclent tous ensemble sans difficulte:", points: 2, answerKey: "B" },
  { prompt: "Q8. Un megot peut polluer:", points: 2, answerKey: "A" },
  { prompt: "Q9. Les megots representent dans le support fourni:", points: 2, answerKey: "A" },
  { prompt: "Q10. Parmi ces sources, laquelle est reconnue comme importante pour les microplastiques ?", points: 2, answerKey: "A" },
  { prompt: "Q11. Les textiles synthetiques peuvent contribuer aux microplastiques:", points: 2, answerKey: "A" },
  { prompt: "Q12. La meilleure strategie generale face aux microplastiques est:", points: 2, answerKey: "A" },
  { prompt: "Q13. Boire dans une gourde durable et eviter les plastiques jetables quand c'est possible:", points: 2, answerKey: "A" },
  { prompt: "Q14. Un lycee qui veut limiter la dispersion de microplastiques devrait:", points: 2, answerKey: "A" },
  { prompt: "Q15. Les microplastiques sont retrouves:", points: 2, answerKey: "A" },
  { prompt: "Q16. La phrase la plus juste aujourd'hui est:", points: 2, answerKey: "A" },
  { prompt: "Q17. Une politique efficace contre les microplastiques agit:", points: 2, answerKey: "A" },
  { prompt: "Q18. Le meilleur message final pour ce concours est:", points: 2, answerKey: "A" },
  { prompt: "Q19. Les microplastiques secondaires proviennent surtout:", points: 2, answerKey: "A" },
  { prompt: "Q20. Les microplastiques primaires sont:", points: 2, answerKey: "A" },
  { prompt: "Q21. Une source importante de microplastiques dans l'environnement est:", points: 2, answerKey: "A" },
  { prompt: "Q22. Les textiles synthetiques peuvent liberer:", points: 2, answerKey: "A" },
  { prompt: "Q23. Les microplastiques peuvent etre presents:", points: 2, answerKey: "A" },
  { prompt: "Q24. Le risque lie aux microplastiques est etudie car ils peuvent:", points: 2, answerKey: "A" },
  { prompt: "Q25. Selon l'OMS, parler des effets sanitaires des microplastiques demande:", points: 2, answerKey: "A" },
  { prompt: "Q26. Une bonne strategie de prevention est:", points: 2, answerKey: "A" },
  { prompt: "Q27. Les megots sont problematiques car ils:", points: 2, answerKey: "A" },
  { prompt: "Q28. Dire \"un dechet plastique abandonne est sans consequence s'il est petit\" est:", points: 2, answerKey: "A" },
  { prompt: "Q29. Les systemes de traitement de l'eau peuvent:", points: 2, answerKey: "A" },
  { prompt: "Q30. Le lien entre microplastiques et sante humaine est etudie notamment via:", points: 2, answerKey: "A" },
  { prompt: "Q31. Un lycee qui veut reduire son impact plastique devrait d'abord:", points: 2, answerKey: "A" },
  { prompt: "Q32. Le recyclage du plastique est utile mais:", points: 2, answerKey: "A" },
  { prompt: "Q33. La taille tres petite des microplastiques pose probleme car:", points: 2, answerKey: "A" },
  { prompt: "Q34. Le message \"Invisible ne veut pas dire inoffensif\" s'applique ici car:", points: 2, answerKey: "A" },
  { prompt: "Q35. Une bonne action de sensibilisation au lycee serait:", points: 2, answerKey: "A" },
  { prompt: "Q36. Le cycle de vie du plastique comprend:", points: 2, answerKey: "A" },
  { prompt: "Q37. Un exemple d'action individuelle realiste est:", points: 2, answerKey: "A" },
  { prompt: "Q38. Le principal enjeu scientifique aujourd'hui n'est pas seulement de detecter les microplastiques, mais aussi:", points: 2, answerKey: "A" },
  { prompt: "Q39. Une politique efficace contre les microplastiques combine:", points: 2, answerKey: "A" },
  { prompt: "Q40. La meilleure conclusion pour ce concours est:", points: 2, answerKey: "A" },
  { prompt: "Q41. Un lycee veut reduire l'exposition potentielle aux microplastiques. Quelle action est la plus pertinente en priorite ?", points: 2, answerKey: "B" },
  { prompt: "Q42. Pourquoi une strategie \"nettoyer seulement en fin de chaine\" est-elle insuffisante ?", points: 2, answerKey: "A" },
  { prompt: "Q43. Quel scenario reflete le mieux une logique de prevention ?", points: 2, answerKey: "A" },
  { prompt: "Q44. Dans une analyse de sante publique, pourquoi faut-il distinguer danger et exposition ?", points: 2, answerKey: "A" },
  { prompt: "Q45. Pourquoi l'usure des pneus est-elle un enjeu important dans le debat sur les microplastiques ?", points: 2, answerKey: "A" },
  { prompt: "Q46. Un etablissement veut acheter des uniformes. Quel critere est le plus coherent avec une approche \"microplastiques + sante + durabilite\" ?", points: 2, answerKey: "B" },
  { prompt: "Q47. Quelle affirmation montre la meilleure comprehension scientifique actuelle ?", points: 2, answerKey: "B" },
  { prompt: "Q48. Quel exemple illustre le mieux une \"source secondaire\" de microplastiques ?", points: 2, answerKey: "A" },
  { prompt: "Q49. Pourquoi les microplastiques posent-ils un defi methodologique pour la recherche ?", points: 2, answerKey: "A" },
  { prompt: "Q50. Une politique centree uniquement sur le recyclage a quelle limite principale ?", points: 2, answerKey: "A" },
  { prompt: "Q51. Quel raisonnement est le plus solide ?", points: 2, answerKey: "B" },
  { prompt: "Q52. Dans quel cas parle-t-on le plus d'une approche \"cycle de vie\" du plastique ?", points: 2, answerKey: "A" },
  { prompt: "Q53. Pourquoi les microfibres textiles interessent-elles particulierement les chercheurs ?", points: 2, answerKey: "A" },
  { prompt: "Q54. Une ville remplace les bouteilles jetables dans les batiments publics par des fontaines et contenants reutilisables. Quel effet est le plus plausible ?", points: 2, answerKey: "A" },
  { prompt: "Q55. Quelle proposition montre le meilleur esprit critique ?", points: 2, answerKey: "A" },
  { prompt: "Q56. Pourquoi l'abandon de dechets plastiques dans l'espace public reste-t-il un probleme meme quand le dechet parait \"petit\" ?", points: 2, answerKey: "A" },
  { prompt: "Q57. Une campagne scolaire veut etre scientifiquement honnete. Quelle formule est la meilleure ?", points: 2, answerKey: "A" },
  { prompt: "Q58. Quel ensemble d'indicateurs serait le plus utile pour suivre un plan \"plastique et sante\" dans un lycee ?", points: 2, answerKey: "A" },
  { prompt: "Q59. Quelle action a le plus de chances de produire un effet durable ?", points: 2, answerKey: "B" },
  { prompt: "Q60. La conclusion la plus rigoureuse pour ce concours est:", points: 2, answerKey: "A" },
  { prompt: "Defi visuel 1: Source primaire ou source secondaire", points: 20 },
  { prompt: "Defi visuel 2: Chaine d'exposition", points: 20 },
] as const;

function applyConcoursAnswerKeys(snapshot: Parameters<typeof gradeSubmission>[0]) {
  const answerKeys = concoursTwoQuestions.map((question) => question.answerKey ?? null);
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

async function ensureConcoursTwoAccessCode(currentUserId: string) {
  const existingCode = await db.examAccessCode.findUnique({
    where: { code: CONCOURS2_ACCESS_CODE },
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

    for (const [index, question] of concoursTwoQuestions.entries()) {
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
      where: { code: CONCOURS2_ACCESS_CODE },
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
      title: "Concours 2 - Microplastiques et impact sur la sante",
      description: "Parcours microplastiques, sources, sante et prevention.",
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
              create: concoursTwoQuestions.map((question, index) => ({
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
      code: CONCOURS2_ACCESS_CODE,
      generatedById: currentUserId,
      isActive: true,
    },
  });

  return db.examAccessCode.findUnique({
    where: { code: CONCOURS2_ACCESS_CODE },
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

  if (normalizedCode === CONCOURS2_ACCESS_CODE) {
    accessCode = await ensureConcoursTwoAccessCode(session.user.id);
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
  const isConcours = accessCode.code === CONCOURS2_ACCESS_CODE;
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
    examSession.accessCode.code === CONCOURS2_ACCESS_CODE
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
