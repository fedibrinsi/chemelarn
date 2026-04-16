import { PageHeader } from "@/components/shared/page-header";
import { ExamBuilderForm } from "@/components/exam/exam-builder-form";

export default function NewExamPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create exam"
        description="Build a mixed exercise paper with timing, publishing settings, and structured answer keys."
      />
      <ExamBuilderForm />
    </div>
  );
}
