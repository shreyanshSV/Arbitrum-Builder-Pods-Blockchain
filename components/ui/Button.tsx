import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium " +
  "whitespace-nowrap transition-all duration-200 cursor-pointer select-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-primary to-primary-strong text-primary-foreground font-semibold " +
    "shadow-[0_8px_30px_-8px_rgba(255,197,61,0.55)] " +
    "hover:shadow-[0_12px_40px_-6px_rgba(255,197,61,0.7)] hover:brightness-110",
  secondary:
    "glass text-foreground hover:border-border-strong hover:bg-white/[0.06]",
  outline:
    "border border-border-strong bg-transparent text-foreground hover:bg-white/[0.05]",
  ghost: "bg-transparent text-muted-strong hover:bg-white/[0.06] hover:text-foreground",
  danger:
    "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
  icon: "h-10 w-10",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={buttonStyles({ variant, size, className })}
      {...props}
    />
  ),
);
Button.displayName = "Button";
