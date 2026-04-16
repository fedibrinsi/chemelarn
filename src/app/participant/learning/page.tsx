import { ParticipantLearningContent } from "@/components/participant/learning-content";
import { db } from "@/lib/db";

export default async function ParticipantLearningPage() {
  const summaries = await db.learningSummary.findMany({
    where: { isPublished: true },
    include: { exam: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <ParticipantLearningContent
      summaries={summaries.map((summary) => ({
        id: summary.id,
        title: summary.title,
        content: summary.content,
        videoUrl: summary.videoUrl,
        examTitle: summary.exam?.title ?? null,
      }))}
    />
  );
}
