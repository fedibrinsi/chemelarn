import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

export async function getCurrentSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireRole(role: Role) {
  const session = await requireSession();
  if (!session.user.role) {
    redirect("/login");
  }
  if (session.user.role !== role) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/participant");
  }
  if (session.user.role === "PARTICIPANT" && !session.user.participantProfileId) {
    const profile = await db.participantProfile.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id, gradeLevel: "Not specified" },
    });
    session.user.participantProfileId = profile.id;
  }
  return session;
}
