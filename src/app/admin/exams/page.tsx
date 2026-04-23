import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/shared/button-link";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function AdminExamsPage() {
  const exams = await db.exam.findMany({
    orderBy: { updatedAt: "desc" },
    include: { sections: true, sessions: true, accessCodes: true },
  });
  const visibleExams = exams.filter((exam) => exam.title === "Concours 3 - ODD");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam builder"
        description="Create, publish, and maintain mixed-format exams with reusable sections and generated access codes."
        action={<ButtonLink href="/admin/exams/new">Create exam</ButtonLink>}
      />
      <Card className="space-y-4">
        {visibleExams.map((exam) => (
          <Link key={exam.id} href={`/admin/exams/${exam.id}`} className="block rounded-3xl bg-[var(--panel-soft)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{exam.title}</p>
                <p className="text-sm text-slate-500">
                  {exam.sections.length} sections • {exam.sessions.length} sessions • updated {formatDate(exam.updatedAt)}
                </p>
              </div>
              <Badge tone={exam.status === "PUBLISHED" ? "success" : "default"}>{exam.status}</Badge>
            </div>
          </Link>
        ))}
      </Card>
    </div>
  );
}
