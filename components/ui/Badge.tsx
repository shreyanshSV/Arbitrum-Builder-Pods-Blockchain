import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "danger"
  | "warning"
  | "outline"
  | "violet";

const variants: Record<BadgeVariant, string> = {
  default: "bg-white/[0.06] text-muted-strong border-border",
  primary: "bg-primary/12 text-primary border-primary/25",
  success: "bg-success/12 text-success border-success/25",
  danger: "bg-danger/12 text-danger border-danger/25",
  warning: "bg-warning/12 text-warning border-warning/25",
  violet: "bg-accent-violet/12 text-accent-violet border-accent-violet/25",
  outline: "bg-transparent text-muted-strong border-border-strong",
};

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 " +
          "text-xs font-medium tracking-wide",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
