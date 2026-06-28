"use client";

import { ArrowDown, ArrowUp, CircleDollarSign } from "lucide-react";
import type { CoinPrice } from "@/lib/coingecko";
import { formatCompactUSD } from "@/lib/utils";

/**
 * Summary strip over the visible coins: combined market cap plus a tally of
 * gainers vs losers in the last 24h. Recomputes from whatever is currently
 * shown (so it respects the active filter).
 */
export function MarketSummary({ coins }: { coins: CoinPrice[] }) {
  const totalCap = coins.reduce((sum, c) => sum + (c.marketCap || 0), 0);
  const gainers = coins.filter((c) => c.change24h >= 0).length;
  const losers = coins.length - gainers;

  return (
    <div className="glass grid grid-cols-1 gap-px overflow-hidden rounded-2xl sm:grid-cols-3">
      <SummaryCell
        icon={<CircleDollarSign className="h-4 w-4 text-primary" />}
        label="Combined market cap"
        value={formatCompactUSD(totalCap)}
        tone="text-foreground"
      />
      <SummaryCell
        icon={<ArrowUp className="h-4 w-4 text-success" />}
        label="Gainers (24h)"
        value={String(gainers)}
        tone="text-success"
      />
      <SummaryCell
        icon={<ArrowDown className="h-4 w-4 text-danger" />}
        label="Losers (24h)"
        value={String(losers)}
        tone="text-danger"
      />
    </div>
  );
}

function SummaryCell({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-background-elevated/30 px-5 py-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className={`font-mono text-lg font-bold tnum ${tone}`}>{value}</p>
      </div>
    </div>
  );
}
