// Birdeye Deep Analysis - Comprehensive wallet scoring
// Uses historical trades to calculate real EV

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || "";
const BIRDEYE_BASE_URL = "https://public-api.birdeye.so";

// Rate limiter
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000;

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

interface BirdeyeTrade {
  txHash: string;
  blockUnixTime: number;
  owner: string;
  side: "buy" | "sell";
  quote: {
    symbol: string;
    uiAmount: number;
    price: number; // USD price of quote token
  };
  base: {
    symbol: string;
    uiAmount: number;
    price: number; // USD price of base token
  };
}

interface WalletTradeData {
  wallet: string;
  trades: Array<{
    mint: string;
    side: "buy" | "sell";
    solAmount: number;
    usdAmount: number;
    timestamp: number;
  }>;
}

interface WalletEV {
  wallet: string;
  totalTrades: number;
  tokensTraded: number;
  totalBuyUsd: number;
  totalSellUsd: number;
  realizedPnlUsd: number;
  pnlPercent: number;
  isEligible: boolean;
  exclusionReason?: string;
}

async function getTokenTrades(tokenAddress: string, limit: number = 50): Promise<BirdeyeTrade[]> {
  try {
    const url = `${BIRDEYE_BASE_URL}/defi/txs/token?address=${tokenAddress}&tx_type=swap&sort_type=desc&limit=${limit}`;
    const response = await rateLimitedFetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error(`  Trades error ${response.status}: ${text.slice(0, 100)}`);
      return [];
    }

    const json = await response.json() as any;
    return json.data?.items || [];
  } catch (e) {
    console.error(`  Error: ${e}`);
    return [];
  }
}

async function collectWalletTrades(tokenMints: string[]): Promise<Map<string, WalletTradeData>> {
  const walletData = new Map<string, WalletTradeData>();

  for (const mint of tokenMints) {
    console.log(`Fetching trades for ${mint.slice(0, 8)}...`);

    const trades = await getTokenTrades(mint, 50);
    console.log(`  Found ${trades.length} trades`);

    for (const trade of trades) {
      if (!trade.owner) continue;

      // Birdeye provides side directly
      const side = trade.side as "buy" | "sell";

      // Calculate USD amount (quote is SOL, multiply by SOL price)
      const solAmount = trade.quote?.uiAmount || 0;
      const solPrice = trade.quote?.price || 0;
      const usdAmount = solAmount * solPrice;

      const existing = walletData.get(trade.owner) || {
        wallet: trade.owner,
        trades: [],
      };

      existing.trades.push({
        mint,
        side,
        solAmount,
        usdAmount,
        timestamp: trade.blockUnixTime,
      });

      walletData.set(trade.owner, existing);
    }
  }

  return walletData;
}

function calculateWalletEVs(walletData: Map<string, WalletTradeData>): WalletEV[] {
  const results: WalletEV[] = [];

  for (const [wallet, data] of walletData) {
    const tokensTraded = new Set(data.trades.map(t => t.mint)).size;

    let totalBuyUsd = 0;
    let totalSellUsd = 0;

    for (const trade of data.trades) {
      if (trade.side === "buy") {
        totalBuyUsd += trade.usdAmount;
      } else {
        totalSellUsd += trade.usdAmount;
      }
    }

    const realizedPnlUsd = totalSellUsd - totalBuyUsd;
    const pnlPercent = totalBuyUsd > 0 ? (realizedPnlUsd / totalBuyUsd) * 100 : 0;

    // Eligibility criteria
    let isEligible = true;
    let exclusionReason: string | undefined;

    if (data.trades.length < 3) {
      isEligible = false;
      exclusionReason = "insufficient_trades";
    } else if (tokensTraded < 2) {
      isEligible = false;
      exclusionReason = "single_token";
    } else if (totalBuyUsd < 10) {
      isEligible = false;
      exclusionReason = "no_buys";
    } else if (pnlPercent <= 0) {
      isEligible = false;
      exclusionReason = "negative_pnl";
    } else if (pnlPercent > 500) {
      isEligible = false;
      exclusionReason = "suspicious_pnl";
    }

    results.push({
      wallet,
      totalTrades: data.trades.length,
      tokensTraded,
      totalBuyUsd,
      totalSellUsd,
      realizedPnlUsd,
      pnlPercent,
      isEligible,
      exclusionReason,
    });
  }

  return results.sort((a, b) => b.pnlPercent - a.pnlPercent);
}

