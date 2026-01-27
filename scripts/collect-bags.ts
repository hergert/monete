#!/usr/bin/env bun
/**
 * Collect Bags launch fixtures from Helius API
 * Fetches real transactions from the Fee Share V1 program
 */

import { mkdir, writeFile, readdir } from "fs/promises";
import { join } from "path";

const BAGS_FEE_SHARE_V1 = "FEEhPbKVKnco9EXnaY3i4R5rQVUx91wgVfu8qokixywi";
const METEORA_DBC = "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN";

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
if (!HELIUS_API_KEY) {
  console.error("ERROR: HELIUS_API_KEY not set in environment");
  process.exit(1);
}

const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const FIXTURES_DIR = join(import.meta.dir, "..", "data", "fixtures", "bags");

// Target count for fixtures
const TARGET_COUNT = 10;

interface HeliusSignature {
  signature: string;
  slot: number;
  blockTime: number;
  err: unknown | null;
}

interface GetSignaturesResponse {
  result: HeliusSignature[];
}

interface GetTransactionResponse {
  result: unknown;
}

async function rpcCall<T>(method: string, params: unknown[]): Promise<T> {
  const response = await fetch(HELIUS_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`RPC error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as T;
  return data;
}

async function getSignaturesForAddress(
  address: string,
  limit: number,
  before?: string
): Promise<HeliusSignature[]> {
  const params: Record<string, unknown> = { limit };
  if (before) params.before = before;

  const response = await rpcCall<GetSignaturesResponse>(
    "getSignaturesForAddress",
    [address, params]
  );
  return response.result || [];
}

async function getTransaction(signature: string): Promise<unknown> {
  const response = await rpcCall<GetTransactionResponse>("getTransaction", [
    signature,
    {
      encoding: "json",
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    },
  ]);
  return response.result;
}

function extractPrograms(tx: unknown): Set<string> {
  const programs = new Set<string>();

  try {
    const txData = tx as {
      transaction?: {
        message?: {
          accountKeys?: string[];
          staticAccountKeys?: string[];
        };
      };
      meta?: {
        loadedAddresses?: {
          readonly?: string[];
          writable?: string[];
        };
        innerInstructions?: Array<{
          instructions?: Array<{ programIdIndex?: number }>;
        }>;
      };
    };

    // Account keys from main message
    const accountKeys =
      txData.transaction?.message?.accountKeys ||
      txData.transaction?.message?.staticAccountKeys ||
      [];
    for (const key of accountKeys) {
      if (typeof key === "string") {
        programs.add(key);
      }
    }

    // Loaded addresses (versioned transactions)
    const loadedAddresses = txData.meta?.loadedAddresses;
    if (loadedAddresses) {
      for (const key of loadedAddresses.readonly || []) {
        programs.add(key);
      }
      for (const key of loadedAddresses.writable || []) {
        programs.add(key);
      }
    }
  } catch {
    // Ignore extraction errors
  }

  return programs;
}

function isBagsLaunch(tx: unknown): boolean {
  const programs = extractPrograms(tx);
  return programs.has(BAGS_FEE_SHARE_V1) && programs.has(METEORA_DBC);
}

async function countExistingFixtures(): Promise<number> {
  try {
    const files = await readdir(FIXTURES_DIR);
    return files.filter((f) => f.endsWith(".json") && f !== ".gitkeep").length;
  } catch {
    return 0;
  }
}

async function main() {
  console.log("Collecting Bags launch fixtures from Helius...");
  console.log(`Target: ${TARGET_COUNT} fixtures`);
  console.log(`Output: ${FIXTURES_DIR}`);
  console.log("");

  // Ensure directory exists
  await mkdir(FIXTURES_DIR, { recursive: true });

  const existingCount = await countExistingFixtures();
  console.log(`Existing fixtures: ${existingCount}`);

  if (existingCount >= TARGET_COUNT) {
    console.log("Already have enough fixtures.");
    return;
  }

  const needed = TARGET_COUNT - existingCount;
  console.log(`Need to collect: ${needed} more`);
  console.log("");

  // Fetch signatures from Fee Share V1 program
  console.log(`Fetching signatures from ${BAGS_FEE_SHARE_V1}...`);

  const collected: { signature: string; tx: unknown }[] = [];
  let before: string | undefined;
  let attempts = 0;
  const maxAttempts = 10; // Avoid infinite loops

  while (collected.length < needed && attempts < maxAttempts) {
    attempts++;
    console.log(`Batch ${attempts}: fetching signatures...`);

    const signatures = await getSignaturesForAddress(
      BAGS_FEE_SHARE_V1,
      100,
      before
    );

    if (signatures.length === 0) {
      console.log("No more signatures available.");
      break;
    }

    console.log(`  Got ${signatures.length} signatures`);

    // Filter successful transactions
    const successful = signatures.filter((s) => s.err === null);
    console.log(`  Successful: ${successful.length}`);

    // Fetch transaction details and filter for Bags launches
    for (const sig of successful) {
      if (collected.length >= needed) break;

      try {
        const tx = await getTransaction(sig.signature);
        if (!tx) continue;

        if (isBagsLaunch(tx)) {
          collected.push({ signature: sig.signature, tx });
          console.log(
            `  Found Bags launch: ${sig.signature.slice(0, 16)}... (${collected.length}/${needed})`
          );
        }
      } catch (err) {
        console.log(`  Error fetching ${sig.signature.slice(0, 16)}...: ${err}`);
      }

      // Rate limit: small delay between requests
      await new Promise((r) => setTimeout(r, 100));
    }

    // Use last signature for pagination
    before = signatures[signatures.length - 1].signature;
  }

  console.log("");
  console.log(`Collected ${collected.length} Bags launch transactions`);

  // Save to files
  for (let i = 0; i < collected.length; i++) {
    const idx = existingCount + i + 1;
    const filename = `bags_${String(idx).padStart(2, "0")}.json`;
    const filepath = join(FIXTURES_DIR, filename);

    const fixture = {
      _meta: {
        source: "helius",
        collected_at: new Date().toISOString(),
        signature: collected[i].signature,
      },
      ...collected[i].tx,
    };

    await writeFile(filepath, JSON.stringify(fixture, null, 2));
    console.log(`Saved: ${filename}`);
  }

  const totalCount = existingCount + collected.length;
  console.log("");
  console.log(`Total fixtures: ${totalCount}/${TARGET_COUNT}`);

  if (totalCount < TARGET_COUNT) {
    console.log(
      `WARNING: Only collected ${totalCount} fixtures, need ${TARGET_COUNT}`
    );
    process.exit(1);
  }

  console.log("Done!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
