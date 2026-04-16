"use client";

import { Languages } from "lucide-react";
import { useParticipantLanguage, type ParticipantLocale } from "@/components/participant/participant-language";
import { cn } from "@/lib/utils";

const options: Array<{ value: ParticipantLocale; label: string }> = [
  { value: "en", label: "EN" },
  { value: "fr", label: "FR" },
  { value: "ar", label: "AR" },
];

export function ParticipantLanguageSwitcher() {
  const { locale, setLocale, dictionary } = useParticipantLanguage();

  return (
    <div className="hero-glass chem-accent-ring inline-flex items-center gap-2 rounded-2xl px-3 py-2">
      <Languages className="h-4 w-4 text-[var(--brand)]" />
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {dictionary.language}
      </span>
      <div className="ml-1 flex gap-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setLocale(option.value)}
            className={cn(
              "rounded-xl px-2.5 py-1 text-xs font-semibold transition",
              locale === option.value
                ? "bg-[var(--brand)] text-white"
                : "bg-white/70 text-slate-600 hover:bg-white",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
