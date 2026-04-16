import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("card-shadow rounded-[1.75rem] border border-white/70 bg-[var(--panel)] p-6", className)}>
      {children}
    </div>
  );
}
