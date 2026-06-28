import { getPrices } from "@/lib/coingecko";

// Always run on the server at request time; our own TTL cache (in lib/coingecko)
// controls how often CoinGecko is actually hit.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/prices        -> cached-within-TTL price payload
 * GET /api/prices?force=1 -> bypass the TTL and refetch now (used by Refresh)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const force =
    searchParams.get("force") === "true" || searchParams.get("force") === "1";

  try {
    const payload = await getPrices(force);
    return Response.json(payload, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "Unable to load prices right now. Please try again." },
      { status: 502 },
    );
  }
}
