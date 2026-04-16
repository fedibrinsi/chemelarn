"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { FlaskConical, GraduationCap, LayoutDashboard, LogOut, MessageSquare, ScrollText, Settings, Users } from "lucide-react";
import { ChemistryBackdrop } from "@/components/layout/chemistry-backdrop";
import { cn } from "@/lib/utils";

const icons = {
  dashboard: LayoutDashboard,
  exams: FlaskConical,
  participants: Users,
  learning: GraduationCap,
  chat: MessageSquare,
  settings: Settings,
  results: ScrollText,
};

type NavItem = {
  href: string;
  label: string;
  icon: keyof typeof icons;
};

export function DashboardShell({
  title,
  subtitle,
  nav,
  children,
}: {
  title: string;
  subtitle: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="shell relative grid min-h-screen overflow-hidden lg:grid-cols-[280px_1fr]">
      <ChemistryBackdrop />
      <aside className="panel-frost relative z-10 border-b border-white/70 p-6 lg:border-b-0 lg:border-r">
        <div className="hero-glass chem-accent-ring rounded-[1.75rem] p-5">
          <p className="font-display text-2xl text-slate-900">{title}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{subtitle}</p>
        </div>
        <nav className="mt-8 space-y-2">
          {nav.map((item) => {
            const Icon = icons[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "chem-accent-ring hero-glass flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:translate-x-1 hover:text-[var(--brand)]",
                )}
              >
                <Icon className="h-4 w-4 text-[var(--brand)]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="hero-glass chem-accent-ring mt-8 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-slate-700"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </aside>
      <main className="relative z-10 p-6 lg:p-8">{children}</main>
    </div>
  );
}
