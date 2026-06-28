"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, type Variants } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/useReducedMotionSafe";
import {
  OctagonAlert,
  RotateCcw,
  Server,
  ShieldCheck,
  Lock,
  CircleCheck,
  CircleX,
  TriangleAlert,
  LoaderCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import {
  type Block,
  computeHash,
  mineBlock,
  meetsDifficulty,
  targetPrefix,
  GENESIS_PREV_HASH,
} from "@/lib/crypto";
import { BlockCard, type BlockView } from "./BlockCard";
import { ChainConnector } from "./ChainConnector";
import { DifficultyControl } from "./DifficultyControl";
import { type MiningStats } from "./MiningProgress";

/* ----------------------------------------------------------------------------
 * Constants & types
 * ------------------------------------------------------------------------- */

const BLOCK_COUNT = 3;
const DEFAULT_DIFFICULTY = 2;

/**
 * FIXED base timestamp. Each block's timestamp = BASE + index, so the pre-image
 * (and therefore the hash) is fully deterministic — no Date.now() in
 * render/initializers, so the client never disagrees with itself or the server.
 */
const BASE_TIMESTAMP = 1_700_000_000_000;

const INITIAL_DATA = [
  "Genesis block — ChainLab",
  "alice → bob: 5 ETH",
  "bob → carol: 2 ETH",
];

/** Server response shape from /api/verify-chain. */
type ServerBlockResult = {
  index: number;
  hash: string;
  hashValid: boolean;
  linkValid: boolean;
  valid: boolean;
};
type ServerVerdict = {
  chainValid: boolean;
  difficulty: number;
  firstBrokenIndex: number;
  blocks: ServerBlockResult[];
};

type VerifyState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; verdict: ServerVerdict };

/** A fresh, unmined chain. Mining (or the auto-build) links + finds nonces. */
function makeInitialBlocks(): Block[] {
  return Array.from({ length: BLOCK_COUNT }, (_, i) => ({
    index: i,
    data: INITIAL_DATA[i] ?? `Block ${i}`,
    previousHash: GENESIS_PREV_HASH,
    nonce: 0,
    timestamp: BASE_TIMESTAMP + i,
  }));
}

/* ----------------------------------------------------------------------------
 * Motion
 * ------------------------------------------------------------------------- */

const listContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const listItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 0.7, 0.2, 1] },
  },
};

/* ----------------------------------------------------------------------------
 * Component
 * ------------------------------------------------------------------------- */

