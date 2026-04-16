import { Card } from "@/components/ui/card";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(234,248,251,0.92))]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">
            Chemistry-inspired workspace
          </p>
          <h1 className="font-display text-3xl text-slate-900">{title}</h1>
          <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">{description}</p>
        </div>
        {action}
      </div>
    </Card>
  );
}
