import { EnterCodeForm } from "@/components/forms/enter-code-form";
import { PageHeader } from "@/components/shared/page-header";

export default function EnterCodePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Enter exam code"
        description="Use the access code your teacher generated to open a secure exam session tied to your account."
      />
      <EnterCodeForm />
    </div>
  );
}
