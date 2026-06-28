import {
  computeHash,
  meetsDifficulty,
  GENESIS_PREV_HASH,
  type Block,
} from "@/lib/crypto";

export const runtime = "nodejs";

const MAX_BLOCKS = 24;
const MAX_DATA_LEN = 2000;

type VerifyBody = {
  blocks?: unknown;
  difficulty?: unknown;
};

type BlockResult = {
  index: number;
  hash: string;
  hashValid: boolean; // satisfies proof-of-work for the difficulty
  linkValid: boolean; // previousHash matches the recomputed prior block hash
  valid: boolean;
};

function isBlock(value: unknown): value is Block {
  if (typeof value !== "object" || value === null) return false;
  const b = value as Record<string, unknown>;
  return (
    typeof b.index === "number" &&
    typeof b.data === "string" &&
    typeof b.previousHash === "string" &&
    typeof b.nonce === "number" &&
    typeof b.timestamp === "number" &&
    b.data.length <= MAX_DATA_LEN
  );
}

/**
 * POST /api/verify-chain
 * Body: { blocks: Block[], difficulty: number }
 *
 * Independently RE-COMPUTES every hash on the server from the raw block fields
 * (it ignores any client-supplied hash) and checks two things per block:
 *   1. proof-of-work  — recomputed hash starts with `difficulty` zeros
 *   2. linkage        — stored previousHash equals the prior block's real hash
 * This is the trustless verification a real node performs: the chain is only
 * valid if the data itself produces the claimed, properly-linked hashes.
 */
export async function POST(request: Request) {
  let body: VerifyBody;
  try {
    body = (await request.json()) as VerifyBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const difficulty =
    typeof body.difficulty === "number" &&
    body.difficulty >= 1 &&
    body.difficulty <= 6
      ? Math.floor(body.difficulty)
      : 2;

  if (!Array.isArray(body.blocks) || body.blocks.length === 0) {
    return Response.json(
      { error: "`blocks` must be a non-empty array." },
      { status: 400 },
    );
  }
  if (body.blocks.length > MAX_BLOCKS) {
    return Response.json(
      { error: `Too many blocks (max ${MAX_BLOCKS}).` },
      { status: 400 },
    );
  }
  if (!body.blocks.every(isBlock)) {
    return Response.json(
      { error: "One or more blocks are malformed." },
      { status: 400 },
    );
  }

  const blocks = body.blocks as Block[];
  const results: BlockResult[] = [];
  let expectedPrev = GENESIS_PREV_HASH;

  for (const block of blocks) {
    const hash = await computeHash(block);
    const hashValid = meetsDifficulty(hash, difficulty);
    const linkValid = block.previousHash === expectedPrev;
    results.push({
      index: block.index,
      hash,
      hashValid,
      linkValid,
      valid: hashValid && linkValid,
    });
    expectedPrev = hash;
  }

  const chainValid = results.every((r) => r.valid);
  const firstBrokenIndex = results.findIndex((r) => !r.valid);

  return Response.json(
    { chainValid, difficulty, firstBrokenIndex, blocks: results },
    { headers: { "Cache-Control": "no-store" } },
  );
}
