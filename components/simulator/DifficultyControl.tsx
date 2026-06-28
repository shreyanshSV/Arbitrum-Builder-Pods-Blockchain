"use client";

import { Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { targetPrefix } from "@/lib/crypto";

/**
 * Difficulty selector (1–5). Difficulty = the number of leading zeros a block's
 * hash must have to count as "mined". Each extra zero makes valid hashes ~16x
 * rarer, so mining time climbs steeply — the same security/cost trade-off real
 * proof-of-work chains tune.
 */

const LEVELS = [1, 2, 3, 4, 5] as const;

export function DifficultyControl({
  difficulty,
  onChange,
  disabled,
}: {
  difficulty: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-bold tracking-tight">
            Difficulty
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            Required leading zeros in every block hash.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-background/60 px-2.5 py-1 font-mono tnum text-xs text-primary">
          <Hash className="h-3.5 w-3.5" />
          target {targetPrefix(difficulty)}…
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Mining difficulty"
        className="mt-4 grid grid-cols-5 gap-2"
      >
        {LEVELS.map((level) => {
          const active = level === difficulty;
          return (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`Difficulty ${level} (${level} leading zeros)`}
              disabled={disabled}
              onClick={() => onChange(level)}
              className={cn(
                "h-11 rounded-xl border font-mono tnum text-sm font-semibold transition-all",
                "disabled:cursor-not-allowed disabled:opacity-40",
                active
                  ? "border-primary/60 bg-primary/15 text-primary shadow-[0_0_0_1px_rgba(255,59,66,0.25)]"
                  : "border-border bg-background/40 text-muted-strong hover:border-border-strong hover:text-foreground",
              )}
            >
              {level}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[0.7rem] leading-relaxed text-muted">
        Higher difficulty = exponentially more hashes per block. Try 4–5 to feel
        why miners need real hardware.
      </p>
    </div>
  );
}
