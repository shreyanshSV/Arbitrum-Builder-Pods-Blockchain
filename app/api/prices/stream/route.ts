import { getPrices } from "@/lib/coingecko";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PUSH_INTERVAL_MS = 12_000;
const HEARTBEAT_MS = 25_000;

/**
 * GET /api/prices/stream — Server-Sent Events.
 *
 * Pushes a fresh price payload every ~12s over a single long-lived connection,
 * so the dashboard updates in real time without the client polling. Heartbeat
 * comments keep proxies from closing an idle connection.
 */
export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let active = true;

      const safeEnqueue = (chunk: string) => {
        if (!active) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          active = false;
        }
      };

      const sendData = async () => {
        try {
          const payload = await getPrices();
          safeEnqueue(`event: prices\ndata: ${JSON.stringify(payload)}\n\n`);
        } catch {
          safeEnqueue(`event: error\ndata: "stream fetch failed"\n\n`);
        }
      };

      // Initial burst so the client renders immediately on connect.
      await sendData();

      const dataTimer = setInterval(sendData, PUSH_INTERVAL_MS);
      const beatTimer = setInterval(
        () => safeEnqueue(`: keepalive ${Date.now()}\n\n`),
        HEARTBEAT_MS,
      );

      const cleanup = () => {
        active = false;
        clearInterval(dataTimer);
        clearInterval(beatTimer);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      request.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
