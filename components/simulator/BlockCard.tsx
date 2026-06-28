"use client";

import {
  Boxes,
  CircleCheck,
  CircleX,
  Lock,
  Pickaxe,
  CircleStop,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { GENESIS_PREV_HASH } from "@/lib/crypto";
import { MiningProgress, type MiningStats } from "./MiningProgress";

/**
 * A single block in the chain. Renders the editable data, the read-only
 * (reactive) previousHash, the live-computed hash colour-coded by validity, the
 * Mine/Stop controls, and a VALID / INVALID badge.
 *
 * All hashing lives in the parent orchestrator; this is a presentational +
 * input component that reports edits and mine requests upward.
 */

export type BlockView = {
  index: number;
  data: string;
  previousHash: string;
  nonce: number;
  /** computed hash, or null while the first hash is still being computed */
  hash: string | null;
  /** hash satisfies proof-of-work for the current difficulty */
  hashValid: boolean;
  /** previousHash equals the actual current hash of the prior block */
  linkValid: boolean;
  /** this block on its own is sound (hashValid && linkValid) */
  selfValid: boolean;
  /** cumulative validity: this block AND every block before it are sound.
   *  A block can be selfValid but still invalid here if an earlier block broke
   *  ("orphaned" — it no longer descends from a valid chain). */
  valid: boolean;
};

export function BlockCard({
  block,
  difficulty,
  mining,
  miningStats,
  onDataChange,
  onMine,
  onStop,
}: {
  block: BlockView;
  difficulty: number;
  mining: boolean;
  miningStats: MiningStats | null;
  onDataChange: (value: string) => void;
  onMine: () => void;
  onStop: () => void;
}) {
  const computing = block.hash === null;
  const isGenesisLink = block.previousHash === GENESIS_PREV_HASH;

  return (
    <div
      className={cn(
        "glass rounded-2xl p-5 transition-colors duration-300 sm:p-6",
        // neutral while computing; primary glow when valid; amber when the block
        // is sound but orphaned (an earlier block broke); red when broken itself.
        computing
          ? "border-border"
          : block.valid
            ? "border-success/40 shadow-[0_0_0_1px_rgba(52,210,127,0.2),0_18px_50px_-30px_rgba(52,210,127,0.45)]"
            : block.selfValid
              ? "border-warning/50 shadow-[0_0_0_1px_rgba(255,194,75,0.2)]"
              : "border-danger/50 shadow-[0_0_0_1px_rgba(255,77,77,0.25)]",
      )}
    >
      {/* header: index + status badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-xl",
              computing
                ? "bg-white/[0.06] text-muted"
                : block.valid
                  ? "bg-success/12 text-success"
                  : block.selfValid
                    ? "bg-warning/12 text-warning"
                    : "bg-danger/12 text-danger",
            )}
          >
            <Boxes className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-sm font-bold tracking-tight">
              Block #{block.index}
            </p>
            <p className="font-mono text-[0.7rem] text-muted">
              {block.index === 0 ? "genesis" : `links to #${block.index - 1}`}
            </p>
          </div>
        </div>

        {computing ? (
          <Badge variant="outline">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
            computing…
          </Badge>
        ) : block.valid ? (
          <Badge variant="success">
            <CircleCheck className="h-3.5 w-3.5" />
            Valid
          </Badge>
        ) : block.selfValid ? (
          <Badge variant="warning">
            <TriangleAlert className="h-3.5 w-3.5" />
            Orphaned
          </Badge>
        ) : (
          <Badge variant="danger">
            <CircleX className="h-3.5 w-3.5" />
            Invalid
          </Badge>
        )}
      </div>

      {/* editable data */}
      <div className="mt-4">
        <label
          htmlFor={`block-data-${block.index}`}
          className="mb-1.5 block text-xs font-medium text-muted-strong"
        >
          Data
        </label>
        <textarea
          id={`block-data-${block.index}`}
          value={block.data}
          onChange={(e) => onDataChange(e.target.value)}
          rows={2}
          maxLength={2000}
          spellCheck={false}
          placeholder="Transactions, a message, anything…"
          className={cn(
            "w-full resize-y rounded-xl border bg-background/60 px-3 py-2.5 text-sm text-foreground",
            "placeholder:text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "border-border transition-colors hover:border-border-strong",
          )}
        />
      </div>

      {/* previous hash (read-only, reactive) */}
      <div className="mt-3">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-strong">
          <Lock className="h-3 w-3" />
          Previous Hash
          <span className="font-normal text-muted">(snapshot)</span>
        </p>
        <div
          aria-label={`Block ${block.index} previous hash`}
          className={cn(
            "break-all rounded-xl border bg-background/40 px-3 py-2 font-mono tnum text-[0.72rem] leading-relaxed",
            isGenesisLink ? "text-muted" : "text-muted-strong",
            block.linkValid ? "border-border" : "border-danger/40 text-danger",
          )}
        >
          {block.previousHash}
        </div>
        {!block.linkValid && (
          <p className="mt-1 text-[0.7rem] text-danger">
            Does not match block #{block.index - 1}&apos;s current hash — link
            broken.
          </p>
        )}
      </div>

      {/* nonce + hash grid */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr]">
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-strong">Nonce</p>
          <div className="rounded-xl border border-border bg-background/40 px-3 py-2 font-mono tnum text-sm text-foreground">
            {block.nonce.toLocaleString("en-US")}
          </div>
        </div>
        <div className="min-w-0">
          <p className="mb-1.5 text-xs font-medium text-muted-strong">
            Hash <span className="font-normal text-muted">(SHA-256)</span>
          </p>
          <div
            className={cn(
              "break-all rounded-xl border bg-background/40 px-3 py-2 font-mono tnum text-[0.72rem] leading-relaxed",
              computing
                ? "border-border text-muted"
                : block.hashValid
                  ? "border-success/40 text-success"
                  : "border-danger/40 text-danger",
            )}
          >
            {computing ? "computing…" : block.hash}
          </div>
        </div>
      </div>

      {/* orphaned: this block is fine, but it descends from a broken block */}
      {block.selfValid && !block.valid && (
        <p className="mt-3 flex items-start gap-1.5 rounded-lg border border-warning/30 bg-warning/[0.06] px-3 py-2 text-[0.7rem] leading-relaxed text-warning">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Sound on its own, but a block above it is broken — so it no longer
          belongs to a valid chain. Repair the earlier block first.
        </p>
      )}

      {/* live mining read-out */}
      {(mining || miningStats) && miningStats && (
        <div className="mt-3">
          <MiningProgress stats={miningStats} running={mining} />
        </div>
      )}

      {/* controls */}
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        {mining ? (
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={onStop}
            aria-label={`Stop mining block ${block.index}`}
          >
            <CircleStop className="h-4 w-4" />
            Stop
          </Button>
        ) : (
          <Button
            type="button"
            variant={block.hashValid ? "secondary" : "primary"}
            size="sm"
            onClick={onMine}
            disabled={computing}
            aria-label={`Mine block ${block.index}`}
          >
            <Pickaxe className="h-4 w-4" />
            {block.hashValid ? "Re-mine" : "Mine block"}
          </Button>
        )}
        <span className="font-mono text-[0.7rem] text-muted">
          {mining
            ? "brute-forcing the nonce…"
            : block.hashValid
              ? `hash starts with ${(block.hash ?? "").slice(0, difficulty)}…`
              : `needs ${difficulty} leading zero${difficulty > 1 ? "s" : ""}`}
        </span>
      </div>
    </div>
  );
}
