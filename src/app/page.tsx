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
      <section className="studio-hero grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="studio-intro chem-accent-ring rounded-[2.2rem] border border-white/75 p-7 md:p-10">
          <span className="studio-chip inline-flex items-center rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em]">
            Periodic Chemistry Studio
          </span>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] text-slate-900 md:text-7xl">
            A bold chemistry design for high-school learners.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
            This version feels like a science magazine mixed with an interactive lab wall, with
            larger visual demos and clear chemistry guidance for students.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/login">Open Teacher Lab</ButtonLink>
            <ButtonLink href="/register" variant="secondary">
              Enter Student Zone
            </ButtonLink>
          </div>
        </div>

        <aside className="periodic-stack grid gap-4">
          <div className="periodic-tile tile-primary">
            <p className="tile-index">08</p>
            <p className="tile-symbol">O</p>
            <p className="tile-label">oxygen clues</p>
          </div>
          <div className="periodic-tile tile-secondary">
            <p className="tile-index">11</p>
            <p className="tile-symbol">Na</p>
            <p className="tile-label">electron transfer</p>
          </div>
          <div className="periodic-tile tile-tertiary">
            <p className="tile-index">17</p>
            <p className="tile-symbol">Cl</p>
            <p className="tile-label">bond formation</p>
          </div>
        </aside>
      </section>
    </MarketingShell>
  );
}
