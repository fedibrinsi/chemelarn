import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";

export default function TutorialPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tutorial"
        description="A simple orientation space so participants know how to enter a code, save answers, and submit."
      />
      <Card className="space-y-4">
        <div className="aspect-video overflow-hidden rounded-3xl bg-slate-900">
          <iframe
            className="h-full w-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"
            title="Tutorial video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
        <p className="text-sm leading-7 text-slate-700">
          Watch the demo, then head to the exam code page. Your answers save automatically while the timer runs.
        </p>
      </Card>
    </div>
  );
}
