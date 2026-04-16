"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useParticipantLanguage } from "@/components/participant/participant-language";
import { redeemExamCodeAction } from "@/lib/actions/participant";
import { toast } from "sonner";

const initialState = { success: false, message: "", redirectTo: undefined as string | undefined };

export function EnterCodeForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(redeemExamCodeAction, initialState);
  const { dictionary } = useParticipantLanguage();

  useEffect(() => {
    if (!state.message) return;
    if (state.success) {
      toast.success(state.message);
      if (state.redirectTo) router.push(state.redirectTo);
    } else {
      toast.error(state.message);
    }
  }, [router, state]);

  return (
    <Card className="max-w-xl">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{dictionary.examAccessCode}</label>
          <Input
            name="code"
            placeholder={dictionary.examAccessCodePlaceholder}
            className="uppercase tracking-[0.2em]"
            autoComplete="off"
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? dictionary.validating : dictionary.openExamSession}
        </Button>
      </form>
    </Card>
  );
}
