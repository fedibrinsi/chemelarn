import { APP_NAME } from "@/lib/constants";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="shell grid-dots">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="mb-14 flex items-center justify-between">
          <div>
            <p className="font-display text-2xl text-slate-900">{APP_NAME}</p>
            <p className="text-sm text-[var(--muted)]">Exam sessions, scoring, and student support</p>
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </div>
    </main>
  );
}