async function main() {
  console.log("=== Birdeye Deep Analysis ===\n");

  if (!BIRDEYE_API_KEY) {
    console.error("ERROR: BIRDEYE_API_KEY not set");
    process.exit(1);
  }

  const bagsMints = [
    "7Mxvi7bi5bnjELB4QNzQ4VrQEPeBgPbWwbfwE1ydBAGS",
    "G1DXVVmqJs8Ei79QbK41dpgk2WtXSGqLtx9of7o8BAGS",
    "5arEQv5tGJj8UbhnPrc1WL5KMmijCe4FuexCaEXUBAGS",
    "2ZhzUhaPm8L9g6iUF1LegbjFHJyXdEXahi8R4eQhBAGS",
    "78a6Cbggc2axnGQyuM5iA91oN1Qt93M95NswhhzPBAGS",
    "ArhUyCSWvDKD7tXcTcgTaYxBkDZiFVkmxzyZXmUJBAGS",
    "ehipS3kn9GUSnEMgtB9RxCNBVfH5gTNRVxNtqFTBAGS",
  ];

  console.log("Step 1: Collecting trades from Birdeye...\n");
  const walletData = await collectWalletTrades(bagsMints);
  console.log(`\nCollected data for ${walletData.size} unique wallets`);

  console.log("\nStep 2: Calculating wallet EVs...\n");
  const evResults = calculateWalletEVs(walletData);

  const eligible = evResults.filter(w => w.isEligible);
  const withBuys = evResults.filter(w => w.totalBuyUsd > 10);
  const withProfits = evResults.filter(w => w.pnlPercent > 0 && w.totalBuyUsd > 10);

  // Report
  console.log("=".repeat(120));
  console.log("DEEP ANALYSIS REPORT");
  console.log("=".repeat(120));

  console.log(`\nTokens analyzed: ${bagsMints.length}`);
  console.log(`Total wallets: ${evResults.length}`);
  console.log(`Wallets with buys (>$10): ${withBuys.length}`);
  console.log(`Wallets with profits: ${withProfits.length}`);
  console.log(`Eligible wallets: ${eligible.length}`);

  console.log("\n--- Top 20 Wallets by P&L % ---\n");
  console.log(
    "Wallet".padEnd(14) +
    "Tokens".padEnd(8) +
    "Trades".padEnd(8) +
    "Buy $".padEnd(12) +
    "Sell $".padEnd(12) +
    "P&L $".padEnd(12) +
    "P&L %".padEnd(10) +
    "Status"
  );
  console.log("-".repeat(120));

  for (const w of evResults.slice(0, 20)) {
    const status = w.isEligible
      ? "✓ ELIGIBLE"
      : `✗ ${w.exclusionReason}`;

    console.log(
      w.wallet.slice(0, 12).padEnd(14) +
      w.tokensTraded.toString().padEnd(8) +
      w.totalTrades.toString().padEnd(8) +
      `$${w.totalBuyUsd.toFixed(0)}`.padEnd(12) +
      `$${w.totalSellUsd.toFixed(0)}`.padEnd(12) +
      `$${w.realizedPnlUsd.toFixed(0)}`.padEnd(12) +
      `${w.pnlPercent.toFixed(1)}%`.padEnd(10) +
      status
    );
  }

  // Save report
  const report = {
    generated_at: new Date().toISOString(),
    tokens_analyzed: bagsMints.length,
    total_wallets: evResults.length,
    wallets_with_buys: withBuys.length,
    wallets_with_profits: withProfits.length,
    eligible_count: eligible.length,
    gate_target: 15,
    gate_passed: eligible.length >= 15,
    eligible_wallets: eligible.map(w => ({
      wallet: w.wallet,
      tokens_traded: w.tokensTraded,
      total_trades: w.totalTrades,
      total_buy_usd: w.totalBuyUsd,
      total_sell_usd: w.totalSellUsd,
      pnl_usd: w.realizedPnlUsd,
      pnl_percent: w.pnlPercent,
    })),
    all_wallets: evResults,
  };

  const reportPath = "reports/deep_analysis.json";
  await Bun.write(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport saved to ${reportPath}`);

  // Gate check
  console.log("\n" + "=".repeat(60));
  console.log("PHASE 0B GATE CHECK");
  console.log("=".repeat(60));
  console.log(`Eligible wallets: ${eligible.length}`);
  console.log(`Required: ≥15`);
  console.log(`Status: ${eligible.length >= 15 ? "PASS ✓" : "NEED_MORE_DATA"}`);

  if (eligible.length > 0) {
    console.log(`\nEligible wallets found:`);
    for (const w of eligible.slice(0, 10)) {
      console.log(`  ${w.wallet.slice(0, 12)}: ${w.pnlPercent.toFixed(1)}% P&L, ${w.totalTrades} trades`);
    }
  }
}

if (import.meta.main) {
  main().catch(console.error);
}
