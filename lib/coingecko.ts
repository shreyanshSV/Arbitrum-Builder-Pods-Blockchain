/**
 * Server-side CoinGecko data layer.
 *
 * - Talks to the free, no-key CoinGecko `/coins/markets` endpoint (richer than
 *   `/simple/price`: gives price, 24h change, market cap, volume, and a 7-day
 *   sparkline in a single request).
 * - In-memory TTL cache so rapid refreshes / many visitors don't hammer the API
 *   and trip its rate limit.
 * - Graceful degradation: on a failed/blocked request it serves the last good
 *   cached payload (marked "stale"); if there's nothing cached at all it falls
 *   back to a static seed so the dashboard never renders empty.
 *
 * This module is server-only — it is imported exclusively by route handlers.
 */

export type CoinMeta = {
  id: string; // CoinGecko id
  symbol: string;
  name: string;
  glyph: string; // short badge label / currency glyph
  color: string; // brand accent for sparkline + badge
};

/** Coins tracked by the dashboard. ETH & BTC are required; the rest are bonus. */
export const COINS: CoinMeta[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", glyph: "₿", color: "#f7931a" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", glyph: "Ξ", color: "#6f8cff" },
  { id: "arbitrum", symbol: "ARB", name: "Arbitrum", glyph: "A", color: "#2ea6ff" },
  { id: "solana", symbol: "SOL", name: "Solana", glyph: "◎", color: "#14f195" },
  { id: "matic-network", symbol: "POL", name: "Polygon", glyph: "⬡", color: "#a06bff" },
  { id: "optimism", symbol: "OP", name: "Optimism", glyph: "O", color: "#ff5d6c" },
];

export const COIN_IDS = COINS.map((c) => c.id);
const META_BY_ID = new Map(COINS.map((c) => [c.id, c]));

export type CoinPrice = {
  id: string;
  symbol: string;
  name: string;
  glyph: string;
  color: string;
  price: number;
  change24h: number; // percent
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  sparkline: number[];
  lastUpdated: string;
};

export type PriceSource = "live" | "cache" | "stale" | "fallback";

export type PricePayload = {
  coins: CoinPrice[];
  source: PriceSource;
  fetchedAt: number; // epoch ms
};

const CG_MARKETS_URL =
  "https://api.coingecko.com/api/v3/coins/markets" +
  `?vs_currency=usd&ids=${COIN_IDS.join(",")}` +
  "&order=market_cap_desc&sparkline=true&price_change_percentage=24h&precision=full";

const TTL_MS = 15_000; // serve cached data within this window
const FETCH_TIMEOUT_MS = 8_000;

type Cache = { payload: PricePayload | null };
const cache: Cache = { payload: null };

type RawMarketCoin = {
  id: string;
  symbol: string;
  name: string;
  current_price: number | null;
  market_cap: number | null;
  total_volume: number | null;
  high_24h: number | null;
  low_24h: number | null;
  price_change_percentage_24h: number | null;
  last_updated: string | null;
  sparkline_in_7d?: { price: number[] };
};

function normalize(raw: RawMarketCoin): CoinPrice {
  const meta = META_BY_ID.get(raw.id);
  return {
    id: raw.id,
    symbol: meta?.symbol ?? raw.symbol.toUpperCase(),
    name: meta?.name ?? raw.name,
    glyph: meta?.glyph ?? raw.symbol.slice(0, 1).toUpperCase(),
    color: meta?.color ?? "#2ea6ff",
    price: raw.current_price ?? 0,
    change24h: raw.price_change_percentage_24h ?? 0,
    marketCap: raw.market_cap ?? 0,
    volume24h: raw.total_volume ?? 0,
    high24h: raw.high_24h ?? 0,
    low24h: raw.low_24h ?? 0,
    sparkline: raw.sparkline_in_7d?.price ?? [],
    lastUpdated: raw.last_updated ?? new Date().toISOString(),
  };
}

/** Keep CoinGecko's market-cap ordering but pin BTC/ETH presence first if tied. */
function sortByConfiguredOrder(coins: CoinPrice[]): CoinPrice[] {
  const order = new Map(COIN_IDS.map((id, i) => [id, i]));
  return [...coins].sort(
    (a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99),
  );
}

async function fetchFromCoinGecko(): Promise<CoinPrice[]> {
  const res = await fetch(CG_MARKETS_URL, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`CoinGecko responded ${res.status}`);
  }
  const raw = (await res.json()) as RawMarketCoin[];
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("CoinGecko returned an empty payload");
  }
  return sortByConfiguredOrder(raw.map(normalize));
}

/**
 * Get current prices. Returns cached data within the TTL, refetches otherwise,
 * and degrades gracefully to stale cache / seed data on failure.
 */
export async function getPrices(force = false): Promise<PricePayload> {
  const now = Date.now();
  const cached = cache.payload;

  if (!force && cached && now - cached.fetchedAt < TTL_MS) {
    return { ...cached, source: "cache" };
  }

  try {
    const coins = await fetchFromCoinGecko();
    const payload: PricePayload = { coins, source: "live", fetchedAt: Date.now() };
    cache.payload = payload;
    return payload;
  } catch {
    if (cached) {
      // Serve the last good data so a transient error / rate-limit is invisible.
      return { ...cached, source: "stale" };
    }
    return { coins: seedFallback(), source: "fallback", fetchedAt: now };
  }
}

/**
 * Static seed used only when CoinGecko is unreachable AND nothing is cached
 * (e.g. fully offline). Values are illustrative so the UI stays presentable.
 */
function seedFallback(): CoinPrice[] {
  const seeds: Record<string, { price: number; change: number; cap: number }> = {
    bitcoin: { price: 67250, change: 1.84, cap: 1_320_000_000_000 },
    ethereum: { price: 3520, change: 2.41, cap: 423_000_000_000 },
    arbitrum: { price: 0.92, change: -1.27, cap: 3_600_000_000 },
    solana: { price: 168, change: 3.92, cap: 78_000_000_000 },
    "matic-network": { price: 0.54, change: -0.61, cap: 5_100_000_000 },
    optimism: { price: 2.18, change: 0.74, cap: 2_400_000_000 },
  };
  return COINS.map((meta) => {
    const s = seeds[meta.id] ?? { price: 1, change: 0, cap: 0 };
    // Build a gently wavy synthetic sparkline around the seed price.
    const sparkline = Array.from({ length: 48 }, (_, i) =>
      Number((s.price * (1 + Math.sin(i / 4) * 0.03)).toFixed(6)),
    );
    return {
      id: meta.id,
      symbol: meta.symbol,
      name: meta.name,
      glyph: meta.glyph,
      color: meta.color,
      price: s.price,
      change24h: s.change,
      marketCap: s.cap,
      volume24h: s.cap * 0.05,
      high24h: s.price * 1.03,
      low24h: s.price * 0.97,
      sparkline,
      lastUpdated: new Date().toISOString(),
    };
  });
}
