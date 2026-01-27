#!/usr/bin/env bun
/**
 * Collect wallet action fixtures from Helius API
 * Fetches real trading activity on Bags tokens
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
const WALLET_ACTIONS_DIR = join(dirname(import.meta.dir), "data", "fixtures", "wallet_actions");

// Target count for fixtures
const TARGET_COUNT = 50;

// Known smart wallets to check (we'll look for any wallet interacting with Bags tokens)
// We discover wallets by looking at who traded the tokens

interface HeliusSignature {
  signature: string;
  slot: number;
  blockTime: number;
  err: unknown | null;
}

interface TokenBalance {
  accountIndex: number;
  mint: string;
  owner: string;
  uiTokenAmount: {
    amount: string;
    decimals: number;
    uiAmount: number;
  };
}

interface TransactionData {
  slot: number;
  blockTime: number;
  transaction: {
    signatures: string[];
    message: {
      accountKeys: string[];
    };
  };
  meta: {
    err: unknown | null;
    preTokenBalances?: TokenBalance[];
    postTokenBalances?: TokenBalance[];
  };
}

interface WalletActionFixture {
  wallet: string;
  mint: string;
  action: "buy" | "sell";
  slot: number;
  block_time: number;
  signature: string;
  instruction_index: number;
  amount_in?: number;
  amount_out?: number;
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
        if (balance.mint && balance.mint !== "So11111111111111111111111111111111111111112") {
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

async function getSignaturesForToken(mint: string, limit: number): Promise<HeliusSignature[]> {
  // Query signatures for this token account
  const signatures = await rpcCall<HeliusSignature[]>("getSignaturesForAddress", [
    mint,
    { limit, commitment: "confirmed" },
  ]);
  return signatures || [];
}

async function getTransaction(signature: string): Promise<TransactionData | null> {
  try {
    const tx = await rpcCall<TransactionData>("getTransaction", [
      signature,
      {
        encoding: "json",
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      },
    ]);
    return tx;
  } catch {
    return null;
  }
}

function analyzeWalletAction(
  tx: TransactionData,
  mint: string
): WalletActionFixture | null {
  const preBalances = tx.meta?.preTokenBalances || [];
  const postBalances = tx.meta?.postTokenBalances || [];

  // Find the wallet that traded this token
  const mintPreBalances = preBalances.filter((b) => b.mint === mint);
  const mintPostBalances = postBalances.filter((b) => b.mint === mint);

  for (const post of mintPostBalances) {
    const pre = mintPreBalances.find((p) => p.owner === post.owner);
    const preBal = pre ? parseFloat(pre.uiTokenAmount.amount) : 0;
    const postBal = parseFloat(post.uiTokenAmount.amount);

    const diff = postBal - preBal;
    if (Math.abs(diff) < 1) continue; // Skip tiny changes

    const action: "buy" | "sell" = diff > 0 ? "buy" : "sell";

    return {
      wallet: post.owner,
      mint,
      action,
      slot: tx.slot,
      block_time: tx.blockTime,
      signature: tx.transaction.signatures[0] || "",
      instruction_index: 0,
      amount_out: diff > 0 ? diff : undefined,
      amount_in: diff < 0 ? Math.abs(diff) : undefined,
      _meta: {
        source: "helius",
        collected_at: new Date().toISOString(),
      },
    };
  }

  return null;
}

async function countExistingFixtures(): Promise<number> {
  try {
    const files = await readdir(WALLET_ACTIONS_DIR);
    return files.filter((f) => f.endsWith(".json")).length;
  } catch {
    return 0;
  }
}

async function main() {
  console.log("Collecting wallet action fixtures from Helius...");
  console.log(`Target: ${TARGET_COUNT} fixtures`);
  console.log(`Output: ${WALLET_ACTIONS_DIR}`);
  console.log("");

  // Ensure directory exists
  await mkdir(WALLET_ACTIONS_DIR, { recursive: true });

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

  const collected: WalletActionFixture[] = [];
  const seenSignatures = new Set<string>();

  // For each mint, get trading activity
  for (const mint of mints) {
    if (collected.length >= needed) break;

    console.log(`\nQuerying signatures for mint: ${mint.slice(0, 16)}...`);

    try {
      const signatures = await getSignaturesForToken(mint, 50);
      console.log(`  Got ${signatures.length} signatures`);

      // Filter successful transactions
      const successful = signatures.filter((s) => s.err === null);

      for (const sig of successful) {
        if (collected.length >= needed) break;
        if (seenSignatures.has(sig.signature)) continue;

        try {
          const tx = await getTransaction(sig.signature);
          if (!tx) continue;

          const action = analyzeWalletAction(tx, mint);
          if (action) {
            seenSignatures.add(sig.signature);
            collected.push(action);
            console.log(
              `  Found ${action.action}: ${action.wallet.slice(0, 8)}... (${collected.length}/${needed})`
            );
          }
        } catch (err) {
          console.log(`  Error: ${err}`);
        }

        // Rate limit
        await new Promise((r) => setTimeout(r, 100));
      }
    } catch (err) {
      console.log(`  Error querying mint: ${err}`);
    }

    // Rate limit between mints
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log("");
  console.log(`Collected ${collected.length} wallet actions`);

  // Save to files
  for (let i = 0; i < collected.length; i++) {
    const action = collected[i];
    if (!action) continue;

    const idx = existingCount + i + 1;
    const filename = `wallet_action_${String(idx).padStart(2, "0")}.json`;
    const filepath = join(WALLET_ACTIONS_DIR, filename);

    await writeFile(filepath, JSON.stringify(action, null, 2));
    console.log(`Saved: ${filename}`);
  }

  const totalCount = existingCount + collected.length;
  console.log("");
  console.log(`Total fixtures: ${totalCount}/${TARGET_COUNT}`);

  if (totalCount < TARGET_COUNT) {
    console.log(
      `WARNING: Only collected ${totalCount} fixtures, need ${TARGET_COUNT}`
    );
    console.log("Try running again or expanding the mint list.");
  }

  console.log("Done!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
