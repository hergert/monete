// Find Slow Traders - Discover wallets with longer hold times
// These are better for copy trading because our 2.4s latency is negligible
// vs their 5+ minute holds

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || "";
const BIRDEYE_BASE_URL = "https://public-api.birdeye.so";

// Expanded list of Bags tokens to analyze
const BAGS_TOKENS = [
  // Original tokens
  "7Mxvi7bi5bnjELB4QNzQ4VrQEPeBgPbWwbfwE1ydBAGS",
  "G1DXVVmqJs8Ei79QbK41dpgk2WtXSGqLtx9of7o8BAGS",
  "5arEQv5tGJj8UbhnPrc1WL5KMmijCe4FuexCaEXUBAGS",
  "2ZhzUhaPm8L9g6iUF1LegbjFHJyXdEXahi8R4eQhBAGS",
  "78a6Cbggc2axnGQyuM5iA91oN1Qt93M95NswhhzPBAGS",
  "ArhUyCSWvDKD7tXcTcgTaYxBkDZiFVkmxzyZXmUJBAGS",
  "ehipS3kn9GUSnEMgtB9RxCNBVfH5gTNRVxNtqFTBAGS",
  // Recently discovered
  "H5hygVvXiYxk2a3BVtjiqcDJK8TdHTB5u5U1fXEuBAGS",
  "FFEjZnvY1tqHyBAMBPE1DHoEmQWLmxjhvvDs4TaRBAGS",
  "k9BKDF8x9Y6nBbGVL938yPT33h4zo8p8GTsi4wJBAGS",
  "CdyjsXbPs6VamxNk7StU5apXFHAiM7q8FTYAN3rdBAGS",
];

// Minimum hold time to be considered a "slow trader" (in seconds)
const MIN_HOLD_TIME_SECONDS = 300; // 5 minutes
const MIN_BAGS_TOKENS_TRADED = 2;
const MIN_TOTAL_TRADES = 3;

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2100; // Slightly over 2s to be safe

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

interface Trade {
  wallet: string;
  token: string;
  side: "buy" | "sell";
  timestamp: number;
  priceUsd: number;
  amountUsd: number;
}

interface WalletStats {
  wallet: string;
  totalTrades: number;
  tokensTraded: Set<string>;
  completedRoundTrips: number; // buy + sell pairs
  avgHoldTimeSeconds: number;
  minHoldTimeSeconds: number;
  maxHoldTimeSeconds: number;
  totalBuyUsd: number;
  totalSellUsd: number;
  realizedPnlUsd: number;
  realizedPnlPercent: number;
  trades: Trade[];
}

async function getTokenTrades(token: string): Promise<Trade[]> {
  try {
    const url = `${BIRDEYE_BASE_URL}/defi/txs/token?address=${token}&tx_type=swap&sort_type=desc&limit=50`;
    const response = await rateLimitedFetch(url);

    if (!response.ok) {
      console.log(`  ⚠️ Failed to fetch ${token.slice(0, 12)}...: ${response.status}`);
      return [];
    }

    const json = await response.json() as any;
    const items = json.data?.items || [];

    return items.map((item: any) => ({
      wallet: item.owner,
      token,
      side: item.side as "buy" | "sell",
      timestamp: item.blockUnixTime,
      priceUsd: item.price || 0,
      amountUsd: Math.abs(item.volumeUSD || 0),
    }));
  } catch (e) {
    console.log(`  ⚠️ Error fetching ${token.slice(0, 12)}...: ${e}`);
    return [];
  }
}

function analyzeWallet(trades: Trade[]): WalletStats | null {
  if (trades.length === 0) return null;

  const wallet = trades[0].wallet;
  const tokensTraded = new Set(trades.map(t => t.token));

  // Group trades by token
  const tradesByToken = new Map<string, Trade[]>();
  for (const trade of trades) {
    const existing = tradesByToken.get(trade.token) || [];
    existing.push(trade);
    tradesByToken.set(trade.token, existing);
  }

  // Calculate hold times from buy-sell pairs
  const holdTimes: number[] = [];
  let totalBuyUsd = 0;
  let totalSellUsd = 0;
  let completedRoundTrips = 0;

  for (const [token, tokenTrades] of tradesByToken) {
    // Sort by timestamp
    tokenTrades.sort((a, b) => a.timestamp - b.timestamp);

    const buys = tokenTrades.filter(t => t.side === "buy");
    const sells = tokenTrades.filter(t => t.side === "sell");

    // Match buys with subsequent sells
    for (const buy of buys) {
      totalBuyUsd += buy.amountUsd;

      const matchingSell = sells.find(s => s.timestamp > buy.timestamp);
      if (matchingSell) {
        const holdTime = matchingSell.timestamp - buy.timestamp;
        holdTimes.push(holdTime);
        totalSellUsd += matchingSell.amountUsd;
        completedRoundTrips++;
      }
    }

    // Add sells that weren't matched (sold existing holdings)
    for (const sell of sells) {
      if (!buys.some(b => b.timestamp < sell.timestamp)) {
        totalSellUsd += sell.amountUsd;
      }
    }
  }

  if (holdTimes.length === 0) {
    return null; // No completed round trips
  }

  const avgHoldTime = holdTimes.reduce((a, b) => a + b, 0) / holdTimes.length;
  const minHoldTime = Math.min(...holdTimes);
  const maxHoldTime = Math.max(...holdTimes);

  const realizedPnlUsd = totalSellUsd - totalBuyUsd;
  const realizedPnlPercent = totalBuyUsd > 0 ? (realizedPnlUsd / totalBuyUsd) * 100 : 0;

  return {
    wallet,
    totalTrades: trades.length,
    tokensTraded,
    completedRoundTrips,
    avgHoldTimeSeconds: avgHoldTime,
    minHoldTimeSeconds: minHoldTime,
    maxHoldTimeSeconds: maxHoldTime,
    totalBuyUsd,
    totalSellUsd,
    realizedPnlUsd,
    realizedPnlPercent,
    trades,
  };
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(0)}s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

