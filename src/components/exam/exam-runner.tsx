"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, GripVertical, RotateCcw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useParticipantLanguage } from "@/components/participant/participant-language";
import { cn } from "@/lib/utils";
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
  const { dictionary } = useParticipantLanguage();
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
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            {snapshot.instructions ?? dictionary.examInstructions}
          </p>
        </div>
        <div className="rounded-3xl bg-[var(--panel-soft)] px-5 py-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">{dictionary.timeLeft}</p>
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
        {submitting ? dictionary.submitting : dictionary.submitExam}
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
    const multipleAllowed = (question.options ?? []).filter((option) => option.isCorrect).length > 1;
    const selectedValues = Array.isArray(value) ? value.map(String) : [String(value ?? "")].filter(Boolean);

    return (
      <div className="grid gap-3">
        {(question.options ?? []).map((option) => (
          <label key={option.value} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
            <input
              type={multipleAllowed ? "checkbox" : "radio"}
              name={question.id}
              checked={selectedValues.includes(option.value)}
              onChange={() => {
                if (!multipleAllowed) {
                  onChange(option.value);
                  return;
                }

                onChange(
                  selectedValues.includes(option.value)
                    ? selectedValues.filter((item) => item !== option.value)
                    : [...selectedValues, option.value],
                );
              }}
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

  if (question.type === "FILL_BLANK") {
    return <FillBlankQuestion question={question} value={value} onChange={onChange} />;
  }

  if (question.type === "ORDERING") {
    return <OrderingQuestion question={question} value={value} onChange={onChange} />;
  }

  if (question.type === "MATCHING") {
    return <MatchingQuestion question={question} value={value} onChange={onChange} />;
  }

  return (
    <textarea
      className="min-h-28 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
      placeholder={question.placeholder ?? question.explanation ?? "Type your answer here"}
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function FillBlankQuestion({
  question,
  value,
  onChange,
}: {
  question: ExamSnapshot["sections"][number]["questions"][number];
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const segments = useMemo(() => question.prompt.split("[[blank]]"), [question.prompt]);
  const { dictionary } = useParticipantLanguage();
  const blankCount = Math.max(
    segments.length - 1,
    Array.isArray(question.answerKey) ? question.answerKey.length : 1,
  );
  const response = Array.isArray(value)
    ? value.map((item) => String(item))
    : typeof value === "string"
      ? [value]
      : Array.from({ length: blankCount }, () => "");
  const paddedResponse = Array.from({ length: blankCount }, (_, index) => response[index] ?? "");
  const [activeBlank, setActiveBlank] = useState(0);

  function updateBlank(index: number, nextValue: string) {
    const updated = paddedResponse.map((item, itemIndex) => (itemIndex === index ? nextValue : item));
    onChange(blankCount === 1 ? updated[0] : updated);
  }

  function chooseOption(optionValue: string) {
    updateBlank(activeBlank, optionValue);
    const nextEmpty = paddedResponse.findIndex((item, index) => index > activeBlank && !item);
    if (nextEmpty !== -1) setActiveBlank(nextEmpty);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-white p-4 leading-8 text-slate-700">
        {segments.length > 1
          ? segments.map((segment, index) => (
              <span key={`${segment}-${index}`}>
                {segment}
                {index < blankCount ? (
                  <button
                    type="button"
                    onClick={() => setActiveBlank(index)}
                    className={cn(
                      "mx-2 inline-flex min-w-28 items-center justify-center rounded-2xl border px-3 py-2 text-sm font-semibold",
                      activeBlank === index
                        ? "border-[var(--brand)] bg-[var(--panel-soft)] text-[var(--brand)]"
                        : "border-[var(--line)] bg-slate-50 text-slate-700",
                    )}
                  >
                    {paddedResponse[index] || `Blank ${index + 1}`}
                  </button>
                ) : null}
              </span>
            ))
          : Array.from({ length: blankCount }).map((_, index) => (
              <div key={index} className="mb-3 flex items-center gap-3">
                <span className="text-sm font-medium text-slate-500">Blank {index + 1}</span>
                <button
                  type="button"
                  onClick={() => setActiveBlank(index)}
                  className={cn(
                    "inline-flex min-w-28 items-center justify-center rounded-2xl border px-3 py-2 text-sm font-semibold",
                    activeBlank === index
                      ? "border-[var(--brand)] bg-[var(--panel-soft)] text-[var(--brand)]"
                      : "border-[var(--line)] bg-slate-50 text-slate-700",
                  )}
                >
                  {paddedResponse[index] || "Choose answer"}
                </button>
              </div>
            ))}
      </div>

      {(question.options ?? []).length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">{dictionary.wordBank}</p>
          <div className="flex flex-wrap gap-2">
            {(question.options ?? []).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => chooseOption(option.value)}
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: blankCount }).map((_, index) => (
            <input
              key={index}
              value={paddedResponse[index]}
              placeholder={`Blank ${index + 1}`}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm"
              onFocus={() => setActiveBlank(index)}
              onChange={(event) => updateBlank(index, event.target.value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderingQuestion({
  question,
  value,
  onChange,
}: {
  question: ExamSnapshot["sections"][number]["questions"][number];
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const choices = question.options ?? [];
  const { dictionary } = useParticipantLanguage();
  const current = Array.isArray(value)
    ? value.map(String).filter((item) => choices.some((choice) => choice.value === item))
    : [];
  const remaining = choices.filter((choice) => !current.includes(choice.value));

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-white p-4">
        <p className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
          <GripVertical className="h-4 w-4 text-[var(--brand)]" />
          {dictionary.buildSequence}
        </p>
        <div className="space-y-2">
          {current.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--line)] px-4 py-6 text-sm text-slate-400">
              {dictionary.sequenceHint}
            </div>
          ) : (
            current.map((item, index) => {
              const option = choices.find((choice) => choice.value === item);
              return (
                <div key={`${item}-${index}`} className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-3">
                  <span className="text-sm font-semibold text-slate-700">
                    {index + 1}. {option?.label ?? item}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => onChange(moveArrayItem(current, index, -1))}
                    >
                      ←
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => onChange(moveArrayItem(current, index, 1))}
                    >
                      →
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => onChange(current.filter((_, itemIndex) => itemIndex !== index))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">{dictionary.availableBlocks}</p>
        <div className="flex flex-wrap gap-2">
          {remaining.map((choice) => (
            <button
              key={choice.value}
              type="button"
              onClick={() => onChange([...current, choice.value])}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              {choice.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MatchingQuestion({
  question,
  value,
  onChange,
}: {
  question: ExamSnapshot["sections"][number]["questions"][number];
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const pairs = question.matchingPairs ?? [];
  const { dictionary } = useParticipantLanguage();
  const response = Array.isArray(value) ? value.map(String) : [];
  const selectedMap = new Map(
    response.map((item) => {
      const [left, right] = item.split("->");
      return [left, right];
    }),
  );

  function updatePair(leftLabel: string, rightLabel: string) {
    const next = pairs
      .map((pair) =>
        pair.leftLabel === leftLabel
          ? `${pair.leftLabel}->${rightLabel}`
          : selectedMap.get(pair.leftLabel)
            ? `${pair.leftLabel}->${selectedMap.get(pair.leftLabel)}`
            : null,
      )
      .filter(Boolean);
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-white p-4">
        <p className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
          <ArrowLeftRight className="h-4 w-4 text-[var(--brand)]" />
          {dictionary.connectTerms}
        </p>
        <div className="space-y-3">
          {pairs.map((pair) => (
            <div key={pair.leftLabel} className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div className="rounded-2xl bg-[var(--panel-soft)] px-4 py-3 text-sm font-semibold text-slate-700">
                {pair.leftLabel}
              </div>
              <div className="text-center text-xl text-[var(--brand)]">→</div>
              <select
                value={selectedMap.get(pair.leftLabel) ?? ""}
                onChange={(event) => updatePair(pair.leftLabel, event.target.value)}
                className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none"
              >
                <option value="">{dictionary.chooseCorrectMatch}</option>
                {pairs.map((option) => (
                  <option key={option.rightLabel} value={option.rightLabel}>
                    {option.rightLabel}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
      <Button variant="secondary" onClick={() => onChange([])}>
        <RotateCcw className="mr-2 h-4 w-4" />
        {dictionary.resetMatches}
      </Button>
    </div>
  );
}

function moveArrayItem(items: string[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const clone = [...items];
  [clone[index], clone[nextIndex]] = [clone[nextIndex], clone[index]];
  return clone;
}
