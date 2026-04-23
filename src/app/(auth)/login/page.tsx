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
      <div className="grid gap-10">
        <LoginForm />
      </div>
    </MarketingShell>
  );
}
