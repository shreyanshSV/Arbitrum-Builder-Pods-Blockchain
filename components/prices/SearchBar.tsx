"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Controlled search input used to filter coins by name or symbol. Includes an
 * accessible clear button that only appears when there's text.
 */
export function SearchBar({
  value,
  onChange,
  resultCount,
  className,
}: {
  value: string;
  onChange: (next: string) => void;
  resultCount: number;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full sm:max-w-xs", className)}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Filter by name or symbol…"
        aria-label="Filter coins by name or symbol"
        className={cn(
          "glass h-11 w-full rounded-xl border border-border pl-10 pr-10 text-sm",
          "text-foreground placeholder:text-muted",
          "transition-colors focus-visible:border-primary/50 focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear filter"
          className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {/* live region for screen readers as the list filters */}
      <span className="sr-only" aria-live="polite">
        {resultCount} coin{resultCount === 1 ? "" : "s"} shown
      </span>
    </div>
  );
}
