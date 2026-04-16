import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { LoginForm } from "@/components/auth/login-form";
import { authOptions } from "@/lib/auth/auth-options";
import { MarketingShell } from "@/components/layout/marketing-shell";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user.role === "ADMIN") redirect("/admin");
  if (session?.user.role === "PARTICIPANT") redirect("/participant");

  return (
    <MarketingShell>
      <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <LoginForm />
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">
            Demo accounts from seed data
          </p>
          <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_25px_65px_rgba(15,23,42,0.08)]">
            <p className="font-display text-2xl text-slate-900">Quick start</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>`admin@chemlearn.test` / `Admin123!`</p>
              <p>`student1@chemlearn.test` / `Student123!`</p>
              <p>`student2@chemlearn.test` / `Student123!`</p>
            </div>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
