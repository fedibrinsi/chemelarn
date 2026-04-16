"use client";

import { useActionState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { registerParticipantAction, type RegistrationState } from "@/lib/actions/auth";

const initialState: RegistrationState = {
  success: false,
  message: "",
};

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerParticipantAction, initialState);

  useEffect(() => {
    if (!state.message) return;

    if (!state.success) {
      toast.error(state.message);
      return;
    }

    toast.success(state.message);

    void (async () => {
      const response = await signIn("credentials", {
        email: state.email,
        password: state.password,
        redirect: false,
      });

      if (response?.error) {
        router.push("/login");
        return;
      }

      router.refresh();
      router.push("/participant");
    })();
  }, [router, state]);

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <div className="mb-6 space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">
          Participant registration
        </p>
        <h1 className="font-display text-3xl text-slate-900">Create your student account</h1>
        <p className="text-sm leading-7 text-[var(--muted)]">
          Register once, then use your own account for exam access codes, results, learning
          summaries, and support chat.
        </p>
      </div>

      <form action={formAction} className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Full name</label>
          <Input name="name" placeholder="Lina Haddad" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <Input name="email" type="email" placeholder="student@example.com" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Grade level</label>
          <Input name="gradeLevel" placeholder="8th Grade" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">School name</label>
          <Input name="schoolName" placeholder="Future Science School" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Student number</label>
          <Input name="studentNumber" placeholder="CH-101" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Password</label>
          <Input name="password" type="password" placeholder="At least 8 characters" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Confirm password</label>
          <Input name="confirmPassword" type="password" placeholder="Repeat your password" />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating account..." : "Create participant account"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
