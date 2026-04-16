"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DraftAnswers, ExamSnapshot } from "@/lib/exam";

type ExamRunnerProps = {
  sessionId: string;
  snapshot: ExamSnapshot;
  initialAnswers: DraftAnswers;
  expiresAt: string;
  status: "NOT_STARTED" | "IN_PROGRESS";
};

export function ExamRunner({ sessionId, snapshot, initialAnswers, expiresAt, status }: ExamRunnerProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<DraftAnswers>(initialAnswers);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(snapshot.durationMinutes * 60);

  const submitNow = useCallback(async (autoSubmitted = false) => {
    if (submitting) return;
    setSubmitting(true);
    const response = await fetch(`/api/sessions/${sessionId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, autoSubmitted }),
    });

    if (!response.ok) {
      setSubmitting(false);
      toast.error("Submission failed. Please try again.");
      return;
    }

    router.push(`/participant/results/${sessionId}`);
  }, [answers, router, sessionId, submitting]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        const recalculated = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
        if (recalculated <= 1 || current <= 1) {
          window.clearInterval(timer);
          void submitNow(true);
          return 0;
        }
        return recalculated;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt, submitNow]);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      await fetch(`/api/sessions/${sessionId}/autosave`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, start: status === "NOT_STARTED" }),
      });
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [answers, sessionId, status]);

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">{snapshot.title}</h1>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{snapshot.instructions}</p>
        </div>
        <div className="rounded-3xl bg-[var(--panel-soft)] px-5 py-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Time left</p>
          <p className="font-display text-3xl text-slate-900">{formatTime(timeLeft)}</p>
        </div>
      </Card>

      {snapshot.sections.map((section, sectionIndex) => (
        <Card key={section.id} className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">
              Section {sectionIndex + 1}
            </p>
            <h2 className="font-display text-2xl text-slate-900">{section.title}</h2>
          </div>
          {section.questions.map((question, questionIndex) => (
            <div key={question.id} className="space-y-3 rounded-3xl border border-[var(--line)] bg-[var(--panel-soft)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {sectionIndex + 1}.{questionIndex + 1} {question.prompt}
                  </p>
                  <p className="text-xs text-slate-500">{question.points} points</p>
                </div>
              </div>
              <QuestionInput
                question={question}
                value={answers[question.id]}
                onChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
              />
            </div>
          ))}
        </Card>
      ))}

      <Button type="button" onClick={() => void submitNow(false)} disabled={submitting}>
        {submitting ? "Submitting..." : "Submit exam"}
      </Button>
    </div>
  );
}

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: ExamSnapshot["sections"][number]["questions"][number];
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (question.type === "MULTIPLE_CHOICE") {
    return (
      <div className="grid gap-3">
        {(question.options ?? []).map((option) => (
          <label key={option.value} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
            <input
              type="radio"
              name={question.id}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    );
  }

  if (question.type === "TRUE_FALSE") {
    return (
      <div className="flex gap-3">
        {["true", "false"].map((option) => (
          <label key={option} className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3">
            <input
              type="radio"
              checked={String(value) === option}
              onChange={() => onChange(option === "true")}
            />
            {option}
          </label>
        ))}
      </div>
    );
  }

  if (question.type === "ORDERING") {
    return (
      <textarea
        className="min-h-28 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
        placeholder={'Enter the order as a JSON array, for example ["step 1", "step 2"]'}
        value={Array.isArray(value) ? JSON.stringify(value) : ""}
        onChange={(event) => onChange(parseTextArea(event.target.value))}
      />
    );
  }

  if (question.type === "MATCHING") {
    return (
      <textarea
        className="min-h-28 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
        placeholder={'Enter matches as a JSON array, for example ["acid->pH", "base->OH-"]'}
        value={Array.isArray(value) ? JSON.stringify(value) : ""}
        onChange={(event) => onChange(parseTextArea(event.target.value))}
      />
    );
  }

  return (
    <textarea
      className="min-h-28 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
      placeholder={question.explanation ?? "Type your answer here"}
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function parseTextArea(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
