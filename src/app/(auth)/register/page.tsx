import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { RegisterForm } from "@/components/auth/register-form";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { authOptions } from "@/lib/auth/auth-options";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session?.user.role === "ADMIN") redirect("/admin");
  if (session?.user.role === "PARTICIPANT") redirect("/participant");

  return (
    <MarketingShell>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <RegisterForm />
        <div className="space-y-4">
          <div className="hero-glass chem-accent-ring rounded-[2rem] p-6">
            <p className="font-display text-2xl text-slate-900">What happens after registration?</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
              <p>Your participant profile is created automatically.</p>
              <p>You can open your dashboard, enter exam codes, and keep your own submissions.</p>
              <p>Your account also gets a personal help-chat conversation with the admin team.</p>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_25px_65px_rgba(15,23,42,0.08)]">
            <p className="font-display text-2xl text-slate-900">How to register</p>
            <div className="mt-4 aspect-video overflow-hidden rounded-3xl bg-slate-900">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/aqz-KE-bpKQ?rel=0"
                title="Registration tutorial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Fill in your details, confirm your password, and your participant account will be created instantly.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_25px_65px_rgba(15,23,42,0.08)]">
            <p className="font-medium text-slate-900">Already have an account?</p>
            <Link href="/login" className="mt-3 inline-flex text-sm font-semibold text-[var(--brand)]">
              Go to login
            </Link>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
