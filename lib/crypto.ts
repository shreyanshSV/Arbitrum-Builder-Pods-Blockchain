/**
 * Hashing + proof-of-work helpers for the Block Simulator.
 *
 * Uses the Web Crypto API (SHA-256) which is available both in modern browsers
 * and in the Node.js runtime (globalThis.crypto.subtle), so the exact same code
 * powers the client-side miner AND the server-side chain verifier — guaranteeing
 * the two always agree on what a "valid" block is.
 */

export type Block = {
  index: number;
  data: string;
  previousHash: string;
  nonce: number;
  /** epoch ms — kept fixed once mined so the hash is reproducible */
  timestamp: number;
};

/** The genesis previous-hash: 64 zeros, the conventional "start of chain". */
export const GENESIS_PREV_HASH = "0".repeat(64);

const encoder = new TextEncoder();

/** SHA-256 of a string, returned as lowercase hex. */
export async function sha256Hex(input: string): Promise<string> {
  const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

/** Deterministic string representation of a block (the pre-image we hash). */
export function serializeBlock(block: Block): string {
  return `${block.index}|${block.timestamp}|${block.data}|${block.previousHash}|${block.nonce}`;
}

/** Compute a block's SHA-256 hash from its fields. */
export function computeHash(block: Block): Promise<string> {
  return sha256Hex(serializeBlock(block));
}

/** The required hash prefix for a given difficulty (number of leading zeros). */
export function targetPrefix(difficulty: number): string {
  return "0".repeat(Math.max(0, difficulty));
}

/** A hash satisfies proof-of-work when it starts with `difficulty` zeros. */
export function meetsDifficulty(hash: string, difficulty: number): boolean {
  return hash.startsWith(targetPrefix(difficulty));
}

export type MineProgress = {
  nonce: number;
  hash: string;
  attempts: number;
};

export type MineResult = {
  nonce: number;
  hash: string;
  attempts: number;
  durationMs: number;
};

export type MineOptions = {
  difficulty: number;
  /** called periodically so the UI can show the nonce/hash rolling */
  onProgress?: (progress: MineProgress) => void;
  /** abort an in-flight mine (e.g. user clicked stop) */
  signal?: AbortSignal;
  /** hashes per batch before yielding to the event loop (keeps UI responsive) */
  batchSize?: number;
  /** nonce to start from (defaults to 0) */
  startNonce?: number;
};

/**
 * Proof-of-work miner: increments the nonce until the block hash starts with
 * the required number of zeros. Yields to the event loop between batches so the
 * page stays interactive and progress can animate.
 */
export async function mineBlock(
  block: Block,
  { difficulty, onProgress, signal, batchSize = 750, startNonce = 0 }: MineOptions,
): Promise<MineResult> {
  const start = performance.now();
  let nonce = startNonce;
  let attempts = 0;

  // Guard against runaway loops on very high difficulty. Scales with difficulty
  // so the UI-supported range (1–5) effectively never hits the ceiling by bad
  // luck — at difficulty 5 the expected work is ~1M hashes, well under this.
  const MAX_ATTEMPTS = Math.max(5_000_000, 16 ** difficulty * 40);

  while (attempts < MAX_ATTEMPTS) {
    for (let i = 0; i < batchSize; i++) {
      if (signal?.aborted) {
        throw new DOMException("Mining aborted", "AbortError");
      }
      const candidate: Block = { ...block, nonce };
      const hash = await computeHash(candidate);
      attempts++;

      if (meetsDifficulty(hash, difficulty)) {
        onProgress?.({ nonce, hash, attempts });
        return { nonce, hash, attempts, durationMs: performance.now() - start };
      }

      if (i === batchSize - 1) {
        onProgress?.({ nonce, hash, attempts });
      }
      nonce++;
    }
    // Yield so the browser can paint progress and stay responsive.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  throw new Error("Mining exceeded the maximum attempt budget.");
}
