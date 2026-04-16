import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const redeemCodeSchema = z.object({
  code: z.string().min(4).max(32),
});

export const learningSummarySchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  videoUrl: z.union([z.string().url(), z.literal("")]).optional(),
  examId: z.string().optional(),
});

export const chatMessageSchema = z.object({
  conversationId: z.string().min(1),
  body: z.string().min(1).max(1000),
});

const builderChoiceSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  isCorrect: z.boolean().optional(),
});

const builderPairSchema = z.object({
  leftLabel: z.string().min(1),
  rightLabel: z.string().min(1),
  correctMatch: z.string().min(1),
});

const questionBuilderSchema = z.object({
  prompt: z.string().min(5),
  explanation: z.string().optional(),
  placeholder: z.string().optional(),
  type: z.enum([
    "MULTIPLE_CHOICE",
    "FILL_BLANK",
    "TRUE_FALSE",
    "SHORT_ANSWER",
    "MATCHING",
    "ORDERING",
  ]),
  points: z.number().min(0.5).max(100),
  isCaseSensitive: z.boolean().optional(),
  answerKey: z.any().optional(),
  options: z.array(builderChoiceSchema).optional(),
  pairs: z.array(builderPairSchema).optional(),
});

export const examBuilderSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  durationMinutes: z.number().min(5).max(300),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  availableFrom: z.string().optional(),
  availableUntil: z.string().optional(),
  allowResultReview: z.boolean(),
  allowPastSubmissions: z.boolean(),
  instructions: z.string().optional(),
  sections: z.array(
    z.object({
      title: z.string().min(2),
      description: z.string().optional(),
      questions: z.array(questionBuilderSchema).min(1),
    }),
  ),
});
