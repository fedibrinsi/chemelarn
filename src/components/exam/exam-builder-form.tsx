"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveExamAction } from "@/lib/actions/admin";
import { questionTypeOptions } from "@/lib/constants";
import { toast } from "sonner";

type BuilderQuestion = {
  prompt: string;
  explanation?: string;
  placeholder?: string;
  type: (typeof questionTypeOptions)[number]["value"];
  points: number;
  isCaseSensitive?: boolean;
  answerKey?: unknown;
  options?: Array<{ label: string; value: string; isCorrect?: boolean }>;
  pairs?: Array<{ leftLabel: string; rightLabel: string; correctMatch: string }>;
};

type BuilderState = {
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
      <input type="hidden" name="payload" value={JSON.stringify(state)} />

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
                      updateQuestion(sectionIndex, questionIndex, {
                        type: event.target.value as BuilderQuestion["type"],
                      })
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
                  <label className="text-sm font-medium">Answer key</label>
                  <Textarea
                    value={JSON.stringify(question.answerKey ?? "", null, 0)}
                    onChange={(event) =>
                      updateQuestion(sectionIndex, questionIndex, { answerKey: safeParseJson(event.target.value) })
                    }
                    placeholder={`Examples: "reaction rate", true, ["A","B"], [{"left":"pH","right":"acidity"}]`}
                  />
                </div>
              </div>

              {(question.type === "MULTIPLE_CHOICE" || question.type === "ORDERING") && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Options</p>
                  {(question.options ?? []).map((option, optionIndex) => (
                    <div key={`${option.value}-${optionIndex}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                      <Input
                        value={option.label}
                        placeholder="Label"
                        onChange={(event) =>
                          updateQuestion(sectionIndex, questionIndex, {
                            options: (question.options ?? []).map((item, index) =>
                              index === optionIndex ? { ...item, label: event.target.value } : item,
                            ),
                          })
                        }
                      />
                      <Input
                        value={option.value}
                        placeholder="Value"
                        onChange={(event) =>
                          updateQuestion(sectionIndex, questionIndex, {
                            options: (question.options ?? []).map((item, index) =>
                              index === optionIndex ? { ...item, value: event.target.value } : item,
                            ),
                          })
                        }
                      />
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={Boolean(option.isCorrect)}
                          onChange={(event) =>
                            updateQuestion(sectionIndex, questionIndex, {
                              options: (question.options ?? []).map((item, index) =>
                                index === optionIndex ? { ...item, isCorrect: event.target.checked } : item,
                              ),
                            })
                          }
                        />
                        Correct
                      </label>
                    </div>
                  ))}
                  <Button
                    variant="secondary"
                    onClick={() =>
                      updateQuestion(sectionIndex, questionIndex, {
                        options: [...(question.options ?? []), { label: "Option", value: "option", isCorrect: false }],
                      })
                    }
                  >
                    Add option
                  </Button>
                </div>
              )}

              {question.type === "MATCHING" && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Matching pairs</p>
                  {(question.pairs ?? []).map((pair, pairIndex) => (
                    <div key={`${pair.leftLabel}-${pairIndex}`} className="grid gap-3 md:grid-cols-3">
                      <Input
                        value={pair.leftLabel}
                        placeholder="Left item"
                        onChange={(event) =>
                          updateQuestion(sectionIndex, questionIndex, {
                            pairs: (question.pairs ?? []).map((item, index) =>
                              index === pairIndex ? { ...item, leftLabel: event.target.value } : item,
                            ),
                          })
                        }
                      />
                      <Input
                        value={pair.rightLabel}
                        placeholder="Right item"
                        onChange={(event) =>
                          updateQuestion(sectionIndex, questionIndex, {
                            pairs: (question.pairs ?? []).map((item, index) =>
                              index === pairIndex ? { ...item, rightLabel: event.target.value } : item,
                            ),
                          })
                        }
                      />
                      <Input
                        value={pair.correctMatch}
                        placeholder="Correct match value"
                        onChange={(event) =>
                          updateQuestion(sectionIndex, questionIndex, {
                            pairs: (question.pairs ?? []).map((item, index) =>
                              index === pairIndex ? { ...item, correctMatch: event.target.value } : item,
                            ),
                          })
                        }
                      />
                    </div>
                  ))}
                  <Button
                    variant="secondary"
                    onClick={() =>
                      updateQuestion(sectionIndex, questionIndex, {
                        pairs: [...(question.pairs ?? []), { leftLabel: "Left", rightLabel: "Right", correctMatch: "Right" }],
                      })
                    }
                  >
                    Add pair
                  </Button>
                </div>
              )}
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

function safeParseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
