"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftRight, FlaskConical, GripVertical, RotateCcw, X } from "lucide-react";
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

    const payload = (await response.json()) as { status?: "submitted" | "expired" | "already-finalized" };
    if (payload.status === "expired") {
      toast.info("Time is finished. The exam is now closed and your saved answers were sent.");
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
      const response = await fetch(`/api/sessions/${sessionId}/autosave`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, start: status === "NOT_STARTED" }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          router.push(`/participant/results/${sessionId}`);
        }
        return;
      }

      const payload = (await response.json()) as { expired?: boolean; redirectTo?: string };
      if (payload.expired) {
        toast.info("Time is finished. The exam is now closed.");
        router.push(payload.redirectTo ?? `/participant/results/${sessionId}`);
      }
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [answers, router, sessionId, status]);

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

      <Button type="button" onClick={() => void submitNow(false)} disabled={submitting || timeLeft <= 0}>
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

  if (question.type === "LAB_SIMULATION") {
    return <LabSimulationQuestion question={question} value={value} onChange={onChange} />;
  }

  return (
    <textarea
      rows={6}
      className="min-h-40 w-full resize-y rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm leading-7"
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

function LabSimulationQuestion({
  question,
  value,
  onChange,
}: {
  question: ExamSnapshot["sections"][number]["questions"][number];
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const config = question.config ?? null;
  const components = config?.components ?? [];
  const response = Array.isArray(value) ? value.map(String) : [];
  const expectedLength = Array.isArray(question.answerKey) ? question.answerKey.length : 0;
  const visibleMix = response
    .map((item, index) => {
      const component = components.find((entry) => entry.value === item);
      return component ? { ...component, key: `${item}-${index}` } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const fillHeight = Math.min(90, Math.max(12, visibleMix.length * 18));

  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl bg-white p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-[var(--panel-soft)] p-3 text-[var(--brand)]">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{config?.experimentTitle ?? "Virtual chemistry lab"}</p>
            <p className="text-sm text-slate-500">
              {config?.resultLabel ?? "Use the reagent buttons to build the correct chemical mixture."}
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-[220px_1fr]">
          <div className="flex flex-col items-center justify-center rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_rgba(255,255,255,1)_58%)] p-4">
            <div className="relative h-64 w-36 overflow-hidden rounded-b-[3rem] rounded-t-[1.5rem] border-[10px] border-slate-300 bg-slate-50 shadow-inner">
              <div className="absolute inset-x-0 bottom-0 transition-all duration-300" style={{ height: `${fillHeight}%` }}>
                {visibleMix.length ? (
                  <div className="flex h-full flex-col-reverse">
                    {visibleMix.map((component) => (
                      <div
                        key={component.key}
                        className="flex-1 border-t border-white/30"
                        style={{ backgroundColor: component.color }}
                        title={component.label}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-full bg-[linear-gradient(180deg,rgba(191,219,254,0.15),rgba(191,219,254,0.45))]" />
                )}
              </div>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600">{config?.vesselLabel ?? "Mixing flask"}</p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Reagent controls</p>
              <div className="flex flex-wrap gap-2">
                {components.map((component) => (
                  <button
                    key={component.value}
                    type="button"
                    onClick={() => onChange([...response, component.value])}
                    className="rounded-2xl border px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:scale-[1.01]"
                    style={{ borderColor: component.color, backgroundColor: `${component.color}1A` }}
                    title={component.effect}
                  >
                    {component.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-[var(--panel-soft)] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-700">Your mixing sequence</p>
                <p className="text-xs text-slate-500">
                  {response.length}
                  {expectedLength ? ` / ${expectedLength}` : ""} steps
                </p>
              </div>
              {visibleMix.length ? (
                <div className="space-y-2">
                  {visibleMix.map((component, index) => (
                    <div key={component.key} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-white/60"
                          style={{ backgroundColor: component.color }}
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            Step {index + 1}: {component.label}
                          </p>
                          <p className="text-xs text-slate-500">{component.effect}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--line)] px-4 py-6 text-sm text-slate-400">
                  Add reagents with the buttons to build the experiment.
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => onChange(response.slice(0, -1))} disabled={!response.length}>
                Remove last step
              </Button>
              <Button variant="ghost" onClick={() => onChange([])} disabled={!response.length}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset mixture
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-3xl bg-white p-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Experiment goal</p>
          <p className="mt-2 text-sm leading-7 text-slate-700">{question.prompt}</p>
        </div>
        <div className="rounded-3xl bg-[var(--panel-soft)] p-4 text-sm leading-7 text-slate-600">
          {question.explanation ?? "Choose the right reagents in the right order to produce the expected result."}
        </div>
        <div className="grid gap-3">
          {components.map((component) => (
            <div key={component.value} className="rounded-2xl border border-[var(--line)] px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: component.color }} />
                <p className="text-sm font-semibold text-slate-800">{component.label}</p>
              </div>
              <p className="mt-1 text-xs text-slate-500">{component.effect}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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

  function clearBlank(index: number) {
    updateBlank(index, "");
    setActiveBlank(index);
  }

  function handleDrop(index: number, event: React.DragEvent<HTMLButtonElement | HTMLDivElement>) {
    event.preventDefault();
    const optionValue = event.dataTransfer.getData("text/plain");
    if (!optionValue) return;
    updateBlank(index, optionValue);
    setActiveBlank(index);
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
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleDrop(index, event)}
                    className={cn(
                      "mx-2 inline-flex min-w-32 items-center justify-center rounded-2xl border px-3 py-2 text-sm font-semibold transition",
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
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(index, event)}
                  className={cn(
                    "inline-flex min-w-32 items-center justify-center rounded-2xl border px-3 py-2 text-sm font-semibold transition",
                    activeBlank === index
                      ? "border-[var(--brand)] bg-[var(--panel-soft)] text-[var(--brand)]"
                      : "border-[var(--line)] bg-slate-50 text-slate-700",
                  )}
                >
                  {paddedResponse[index] || "Choose answer"}
                </button>
                {paddedResponse[index] ? (
                  <Button type="button" variant="ghost" onClick={() => clearBlank(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            ))}
      </div>

      {(question.options ?? []).length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">{dictionary.wordBank}</p>
          <div className="flex flex-wrap gap-2">
            {(question.options ?? []).map((option, index) => (
              <button
                key={`${option.value}-${index}`}
                type="button"
                onClick={() => chooseOption(option.value)}
                draggable
                onDragStart={(event) => event.dataTransfer.setData("text/plain", option.value)}
                className="cursor-grab rounded-2xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[var(--brand)] hover:text-[var(--brand)] active:cursor-grabbing"
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
  const pairs = useMemo(() => question.matchingPairs ?? [], [question.matchingPairs]);
  const { dictionary } = useParticipantLanguage();
  const response = useMemo(() => (Array.isArray(value) ? value.map(String) : []), [value]);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const leftRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const firstLeft = pairs[0]?.leftLabel ?? null;
  const [activeLeft, setActiveLeft] = useState<string | null>(firstLeft);
  const [lines, setLines] = useState<Array<{ key: string; x1: number; y1: number; x2: number; y2: number }>>([]);
  const selectedMap = useMemo(
    () =>
      new Map(
        response.map((item) => {
          const [left, right] = item.split("->");
          return [left, right];
        }),
      ),
    [response],
  );
  const rightChoices = pairs.map((pair) => pair.rightLabel);
  const currentActiveLeft = activeLeft && pairs.some((pair) => pair.leftLabel === activeLeft) ? activeLeft : firstLeft;

  useEffect(() => {
    const updateLines = () => {
      const board = boardRef.current;
      if (!board) return;
      const boardRect = board.getBoundingClientRect();
      const nextLines = pairs
        .map((pair) => {
          const selectedRight = selectedMap.get(pair.leftLabel);
          if (!selectedRight) return null;

          const leftNode = leftRefs.current[pair.leftLabel];
          const rightNode = rightRefs.current[selectedRight];
          if (!leftNode || !rightNode) return null;

          const leftRect = leftNode.getBoundingClientRect();
          const rightRect = rightNode.getBoundingClientRect();

          return {
            key: `${pair.leftLabel}-${selectedRight}`,
            x1: leftRect.right - boardRect.left,
            y1: leftRect.top + leftRect.height / 2 - boardRect.top,
            x2: rightRect.left - boardRect.left,
            y2: rightRect.top + rightRect.height / 2 - boardRect.top,
          };
        })
        .filter((item): item is { key: string; x1: number; y1: number; x2: number; y2: number } => Boolean(item));

      setLines(nextLines);
    };

    const frame = window.requestAnimationFrame(updateLines);
    window.addEventListener("resize", updateLines);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateLines);
    };
  }, [pairs, selectedMap]);

  function updatePair(leftLabel: string, rightLabel: string) {
    const nextMap = new Map(selectedMap);

    for (const [left, currentRight] of nextMap.entries()) {
      if (currentRight === rightLabel && left !== leftLabel) {
        nextMap.delete(left);
      }
    }

    if (!rightLabel) {
      nextMap.delete(leftLabel);
    } else {
      nextMap.set(leftLabel, rightLabel);
    }

    const next = pairs
      .map((pair) => {
        const currentRight = nextMap.get(pair.leftLabel);
        return currentRight ? `${pair.leftLabel}->${currentRight}` : null;
      })
      .filter(Boolean);

    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div ref={boardRef} className="relative overflow-hidden rounded-3xl bg-white p-4">
        <p className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
          <ArrowLeftRight className="h-4 w-4 text-[var(--brand)]" />
          {dictionary.connectTerms}
        </p>
        <div className="grid gap-6 md:grid-cols-[1fr_120px_1fr]">
          <div className="space-y-3">
            {pairs.map((pair) => (
              <button
                key={pair.leftLabel}
                type="button"
                ref={(node) => {
                  leftRefs.current[pair.leftLabel] = node;
                }}
                onClick={() => setActiveLeft(pair.leftLabel)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition",
                  currentActiveLeft === pair.leftLabel
                    ? "border-[var(--brand)] bg-[var(--panel-soft)] text-[var(--brand)]"
                    : "border-[var(--line)] bg-white text-slate-700",
                )}
              >
                <span>{pair.leftLabel}</span>
                <span className="text-xs font-medium uppercase tracking-[0.2em]">
                  {selectedMap.get(pair.leftLabel) ? "Linked" : "Select"}
                </span>
              </button>
            ))}
          </div>

          <div className="relative hidden md:block">
            <svg className="absolute inset-0 h-full w-full overflow-visible pointer-events-none">
              {lines.map((line) => (
                <g key={line.key}>
                  <line
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="var(--brand)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx={line.x1} cy={line.y1} r="4" fill="var(--brand)" />
                  <circle cx={line.x2} cy={line.y2} r="4" fill="var(--brand)" />
                </g>
              ))}
            </svg>
          </div>

          <div className="space-y-3">
            {rightChoices.map((rightLabel) => {
              const linkedLeft = pairs.find((pair) => selectedMap.get(pair.leftLabel) === rightLabel)?.leftLabel;
              return (
                <button
                  key={rightLabel}
                  type="button"
                  ref={(node) => {
                    rightRefs.current[rightLabel] = node;
                  }}
                  onClick={() => {
                    if (!currentActiveLeft) return;
                    updatePair(currentActiveLeft, rightLabel);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium transition",
                    linkedLeft
                      ? "border-[var(--brand)] bg-[var(--panel-soft)] text-[var(--brand)]"
                      : "border-[var(--line)] bg-white text-slate-700 hover:border-[var(--brand)] hover:text-[var(--brand)]",
                  )}
                >
                  <span>{rightLabel}</span>
                  <span className="text-xs font-medium">
                    {linkedLeft ? linkedLeft : dictionary.chooseCorrectMatch}
                  </span>
                </button>
              );
            })}
          </div>
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
