import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/40 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-[var(--brand)] text-white shadow-[0_14px_30px_rgba(18,103,130,0.22)] hover:bg-[var(--brand-strong)]",
        variant === "secondary" &&
          "border border-[var(--line)] bg-white/80 text-slate-800 hover:bg-[var(--panel-soft)]",
        variant === "ghost" && "text-slate-700 hover:bg-white/70",
        variant === "danger" && "bg-[var(--danger)] text-white hover:opacity-90",
        className,
      )}
      {...props}
    />
  );
}
