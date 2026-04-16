import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Key defaults for deployment and operations live in environment variables documented in the README."
      />
      <Card className="space-y-3 text-sm leading-7 text-slate-700">
        <p>Use Neon for `DATABASE_URL`, configure `NEXTAUTH_SECRET`, and set `NEXTAUTH_URL` on Vercel.</p>
        <p>Rate limiting is applied to chat and autosave endpoints with light request validation and role checks.</p>
        <p>Important admin actions are written to the `AuditLog` table for traceability.</p>
      </Card>
    </div>
  );
}
