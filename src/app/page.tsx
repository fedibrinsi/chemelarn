import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { ButtonLink } from "@/components/shared/button-link";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user.role === "ADMIN") {
    redirect("/admin");
  }

  if (session?.user.role === "PARTICIPANT") {
    redirect("/participant");
  }

  return (
    <MarketingShell>
      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-sm font-medium text-[var(--muted)] shadow-sm backdrop-blur">
            Chemistry-inspired online exams for schools
          </span>
          <div className="space-y-4">
            <h1 className="font-display text-5xl leading-tight text-slate-900 md:text-6xl">
              A calm digital lab where exams, feedback, and learning stay in one place.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              ChemLearn helps admins publish structured exams while participants join with secure
              access codes, work in their own sessions, and receive fast scoring with clear
              feedback.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/login">Start with Login</ButtonLink>
            <ButtonLink href="/login" variant="secondary">
              Explore the platform
            </ButtonLink>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="absolute inset-x-6 top-6 h-24 rounded-full bg-[radial-gradient(circle,_rgba(96,165,250,0.18),_transparent_70%)]" />
          <div className="relative grid gap-4">
            {[
              "Adaptive exam sessions with timer and autosave",
              "Admin insights for submissions, averages, and live activity",
              "Participant help chat and learning summaries after each exam",
            ].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-[var(--line)] bg-[var(--panel-soft)] p-5 text-sm font-medium text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
