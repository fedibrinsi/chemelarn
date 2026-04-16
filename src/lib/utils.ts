import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number, maxScore: number) {
  if (!maxScore) return "0 / 0";
  return `${score.toFixed(score % 1 === 0 ? 0 : 1)} / ${maxScore.toFixed(maxScore % 1 === 0 ? 0 : 1)}`;
}

export function toPercent(score: number, maxScore: number) {
  if (!maxScore) return 0;
  return Math.round((score / maxScore) * 100);
}

export function minutesFromNow(minutes: number) {
  return new Date(Date.now() + minutes * 60_000);
}

export function formatDate(value?: Date | string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function randomCode(prefix = "LAB") {
  return `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
