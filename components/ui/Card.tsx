import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Glass surface used across every page for cards/panels. `interactive` adds the
 * hover-lift treatment for clickable cards.
 */
export function Card({
  className,
  interactive = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "glass rounded-2xl",
        interactive && "lift cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}
