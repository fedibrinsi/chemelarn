import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function ParticipantsPage() {
  const participants = await db.participantProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      examSessions: { include: { submission: true }, orderBy: { createdAt: "desc" } },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Participants"
        description="Browse student activity, session history, and graded performance."
      />
      <Card className="space-y-4">
        {participants.map((participant) => (
          <Link
            key={participant.id}
            href={`/admin/participants/${participant.id}`}
            className="block rounded-3xl bg-[var(--panel-soft)] p-5"
          >
            <p className="font-semibold text-slate-900">{participant.user.name}</p>
            <p className="text-sm text-slate-500">
              {participant.gradeLevel} • {participant.examSessions.length} sessions • joined {formatDate(participant.createdAt)}
            </p>
          </Link>
        ))}
      </Card>
    </div>
  );
}
