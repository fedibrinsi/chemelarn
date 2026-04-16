import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

export function ButtonLink({ href, children, variant = "primary" }: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition",
        variant === "primary"
          ? "bg-[var(--brand)] text-white shadow-[0_14px_30px_rgba(18,103,130,0.22)] hover:bg-[var(--brand-strong)]"
          : "border border-[var(--line)] bg-white/80 text-slate-800 hover:bg-[var(--panel-soft)]",
      )}
    >
      {children}
    </Link>
  );
}
