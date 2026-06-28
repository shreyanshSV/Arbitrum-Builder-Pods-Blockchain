"use client";

import { Link2, Link2Off } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The visual link between two stacked block cards. When the lower block's
 * previousHash matches the block above (the cryptographic link holds) it glows
 * primary/intact; when the link is broken it turns red with a broken-chain icon
 * — the literal picture of a tampered chain.
 */

export function ChainConnector({ linked }: { linked: boolean }) {
  return (
    <div
      className="relative flex h-12 items-center justify-center"
      aria-hidden="true"
    >
      {/* vertical wire */}
      <div
        className={cn(
          "absolute top-0 h-full w-px transition-colors duration-300",
          linked
            ? "bg-gradient-to-b from-success/70 to-success/70 shadow-[0_0_8px_rgba(52,210,127,0.55)]"
            : "bg-gradient-to-b from-danger/70 to-danger/70",
        )}
      />
      {/* badge over the wire */}
      <span
        className={cn(
          "relative inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors duration-300",
          linked
            ? "border-success/40 bg-success/15 text-success"
            : "border-danger/50 bg-danger/15 text-danger",
        )}
      >
        {linked ? (
          <Link2 className="h-4 w-4" />
        ) : (
          <Link2Off className="h-4 w-4" />
        )}
      </span>
    </div>
  );
}
