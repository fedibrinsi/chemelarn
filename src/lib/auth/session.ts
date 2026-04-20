import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

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
  return session;
}
