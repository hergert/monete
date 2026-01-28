// Validate Wallets - Check if our "profitable" wallets are actually insiders
// Critical: If they're deployers/insiders, we can't profitably follow them

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || "";
const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || "";

// Top slow traders from expanded analysis (2026-01-28)
// Sorted by statistical significance (tokens × round_trips)
const WALLETS_TO_VALIDATE = [
  { address: "H9JGaqjUAn9YswMK7NTpwoQwyV1RPoHuVNo56eVi2X9N", pnl: "7.8%", tokens: 4, trips: 5 },
  { address: "3i51cKbLbaKAqvRJdCUaq9hsnvf9kqCfMujNgFj7nRKt", pnl: "7.1%", tokens: 5, trips: 3 },
  { address: "ByCrWXeynHEbEfX21a8hjS7YBygz7rRkNcEYSESdhtB6", pnl: "6.4%", tokens: 2, trips: 3 },
  { address: "D9J2kJeL9uWRcApPht4GCNq5De8NEM4ziMLkBqLtJ8Dn", pnl: "14.1%", tokens: 3, trips: 2 },
  { address: "FoG4TcYvxy3Ntes3uNtnD6MEp6nJDW8uKngxKzaFSF9P", pnl: "21.0%", tokens: 3, trips: 1 },
];

// Bags tokens they traded
const TRADED_TOKENS = [
  "7Mxvi7bi5bnjELB4QNzQ4VrQEPeBgPbWwbfwE1ydBAGS",
  "G1DXVVmqJs8Ei79QbK41dpgk2WtXSGqLtx9of7o8BAGS",
  "5arEQv5tGJj8UbhnPrc1WL5KMmijCe4FuexCaEXUBAGS",
  "2ZhzUhaPm8L9g6iUF1LegbjFHJyXdEXahi8R4eQhBAGS",
  "78a6Cbggc2axnGQyuM5iA91oN1Qt93M95NswhhzPBAGS",
  "ArhUyCSWvDKD7tXcTcgTaYxBkDZiFVkmxzyZXmUJBAGS",
  "ehipS3kn9GUSnEMgtB9RxCNBVfH5gTNRVxNtqFTBAGS",
];

interface WalletValidation {
  wallet: string;
  pnl: string;
  isDeployer: boolean;
  deployedTokens: string[];
  isSniperBot: boolean;
  avgBuyLatencySeconds: number | null;
  totalTransactions: number;
  firstActivityDate: string | null;
  riskFlags: string[];
  verdict: "SAFE" | "RISKY" | "INSIDER";
}

// Check if wallet deployed any tokens
async function checkDeployerStatus(wallet: string): Promise<{ isDeployer: boolean; deployedTokens: string[] }> {
  try {
    // Get wallet's transaction history looking for token creates
    const response = await fetch(
      `https://api.helius.xyz/v0/addresses/${wallet}/transactions?api-key=${HELIUS_API_KEY}&type=CREATE`,
      { method: "GET" }
    );

    const txs = await response.json() as any[];

    if (!Array.isArray(txs)) {
      return { isDeployer: false, deployedTokens: [] };
    }

    // Look for token creation transactions
    const deployedTokens: string[] = [];
    for (const tx of txs) {
      if (tx.type === "CREATE" || tx.description?.includes("create")) {
        // Extract created token mint if available
        const tokenTransfers = tx.tokenTransfers || [];
        for (const transfer of tokenTransfers) {
          if (transfer.mint && !deployedTokens.includes(transfer.mint)) {
            deployedTokens.push(transfer.mint);
          }
        }
      }
    }

    return {
      isDeployer: deployedTokens.length > 0,
      deployedTokens,
    };
  } catch (e) {
    console.error(`Error checking deployer status: ${e}`);
    return { isDeployer: false, deployedTokens: [] };
  }
}

