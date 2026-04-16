import { QuestionType, type Prisma } from "@prisma/client";
import { toPercent } from "@/lib/utils";

type QuestionSnapshot = {
  id: string;
  type: QuestionType;
  prompt: string;
  explanation?: string | null;
  placeholder?: string | null;
  points: number;
  isCaseSensitive: boolean;
  answerKey?: unknown;
  options?: Array<{ id?: string; label: string; value: string; isCorrect?: boolean }>;
  matchingPairs?: Array<{ leftLabel: string; rightLabel: string; correctMatch: string }>;
  config?: {
    experimentTitle?: string;
    vesselLabel?: string;
    resultLabel?: string;
    components?: Array<{ label: string; value: string; color: string; effect: string }>;
  } | null;
};

type SectionSnapshot = {
  id: string;
  title: string;
  questions: QuestionSnapshot[];
};

export type ExamSnapshot = {
  id: string;
  title: string;
  description?: string | null;
  instructions?: string | null;
  durationMinutes: number;
  allowResultReview: boolean;
  sections: SectionSnapshot[];
};

export type DraftAnswers = Record<string, unknown>;

type GradedAnswer = {
  questionId: string;
  response: Prisma.JsonValue;
  autoScore: number;
  finalScore: number;
  maxScore: number;
  isCorrect: boolean | null;
  feedback?: string;
  requiresManualReview: boolean;
};

export function buildExamSnapshot(exam: {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  durationMinutes: number;
  allowResultReview: boolean;
  sections: Array<{
    id: string;
    title: string;
    questions: Array<{
      id: string;
      type: QuestionType;
      prompt: string;
      explanation: string | null;
      placeholder: string | null;
      points: number;
      isCaseSensitive: boolean;
      config: Prisma.JsonValue | null;
      answerKey: Prisma.JsonValue | null;
      choiceOptions: Array<{ id: string; label: string; value: string; isCorrect: boolean }>;
      matchingPairs: Array<{ leftLabel: string; rightLabel: string; correctMatch: string }>;
    }>;
  }>;
}): ExamSnapshot {
  return {
    id: exam.id,
    title: exam.title,
    description: exam.description,
    instructions: exam.instructions,
    durationMinutes: exam.durationMinutes,
    allowResultReview: exam.allowResultReview,
    sections: exam.sections.map((section) => ({
      id: section.id,
      title: section.title,
      questions: section.questions.map((question) => ({
        id: question.id,
        type: question.type,
        prompt: question.prompt,
        explanation: question.explanation,
        placeholder: question.placeholder,
        points: question.points,
        isCaseSensitive: question.isCaseSensitive,
        config: (question.config as QuestionSnapshot["config"]) ?? undefined,
        answerKey: question.answerKey ?? undefined,
        options: question.choiceOptions,
        matchingPairs: question.matchingPairs,
      })),
    })),
  };
}

function normalizeString(value: unknown, caseSensitive: boolean) {
  const raw = String(value ?? "").trim();
  return caseSensitive ? raw : raw.toLowerCase();
}

function arrayEquals(a: unknown[], b: unknown[]) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function arraySetEquals(a: unknown[], b: unknown[]) {
  return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
}

function normalizeFillBlankResponse(response: Prisma.JsonValue) {
  if (Array.isArray(response)) return response;
  if (response === null || response === undefined) return [];
  return [response];
}

export function gradeSubmission(snapshot: ExamSnapshot, draftAnswers: DraftAnswers) {
  const gradedAnswers: GradedAnswer[] = [];
  const sectionBreakdown: Array<{ sectionId: string; title: string; score: number; maxScore: number }> = [];

  for (const section of snapshot.sections) {
    let sectionScore = 0;
    let sectionMax = 0;

    for (const question of section.questions) {
      const response = (draftAnswers[question.id] ?? null) as Prisma.JsonValue;
      const maxScore = question.points;
      sectionMax += maxScore;

      let autoScore = 0;
      let isCorrect: boolean | null = false;
      let requiresManualReview = false;
      let feedback = "";

      switch (question.type) {
        case "MULTIPLE_CHOICE": {
          const expected = (question.options ?? []).filter((option) => option.isCorrect).map((option) => option.value);
          const actual = Array.isArray(response) ? response : [response].filter(Boolean);
          isCorrect = arraySetEquals(actual, expected);
          autoScore = isCorrect ? maxScore : 0;
          feedback = isCorrect ? "Correct choice." : "Review the selected option(s).";
          break;
        }
        case "TRUE_FALSE": {
          const expected = Boolean(question.answerKey);
          isCorrect = Boolean(response) === expected;
          autoScore = isCorrect ? maxScore : 0;
          feedback = isCorrect ? "Correct." : "The true/false answer is different.";
          break;
        }
        case "FILL_BLANK": {
          const validAnswers = Array.isArray(question.answerKey) ? question.answerKey : [question.answerKey];
          const actual = normalizeFillBlankResponse(response);
          isCorrect =
            actual.length === validAnswers.length &&
            validAnswers.every(
              (answer, index) =>
                normalizeString(answer, question.isCaseSensitive) ===
                normalizeString(actual[index], question.isCaseSensitive),
            );
          autoScore = isCorrect ? maxScore : 0;
          feedback = isCorrect ? "Exact answer matched." : "The missing term needs revision.";
          break;
        }
        case "ORDERING": {
          const expected = Array.isArray(question.answerKey) ? question.answerKey : [];
          const actual = Array.isArray(response) ? response : [];
          isCorrect = arrayEquals(actual, expected);
          autoScore = isCorrect ? maxScore : 0;
          feedback = isCorrect ? "Sequence is correct." : "The order is not fully correct.";
          break;
        }
        case "MATCHING": {
          const expected = Array.isArray(question.answerKey) ? question.answerKey : [];
          const actual = Array.isArray(response) ? response : [];
          isCorrect = arrayEquals(actual, expected);
          autoScore = isCorrect ? maxScore : 0;
          feedback = isCorrect ? "Matching is correct." : "Some matches need review.";
          break;
        }
        case "SHORT_ANSWER": {
          requiresManualReview = true;
          isCorrect = null;
          autoScore = 0;
          feedback = "Awaiting teacher review.";
          break;
        }
        case "LAB_SIMULATION": {
          const expected = Array.isArray(question.answerKey) ? question.answerKey.map(String) : [];
          const actual = Array.isArray(response) ? response.map(String) : [];
          isCorrect = arrayEquals(actual, expected);
          autoScore = isCorrect ? maxScore : 0;
          feedback = isCorrect ? "Lab mixture is correct." : "The selected mixing sequence is not correct yet.";
          break;
        }
        default:
          break;
      }

      sectionScore += autoScore;
      gradedAnswers.push({
        questionId: question.id,
        response,
        autoScore,
        finalScore: autoScore,
        maxScore,
        isCorrect,
        feedback,
        requiresManualReview,
      });
    }

    sectionBreakdown.push({
      sectionId: section.id,
      title: section.title,
      score: sectionScore,
      maxScore: sectionMax,
    });
  }

  const totalScore = gradedAnswers.reduce((sum, answer) => sum + answer.autoScore, 0);
  const maxScore = gradedAnswers.reduce((sum, answer) => sum + answer.maxScore, 0);
  const needsReview = gradedAnswers.some((answer) => answer.requiresManualReview);

  return {
    gradedAnswers,
    totalScore,
    maxScore,
    percentage: toPercent(totalScore, maxScore),
    sectionBreakdown,
    status: needsReview ? "NEEDS_REVIEW" : "GRADED",
  };
}
