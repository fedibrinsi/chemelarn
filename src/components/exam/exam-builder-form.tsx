"use client";

import { useActionState, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveExamAction } from "@/lib/actions/admin";
import { questionTypeOptions } from "@/lib/constants";
import { toast } from "sonner";

export type BuilderQuestion = {
  prompt: string;
  explanation?: string;
  placeholder?: string;
  type: (typeof questionTypeOptions)[number]["value"];
  points: number;
  isCaseSensitive?: boolean;
  answerKey?: unknown;
  options?: Array<{ label: string; value: string; isCorrect?: boolean }>;
  pairs?: Array<{ leftLabel: string; rightLabel: string; correctMatch: string }>;
  config?: {
    experimentTitle: string;
    vesselLabel: string;
    resultLabel: string;
    components: Array<{ label: string; value: string; color: string; effect: string }>;
  };
};

export type BuilderState = {
  title: string;
  description?: string;
  durationMinutes: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  availableFrom?: string;
  availableUntil?: string;
  allowResultReview: boolean;
  allowPastSubmissions: boolean;
  instructions?: string;
  sections: Array<{
    title: string;
    description?: string;
    questions: BuilderQuestion[];
  }>;
};

const initialAction = { success: false, message: "" };

const starterQuestion: BuilderQuestion = {
  prompt: "What happens to the reaction rate when temperature increases?",
  type: "SHORT_ANSWER",
  points: 2,
  placeholder: "Write a short explanation",
};

function createDefaultLabConfig() {
  return {
    experimentTitle: "Reaction bench",
    vesselLabel: "Mixing flask",
    resultLabel: "Expected result: blue precipitate",
    components: [
      { label: "Copper sulfate", value: "copper-sulfate", color: "#2563eb", effect: "Turns the solution blue." },
      { label: "Sodium hydroxide", value: "sodium-hydroxide", color: "#10b981", effect: "Forms a precipitate with copper ions." },
      { label: "Distilled water", value: "distilled-water", color: "#cbd5f5", effect: "Dilutes the mixture." },
    ],
  };
}