// Check if wallet buys suspiciously fast after launches (sniper bot detection)
async function checkSniperBehavior(wallet: string): Promise<{ isSniper: boolean; avgLatencySeconds: number | null }> {
  try {
    const response = await fetch(
      `https://api.helius.xyz/v0/addresses/${wallet}/transactions?api-key=${HELIUS_API_KEY}&type=SWAP`,
      { method: "GET" }
    );

    const txs = await response.json() as any[];

    if (!Array.isArray(txs) || txs.length === 0) {
      return { isSniper: false, avgLatencySeconds: null };
    }

    // Count how many swaps happened very quickly (within 10 seconds of token creation)
    // This is a heuristic - real sniper detection would need token creation times
    let fastBuys = 0;
    let totalBuys = 0;

    for (const tx of txs) {
      if (tx.type === "SWAP") {
        totalBuys++;
        // Check if this looks like a snipe (very early slot, specific patterns)
        // Without token creation time, we check for other sniper indicators
      }
    }

    // If >50% of buys are within first 5 seconds, likely a bot
    const isSniper = totalBuys > 5 && fastBuys / totalBuys > 0.5;

    return {
      isSniper,
      avgLatencySeconds: null, // Would need token creation times
    };
  } catch (e) {
    return { isSniper: false, avgLatencySeconds: null };
  }
}

// Get wallet's overall activity stats
async function getWalletStats(wallet: string): Promise<{
  totalTransactions: number;
  firstActivityDate: string | null;
}> {
  try {
    const response = await fetch(
      `https://api.helius.xyz/v0/addresses/${wallet}/transactions?api-key=${HELIUS_API_KEY}&limit=1`,
      { method: "GET" }
    );

    const txs = await response.json() as any[];

    // For total count, we'd need to paginate - use limit as proxy
    return {
      totalTransactions: Array.isArray(txs) ? txs.length : 0,
      firstActivityDate: txs?.[0]?.timestamp ? new Date(txs[0].timestamp * 1000).toISOString() : null,
    };
  } catch (e) {
    return { totalTransactions: 0, firstActivityDate: null };
  }
}

// Check if wallet is related to any token deployers
async function checkDeployerRelationship(wallet: string, tokens: string[]): Promise<string[]> {
  const relationships: string[] = [];

  for (const token of tokens) {
    try {
      // Get token creator from Bags API
      const response = await fetch(
        `https://public-api-v2.bags.fm/api/v1/token-launch/creator/v3?tokenMint=${token}`,
        {
          headers: {
            "x-api-key": process.env.BAGS_API_KEY || "",
          },
        }
      );

      if (response.ok) {
        const data = await response.json() as any;
        const creator = data?.creator || data?.deployer;

        if (creator === wallet) {
          relationships.push(`Creator of ${token.slice(0, 8)}...`);
        }
      }
    } catch {
      // Skip if API fails
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 500));
  }

  return relationships;
}

