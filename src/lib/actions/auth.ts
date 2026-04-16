"use server";

import bcrypt from "bcryptjs";
import { Prisma, Role, SenderRole } from "@prisma/client";
import { participantRegistrationSchema } from "@/lib/validations";
import { db } from "@/lib/db";

export type RegistrationState = {
  success: boolean;
  message: string;
  email?: string;
  password?: string;
};

export async function registerParticipantAction(
  _: RegistrationState,
  formData: FormData,
): Promise<RegistrationState> {
  const parsed = participantRegistrationSchema.safeParse({
    name: formData.get("name"),
    email: String(formData.get("email") ?? "").toLowerCase(),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    gradeLevel: formData.get("gradeLevel"),
    schoolName: formData.get("schoolName") || undefined,
    studentNumber: formData.get("studentNumber") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Please check the registration form.",
    };
  }

  const { name, email, password, gradeLevel, schoolName, studentNumber } = parsed.data;

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: Role.PARTICIPANT,
          participantProfile: {
            create: {
              gradeLevel,
              schoolName: schoolName || undefined,
              studentNumber: studentNumber || undefined,
            },
          },
        },
        include: { participantProfile: true },
      });

      if (!user.participantProfile) {
        throw new Error("Participant profile creation failed.");
      }

      await tx.chatConversation.create({
        data: {
          participantId: user.participantProfile.id,
          messages: {
            create: {
              senderId: user.id,
              senderRole: SenderRole.PARTICIPANT,
              body: "Hello! I just created my account and joined the platform.",
            },
          },
        },
      });
    });

    return {
      success: true,
      message: "Your participant account is ready.",
      email,
      password,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "That email or student number is already in use.",
      };
    }

    return {
      success: false,
      message: "Registration failed. Please try again.",
    };
  }
}
