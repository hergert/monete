#!/usr/bin/env bun
/**
 * Build Replay Dataset
 * Converts fixtures into replay events for offline E2E testing
 *
 * Reads from:
 * - data/fixtures/bags/*.json (Bags launch transactions)
 * - data/fixtures/wallet_actions/*.json (wallet buy/sell events)
 * - data/fixtures/quotes/*.json (Jupiter quote snapshots)
 *
 * Writes to:
 * - data/replay/events.jsonl (one event per line, sorted by slot)
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const FIXTURES_DIR = join(import.meta.dir, "..", "data", "fixtures");
const REPLAY_DIR = join(import.meta.dir, "..", "data", "replay");
const OUTPUT_FILE = join(REPLAY_DIR, "events.jsonl");

interface ReplayEvent {
  type: "launch" | "wallet_action" | "quote";
  signature: string;
  slot: number;
  block_time: number;
  instruction_index: number;
  received_at: string;
  payload: unknown;
}

interface BagsFixture {
  _meta?: {
    signature?: string;
    collected_at?: string;
  };
  slot: number;
  blockTime: number;
  transaction: {
    signatures: string[];
    message: {
      accountKeys: string[];
      instructions: Array<{
        programIdIndex: number;
        accounts: number[];
        data: string;
      }>;
    };
  };
  meta: {
    err: unknown;
    innerInstructions?: Array<{
      index: number;
      instructions: Array<unknown>;
    }>;
    logMessages?: string[];
    preTokenBalances?: Array<{
      mint: string;
      owner: string;
    }>;
    postTokenBalances?: Array<{
      mint: string;
      owner: string;
    }>;
  };
}

interface WalletActionFixture {
  wallet: string;
  mint: string;
  action: "buy" | "sell";
  slot: number;
  block_time: number;
  signature: string;
  amount_in?: number;
  amount_out?: number;
  instruction_index: number;
}

interface QuoteFixture {
  mint: string;
  in_amount: number;
  slippage_bps: number;
  expected_out: number;
  price_impact_bps: number;
  ts: string;
  route?: unknown;
}

function readJsonFiles<T>(dir: string): T[] {
  if (!existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return [];
  }

  const files = readdirSync(dir).filter((f) => f.endsWith(".json") && f !== ".gitkeep");
  const results: T[] = [];

  for (const file of files) {
    try {
      const content = readFileSync(join(dir, file), "utf-8");
      const data = JSON.parse(content) as T;
      results.push(data);
    } catch (err) {
      console.error(`Error reading ${file}: ${err}`);
    }
  }

  return results;
}

function extractMintFromBagsLaunch(fixture: BagsFixture): string | null {
  // Try to extract mint from token balances
  const postBalances = fixture.meta?.postTokenBalances || [];
  for (const balance of postBalances) {
    // Skip SOL (wrapped)
    if (balance.mint === "So11111111111111111111111111111111111111112") continue;
    return balance.mint;
  }
  return null;
}

function main() {
  console.log("=== Build Replay Dataset ===\n");

  // Ensure output directory exists
  if (!existsSync(REPLAY_DIR)) {
    mkdirSync(REPLAY_DIR, { recursive: true });
  }

  const events: ReplayEvent[] = [];

  // 1. Process Bags launch fixtures
  console.log("Processing Bags launch fixtures...");
  const bagsFixtures = readJsonFiles<BagsFixture>(join(FIXTURES_DIR, "bags"));
  console.log(`  Found ${bagsFixtures.length} Bags fixtures`);

  for (const fixture of bagsFixtures) {
    const signature = fixture._meta?.signature || fixture.transaction?.signatures?.[0];
    if (!signature) {
      console.log("  Skipping fixture without signature");
      continue;
    }

    const mint = extractMintFromBagsLaunch(fixture);

    const event: ReplayEvent = {
      type: "launch",
      signature,
      slot: fixture.slot,
      block_time: fixture.blockTime,
      instruction_index: 0, // Main instruction
      received_at: fixture._meta?.collected_at || new Date().toISOString(),
      payload: {
        mint,
        transaction: fixture.transaction,
        meta: fixture.meta,
      },
    };

    events.push(event);
  }

  // 2. Process wallet action fixtures
  console.log("Processing wallet action fixtures...");
  const walletActionsDir = join(FIXTURES_DIR, "wallet_actions");
  const walletActionFixtures = readJsonFiles<WalletActionFixture>(walletActionsDir);
  console.log(`  Found ${walletActionFixtures.length} wallet action fixtures`);

  for (const fixture of walletActionFixtures) {
    const event: ReplayEvent = {
      type: "wallet_action",
      signature: fixture.signature,
      slot: fixture.slot,
      block_time: fixture.block_time,
      instruction_index: fixture.instruction_index || 0,
      received_at: new Date(fixture.block_time * 1000).toISOString(),
      payload: {
        wallet: fixture.wallet,
        mint: fixture.mint,
        action: fixture.action,
        amount_in: fixture.amount_in,
        amount_out: fixture.amount_out,
      },
    };

    events.push(event);
  }

  // 3. Process quote fixtures
  console.log("Processing quote fixtures...");
  const quotesDir = join(FIXTURES_DIR, "quotes");
  const quoteFixtures = readJsonFiles<QuoteFixture>(quotesDir);
  console.log(`  Found ${quoteFixtures.length} quote fixtures`);

  for (const fixture of quoteFixtures) {
    // Quotes don't have signatures or slots, use timestamp
    const ts = new Date(fixture.ts);
    const pseudoSlot = Math.floor(ts.getTime() / 400); // Approximate slot from time

    const event: ReplayEvent = {
      type: "quote",
      signature: `quote_${fixture.mint}_${fixture.ts}`, // Synthetic ID for quotes
      slot: pseudoSlot,
      block_time: Math.floor(ts.getTime() / 1000),
      instruction_index: 0,
      received_at: fixture.ts,
      payload: {
        mint: fixture.mint,
        in_amount: fixture.in_amount,
        slippage_bps: fixture.slippage_bps,
        expected_out: fixture.expected_out,
        price_impact_bps: fixture.price_impact_bps,
        route: fixture.route,
      },
    };

    events.push(event);
  }

  // Sort events by slot, then by instruction_index
  events.sort((a, b) => {
    if (a.slot !== b.slot) return a.slot - b.slot;
    return a.instruction_index - b.instruction_index;
  });

  console.log(`\nTotal events: ${events.length}`);
  console.log(`  - Launches: ${events.filter((e) => e.type === "launch").length}`);
  console.log(`  - Wallet actions: ${events.filter((e) => e.type === "wallet_action").length}`);
  console.log(`  - Quotes: ${events.filter((e) => e.type === "quote").length}`);

  // Write JSONL output
  const jsonlContent = events.map((e) => JSON.stringify(e)).join("\n");
  writeFileSync(OUTPUT_FILE, jsonlContent + (events.length > 0 ? "\n" : ""));

  console.log(`\nWrote ${events.length} events to ${OUTPUT_FILE}`);

  // Summary
  if (events.length === 0) {
    console.log("\nWARNING: No events generated. Check that fixtures exist.");
    process.exit(1);
  }

  console.log("\nDone!");
}

main();