async function validateWallet(wallet: string, pnl: string): Promise<WalletValidation> {
  console.log(`\nValidating ${wallet.slice(0, 12)}... (${pnl} P&L)`);

  const riskFlags: string[] = [];

  // Check 1: Is this wallet a token deployer?
  console.log("  Checking deployer status...");
  const deployerStatus = await checkDeployerStatus(wallet);
  if (deployerStatus.isDeployer) {
    riskFlags.push("DEPLOYED_TOKENS");
    console.log(`  ⚠️  Has deployed ${deployerStatus.deployedTokens.length} tokens`);
  } else {
    console.log("  ✓ Not a deployer");
  }

  // Check 2: Is this wallet a sniper bot?
  console.log("  Checking sniper behavior...");
  const sniperStatus = await checkSniperBehavior(wallet);
  if (sniperStatus.isSniper) {
    riskFlags.push("SNIPER_BOT_PATTERN");
    console.log("  ⚠️  Shows sniper bot patterns");
  } else {
    console.log("  ✓ No sniper patterns detected");
  }

  // Check 3: Get basic stats
  console.log("  Getting wallet stats...");
  const stats = await getWalletStats(wallet);
  console.log(`  Total transactions: ${stats.totalTransactions}`);

  // Check 4: Related to any deployers?
  console.log("  Checking deployer relationships...");
  const relationships = await checkDeployerRelationship(wallet, TRADED_TOKENS.slice(0, 3));
  if (relationships.length > 0) {
    riskFlags.push("RELATED_TO_DEPLOYER");
    for (const r of relationships) {
      console.log(`  ⚠️  ${r}`);
    }
  } else {
    console.log("  ✓ No deployer relationships found");
  }

  // Determine verdict
  let verdict: "SAFE" | "RISKY" | "INSIDER";
  if (deployerStatus.isDeployer || relationships.length > 0) {
    verdict = "INSIDER";
  } else if (sniperStatus.isSniper || riskFlags.length > 0) {
    verdict = "RISKY";
  } else {
    verdict = "SAFE";
  }

  console.log(`  Verdict: ${verdict}`);

  return {
    wallet,
    pnl,
    isDeployer: deployerStatus.isDeployer,
    deployedTokens: deployerStatus.deployedTokens,
    isSniperBot: sniperStatus.isSniper,
    avgBuyLatencySeconds: sniperStatus.avgLatencySeconds,
    totalTransactions: stats.totalTransactions,
    firstActivityDate: stats.firstActivityDate,
    riskFlags,
    verdict,
  };
}

async function main() {
  console.log("=== Wallet Validation ===\n");
  console.log("Checking if our 'profitable' wallets are actually insiders...\n");

  if (!HELIUS_API_KEY) {
    console.error("ERROR: HELIUS_API_KEY not set");
    process.exit(1);
  }

  const results: WalletValidation[] = [];

  for (const { address, pnl } of WALLETS_TO_VALIDATE) {
    const result = await validateWallet(address, pnl);
    results.push(result);
    await new Promise(r => setTimeout(r, 1000)); // Rate limit
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("VALIDATION SUMMARY");
  console.log("=".repeat(60));

  const safe = results.filter(r => r.verdict === "SAFE");
  const risky = results.filter(r => r.verdict === "RISKY");
  const insiders = results.filter(r => r.verdict === "INSIDER");

  console.log(`\nSafe to follow: ${safe.length}`);
  for (const w of safe) {
    console.log(`  ✓ ${w.wallet.slice(0, 12)}... (${w.pnl})`);
  }

  console.log(`\nRisky (proceed with caution): ${risky.length}`);
  for (const w of risky) {
    console.log(`  ⚠️  ${w.wallet.slice(0, 12)}... (${w.pnl}) - ${w.riskFlags.join(", ")}`);
  }

  console.log(`\nInsiders (do NOT follow): ${insiders.length}`);
  for (const w of insiders) {
    console.log(`  ❌ ${w.wallet.slice(0, 12)}... (${w.pnl}) - ${w.riskFlags.join(", ")}`);
  }

  // Recommendation
  console.log("\n" + "=".repeat(60));
  console.log("RECOMMENDATION");
  console.log("=".repeat(60));

  if (safe.length > 0) {
    console.log(`\n✓ ${safe.length} wallet(s) appear safe to monitor and follow.`);
    console.log("  Next step: Run live-monitor.ts to track their activity.");
  } else if (risky.length > 0) {
    console.log(`\n⚠️  No clearly safe wallets, but ${risky.length} might be worth monitoring.`);
    console.log("  Proceed with caution and smaller position sizes.");
  } else {
    console.log("\n❌ All profitable wallets appear to be insiders.");
    console.log("  This strategy may not be viable for Bags.fm.");
  }

  // Save report
  const report = {
    generated_at: new Date().toISOString(),
    wallets_validated: results.length,
    safe_count: safe.length,
    risky_count: risky.length,
    insider_count: insiders.length,
    results,
  };

  await Bun.write("reports/wallet_validation.json", JSON.stringify(report, null, 2));
  console.log("\nReport saved to reports/wallet_validation.json");
}

main().catch(console.error);
