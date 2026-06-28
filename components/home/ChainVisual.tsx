"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/components/ui/useReducedMotionSafe";

/**
 * Decorative "how blocks connect" visual for the hero. Three linked block nodes,
 * each carrying a hash that becomes the next block's previous-hash — the core
 * chain idea, previewing the Simulator page. Deterministic sample hashes (no
 * randomness) keep server and client markup identical.
 */
const BLOCKS = [
  { index: 0, label: "Genesis", hash: "0000a3f1", prev: "00000000" },
  { index: 1, label: "Block", hash: "0000c7d2", prev: "0000a3f1" },
  { index: 2, label: "Block", hash: "00009e4b", prev: "0000c7d2" },
];

function BlockNode({
  block,
  delay,
  float,
}: {
  block: (typeof BLOCKS)[number];
  delay: number;
  float: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="relative w-full md:w-auto md:flex-1"
    >
      <div
        className={cn(
          "glass relative rounded-2xl p-4",
          float && "animate-float",
        )}
        style={{ animationDelay: `${delay}s` }}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="font-display text-sm font-bold text-foreground">
            #{block.index}
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-ring" />
            VALID
          </span>
        </div>
        <p className="text-[10px] uppercase tracking-wider text-muted">
          {block.label}
        </p>
        <div className="mt-2 space-y-1.5">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted/70">
              prev
            </p>
            <p className="tnum truncate font-mono text-xs text-accent-violet">
              {block.prev}…
            </p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted/70">
              hash
            </p>
            <p className="tnum truncate font-mono text-xs text-primary">
              {block.hash}…
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Connector({ delay, reduce }: { delay: number; reduce: boolean }) {
  return (
    <div className="relative flex items-center justify-center md:flex-1">
      {/* vertical on mobile, horizontal on desktop */}
      <div className="h-6 w-px bg-gradient-to-b from-primary/60 to-accent-violet/30 md:h-px md:w-full md:bg-gradient-to-r" />
      {!reduce && (
        <motion.span
          className="absolute h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_2px_rgba(255,59,66,0.85)]"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: ["-40%", "40%"],
          }}
          transition={{
            duration: 1.6,
            delay,
            repeat: Infinity,
            repeatDelay: 1,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
}

export function ChainVisual({ className }: { className?: string }) {
  const reduce = useReducedMotionSafe();
  return (
    <div
      className={cn(
        "flex w-full flex-col items-stretch md:flex-row md:items-center",
        className,
      )}
    >
      {BLOCKS.map((block, i) => (
        <div key={block.index} className="contents">
          <BlockNode block={block} delay={i * 0.15} float={!reduce} />
          {i < BLOCKS.length - 1 && (
            <Connector delay={i * 0.3} reduce={reduce} />
          )}
        </div>
      ))}
    </div>
  );
}
