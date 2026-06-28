"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  RefreshCw,
  Radio,
  TriangleAlert,
  Search as SearchIcon,
} from "lucide-react";
import type { CoinPrice, PricePayload, PriceSource } from "@/lib/coingecko";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn, timeAgo } from "@/lib/utils";
import { PriceCard } from "@/components/prices/PriceCard";
import { PriceCardSkeleton } from "@/components/prices/PriceCardSkeleton";
import { MarketSummary } from "@/components/prices/MarketSummary";
import { SearchBar } from "@/components/prices/SearchBar";

type Status = "loading" | "ready" | "error";

export function PricesClient() {
  const [coins, setCoins] = useState<CoinPrice[]>([]);
  const [source, setSource] = useState<PriceSource | null>(null);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [live, setLive] = useState(false);
  const [query, setQuery] = useState("");

  // Monotonic request id — responses that arrive after a newer request are
  // discarded so rapid Refresh clicks can't apply stale data out of order.
  const requestSeq = useRef(0);
  const esRef = useRef<EventSource | null>(null);

  // Re-render once a second so the "updated Xs ago" label ticks live.
  const [, setNowTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setNowTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  /** Apply a payload only if this is still the latest in-flight request. */
  const applyPayload = useCallback((payload: PricePayload) => {
    setCoins(payload.coins);
    setSource(payload.source);
    setFetchedAt(payload.fetchedAt);
    setStatus("ready");
    setErrorMsg(null);
  }, []);

  /** Manual fetch (used on mount, Retry, and the Refresh button). */
  const fetchPrices = useCallback(
    async (opts: { force?: boolean; initial?: boolean } = {}) => {
      const seq = ++requestSeq.current;
      if (opts.initial) setStatus("loading");
      else setRefreshing(true);

      try {
        const res = await fetch(`/api/prices${opts.force ? "?force=1" : ""}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const payload = (await res.json()) as PricePayload;

        // Ignore if a newer request started meanwhile.
        if (seq !== requestSeq.current) return;
        applyPayload(payload);
      } catch (err) {
        if (seq !== requestSeq.current) return;
        // Only surface a full error screen if we have nothing to show yet.
        if (opts.initial || coins.length === 0) {
          setStatus("error");
          setErrorMsg(
            err instanceof Error ? err.message : "Couldn't load prices.",
          );
        }
      } finally {
        if (seq === requestSeq.current) setRefreshing(false);
      }
    },
    [applyPayload, coins.length],
  );

  // Initial load. Fetching on mount is exactly what an effect is for; the
  // setState happens inside the async fetch, which the rule can't see through.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPrices({ initial: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LIVE mode: open an EventSource and update on each "prices" message.
  // Always tears the connection down on unmount or when toggled off.
  useEffect(() => {
    if (!live) return;

    let es: EventSource;
    try {
      es = new EventSource("/api/prices/stream");
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- recover if the browser can't open the stream
      setLive(false);
      return;
    }
    esRef.current = es;

    es.addEventListener("prices", (event) => {
      try {
        const payload = JSON.parse(
          (event as MessageEvent).data,
        ) as PricePayload;
        // Stream messages are always the freshest; bump the seq so a
        // late manual fetch can't overwrite them.
        requestSeq.current++;
        applyPayload(payload);
      } catch {
        /* ignore malformed frame */
      }
    });

    es.onerror = () => {
      // Connection dropped — fall back to manual mode rather than spinning.
      es.close();
      esRef.current = null;
      setLive(false);
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [live, applyPayload]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coins;
    return coins.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q),
    );
  }, [coins, query]);

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      {/* thematic backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-72 w-[min(620px,85%)] opacity-25 [mask-image:radial-gradient(80%_80%_at_85%_18%,black,transparent_72%)]"
      >
        <Image
          src="/generated/prices.png"
          alt=""
          fill
          sizes="(max-width: 1024px) 80vw, 620px"
          className="object-cover"
        />
      </div>

      <SectionHeading
        align="left"
        eyebrow="Live Prices · CoinGecko"
        title={
          <>
            Watch the market <span className="text-gradient-brand">move</span>
          </>
        }
        subtitle="Real-time prices for ETH, BTC and four more chains — with 7-day trends, 24h stats, and an optional server-streamed live feed."
      />

      {/* Control bar */}
      <Reveal delay={0.05} className="mt-8">
        <div className="glass flex flex-col gap-4 rounded-2xl p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* LIVE toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={live}
              aria-label="Toggle live streaming updates"
              onClick={() => setLive((v) => !v)}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-all cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                live
                  ? "border-success/30 bg-success/12 text-success"
                  : "border-border-strong text-muted-strong hover:bg-white/[0.05]",
              )}
            >
              <span className="relative flex h-2.5 w-2.5">
                {live && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75 motion-reduce:hidden" />
                )}
                <span
                  className={cn(
                    "relative inline-flex h-2.5 w-2.5 rounded-full",
                    live ? "bg-success" : "bg-muted",
                  )}
                />
              </span>
              {live ? "Live" : "Go live"}
              <Radio className="h-4 w-4" />
            </button>

            {/* Refresh */}
            <Button
              variant="secondary"
              onClick={() => fetchPrices({ force: true })}
              disabled={refreshing}
              aria-label="Refresh prices now"
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4",
                  refreshing && "animate-spin motion-reduce:animate-none",
                )}
              />
              {refreshing ? "Refreshing" : "Refresh"}
            </Button>

            {/* status / last-updated */}
            <div className="flex items-center gap-2 text-xs text-muted">
              <SourceLabel source={source} />
              {fetchedAt && status === "ready" && (
                <span className="tnum">· updated {timeAgo(fetchedAt)}</span>
              )}
            </div>
          </div>

          <SearchBar
            value={query}
            onChange={setQuery}
            resultCount={filtered.length}
          />
        </div>
      </Reveal>

      {/* Degraded-source banners */}
      {status === "ready" && source === "fallback" && (
        <SourceBanner
          text="Showing sample data — couldn't reach CoinGecko."
          className="mt-4"
        />
      )}
      {status === "ready" && source === "stale" && (
        <SourceBanner
          text="Showing last cached data — live feed is temporarily unavailable."
          className="mt-4"
        />
      )}

      {/* Summary strip (only with data) */}
      {status === "ready" && coins.length > 0 && (
        <Reveal delay={0.1} className="mt-6">
          <MarketSummary coins={filtered.length > 0 ? filtered : coins} />
        </Reveal>
      )}

      {/* Body */}
      <div className="mt-6">
        {status === "loading" && <SkeletonGrid />}

        {status === "error" && (
          <ErrorState
            message={errorMsg}
            onRetry={() => fetchPrices({ initial: true, force: true })}
          />
        )}

        {status === "ready" && filtered.length === 0 && (
          <EmptyState query={query} onClear={() => setQuery("")} />
        )}

        {status === "ready" && filtered.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((coin, i) => (
              <Reveal key={coin.id} delay={Math.min(i * 0.05, 0.3)}>
                <PriceCard coin={coin} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */

function SourceLabel({ source }: { source: PriceSource | null }) {
  if (!source) return null;
  if (source === "live") {
    return (
      <Badge variant="success" className="px-2 py-0.5">
        Live
      </Badge>
    );
  }
  if (source === "cache") {
    return (
      <Badge variant="primary" className="px-2 py-0.5">
        Cached
      </Badge>
    );
  }
  return null;
}

function SourceBanner({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning",
        className,
      )}
    >
      <TriangleAlert className="h-4 w-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <PriceCardSkeleton key={i} />
      ))}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="glass flex flex-col items-center gap-4 rounded-2xl px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger/12 text-danger">
        <TriangleAlert className="h-6 w-6" />
      </span>
      <div>
        <h3 className="font-display text-lg font-bold">
          Couldn&apos;t load prices
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted">
          {message ?? "Something went wrong reaching the price feed."} Check
          your connection and try again.
        </p>
      </div>
      <Button onClick={onRetry} aria-label="Retry loading prices">
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    </div>
  );
}

function EmptyState({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  return (
    <div className="glass flex flex-col items-center gap-4 rounded-2xl px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05] text-muted">
        <SearchIcon className="h-6 w-6" />
      </span>
      <div>
        <h3 className="font-display text-lg font-bold">No coins match</h3>
        <p className="mt-1 max-w-sm text-sm text-muted">
          Nothing matches{" "}
          <span className="font-mono text-foreground">“{query}”</span>. Try a
          different name or symbol.
        </p>
      </div>
      <Button variant="secondary" onClick={onClear}>
        Clear filter
      </Button>
    </div>
  );
}
