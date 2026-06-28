/**
 * Qwen / Alibaba Wan asset generator (DashScope, International endpoint).
 *
 * Generates the site's image assets via the DashScope text-to-image API and
 * downloads them into public/generated/. Pure Node (global fetch), no deps.
 *
 * SETUP
 *   1. Get a DashScope (Alibaba Cloud Model Studio, International) API key.
 *   2. Put it in arbitrum-builder-lab/.env.local  (gitignored):
 *         DASHSCOPE_API_KEY=sk-xxxxxxxx
 *      ...or export it in your shell.
 *
 * RUN
 *   node --env-file=.env.local scripts/gen-assets.mjs            # all images
 *   node --env-file=.env.local scripts/gen-assets.mjs hero       # one group
 *
 * NOTES
 *   - Model names evolve. Override with  MODEL=wan2.2-t2i-flash  (default below).
 *     Known options: wan2.2-t2i-flash, wan2.2-t2i-plus, wanx2.1-t2i-turbo.
 *   - On any API error the raw response is printed so the model/size can be
 *     adjusted quickly.
 */

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const API_KEY = process.env.DASHSCOPE_API_KEY;
const BASE =
  process.env.DASHSCOPE_BASE_URL ?? "https://dashscope-intl.aliyuncs.com/api/v1";
const MODEL = process.env.MODEL ?? "wan2.2-t2i-flash";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "generated");

const STYLE =
  "premium dark UI background art, deep near-black backdrop, scarlet red and " +
  "ember orange accents only, cinematic volumetric glow, subtle film grain, " +
  "high detail, 3d render, no text, no logos, no watermark";

const NEGATIVE =
  "text, words, watermark, logo, signature, blurry, low quality, jpeg artifacts, " +
  "people, faces, busy clutter, rainbow colors, blue, purple, green";

/** Each item -> one downloaded PNG in public/generated/<file>. */
const ASSETS = {
  hero: [
    {
      file: "hero-mesh.png",
      size: "1440*1440",
      prompt:
        "abstract blockchain network of interconnected glowing nodes and cubes " +
        "receding into darkness with depth of field, flowing data streams, " +
        `${STYLE}`,
    },
    {
      file: "hero-chain.png",
      size: "1440*1440",
      prompt:
        "a chain of glowing translucent cubes linked together floating in dark " +
        `space, isometric, energy connections between blocks, ${STYLE}`,
    },
  ],
  icons: [
    {
      file: "icon-concepts.png",
      size: "1024*1024",
      prompt: `minimal 3d icon of two comparison cards side by side, ${STYLE}`,
    },
    {
      file: "icon-prices.png",
      size: "1024*1024",
      prompt: `minimal 3d icon of an upward candlestick price chart, ${STYLE}`,
    },
    {
      file: "icon-simulator.png",
      size: "1024*1024",
      prompt: `minimal 3d icon of a glowing mined block cube with a hash, ${STYLE}`,
    },
  ],
};

function requireKey() {
  if (!API_KEY) {
    console.error(
      "\n[gen-assets] DASHSCOPE_API_KEY is not set.\n" +
        "  Add it to .env.local and run:\n" +
        "    node --env-file=.env.local scripts/gen-assets.mjs\n",
    );
    process.exit(1);
  }
}

async function submitTask(prompt, size) {
  const res = await fetch(
    `${BASE}/services/aigc/text2image/image-synthesis`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable",
      },
      body: JSON.stringify({
        model: MODEL,
        input: { prompt, negative_prompt: NEGATIVE },
        parameters: { size, n: 1 },
      }),
    },
  );
  const body = await res.json();
  if (!res.ok || !body?.output?.task_id) {
    throw new Error(`submit failed (${res.status}): ${JSON.stringify(body)}`);
  }
  return body.output.task_id;
}

async function pollTask(taskId) {
  // up to ~3 minutes
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await fetch(`${BASE}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    const body = await res.json();
    const status = body?.output?.task_status;
    if (status === "SUCCEEDED") {
      const url = body?.output?.results?.[0]?.url;
      if (!url) throw new Error(`no url in result: ${JSON.stringify(body)}`);
      return url;
    }
    if (status === "FAILED" || status === "UNKNOWN") {
      throw new Error(`task ${status}: ${JSON.stringify(body)}`);
    }
    process.stdout.write(".");
  }
  throw new Error("timed out waiting for task");
}

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed (${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  const dest = join(OUT_DIR, file);
  await writeFile(dest, buf);
  console.log(`  saved public/generated/${file} (${(buf.length / 1024).toFixed(0)} KB)`);
}

async function main() {
  requireKey();
  await mkdir(OUT_DIR, { recursive: true });

  const groupArg = process.argv[2];
  const groups = groupArg ? [groupArg] : Object.keys(ASSETS);

  for (const group of groups) {
    const items = ASSETS[group];
    if (!items) {
      console.warn(`[gen-assets] unknown group "${group}" — skipping`);
      continue;
    }
    console.log(`\n[${group}] generating ${items.length} asset(s) with ${MODEL}…`);
    for (const item of items) {
      try {
        process.stdout.write(`  ${item.file} `);
        const taskId = await submitTask(item.prompt, item.size);
        const url = await pollTask(taskId);
        console.log(" done");
        await download(url, item.file);
      } catch (err) {
        console.error(`\n  ! ${item.file} failed: ${err.message}`);
      }
    }
  }
  console.log("\n[gen-assets] complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
