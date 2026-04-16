"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveLearningSummaryAction } from "@/lib/actions/admin";
import { toast } from "sonner";

const initialState = { success: false, message: "" };

export function LearningSummaryForm({ examOptions }: { examOptions: Array<{ id: string; title: string }> }) {
  const [state, formAction, pending] = useActionState(saveLearningSummaryAction, initialState);

  useEffect(() => {
    if (!state.message) return;
    if (state.success) {
      toast.success(state.message);
      return;
    }
    toast.error(state.message);
  }, [state]);

  return (
    <Card>
      <form action={formAction} className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Title</label>
          <Input name="title" placeholder="Reaction rate recap" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Linked exam</label>
          <select
            name="examId"
            className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none"
            defaultValue=""
          >
            <option value="">General learning summary</option>
            {examOptions.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Video URL</label>
          <Input name="videoUrl" placeholder="https://www.youtube.com/watch?v=..." />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Content</label>
          <Textarea name="content" placeholder="Write a concise summary of what students learned..." />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Publishing..." : "Publish summary"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
