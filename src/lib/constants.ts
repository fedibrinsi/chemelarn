export const APP_NAME = "ChemLearn Exam Lab";

export const CONCOURS3_ACCESS_CODE = "CONCOURS3-ODD-2026";

export const sessionStatuses = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  SUBMITTED: "Submitted",
  EXPIRED: "Expired",
} as const;

export const questionTypeOptions = [
  { value: "MULTIPLE_CHOICE", label: "Multiple choice" },
  { value: "FILL_BLANK", label: "Fill in the blank" },
  { value: "TRUE_FALSE", label: "True / false" },
  { value: "SHORT_ANSWER", label: "Short answer" },
  { value: "MATCHING", label: "Matching" },
  { value: "ORDERING", label: "Ordering" },
  { value: "LAB_SIMULATION", label: "Interactive lab simulation" },
] as const;
