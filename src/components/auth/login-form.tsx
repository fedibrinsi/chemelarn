"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/validations";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    const values = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      toast.error("Please enter a valid email and password.");
      return;
    }

    setPending(true);
    const response = await signIn("credentials", {
      ...parsed.data,
      redirect: false,
    });
    setPending(false);

    if (response?.error) {
      toast.error("Login failed. Check your credentials.");
      return;
    }

    router.refresh();
    router.push("/");
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <div className="mb-6 space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">
          Secure school access
        </p>
        <h1 className="font-display text-3xl text-slate-900">Sign in to your lab session</h1>
        <p className="text-sm leading-7 text-[var(--muted)]">
          Admins manage exams and participants. Students enter with their account first, then join
          an exam using a code.
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <Input name="email" type="email" placeholder="student@chemlearn.test" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Password</label>
          <Input name="password" type="password" placeholder="••••••••" />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
        </Button>
      </form>
      <div className="mt-5 text-center text-sm text-slate-600">
        New participant?{" "}
        <Link href="/register" className="font-semibold text-[var(--brand)]">
          Create an account
        </Link>
      </div>
    </Card>
  );
}
