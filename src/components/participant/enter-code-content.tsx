"use client";

import { EnterCodeForm } from "@/components/forms/enter-code-form";
import { PageHeader } from "@/components/shared/page-header";
import { useParticipantLanguage } from "@/components/participant/participant-language";

export function ParticipantEnterCodeContent() {
  const { dictionary } = useParticipantLanguage();

  return (
    <div className="space-y-6">
      <PageHeader title={dictionary.enterCodeTitle} description={dictionary.enterCodeDescription} />
      <EnterCodeForm />
    </div>
  );
}