async function main() {
  console.log("=== Find Slow Traders ===\n");
  console.log("Looking for wallets with longer hold times...");
  console.log(`Minimum hold time: ${formatDuration(MIN_HOLD_TIME_SECONDS)}`);
  console.log(`Minimum tokens traded: ${MIN_BAGS_TOKENS_TRADED}`);
  console.log(`Minimum total trades: ${MIN_TOTAL_TRADES}\n`);

  if (!BIRDEYE_API_KEY) {
    console.error("ERROR: BIRDEYE_API_KEY not set");
    process.exit(1);
  }

  // Collect all trades
  const allTrades: Trade[] = [];

  console.log("Step 1: Collecting trades from Bags tokens...\n");
  for (const token of BAGS_TOKENS) {
    console.log(`  Fetching ${token.slice(0, 16)}...`);
    const trades = await getTokenTrades(token);
    console.log(`    Found ${trades.length} trades`);
    allTrades.push(...trades);
  }

  console.log(`\nTotal trades collected: ${allTrades.length}`);

  // Group by wallet
  const tradesByWallet = new Map<string, Trade[]>();
  for (const trade of allTrades) {
    if (!trade.wallet) continue;
    const existing = tradesByWallet.get(trade.wallet) || [];
    existing.push(trade);
    tradesByWallet.set(trade.wallet, existing);
  }

  console.log(`Unique wallets: ${tradesByWallet.size}`);

  // Analyze each wallet
  console.log("\nStep 2: Analyzing wallet behavior...\n");
  const walletStats: WalletStats[] = [];

  for (const [wallet, trades] of tradesByWallet) {
    const stats = analyzeWallet(trades);
    if (stats) {
      walletStats.push(stats);
    }
  }

  console.log(`Wallets with completed round trips: ${walletStats.length}`);

  // Filter for "slow traders"
  const slowTraders = walletStats.filter(w =>
    w.avgHoldTimeSeconds >= MIN_HOLD_TIME_SECONDS &&
    w.tokensTraded.size >= MIN_BAGS_TOKENS_TRADED &&
    w.totalTrades >= MIN_TOTAL_TRADES &&
    w.realizedPnlPercent > 0 // Must be profitable
  );

  // Sort by P&L
  slowTraders.sort((a, b) => b.realizedPnlPercent - a.realizedPnlPercent);

  // Report
  console.log("\n" + "=".repeat(100));
  console.log("SLOW TRADER DISCOVERY RESULTS");
  console.log("=".repeat(100));

  console.log(`\nTotal wallets analyzed: ${tradesByWallet.size}`);
  console.log(`Wallets with round trips: ${walletStats.length}`);
  console.log(`Slow traders (hold >5min, profitable): ${slowTraders.length}`);

  if (slowTraders.length > 0) {
    console.log("\n--- Top Slow Traders (Sorted by P&L) ---\n");
    console.log(
      "Wallet".padEnd(14) +
      "Tokens".padEnd(8) +
      "Trades".padEnd(8) +
      "Avg Hold".padEnd(12) +
      "Min Hold".padEnd(12) +
      "P&L %".padEnd(10) +
      "Buy $".padEnd(12) +
      "Verdict"
    );
    console.log("-".repeat(100));

    for (const w of slowTraders.slice(0, 20)) {
      // Determine verdict
      let verdict = "⚠️ REVIEW";
      if (w.avgHoldTimeSeconds > 600 && w.tokensTraded.size >= 3 && w.realizedPnlPercent > 10) {
        verdict = "✅ STRONG";
      } else if (w.avgHoldTimeSeconds > 300 && w.realizedPnlPercent > 5) {
        verdict = "👍 GOOD";
      }

      console.log(
        w.wallet.slice(0, 12).padEnd(14) +
        w.tokensTraded.size.toString().padEnd(8) +
        w.totalTrades.toString().padEnd(8) +
        formatDuration(w.avgHoldTimeSeconds).padEnd(12) +
        formatDuration(w.minHoldTimeSeconds).padEnd(12) +
        `${w.realizedPnlPercent.toFixed(1)}%`.padEnd(10) +
        `$${w.totalBuyUsd.toFixed(0)}`.padEnd(12) +
        verdict
      );
    }
  } else {
    console.log("\n⚠️ No slow traders found matching criteria.");
    console.log("This might mean:");
    console.log("  1. Bags traders are mostly fast flippers");
    console.log("  2. Need to expand token list");
    console.log("  3. Need to lower hold time threshold");
  }

  // Show ALL wallets with round trips for analysis
  console.log("\n--- ALL Wallets with Round Trips (for analysis) ---\n");
  console.log(
    "Wallet".padEnd(14) +
    "Tokens".padEnd(8) +
    "Trips".padEnd(8) +
    "Avg Hold".padEnd(12) +
    "P&L %".padEnd(12) +
    "Status"
  );
  console.log("-".repeat(80));

  const allByPnl = [...walletStats].sort((a, b) => b.realizedPnlPercent - a.realizedPnlPercent);
  for (const w of allByPnl.slice(0, 30)) {
    let status = "";
    if (w.avgHoldTimeSeconds < MIN_HOLD_TIME_SECONDS) status += "⏱️ Fast ";
    if (w.tokensTraded.size < MIN_BAGS_TOKENS_TRADED) status += "🎯 Single-token ";
    if (w.realizedPnlPercent <= 0) status += "📉 Loss ";
    if (status === "") status = "✅ Eligible";

    console.log(
      w.wallet.slice(0, 12).padEnd(14) +
      w.tokensTraded.size.toString().padEnd(8) +
      w.completedRoundTrips.toString().padEnd(8) +
      formatDuration(w.avgHoldTimeSeconds).padEnd(12) +
      `${w.realizedPnlPercent.toFixed(1)}%`.padEnd(12) +
      status
    );
  }

  // Compare to fast traders
  const fastTraders = walletStats
    .filter(w => w.avgHoldTimeSeconds < 60 && w.realizedPnlPercent > 0)
    .sort((a, b) => b.realizedPnlPercent - a.realizedPnlPercent);

  console.log("\n--- Fast Traders (Hold <1min) for Comparison ---\n");
  if (fastTraders.length > 0) {
    for (const w of fastTraders.slice(0, 5)) {
      console.log(
        `  ${w.wallet.slice(0, 12)}... ` +
        `Hold: ${formatDuration(w.avgHoldTimeSeconds)} ` +
        `P&L: ${w.realizedPnlPercent.toFixed(1)}% ` +
        `(NOT SUITABLE - latency will kill edge)`
      );
    }
  } else {
    console.log("  No fast profitable traders found.");
  }

  // Save results
  const report = {
    generated_at: new Date().toISOString(),
    parameters: {
      min_hold_time_seconds: MIN_HOLD_TIME_SECONDS,
      min_tokens_traded: MIN_BAGS_TOKENS_TRADED,
      min_total_trades: MIN_TOTAL_TRADES,
    },
    tokens_analyzed: BAGS_TOKENS.length,
    total_trades: allTrades.length,
    unique_wallets: tradesByWallet.size,
    wallets_with_round_trips: walletStats.length,
    slow_traders_found: slowTraders.length,
    slow_traders: slowTraders.map(w => ({
      wallet: w.wallet,
      tokens_traded: w.tokensTraded.size,
      total_trades: w.totalTrades,
      completed_round_trips: w.completedRoundTrips,
      avg_hold_time_seconds: w.avgHoldTimeSeconds,
      min_hold_time_seconds: w.minHoldTimeSeconds,
      max_hold_time_seconds: w.maxHoldTimeSeconds,
      total_buy_usd: w.totalBuyUsd,
      total_sell_usd: w.totalSellUsd,
      realized_pnl_usd: w.realizedPnlUsd,
      realized_pnl_percent: w.realizedPnlPercent,
    })),
    fast_traders: fastTraders.slice(0, 10).map(w => ({
      wallet: w.wallet,
      avg_hold_time_seconds: w.avgHoldTimeSeconds,
      realized_pnl_percent: w.realizedPnlPercent,
    })),
  };

  await Bun.write("reports/slow_traders.json", JSON.stringify(report, null, 2));
  console.log("\nReport saved to reports/slow_traders.json");

  // Recommendation
  console.log("\n" + "=".repeat(60));
  console.log("RECOMMENDATION");
  console.log("=".repeat(60));

  if (slowTraders.length >= 5) {
    console.log("\n✅ Found enough slow traders for testing.");
    console.log("Next: Run backtest with these wallets to verify edge survives latency.");
  } else if (slowTraders.length > 0) {
    console.log("\n⚠️ Found some slow traders but sample is small.");
    console.log("Options:");
    console.log("  1. Expand Bags token list (monitor Fee Share V1 for new tokens)");
    console.log("  2. Lower hold time threshold (but increases latency risk)");
    console.log("  3. Test with available wallets and see results");
  } else {
    console.log("\n❌ No slow traders found.");
    console.log("Bags.fm may not be suitable for copy trading.");
    console.log("Consider: Different strategy or different platform.");
  }
}

main().catch(console.error);
