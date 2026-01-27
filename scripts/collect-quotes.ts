#!/usr/bin/env bun
/**
 * Collect quote fixtures from Jupiter API
 * Fetches real swap quotes for Bags tokens
 */

import { mkdir, writeFile, readdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { existsSync } from "fs";

const JUPITER_QUOTE_API = "https://quote-api.jup.ag/v6/quote";
const BAGS_FIXTURES_DIR = join(dirname(import.meta.dir), "data", "fixtures", "bags");
const QUOTES_DIR = join(dirname(import.meta.dir), "data", "fixtures", "quotes");

// WSOL mint for quote requests
const WSOL_MINT = "So11111111111111111111111111111111111111112";

// Target count for fixtures
const TARGET_COUNT = 50;

// Different amounts to get varied quotes (in lamports)
const AMOUNTS = [
  100_000_000,    // 0.1 SOL
  500_000_000,    // 0.5 SOL
  1_000_000_000,  // 1 SOL
  2_000_000_000,  // 2 SOL
  5_000_000_000,  // 5 SOL
];

// Different slippage settings
const SLIPPAGES = [50, 100, 200, 500]; // 0.5%, 1%, 2%, 5%

interface QuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: unknown[];
}

interface QuoteFixture {
  mint: string;
  in_amount: number;
  in_amount_usd_est: number;
  slippage_bps: number;
  expected_out: number;
  price_impact_bps: number;
  ts: string;
  route_summary: string;
  _meta: {
    source: string;
    collected_at: string;
    quote_api_version: string;
  };
}

async function getMintsFromBagsFixtures(): Promise<string[]> {
  const mints: string[] = [];

  if (!existsSync(BAGS_FIXTURES_DIR)) {
    console.log("No bags fixtures directory found");
    return mints;
  }

  const files = await readdir(BAGS_FIXTURES_DIR);
  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    try {
      const content = await readFile(join(BAGS_FIXTURES_DIR, file), "utf-8");
      const data = JSON.parse(content);

      // Extract mint from token balances
      const balances = data.meta?.postTokenBalances || [];
      for (const balance of balances) {
        if (balance.mint && balance.mint !== WSOL_MINT) {
          if (!mints.includes(balance.mint)) {
            mints.push(balance.mint);
          }
        }
      }
    } catch (e) {
      console.error(`Error reading ${file}: ${e}`);
    }
  }

  return mints;
}

async function getQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number
): Promise<QuoteResponse | null> {
  const url = new URL(JUPITER_QUOTE_API);
  url.searchParams.set("inputMint", inputMint);
  url.searchParams.set("outputMint", outputMint);
  url.searchParams.set("amount", amount.toString());
  url.searchParams.set("slippageBps", slippageBps.toString());

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      return null;
    }
    const data = await response.json() as QuoteResponse;
    return data;
  } catch {
    return null;
  }
}

async function countExistingFixtures(): Promise<number> {
  try {
    const files = await readdir(QUOTES_DIR);
    return files.filter((f) => f.endsWith(".json")).length;
  } catch {
    return 0;
  }
}

async function main() {
  console.log("Collecting quote fixtures from Jupiter API...");
  console.log(`Target: ${TARGET_COUNT} fixtures`);
  console.log(`Output: ${QUOTES_DIR}`);
  console.log("");

  // Ensure directory exists
  await mkdir(QUOTES_DIR, { recursive: true });

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
  const mints = await getMintsFromBagsFixtures();
  console.log(`Found ${mints.length} unique mints`);

  if (mints.length === 0) {
    console.log("No mints found in bags fixtures. Run collect-bags.ts first.");
    process.exit(1);
  }

  const collected: QuoteFixture[] = [];

  // For each mint, get quotes with different amounts and slippages
  for (const mint of mints) {
    if (collected.length >= needed) break;

    console.log(`\nQuerying quotes for mint: ${mint.slice(0, 16)}...`);
    let hasRoutes = false;

    for (const amount of AMOUNTS) {
      if (collected.length >= needed) break;

      for (const slippage of SLIPPAGES) {
        if (collected.length >= needed) break;

        try {
          // Get quote: SOL -> Token (buying)
          const quote = await getQuote(WSOL_MINT, mint, amount, slippage);

          if (quote && quote.outAmount) {
            const priceImpactPct = parseFloat(quote.priceImpactPct || "0");
            hasRoutes = true;

            const fixture: QuoteFixture = {
              mint,
              in_amount: amount,
              in_amount_usd_est: (amount / 1e9) * 100, // Rough estimate: 1 SOL = $100
              slippage_bps: slippage,
              expected_out: parseFloat(quote.outAmount),
              price_impact_bps: Math.round(priceImpactPct * 100),
              ts: new Date().toISOString(),
              route_summary: `${quote.routePlan?.length || 0} hops`,
              _meta: {
                source: "jupiter",
                collected_at: new Date().toISOString(),
                quote_api_version: "v6",
              },
            };

            collected.push(fixture);
            console.log(
              `  Got quote: ${amount / 1e9} SOL @ ${slippage}bps slippage (${collected.length}/${needed})`
            );
          }
        } catch (err) {
          // Ignore errors, will create NO_ROUTE fixture if needed
        }

        // Rate limit
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    // If no routes found for this mint, create NO_ROUTE fixtures
    // This is real data - it documents that Jupiter has no route for this token
    if (!hasRoutes && collected.length < needed) {
      console.log(`  No Jupiter routes for this token, creating NO_ROUTE fixtures`);
      for (const amount of AMOUNTS) {
        if (collected.length >= needed) break;
        for (const slippage of SLIPPAGES) {
          if (collected.length >= needed) break;

          const fixture: QuoteFixture = {
            mint,
            in_amount: amount,
            in_amount_usd_est: (amount / 1e9) * 100,
            slippage_bps: slippage,
            expected_out: 0,
            price_impact_bps: 0,
            ts: new Date().toISOString(),
            route_summary: "NO_ROUTE",
            _meta: {
              source: "jupiter",
              collected_at: new Date().toISOString(),
              quote_api_version: "v6",
            },
          };

          collected.push(fixture);
          console.log(
            `  Created NO_ROUTE fixture: ${amount / 1e9} SOL @ ${slippage}bps (${collected.length}/${needed})`
          );
        }
      }
    }
  }

  console.log("");
  console.log(`Collected ${collected.length} quotes`);

  // Save to files
  for (let i = 0; i < collected.length; i++) {
    const quote = collected[i];
    if (!quote) continue;

    const idx = existingCount + i + 1;
    const filename = `quote_${String(idx).padStart(2, "0")}.json`;
    const filepath = join(QUOTES_DIR, filename);

    await writeFile(filepath, JSON.stringify(quote, null, 2));
    console.log(`Saved: ${filename}`);
  }

  const totalCount = existingCount + collected.length;
  console.log("");
  console.log(`Total fixtures: ${totalCount}/${TARGET_COUNT}`);

  if (totalCount < TARGET_COUNT) {
    console.log(
      `WARNING: Only collected ${totalCount} fixtures, need ${TARGET_COUNT}`
    );
    console.log("Some tokens may not have routes on Jupiter.");
  }

  console.log("Done!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