export function SimulatorClient() {
  const reduce = useReducedMotionSafe();

  // raw chain data (the source of truth we hash from)
  const [blocks, setBlocks] = useState<Block[]>(makeInitialBlocks);
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY);

  // computed hashes, parallel to `blocks`. null = not yet computed (SSR / first
  // paint), because hashing only runs in an effect on the client.
  const [hashes, setHashes] = useState<(string | null)[]>(() =>
    new Array(BLOCK_COUNT).fill(null),
  );

  // which block (if any) is currently mining, plus its live stats + abort ctrl
  const [miningIndex, setMiningIndex] = useState<number | null>(null);
  const [miningStats, setMiningStats] = useState<Record<number, MiningStats>>(
    {},
  );
  const abortRef = useRef<AbortController | null>(null);

  // server verification result
  const [verify, setVerify] = useState<VerifyState>({ status: "idle" });

  /* ----- reactive hashing with race protection -------------------------- */
  // Per-block monotonically increasing request ids: a stale async result whose
  // id is no longer current must NOT overwrite a newer hash.
  const hashReq = useRef<number[]>(new Array(BLOCK_COUNT).fill(0));

  useEffect(() => {
    let cancelled = false;
    for (let i = 0; i < blocks.length; i++) {
      const reqId = ++hashReq.current[i];
      const block = blocks[i];
      computeHash(block).then((hash) => {
        if (cancelled) return;
        if (reqId !== hashReq.current[i]) return; // a newer request superseded us
        setHashes((prev) => {
          if (prev[i] === hash) return prev; // no-op, avoid re-render churn
          const next = prev.slice();
          next[i] = hash;
          return next;
        });
      });
    }
    return () => {
      cancelled = true;
    };
    // re-run whenever any block field changes (data, nonce, previousHash, ts)
  }, [blocks]);

  /* ----- derive per-block validity views -------------------------------- */
  // NOTE: previousHash is a SNAPSHOT taken at mine time (see buildChain/handleMine)
  // — it is NOT auto-propagated. So editing an earlier block genuinely breaks the
  // next block's stored link, exactly like a real chain.
  const views: BlockView[] = useMemo(() => {
    // pass 1 — per-block soundness
    const base = blocks.map((b, i) => {
      const hash = hashes[i];
      const hashValid = hash != null && meetsDifficulty(hash, difficulty);
      const expectedPrev = i === 0 ? GENESIS_PREV_HASH : hashes[i - 1];
      // link valid when this block's stored previousHash equals the actual
      // current hash of the prior block. Optimistically true while that prior
      // hash is still computing (avoids a flash of red on first paint).
      const linkValid =
        expectedPrev == null ? true : b.previousHash === expectedPrev;
      return {
        index: b.index,
        data: b.data,
        previousHash: b.previousHash,
        nonce: b.nonce,
        hash,
        hashValid,
        linkValid,
        selfValid: hashValid && linkValid,
      };
    });
    // pass 2 — cumulative validity: a block is only valid if every block before
    // it is valid too (a break anywhere orphans everything after it).
    const result: BlockView[] = [];
    for (let i = 0; i < base.length; i++) {
      const prevValid = i === 0 ? true : result[i - 1].valid;
      result.push({ ...base[i], valid: base[i].selfValid && prevValid });
    }
    return result;
  }, [blocks, hashes, difficulty]);

  const allComputed = hashes.every((h) => h !== null);
  const chainValid = allComputed && views.every((v) => v.selfValid);
  const firstBrokenIndex = views.findIndex((v) => !v.selfValid);
  // only surface "broken" once everything has hashed and nothing is mining
  const brokenIndex =
    miningIndex === null && allComputed && !chainValid ? firstBrokenIndex : -1;

  /* ----- build / mine --------------------------------------------------- */

  /** Mine the whole chain from scratch so it loads (or resets) in a valid state. */
  const buildChain = useCallback(async (diff: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setVerify({ status: "idle" });
    setMiningStats({});
    setBlocks(makeInitialBlocks());
    setHashes(new Array(BLOCK_COUNT).fill(null));

    let prev = GENESIS_PREV_HASH;
    try {
      for (let i = 0; i < BLOCK_COUNT; i++) {
        setMiningIndex(i);
        setMiningStats((s) => ({ ...s, [i]: { nonce: 0, hash: "", attempts: 0 } }));
        const snapshotPrev = prev;
        const base: Block = {
          index: i,
          data: INITIAL_DATA[i] ?? `Block ${i}`,
          previousHash: snapshotPrev,
          nonce: 0,
          timestamp: BASE_TIMESTAMP + i,
        };
        const result = await mineBlock(base, {
          difficulty: diff,
          signal: controller.signal,
          onProgress: ({ nonce, hash, attempts }) =>
            setMiningStats((s) => ({ ...s, [i]: { nonce, hash, attempts } })),
        });
        setBlocks((p) =>
          p.map((b) =>
            b.index === i
              ? { ...b, previousHash: snapshotPrev, nonce: result.nonce }
              : b,
          ),
        );
        setMiningStats((s) => ({
          ...s,
          [i]: {
            nonce: result.nonce,
            hash: result.hash,
            attempts: result.attempts,
            durationMs: result.durationMs,
          },
        }));
        prev = result.hash;
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        setVerify({
          status: "error",
          message: err instanceof Error ? err.message : "Build failed.",
        });
      }
    } finally {
      setMiningIndex(null);
      abortRef.current = null;
    }
  }, []);

  // Auto-build a valid chain once on mount (guarded against StrictMode double-run)
  // so visitors land on a green, working chain instead of an all-red one.
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    buildChain(DEFAULT_DIFFICULTY);
  }, [buildChain]);

  /* ----- handlers ------------------------------------------------------- */

  const handleDataChange = useCallback((index: number, value: string) => {
    // Editing data changes this block's hash (breaking its own PoW) and, because
    // previousHash is a snapshot, breaks the NEXT block's stored link too.
    setBlocks((prev) =>
      prev.map((b) => (b.index === index ? { ...b, data: value } : b)),
    );
    setVerify({ status: "idle" });
  }, []);

  const handleMine = useCallback(
    async (index: number) => {
      if (miningIndex !== null) return; // one mine at a time

      // Snapshot the previous block's CURRENT hash into this block's link, then
      // mine. (Re-link first so re-mining after a tamper also repairs the link.)
      let snapshotPrev = GENESIS_PREV_HASH;
      if (index > 0) {
        snapshotPrev = hashes[index - 1] ?? (await computeHash(blocks[index - 1]));
      }

      const controller = new AbortController();
      abortRef.current = controller;
      setMiningIndex(index);
      setVerify({ status: "idle" });
      setMiningStats((s) => ({ ...s, [index]: { nonce: 0, hash: "", attempts: 0 } }));

      const target: Block = { ...blocks[index], previousHash: snapshotPrev };
      // reflect the (possibly new) link immediately in the UI
      setBlocks((prev) =>
        prev.map((b) =>
          b.index === index ? { ...b, previousHash: snapshotPrev } : b,
        ),
      );

      try {
        const result = await mineBlock(target, {
          difficulty,
          signal: controller.signal,
          onProgress: ({ nonce, hash, attempts }) =>
            setMiningStats((s) => ({ ...s, [index]: { nonce, hash, attempts } })),
        });
        setBlocks((prev) =>
          prev.map((b) =>
            b.index === index
              ? { ...b, previousHash: snapshotPrev, nonce: result.nonce }
              : b,
          ),
        );
        setMiningStats((s) => ({
          ...s,
          [index]: {
            nonce: result.nonce,
            hash: result.hash,
            attempts: result.attempts,
            durationMs: result.durationMs,
          },
        }));
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setVerify({
            status: "error",
            message:
              err instanceof Error ? err.message : "Mining failed unexpectedly.",
          });
        }
      } finally {
        setMiningIndex(null);
        abortRef.current = null;
      }
    },
    [blocks, hashes, difficulty, miningIndex],
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleReset = useCallback(() => {
    setDifficulty(DEFAULT_DIFFICULTY);
    buildChain(DEFAULT_DIFFICULTY);
  }, [buildChain]);

  const handleDifficultyChange = useCallback((value: number) => {
    // Changing difficulty can invalidate already-mined blocks (their hash may no
    // longer have enough leading zeros) — that's intentional; re-mine to fix.
    setDifficulty(value);
    setVerify({ status: "idle" });
  }, []);

  const handleVerify = useCallback(async () => {
    setVerify({ status: "loading" });
    try {
      const res = await fetch("/api/verify-chain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks, difficulty }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Server responded ${res.status}.`);
      }
      const verdict = (await res.json()) as ServerVerdict;
      setVerify({ status: "done", verdict });
    } catch (err) {
      setVerify({
        status: "error",
        message:
          err instanceof Error
            ? err.message
            : "Could not reach the verification server.",
      });
    }
  }, [blocks, difficulty]);

  /* ----- render --------------------------------------------------------- */

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionHeading
        eyebrow="Proof of Work · Live"
        align="left"
        title={
          <>
            Mine blocks, then{" "}
            <span className="text-gradient-brand">break the chain</span>
          </>
        }
        subtitle="Each block is hashed with real SHA-256. Find a nonce whose hash starts with enough zeros to mine it, then tamper with any block's data and watch every block after it turn red. That's immutability — you can change history, but the math gives you away."
      />

      {/* live status pills */}
      <Reveal delay={0.05} className="mt-6 flex flex-wrap items-center gap-2.5">
        <Badge variant="primary">
          <span className="font-mono tnum">target {targetPrefix(difficulty)}…</span>
        </Badge>
        {miningIndex !== null ? (
          <Badge variant="primary">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
            mining block #{miningIndex}…
          </Badge>
        ) : !allComputed ? (
          <Badge variant="outline">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
            hashing chain…
          </Badge>
        ) : chainValid ? (
          <Badge variant="success">
            <ShieldCheck className="h-3.5 w-3.5" />
            chain valid
          </Badge>
        ) : (
          <Badge variant="danger">
            <TriangleAlert className="h-3.5 w-3.5" />
            chain broken
          </Badge>
        )}
        <span className="font-mono text-xs text-muted">
          {BLOCK_COUNT} blocks · SHA-256
        </span>
      </Reveal>

      {/* broken-chain banner */}
      {brokenIndex >= 0 && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-2xl border border-danger/40 bg-danger/[0.08] p-4"
        >
          <OctagonAlert className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
          <div>
            <p className="text-sm font-semibold text-danger">
              Chain broken at block #{brokenIndex} — re-mine to repair.
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">
              Block #{brokenIndex}&apos;s contents no longer satisfy the
              difficulty (or its link no longer matches the block above)
              {brokenIndex < BLOCK_COUNT - 1
                ? `, so every block after it is orphaned too. Re-mine #${brokenIndex}, then each later block in order, to make the chain valid again.`
                : ". Re-mine it to make the chain valid again."}
            </p>
          </div>
        </motion.div>
      )}

      {/* main layout: chain + control rail */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        {/* ----- the chain of blocks ----- */}
        <motion.div
          variants={reduce ? undefined : listContainer}
          initial={reduce ? false : "hidden"}
          animate={reduce ? undefined : "show"}
        >
          {views.map((view, i) => (
            <div key={view.index}>
              {i > 0 && (
                <ChainConnector linked={view.linkValid && views[i - 1].valid} />
              )}
              <motion.div
                variants={reduce ? undefined : listItem}
                initial={reduce ? false : undefined}
                animate={reduce ? { opacity: 1, y: 0 } : undefined}
              >
                <BlockCard
                  block={view}
                  difficulty={difficulty}
                  mining={miningIndex === view.index}
                  miningStats={miningStats[view.index] ?? null}
                  onDataChange={(value) => handleDataChange(view.index, value)}
                  onMine={() => handleMine(view.index)}
                  onStop={handleStop}
                />
              </motion.div>
            </div>
          ))}
        </motion.div>

        {/* ----- control rail ----- */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-24">
          <DifficultyControl
            difficulty={difficulty}
            onChange={handleDifficultyChange}
            disabled={miningIndex !== null}
          />

          {/* actions */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-display text-sm font-bold tracking-tight">
              Actions
            </h3>
            <div className="mt-3 flex flex-col gap-2.5">
              <Button
                type="button"
                variant="primary"
                onClick={handleVerify}
                disabled={
                  !allComputed ||
                  miningIndex !== null ||
                  verify.status === "loading"
                }
                aria-label="Verify the chain on the server"
              >
                {verify.status === "loading" ? (
                  <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                ) : (
                  <Server className="h-4 w-4" />
                )}
                Verify on server
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={miningIndex !== null}
                aria-label="Reset the simulator"
              >
                <RotateCcw className="h-4 w-4" />
                Reset chain
              </Button>
            </div>

            <ServerVerdictPanel state={verify} />
          </div>

          {/* immutability explainer */}
          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent-violet/12 text-accent-violet">
                <Lock className="h-5 w-5" />
              </span>
              <h3 className="font-display text-sm font-bold tracking-tight">
                Why this makes a chain immutable
              </h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Every block&apos;s hash is computed from its data{" "}
              <span className="text-muted-strong">and</span> the previous
              block&apos;s hash, which it stores as a snapshot. Change one byte
              anywhere and that block&apos;s hash changes, which breaks the next
              block&apos;s stored link, which orphans the one after that — all the
              way down. To rewrite history an attacker would have to re-mine every
              block from the tamper point forward, faster than the rest of the
              network can extend the honest chain. On a real network that&apos;s
              economically impossible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Server verdict sub-panel (loading / error / done)
 * ------------------------------------------------------------------------- */

function ServerVerdictPanel({ state }: { state: VerifyState }) {
  if (state.status === "idle") {
    return (
      <p className="mt-3 text-[0.7rem] leading-relaxed text-muted">
        The server independently re-hashes every block from its raw fields —
        proving the result isn&apos;t faked in your browser.
      </p>
    );
  }

  if (state.status === "loading") {
    return (
      <div
        role="status"
        className="mt-3 flex items-center gap-2 text-xs text-muted"
      >
        <LoaderCircle className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
        Asking the server to recompute the chain…
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div
        role="alert"
        className="mt-3 flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/[0.08] p-3 text-xs text-danger"
      >
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{state.message}</span>
      </div>
    );
  }

  const { verdict } = state;
  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-3 rounded-xl border border-border bg-background/40 p-3"
    >
      <div className="flex items-center gap-2">
        {verdict.chainValid ? (
          <>
            <CircleCheck className="h-4 w-4 text-success" />
            <span className="text-xs font-semibold text-success">
              Server confirms: chain valid
            </span>
          </>
        ) : (
          <>
            <CircleX className="h-4 w-4 text-danger" />
            <span className="text-xs font-semibold text-danger">
              Server confirms: chain invalid
              {verdict.firstBrokenIndex >= 0
                ? ` at #${verdict.firstBrokenIndex}`
                : ""}
            </span>
          </>
        )}
      </div>
      <ul className="mt-2.5 space-y-1.5">
        {verdict.blocks.map((b) => (
          <li
            key={b.index}
            className="flex items-center justify-between gap-2 font-mono tnum text-[0.7rem]"
          >
            <span className="text-muted">block #{b.index}</span>
            <span className="flex items-center gap-2">
              <span className={b.hashValid ? "text-success" : "text-danger"}>
                pow {b.hashValid ? "ok" : "fail"}
              </span>
              <span className={b.linkValid ? "text-success" : "text-danger"}>
                link {b.linkValid ? "ok" : "fail"}
              </span>
              {b.valid ? (
                <CircleCheck className="h-3.5 w-3.5 text-success" />
              ) : (
                <CircleX className="h-3.5 w-3.5 text-danger" />
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
