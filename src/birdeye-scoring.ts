// Birdeye Wallet Scoring - Real EV calculation using Birdeye data
// Uses top traders and P&L data to find smart money

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || "";
const BIRDEYE_BASE_URL = "https://public-api.birdeye.so";

// Rate limiter: 1 request per second for free tier
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1100; // 1.1 seconds to be safe

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(r => setTimeout(r, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }

  lastRequestTime = Date.now();

  return fetch(url, {
    headers: {
      "X-API-KEY": BIRDEYE_API_KEY,
      "x-chain": "solana",
    },
  });
}

interface TopTrader {
  owner: string;
  trade: number;
  tradeBuy: number;
  tradeSell: number;
  volume: number;
  volumeBuy: number;
  volumeSell: number;
}

interface TokenTrade {
  txHash: string;
  blockUnixTime: number;
  source: string;
  owner: string;
  side: string;
  amount: number;
  decimals?: number;
  priceNative?: number;
  volumeUsd?: number;
}

interface WalletScore {
  wallet: string;
  tokensTraded: number;
  totalTrades: number;
  totalVolume: number;
  buyVolume: number;
  sellVolume: number;
  estimatedPnl: number;  // sell - buy volume
  pnlPercent: number;
  isEligible: boolean;
  exclusionReason?: string;
}

// Get top traders for a token
async function getTopTraders(tokenAddress: string, timeFrame: string = "24h"): Promise<TopTrader[]> {
  try {
    const url = `${BIRDEYE_BASE_URL}/defi/v2/tokens/top_traders?address=${tokenAddress}&time_frame=${timeFrame}&sort_by=volume&sort_type=desc&limit=10`;
    const response = await rateLimitedFetch(url);

    if (!response.ok) {
      console.error(`  Top traders error ${response.status}`);
      return [];
    }

    const json = await response.json() as { success: boolean; data?: { items?: TopTrader[] } };
    return json.data?.items || [];
  } catch (e) {
    console.error(`  Error fetching top traders: ${e}`);
    return [];
  }
}

// Get token trades (to analyze specific wallet behavior)
async function getTokenTrades(tokenAddress: string, limit: number = 50): Promise<TokenTrade[]> {
  try {
    const url = `${BIRDEYE_BASE_URL}/defi/txs/token?address=${tokenAddress}&tx_type=swap&sort_type=desc&limit=${limit}`;
    const response = await rateLimitedFetch(url);

    if (!response.ok) {
      console.error(`  Token trades error ${response.status}`);
      return [];
    }

    const json = await response.json() as { success: boolean; data?: { items?: TokenTrade[] } };
    return json.data?.items || [];
  } catch (e) {
    console.error(`  Error fetching token trades: ${e}`);
    return [];
  }
}

// Get current price for a token
async function getTokenPrice(tokenAddress: string): Promise<number | null> {
  try {
    const url = `${BIRDEYE_BASE_URL}/defi/price?address=${tokenAddress}`;
    const response = await rateLimitedFetch(url);

    if (!response.ok) {
      return null;
    }

    const json = await response.json() as { success: boolean; data?: { value?: number } };
    return json.data?.value || null;
  } catch (e) {
    return null;
  }
}

// Aggregate trader data across multiple tokens
async function scoreWallets(tokenMints: string[]): Promise<Map<string, WalletScore>> {
  const walletScores = new Map<string, WalletScore>();

  console.log(`\nScoring wallets across ${tokenMints.length} tokens...\n`);

  for (const mint of tokenMints) {
    console.log(`Fetching top traders for ${mint.slice(0, 8)}...`);

    const traders = await getTopTraders(mint, "24h");
    console.log(`  Found ${traders.length} traders`);

    for (const trader of traders) {
      const existing = walletScores.get(trader.owner) || {
        wallet: trader.owner,
        tokensTraded: 0,
        totalTrades: 0,
        totalVolume: 0,
        buyVolume: 0,
        sellVolume: 0,
        estimatedPnl: 0,
        pnlPercent: 0,
        isEligible: false,
      };

      existing.tokensTraded += 1;
      existing.totalTrades += trader.trade;
      existing.totalVolume += trader.volume;
      existing.buyVolume += trader.volumeBuy;
      existing.sellVolume += trader.volumeSell;
      existing.estimatedPnl = existing.sellVolume - existing.buyVolume;
      existing.pnlPercent = existing.buyVolume > 0
        ? (existing.estimatedPnl / existing.buyVolume) * 100
        : 0;

      walletScores.set(trader.owner, existing);
    }
  }

  // Determine eligibility
  for (const [wallet, score] of walletScores) {
    // Criteria from PLAN.md:
    // - Sufficient signals (trades)
    // - Positive EV

    if (score.totalTrades < 5) {
      score.exclusionReason = "insufficient_trades";
    } else if (score.tokensTraded < 2) {
      score.exclusionReason = "single_token_trader";
    } else if (score.pnlPercent <= 0) {
      score.exclusionReason = "negative_or_zero_pnl";
    } else {
      score.isEligible = true;
    }

    walletScores.set(wallet, score);
  }

  return walletScores;
}

