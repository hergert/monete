#!/usr/bin/env bun
/**
 * Collect holder fixtures from Helius API
 * Fetches token holder snapshots for Bags tokens (for toxicity checks)
 */

import { mkdir, writeFile, readdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { existsSync } from "fs";

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
if (!HELIUS_API_KEY) {
  console.error("ERROR: HELIUS_API_KEY not set in environment");
  console.error("Set it in .env or export it before running this script");
  process.exit(1);
}

const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const BAGS_FIXTURES_DIR = join(dirname(import.meta.dir), "data", "fixtures", "bags");
const HOLDERS_DIR = join(dirname(import.meta.dir), "data", "fixtures", "holders");

// Target count = at least one per bags fixture
const TARGET_COUNT = 10;

// Allow multiple snapshots per mint (holder data changes over time)
const ALLOW_DUPLICATE_MINTS = true;

interface TokenAccount {
  address: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  uiAmountString: string;
}

interface LargestAccountsResponse {
  context: {
    slot: number;
  };
  value: TokenAccount[];
}

interface HolderFixture {
  mint: string;
  slot: number;
  block_time: number;
  total_supply_estimate: number;
  largest_accounts: Array<{
    address: string;
    amount: number;
    percentage: number;
  }>;
  concentration: {
    top_holder_pct: number;
    top_5_holders_pct: number;
    top_10_holders_pct: number;
  };
  _meta: {
    source: string;
    collected_at: string;
  };
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

  const data = (await response.json()) as { result: T; error?: { message: string } };
  if (data.error) {
    throw new Error(`RPC error: ${data.error.message}`);
  }
  return data.result;
}

async function getMintDataFromBagsFixtures(): Promise<Array<{ mint: string; slot: number; blockTime: number }>> {
  const data: Array<{ mint: string; slot: number; blockTime: number }> = [];

  if (!existsSync(BAGS_FIXTURES_DIR)) {
    console.log("No bags fixtures directory found");
    return data;
  }

  const files = await readdir(BAGS_FIXTURES_DIR);
  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    try {
      const content = await readFile(join(BAGS_FIXTURES_DIR, file), "utf-8");
      const fixture = JSON.parse(content);

      // Extract mint from token balances
      const balances = fixture.meta?.postTokenBalances || [];
      for (const balance of balances) {
        if (balance.mint && balance.mint !== "So11111111111111111111111111111111111111112") {
          data.push({
            mint: balance.mint,
            slot: fixture.slot,
            blockTime: fixture.blockTime,
          });
          break; // One mint per fixture
        }
      }
    } catch (e) {
      console.error(`Error reading ${file}: ${e}`);
    }
  }

  return data;
}

async function getLargestAccounts(mint: string): Promise<LargestAccountsResponse | null> {
  try {
    const result = await rpcCall<LargestAccountsResponse>("getTokenLargestAccounts", [
      mint,
      { commitment: "confirmed" },
    ]);
    return result;
  } catch {
    return null;
  }
}

async function countExistingFixtures(): Promise<number> {
  try {
    const files = await readdir(HOLDERS_DIR);
    return files.filter((f) => f.endsWith(".json")).length;
  } catch {
    return 0;
  }
}

async function main() {
  console.log("Collecting holder fixtures from Helius...");
  console.log(`Target: ${TARGET_COUNT} fixtures`);
  console.log(`Output: ${HOLDERS_DIR}`);
  console.log("");

  // Ensure directory exists
  await mkdir(HOLDERS_DIR, { recursive: true });

  const existingCount = await countExistingFixtures();
  console.log(`Existing fixtures: ${existingCount}`);

  if (existingCount >= TARGET_COUNT) {
    console.log("Already have enough fixtures.");
    return;
  }

  const needed = TARGET_COUNT - existingCount;
  console.log(`Need to collect: ${needed} more`);
  console.log("");

  // Get mints from bags fixtures
  console.log("Extracting mints from bags fixtures...");
  const mintData = await getMintDataFromBagsFixtures();
  console.log(`Found ${mintData.length} mints to query`);

  if (mintData.length === 0) {
    console.log("No mints found in bags fixtures. Run collect-bags.ts first.");
    process.exit(1);
  }

  const collected: HolderFixture[] = [];

  // For each mint, get largest accounts
  for (const { mint, slot, blockTime } of mintData) {
    if (collected.length >= needed) break;

    console.log(`\nQuerying holders for mint: ${mint.slice(0, 16)}...`);

    try {
      const result = await getLargestAccounts(mint);

      if (result && result.value.length > 0) {
        // Calculate total from largest accounts (approximation)
        const totalSupply = result.value.reduce((sum, acc) => sum + acc.uiAmount, 0);

        const largestAccounts = result.value.slice(0, 10).map((acc) => ({
          address: acc.address,
          amount: acc.uiAmount,
          percentage: totalSupply > 0 ? (acc.uiAmount / totalSupply) * 100 : 0,
        }));

        const top1 = largestAccounts[0]?.percentage || 0;
        const top5 = largestAccounts.slice(0, 5).reduce((s, a) => s + a.percentage, 0);
        const top10 = largestAccounts.reduce((s, a) => s + a.percentage, 0);

        const fixture: HolderFixture = {
          mint,
          slot: result.context.slot,
          block_time: blockTime,
          total_supply_estimate: totalSupply,
          largest_accounts: largestAccounts,
          concentration: {
            top_holder_pct: Math.round(top1 * 100) / 100,
            top_5_holders_pct: Math.round(top5 * 100) / 100,
            top_10_holders_pct: Math.round(top10 * 100) / 100,
          },
          _meta: {
            source: "helius",
            collected_at: new Date().toISOString(),
          },
        };

        collected.push(fixture);
        console.log(
          `  Got ${result.value.length} holders, top holder: ${top1.toFixed(1)}% (${collected.length}/${needed})`
        );
      }
    } catch (err) {
      console.log(`  Error: ${err}`);
    }

    // Rate limit
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log("");
  console.log(`Collected ${collected.length} holder snapshots`);

  // Save to files
  for (let i = 0; i < collected.length; i++) {
    const holder = collected[i];
    if (!holder) continue;

    const idx = existingCount + i + 1;
    const filename = `holder_${String(idx).padStart(2, "0")}.json`;
    const filepath = join(HOLDERS_DIR, filename);

    await writeFile(filepath, JSON.stringify(holder, null, 2));
    console.log(`Saved: ${filename}`);
  }

  const totalCount = existingCount + collected.length;
  console.log("");
  console.log(`Total fixtures: ${totalCount}/${TARGET_COUNT}`);

  if (totalCount < TARGET_COUNT) {
    console.log(
      `WARNING: Only collected ${totalCount} fixtures, need ${TARGET_COUNT}`
    );
  }

  console.log("Done!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
