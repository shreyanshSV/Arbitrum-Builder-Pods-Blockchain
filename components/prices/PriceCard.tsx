"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import type { CoinPrice } from "@/lib/coingecko";
import { Card, CardBody } from "@/components/ui/Card";
import { Sparkline } from "@/components/ui/Sparkline";
import {
  cn,
  formatCompactUSD,
  formatPercent,
  formatUSD,
} from "@/lib/utils";

/**
 * A single coin tile: monogram, name/symbol, live price, 24h change (arrow +
 * sign + color so meaning never relies on color alone), a 7-day sparkline, and
 * a compact stats grid (market cap, volume, high, low).
 */
export function PriceCard({ coin }: { coin: CoinPrice }) {
  const up = coin.change24h >= 0;
  // Tint the sparkline by direction; fall back to the coin's brand color if flat.
  const trendColor = up ? "#2fd07a" : "#ff5d6c";

  return (
    <Card className="group h-full lift">
      <CardBody className="flex h-full flex-col">
        {/* Header: monogram chip + name/symbol + change pill */}
        <div className="flex items-start gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold ring-1 ring-inset ring-white/10"
            style={{
              backgroundColor: `${coin.color}22`,
              color: coin.color,
            }}
            aria-hidden
          >
            {coin.glyph}
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-base font-bold tracking-tight">
              {coin.name}
            </h3>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              {coin.symbol}
            </p>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold tnum",
              up
                ? "border-success/25 bg-success/12 text-success"
                : "border-danger/25 bg-danger/12 text-danger",
            )}
          >
            {up ? (
              <ArrowUp className="h-3.5 w-3.5" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5" />
            )}
            <span className="sr-only">
              {up ? "Up" : "Down"} over 24 hours by
            </span>
            {formatPercent(coin.change24h)}
          </span>
        </div>

        {/* Current price */}
        <div className="mt-5">
          <p className="font-mono text-3xl font-bold tracking-tight tnum">
            {formatUSD(coin.price)}
          </p>
          <p className="mt-1 text-xs text-muted">Current price · USD</p>
        </div>

        {/* 7-day sparkline */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-[0.7rem] uppercase tracking-wider text-muted">
            <span>7-day trend</span>
            <span className={cn("font-medium", up ? "text-success" : "text-danger")}>
              {up ? "Bullish" : "Bearish"}
            </span>
          </div>
          <Sparkline
            data={coin.sparkline}
            color={trendColor}
            className="h-10"
          />
        </div>

        {/* Stats grid */}
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-4 text-sm">
          <Stat label="Market cap" value={formatCompactUSD(coin.marketCap)} />
          <Stat label="24h volume" value={formatCompactUSD(coin.volume24h)} />
          <Stat label="24h high" value={formatUSD(coin.high24h)} />
          <Stat label="24h low" value={formatUSD(coin.low24h)} />
        </dl>
      </CardBody>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 truncate font-mono text-sm font-medium tnum text-muted-strong">
        {value}
      </dd>
    </div>
  );
}
