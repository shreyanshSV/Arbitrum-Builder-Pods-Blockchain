"use client";

import { motion } from "motion/react";
import { CountUp } from "@/components/ui/CountUp";

/**
 * Illustrative gas-cost comparison: a simple swap on Ethereum mainnet vs the
 * same swap on Arbitrum. Bars + values animate in when scrolled to. Figures are
 * representative, not live (clearly labelled as such).
 */
const rows = [
  {
    label: "Ethereum Mainnet (L1)",
    value: 4.2,
    barWidth: "100%",
    barClass: "bg-gradient-to-r from-danger/70 to-danger",
    valueClass: "text-danger",
  },
  {
    label: "Arbitrum One (L2)",
    value: 0.04,
    barWidth: "7%",
    barClass: "bg-gradient-to-r from-primary to-accent-cyan",
    valueClass: "text-primary",
  },
];

export function GasCompare() {
  return (
    <div className="glass rounded-2xl p-6 sm:p-7">
      <div className="mb-5 flex items-baseline justify-between">
        <p className="font-display text-sm font-semibold">
          Cost of one token swap
        </p>
        <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
          ~99% cheaper
        </p>
      </div>

      <div className="space-y-5">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-strong">{row.label}</span>
              <span className={`tnum font-semibold ${row.valueClass}`}>
                <CountUp value={row.value} prefix="$" decimals={2} />
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/[0.05]">
              <motion.div
                className={`h-full rounded-full ${row.barClass}`}
                initial={{ width: 0 }}
                whileInView={{ width: row.barWidth }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 1, ease: [0.22, 0.7, 0.2, 1] }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-muted">
        Figures are illustrative of typical conditions — mainnet fees vary with
        congestion. The point stands: rollups make everyday transactions
        affordable.
      </p>
    </div>
  );
}
