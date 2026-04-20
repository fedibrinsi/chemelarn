import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const participantRegistrationSchema = z
  .object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: z.string().min(8).max(64),
    confirmPassword: z.string().min(8).max(64),
    gradeLevel: z.string().min(2).max(40),
    schoolName: z.string().max(120).optional(),
    studentNumber: z.string().max(40).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const redeemCodeSchema = z.object({
  code: z.string().min(4).max(32),
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

const builderLabComponentSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  color: z.string().min(1),
  effect: z.string().min(1),
});

const builderLabConfigSchema = z.object({
  experimentTitle: z.string().min(1),
  vesselLabel: z.string().min(1),
  resultLabel: z.string().min(1),
  components: z.array(builderLabComponentSchema).min(2),
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
    "LAB_SIMULATION",
  ]),
  points: z.number().min(0.5).max(100),
  isCaseSensitive: z.boolean().optional(),
  answerKey: z.any().optional(),
  options: z.array(builderChoiceSchema).optional(),
  pairs: z.array(builderPairSchema).optional(),
  config: builderLabConfigSchema.optional(),
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
