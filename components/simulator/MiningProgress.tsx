"use client";

import { Cpu } from "lucide-react";
import { shortenHash } from "@/lib/utils";

/**
 * Live mining read-out. While a block is being mined we surface the rolling
 * nonce + candidate hash + attempt counter so the user can *feel* the
 * brute-force search happening. Once mining finishes we show the final stats
 * (attempts + wall-clock duration) — the cost of proof-of-work, made tangible.
 */

export type MiningStats = {
  nonce: number;
  hash: string;
  attempts: number;
  /** undefined while still running, set when the search finishes */
  durationMs?: number;
};

export function MiningProgress({
  stats,
  running,
}: {
  stats: MiningStats;
  running: boolean;
}) {
  const hashesPerSec =
    stats.durationMs && stats.durationMs > 0
      ? Math.round(stats.attempts / (stats.durationMs / 1000))
      : null;

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/[0.06] p-3.5">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Cpu
            className={
              running
                ? "h-4 w-4 animate-pulse motion-reduce:animate-none"
                : "h-4 w-4"
            }
          />
          {running ? "Searching for a valid nonce…" : "Last mine"}
        </span>
        <span className="font-mono tnum text-xs text-muted-strong">
          {stats.attempts.toLocaleString("en-US")} hashes
        </span>
      </div>

      {/* rolling candidate hash — updates every batch while mining */}
      <p className="mt-2.5 break-all font-mono tnum text-[0.7rem] leading-relaxed text-muted">
        nonce <span className="text-foreground">{stats.nonce.toLocaleString("en-US")}</span>{" "}
        → <span className="text-muted-strong">{shortenHash(stats.hash, 14, 10)}</span>
      </p>

      {!running && stats.durationMs !== undefined && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono tnum text-[0.7rem] text-muted">
          <span>
            time{" "}
            <span className="text-success">{stats.durationMs.toFixed(0)} ms</span>
          </span>
          {hashesPerSec !== null && (
            <span>
              rate{" "}
              <span className="text-success">
                {hashesPerSec.toLocaleString("en-US")} H/s
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