async function main() {
  console.log("=== Birdeye Wallet Scoring ===\n");

  if (!BIRDEYE_API_KEY) {
    console.error("ERROR: BIRDEYE_API_KEY not set");
    process.exit(1);
  }

  // Our Bags token mints
  const bagsMints = [
    "7Mxvi7bi5bnjELB4QNzQ4VrQEPeBgPbWwbfwE1ydBAGS",
    "G1DXVVmqJs8Ei79QbK41dpgk2WtXSGqLtx9of7o8BAGS",
    "5arEQv5tGJj8UbhnPrc1WL5KMmijCe4FuexCaEXUBAGS",
    "2ZhzUhaPm8L9g6iUF1LegbjFHJyXdEXahi8R4eQhBAGS",
    "78a6Cbggc2axnGQyuM5iA91oN1Qt93M95NswhhzPBAGS",
    "ArhUyCSWvDKD7tXcTcgTaYxBkDZiFVkmxzyZXmUJBAGS",
    "ehipS3kn9GUSnEMgtB9RxCNBVfH5gTNRVxNtqFTBAGS",
  ];

  // Score wallets
  const scores = await scoreWallets(bagsMints);

  // Sort by P&L percent
  const sortedScores = Array.from(scores.values())
    .sort((a, b) => b.pnlPercent - a.pnlPercent);

  const eligible = sortedScores.filter(s => s.isEligible);

  // Report
  console.log("\n" + "=".repeat(100));
  console.log("WALLET SCORING REPORT");
  console.log("=".repeat(100));

  console.log(`\nTotal wallets analyzed: ${sortedScores.length}`);
  console.log(`Eligible wallets: ${eligible.length}`);

  console.log("\n--- Top 15 by P&L % ---\n");
  console.log(
    "Wallet".padEnd(14) +
    "Tokens".padEnd(8) +
    "Trades".padEnd(8) +
    "Buy Vol".padEnd(14) +
    "Sell Vol".padEnd(14) +
    "P&L %".padEnd(10) +
    "Status"
  );
  console.log("-".repeat(100));

  for (const score of sortedScores.slice(0, 15)) {
    const status = score.isEligible
      ? "✓ ELIGIBLE"
      : `✗ ${score.exclusionReason}`;

    console.log(
      score.wallet.slice(0, 12).padEnd(14) +
      score.tokensTraded.toString().padEnd(8) +
      score.totalTrades.toString().padEnd(8) +
      score.buyVolume.toFixed(2).padEnd(14) +
      score.sellVolume.toFixed(2).padEnd(14) +
      `${score.pnlPercent.toFixed(1)}%`.padEnd(10) +
      status
    );
  }

  // Save report
  const report = {
    generated_at: new Date().toISOString(),
    tokens_analyzed: bagsMints.length,
    wallets_found: sortedScores.length,
    eligible_count: eligible.length,
    gate_target: 15,
    gate_passed: eligible.length >= 15,
    eligible_wallets: eligible.map(s => ({
      wallet: s.wallet,
      tokens_traded: s.tokensTraded,
      total_trades: s.totalTrades,
      pnl_percent: s.pnlPercent,
    })),
    all_wallets: sortedScores,
  };

  const reportPath = "reports/wallet_scoring.json";
  await Bun.write(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport saved to ${reportPath}`);

  // Gate check
  console.log("\n" + "=".repeat(50));
  console.log("PHASE 0B GATE CHECK");
  console.log("=".repeat(50));
  console.log(`Eligible wallets with positive P&L: ${eligible.length}`);
  console.log(`Required: ≥15`);
  console.log(`Status: ${eligible.length >= 15 ? "PASS ✓" : "NEED_MORE_DATA"}`);

  if (eligible.length < 15) {
    console.log("\nNote: We may need more Bags tokens or longer time frames.");
    console.log("Current data is from 24h window only.");
  }
}

if (import.meta.main) {
  main().catch(console.error);
}
