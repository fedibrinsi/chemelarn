import { Role } from "@prisma/client";
import { ParticipantShell } from "@/components/participant/participant-shell";
import { requireRole } from "@/lib/auth/session";

export default async function ParticipantLayout({ children }: { children: React.ReactNode }) {
  await requireRole(Role.PARTICIPANT);

  return <ParticipantShell>{children}</ParticipantShell>;
}
