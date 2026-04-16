import { Role } from "@prisma/client";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

const nav = [
  { href: "/participant", label: "Dashboard", icon: "dashboard" as const },
  { href: "/participant/tutorial", label: "Tutorial", icon: "learning" as const },
  { href: "/participant/enter-code", label: "Enter Code", icon: "exams" as const },
  { href: "/participant/learning", label: "Learning", icon: "results" as const },
  { href: "/participant/chat", label: "Help Chat", icon: "chat" as const },
];

export default async function ParticipantLayout({ children }: { children: React.ReactNode }) {
  await requireRole(Role.PARTICIPANT);

  return (
    <DashboardShell title="Participant Learning Lab" subtitle="Join exams, learn from summaries, and ask for help when you need it." nav={nav}>
      {children}
    </DashboardShell>
  );
}
