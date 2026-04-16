"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ParticipantLanguageProvider, useParticipantLanguage } from "@/components/participant/participant-language";
import { ParticipantLanguageSwitcher } from "@/components/participant/language-switcher";

export function ParticipantShell({ children }: { children: React.ReactNode }) {
  return (
    <ParticipantLanguageProvider>
      <ParticipantShellInner>{children}</ParticipantShellInner>
    </ParticipantLanguageProvider>
  );
}

function ParticipantShellInner({ children }: { children: React.ReactNode }) {
  const { dictionary, dir } = useParticipantLanguage();

  const nav = [
    { href: "/participant", label: dictionary.navDashboard, icon: "dashboard" as const },
    { href: "/participant/tutorial", label: dictionary.navTutorial, icon: "learning" as const },
    { href: "/participant/enter-code", label: dictionary.navEnterCode, icon: "exams" as const },
    { href: "/participant/learning", label: dictionary.navLearning, icon: "results" as const },
    { href: "/participant/chat", label: dictionary.navChat, icon: "chat" as const },
  ];

  return (
    <DashboardShell
      title={dictionary.shellTitle}
      subtitle={dictionary.shellSubtitle}
      nav={nav}
      signOutLabel={dictionary.signOut}
      topSlot={<ParticipantLanguageSwitcher />}
      dir={dir}
    >
      {children}
    </DashboardShell>
  );
}
