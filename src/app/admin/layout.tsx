import { Role } from "@prisma/client";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

const nav = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" as const },
  { href: "/admin/exams", label: "Exams", icon: "exams" as const },
  { href: "/admin/participants", label: "Participants", icon: "participants" as const },
  { href: "/admin/learning", label: "Learning", icon: "learning" as const },
  { href: "/admin/chat", label: "Chat", icon: "chat" as const },
  { href: "/admin/settings", label: "Settings", icon: "settings" as const },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(Role.ADMIN);

  return (
    <DashboardShell title="Admin Control Lab" subtitle="Create exams, manage participants, and respond to support chats." nav={nav}>
      {children}
    </DashboardShell>
  );
}