export function ExamBuilderForm({
  examId,
  initialValue,
}: {
  examId?: string;
  initialValue?: BuilderState;
}) {
  const [state, setState] = useState<BuilderState>(
    initialValue ?? {
      title: "New chemistry exam",
      description: "A balanced exam with mixed question types.",
      durationMinutes: 45,
      status: "DRAFT",
      allowResultReview: true,
      allowPastSubmissions: true,
      instructions: "Read each question carefully and save your work as you go.",
      sections: [{ title: "Section 1", description: "Core concepts", questions: [starterQuestion] }],
    },
  );
  const [actionState, formAction, pending] = useActionState(saveExamAction, initialAction);

  useEffect(() => {
    if (!actionState.message) return;
    if (actionState.success) {
      toast.success(actionState.message);
      return;
    }
    toast.error(actionState.message);
  }, [actionState]);

  function updateQuestion(sectionIndex: number, questionIndex: number, next: Partial<BuilderQuestion>) {
    setState((current) => ({
      ...current,
      sections: current.sections.map((section, si) =>
        si !== sectionIndex
          ? section
          : {
              ...section,
              questions: section.questions.map((question, qi) =>
                qi === questionIndex ? { ...question, ...next } : question,
              ),
            },
      ),
    }));
  }

  function addQuestion(sectionIndex: number) {
    setState((current) => ({
      ...current,
      sections: current.sections.map((section, index) =>
        index === sectionIndex ? { ...section, questions: [...section.questions, starterQuestion] } : section,
      ),
    }));
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="examId" value={examId ?? ""} />
      <input type="hidden" name="payload" value={JSON.stringify(serializeBuilderState(state))} />

      <Card className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Exam title</label>
          <Input value={state.title} onChange={(event) => setState({ ...state, title: event.target.value })} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={state.description ?? ""}
            onChange={(event) => setState({ ...state, description: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Duration (minutes)</label>
          <Input
            type="number"
            value={state.durationMinutes}
            onChange={(event) => setState({ ...state, durationMinutes: Number(event.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <select
            value={state.status}
            onChange={(event) =>
              setState({ ...state, status: event.target.value as BuilderState["status"] })
            }
            className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </Card>

      {state.sections.map((section, sectionIndex) => (
        <Card key={`${section.title}-${sectionIndex}`} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl text-slate-900">Section {sectionIndex + 1}</h3>
            <Button
              variant="ghost"
              onClick={() =>
                setState((current) => ({
                  ...current,
                  sections: current.sections.filter((_, index) => index !== sectionIndex),
                }))
              }
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove section
            </Button>
          </div>
          <Input
            value={section.title}
            onChange={(event) =>
              setState((current) => ({
                ...current,
                sections: current.sections.map((item, index) =>
                  index === sectionIndex ? { ...item, title: event.target.value } : item,
                ),
              }))
            }
          />
          {section.questions.map((question, questionIndex) => (
            <div key={`${question.prompt}-${questionIndex}`} className="rounded-3xl border border-[var(--line)] bg-[var(--panel-soft)] p-4">
              <div className="mb-4 grid gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Prompt</label>
                  <Textarea
                    value={question.prompt}
                    onChange={(event) =>
                      updateQuestion(sectionIndex, questionIndex, { prompt: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={question.type}
                    onChange={(event) =>
                      updateQuestion(
                        sectionIndex,
                        questionIndex,
                        normalizeQuestionForType(question, event.target.value as BuilderQuestion["type"]),
                      )
                    }
                    className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none"
                  >
                    {questionTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Points</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={question.points}
                    onChange={(event) =>
                      updateQuestion(sectionIndex, questionIndex, { points: Number(event.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Teacher note</label>
                  <Textarea
                    value={question.explanation ?? ""}
                    onChange={(event) =>
                      updateQuestion(sectionIndex, questionIndex, { explanation: event.target.value })
                    }
                    placeholder="Optional help text or correction note"
                  />
                </div>
              </div>

              <QuestionSettingsEditor
                question={question}
                onChange={(next) => updateQuestion(sectionIndex, questionIndex, next)}
              />
            </div>
          ))}
          <Button variant="secondary" onClick={() => addQuestion(sectionIndex)}>
            <Plus className="mr-2 h-4 w-4" />
            Add question
          </Button>
        </Card>
      ))}

      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          onClick={() =>
            setState((current) => ({
              ...current,
              sections: [...current.sections, { title: `Section ${current.sections.length + 1}`, questions: [starterQuestion] }],
            }))
          }
        >
          Add section
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : examId ? "Update exam" : "Create exam"}
        </Button>
      </div>
    </form>
  );
}

function QuestionSettingsEditor({
  question,
  onChange,
}: {
  question: BuilderQuestion;
  onChange: (next: Partial<BuilderQuestion>) => void;
}) {
  if (question.type === "TRUE_FALSE") {
    return (
      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium">Correct answer</p>
        <div className="flex gap-3">
          {[
            { label: "True", value: true },
            { label: "False", value: false },
          ].map((option) => (
            <label key={String(option.value)} className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm">
              <input
                type="radio"
                checked={question.answerKey === option.value}
                onChange={() => onChange({ answerKey: option.value })}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (question.type === "SHORT_ANSWER") {
    return (
      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium">Student placeholder</p>
        <Input
          value={question.placeholder ?? ""}
          placeholder="Write a short explanation"
          onChange={(event) => onChange({ placeholder: event.target.value })}
        />
      </div>
    );
  }

  if (question.type === "MATCHING") {
    return (
      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium">Matching pairs</p>
        <p className="text-xs text-slate-500">
          Participants will connect the left idea to the correct right idea using a visible matching board.
        </p>
        {(question.pairs ?? []).map((pair, pairIndex) => (
          <div key={`${pair.leftLabel}-${pairIndex}`} className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto]">
            <Input
              value={pair.leftLabel}
              placeholder="Left term"
              onChange={(event) =>
                onChange({
                  pairs: (question.pairs ?? []).map((item, index) =>
                    index === pairIndex ? { ...item, leftLabel: event.target.value, correctMatch: `${event.target.value}->${item.rightLabel}` } : item,
                  ),
                })
              }
            />
            <div className="flex items-center justify-center text-xl text-[var(--brand)]">→</div>
            <Input
              value={pair.rightLabel}
              placeholder="Right meaning"
              onChange={(event) =>
                onChange({
                  pairs: (question.pairs ?? []).map((item, index) =>
                    index === pairIndex ? { ...item, rightLabel: event.target.value, correctMatch: `${item.leftLabel}->${event.target.value}` } : item,
                  ),
                })
              }
            />
            <Button
              variant="ghost"
              onClick={() =>
                onChange({
                  pairs: (question.pairs ?? []).filter((_, index) => index !== pairIndex),
                })
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="secondary"
          onClick={() =>
            onChange({
              pairs: [...(question.pairs ?? []), { leftLabel: "Left term", rightLabel: "Right match", correctMatch: "Left term->Right match" }],
            })
          }
        >
          Add pair
        </Button>
      </div>
    );
  }

  if (question.type === "FILL_BLANK") {
    return (
      <div className="mt-4 space-y-3">
        <p className="text-sm font-medium">Fill in the blank setup</p>
        <p className="text-xs text-slate-500">
          Use `[[blank]]` inside the prompt for each blank. Participants can click or drag choices from the word bank into the blank slots.
        </p>
        <Input
          value={Array.isArray(question.answerKey) ? question.answerKey.join(", ") : String(question.answerKey ?? "")}
          placeholder="Correct answers in order, separated by commas"
          onChange={(event) =>
            onChange({
              answerKey: event.target.value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
        />
        <OptionEditor
          question={question}
          onChange={onChange}
          mode="word-bank"
        />
      </div>
    );
  }

  if (question.type === "ORDERING") {
    return (
      <div className="mt-4 space-y-3">
        <p className="text-sm font-medium">Sequence blocks</p>
        <p className="text-xs text-slate-500">Add the blocks in the correct order. Students will click them into place.</p>
        <OptionEditor question={question} onChange={onChange} mode="ordering" />
      </div>
    );
  }

  if (question.type === "LAB_SIMULATION") {
    const config = question.config ?? createDefaultLabConfig();

    return (
      <div className="mt-4 space-y-4">
        <div>
          <p className="text-sm font-medium">Interactive lab setup</p>
          <p className="text-xs text-slate-500">
            Participants will see a beaker-style visual and reagent buttons, then build the correct mixture step by step.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Input
            value={config.experimentTitle}
            placeholder="Experiment title"
            onChange={(event) =>
              onChange({
                config: { ...config, experimentTitle: event.target.value },
              })
            }
          />
          <Input
            value={config.vesselLabel}
            placeholder="Vessel label"
            onChange={(event) =>
              onChange({
                config: { ...config, vesselLabel: event.target.value },
              })
            }
          />
          <Input
            value={config.resultLabel}
            placeholder="Expected result"
            onChange={(event) =>
              onChange({
                config: { ...config, resultLabel: event.target.value },
              })
            }
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Reagent buttons</p>
          {config.components.map((component, componentIndex) => (
            <div key={`${component.value}-${componentIndex}`} className="grid gap-3 md:grid-cols-[1.1fr_1fr_120px_1.4fr_auto]">
              <Input
                value={component.label}
                placeholder="Button label"
                onChange={(event) =>
                  onChange({
                    config: {
                      ...config,
                      components: config.components.map((item, index) =>
                        index === componentIndex ? { ...item, label: event.target.value } : item,
                      ),
                    },
                  })
                }
              />
              <Input
                value={component.value}
                placeholder="Stored value"
                onChange={(event) =>
                  onChange({
                    config: {
                      ...config,
                      components: config.components.map((item, index) =>
                        index === componentIndex ? { ...item, value: event.target.value } : item,
                      ),
                    },
                  })
                }
              />
              <Input
                type="color"
                value={component.color}
                onChange={(event) =>
                  onChange({
                    config: {
                      ...config,
                      components: config.components.map((item, index) =>
                        index === componentIndex ? { ...item, color: event.target.value } : item,
                      ),
                    },
                  })
                }
              />
              <Input
                value={component.effect}
                placeholder="What this reagent does"
                onChange={(event) =>
                  onChange({
                    config: {
                      ...config,
                      components: config.components.map((item, index) =>
                        index === componentIndex ? { ...item, effect: event.target.value } : item,
                      ),
                    },
                  })
                }
              />
              <Button
                variant="ghost"
                onClick={() =>
                  onChange({
                    config: {
                      ...config,
                      components: config.components.filter((_, index) => index !== componentIndex),
                    },
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="secondary"
            onClick={() =>
              onChange({
                config: {
                  ...config,
                  components: [
                    ...config.components,
                    {
                      label: "New reagent",
                      value: `reagent-${config.components.length + 1}`,
                      color: "#f59e0b",
                      effect: "Describe the visible effect.",
                    },
                  ],
                },
              })
            }
          >
            Add reagent
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Correct mixing sequence</p>
          <p className="text-xs text-slate-500">
            Enter the reagent values in order, separated by commas. Example: `copper-sulfate, sodium-hydroxide`
          </p>
          <Input
            value={Array.isArray(question.answerKey) ? question.answerKey.join(", ") : ""}
            placeholder="reagent-1, reagent-2"
            onChange={(event) =>
              onChange({
                answerKey: event.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm font-medium">Answer choices</p>
      <OptionEditor question={question} onChange={onChange} mode="multiple-choice" />
    </div>
  );
}

function OptionEditor({
  question,
  onChange,
  mode,
}: {
  question: BuilderQuestion;
  onChange: (next: Partial<BuilderQuestion>) => void;
  mode: "multiple-choice" | "ordering" | "word-bank";
}) {
  return (
    <div className="space-y-2">
      {(question.options ?? []).map((option, optionIndex) => (
        <div key={`${option.value}-${optionIndex}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto_auto]">
          <Input
            value={option.label}
            placeholder={mode === "word-bank" ? "Visible choice" : "Label"}
            onChange={(event) =>
              onChange({
                options: (question.options ?? []).map((item, index) =>
                  index === optionIndex
                    ? { ...item, label: event.target.value, value: event.target.value || item.value }
                    : item,
                ),
              })
            }
          />
          <Input
            value={option.value}
            placeholder="Stored value"
            onChange={(event) =>
              onChange({
                options: (question.options ?? []).map((item, index) =>
                  index === optionIndex ? { ...item, value: event.target.value } : item,
                ),
              })
            }
          />
          {mode === "multiple-choice" ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(option.isCorrect)}
                onChange={(event) =>
                  onChange({
                    options: (question.options ?? []).map((item, index) =>
                      index === optionIndex ? { ...item, isCorrect: event.target.checked } : item,
                    ),
                  })
                }
              />
              Correct
            </label>
          ) : (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                onClick={() =>
                  onChange({
                    options: moveItem(question.options ?? [], optionIndex, -1),
                  })
                }
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  onChange({
                    options: moveItem(question.options ?? [], optionIndex, 1),
                  })
                }
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={() =>
              onChange({
                options: (question.options ?? []).filter((_, index) => index !== optionIndex),
              })
            }
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="secondary"
        onClick={() =>
          onChange({
            options: [...(question.options ?? []), { label: "New choice", value: "new-choice", isCorrect: false }],
          })
        }
      >
        Add {mode === "word-bank" ? "word bank choice" : "option"}
      </Button>
    </div>
  );
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const clone = [...items];
  [clone[index], clone[nextIndex]] = [clone[nextIndex], clone[index]];
  return clone;
}

function serializeBuilderState(state: BuilderState): BuilderState {
  return {
    ...state,
    sections: state.sections.map((section) => ({
      ...section,
      questions: section.questions.map((question) => ({
        ...question,
        answerKey: deriveAnswerKey(question),
        pairs: question.pairs?.map((pair) => ({
          ...pair,
          correctMatch: `${pair.leftLabel}->${pair.rightLabel}`,
        })),
      })),
    })),
  };
}

function deriveAnswerKey(question: BuilderQuestion) {
  if (question.type === "MULTIPLE_CHOICE") {
    return (question.options ?? []).filter((option) => option.isCorrect).map((option) => option.value);
  }

  if (question.type === "TRUE_FALSE") {
    return Boolean(question.answerKey);
  }

  if (question.type === "MATCHING") {
    return (question.pairs ?? []).map((pair) => `${pair.leftLabel}->${pair.rightLabel}`);
  }

  if (question.type === "ORDERING") {
    return (question.options ?? []).map((option) => option.value);
  }

  if (question.type === "FILL_BLANK") {
    return Array.isArray(question.answerKey)
      ? question.answerKey
      : String(question.answerKey ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
  }

  if (question.type === "LAB_SIMULATION") {
    return Array.isArray(question.answerKey)
      ? question.answerKey
      : String(question.answerKey ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
  }

  return question.answerKey;
}

function normalizeQuestionForType(
  question: BuilderQuestion,
  type: BuilderQuestion["type"],
): Partial<BuilderQuestion> {
  if (type === "LAB_SIMULATION") {
    return {
      type,
      options: [],
      pairs: [],
      placeholder: "",
      config: question.config ?? createDefaultLabConfig(),
      answerKey: Array.isArray(question.answerKey) ? question.answerKey : [],
    };
  }

  return {
    type,
    config: undefined,
  };
}
