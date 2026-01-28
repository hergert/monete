// Historical Backtest - Simulate following wallets with realistic latency
// This answers: "Would we have made money following these wallets?"

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || "";
const BIRDEYE_BASE_URL = "https://public-api.birdeye.so";

// Our validated wallets
const WALLETS_TO_BACKTEST = [
  "5zf7uryG7jXMEnKvSM2WmmHcJu3Q2fXBpUjZkE7XC2Xr", // 45.9% historical P&L
  "gasTzr94Pmp4Gf8vknQnqxeYxdgwFjbgdJa4msYRpnB",  // 18.0% historical P&L
];

// Known Bags tokens (from our analysis)
const BAGS_TOKENS = [
  "7Mxvi7bi5bnjELB4QNzQ4VrQEPeBgPbWwbfwE1ydBAGS",
  "G1DXVVmqJs8Ei79QbK41dpgk2WtXSGqLtx9of7o8BAGS",
  "5arEQv5tGJj8UbhnPrc1WL5KMmijCe4FuexCaEXUBAGS",
  "2ZhzUhaPm8L9g6iUF1LegbjFHJyXdEXahi8R4eQhBAGS",
  "78a6Cbggc2axnGQyuM5iA91oN1Qt93M95NswhhzPBAGS",
  "ArhUyCSWvDKD7tXcTcgTaYxBkDZiFVkmxzyZXmUJBAGS",
  "ehipS3kn9GUSnEMgtB9RxCNBVfH5gTNRVxNtqFTBAGS",
  "H5hygVvXiYxk2a3BVtjiqcDJK8TdHTB5u5U1fXEuBAGS",
  "FFEjZnvY1tqHyBAMBPE1DHoEmQWLmxjhvvDs4TaRBAGS",
  "k9BKDF8x9Y6nBbGVL938yPT33h4zo8p8GTsi4wJBAGS",
  "CdyjsXbPs6VamxNk7StU5apXFHAiM7q8FTYAN3rdBAGS",
];

// Simulation parameters
const DETECTION_LATENCY_MS = 1400;  // From live testing
const PRICE_FETCH_LATENCY_MS = 1000; // From live testing
const TOTAL_LATENCY_MS = DETECTION_LATENCY_MS + PRICE_FETCH_LATENCY_MS;
const SWAP_FEE_PERCENT = 0.3; // Per swap
const ROUND_TRIP_FEE_PERCENT = SWAP_FEE_PERCENT * 2;

// Rate limiting
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

interface WalletTrade {
  txHash: string;
  blockUnixTime: number;
  side: "buy" | "sell";
  token: string;
  tokenAmount: number;
  solAmount: number;
  priceUsd: number;
}

interface SimulatedTrade {
  walletBuyTime: number;
  ourEntryTime: number;
  walletBuyPrice: number;
  ourEntryPrice: number | null;
  walletSellTime: number | null;
  ourExitTime: number | null;
  walletSellPrice: number | null;
  ourExitPrice: number | null;
  token: string;
  walletPnlPercent: number | null;
  ourPnlPercent: number | null;
  ourPnlAfterFees: number | null;
  status: "open" | "closed" | "no_exit_data";
}

// Get wallet's trade history for a specific token
async function getWalletTokenTrades(wallet: string, token: string): Promise<WalletTrade[]> {
  try {
    // Use Birdeye's token trades endpoint and filter by wallet
    const url = `${BIRDEYE_BASE_URL}/defi/txs/token?address=${token}&tx_type=swap&sort_type=desc&limit=50`;
    const response = await rateLimitedFetch(url);

    if (!response.ok) {
      return [];
    }

    const json = await response.json() as any;
    const items = json.data?.items || [];

    // Filter for our wallet
    return items
      .filter((item: any) => item.owner === wallet)
      .map((item: any) => ({
        txHash: item.txHash,
        blockUnixTime: item.blockUnixTime,
        side: item.side as "buy" | "sell",
        token,
        tokenAmount: item.from?.uiAmount || item.to?.uiAmount || 0,
        solAmount: item.volumeUSD / (item.price || 1), // Approximate
        priceUsd: item.price || 0,
      }));
  } catch (e) {
    console.error(`Error fetching trades for ${wallet} on ${token}: ${e}`);
    return [];
  }
}

// Get historical OHLCV to estimate price at a specific time
async function getPriceAtTime(token: string, timestampSec: number): Promise<number | null> {
  try {
    // Use 1-minute OHLCV data
    const timeFrom = timestampSec - 60;
    const timeTo = timestampSec + 60;
    const url = `${BIRDEYE_BASE_URL}/defi/ohlcv?address=${token}&type=1m&time_from=${timeFrom}&time_to=${timeTo}`;

    const response = await rateLimitedFetch(url);
    if (!response.ok) {
      return null;
    }

    const json = await response.json() as any;
    const items = json.data?.items || [];

    if (items.length === 0) {
      return null;
    }

    // Find the closest candle to our target time
    let closest = items[0];
    let minDiff = Math.abs(items[0].unixTime - timestampSec);

    for (const item of items) {
      const diff = Math.abs(item.unixTime - timestampSec);
      if (diff < minDiff) {
        minDiff = diff;
        closest = item;
      }
    }

    // Use the close price of the candle
    return closest.c || closest.close || null;
  } catch (e) {
    return null;
  }
}

// Get current price for tokens that might still be tradeable
async function getCurrentPrice(token: string): Promise<number | null> {
  try {
    const url = `${BIRDEYE_BASE_URL}/defi/price?address=${token}`;
    const response = await rateLimitedFetch(url);
    if (!response.ok) return null;
    const json = await response.json() as any;
    return json.data?.value || null;
  } catch {
    return null;
  }
}

async function simulateWalletTrades(wallet: string): Promise<SimulatedTrade[]> {
  console.log(`\nSimulating trades for ${wallet.slice(0, 12)}...`);

  const allTrades: WalletTrade[] = [];

  // Collect all trades across all Bags tokens
  for (const token of BAGS_TOKENS) {
    console.log(`  Fetching trades for ${token.slice(0, 12)}...`);
    const trades = await getWalletTokenTrades(wallet, token);
    allTrades.push(...trades);
    if (trades.length > 0) {
      console.log(`    Found ${trades.length} trades`);
    }
  }

  console.log(`  Total trades found: ${allTrades.length}`);

  if (allTrades.length === 0) {
    return [];
  }

  // Group trades by token
  const tradesByToken = new Map<string, WalletTrade[]>();
  for (const trade of allTrades) {
    const existing = tradesByToken.get(trade.token) || [];
    existing.push(trade);
    tradesByToken.set(trade.token, existing);
  }

  const simulations: SimulatedTrade[] = [];

  // For each token, match buys with sells
  for (const [token, trades] of tradesByToken) {
    // Sort by time
    trades.sort((a, b) => a.blockUnixTime - b.blockUnixTime);

    const buys = trades.filter(t => t.side === "buy");
    const sells = trades.filter(t => t.side === "sell");

    console.log(`  Token ${token.slice(0, 12)}: ${buys.length} buys, ${sells.length} sells`);

    for (const buy of buys) {
      // Find the first sell after this buy
      const matchingSell = sells.find(s => s.blockUnixTime > buy.blockUnixTime);

      // Calculate our entry time (with latency)
      const ourEntryTimeSec = buy.blockUnixTime + Math.floor(TOTAL_LATENCY_MS / 1000);

      // Get our entry price (price at our delayed entry time)
      console.log(`    Getting price at entry time...`);
      const ourEntryPrice = await getPriceAtTime(token, ourEntryTimeSec);

      let simulation: SimulatedTrade = {
        walletBuyTime: buy.blockUnixTime,
        ourEntryTime: ourEntryTimeSec,
        walletBuyPrice: buy.priceUsd,
        ourEntryPrice,
        walletSellTime: null,
        ourExitTime: null,
        walletSellPrice: null,
        ourExitPrice: null,
        token,
        walletPnlPercent: null,
        ourPnlPercent: null,
        ourPnlAfterFees: null,
        status: "open",
      };

      if (matchingSell) {
        const ourExitTimeSec = matchingSell.blockUnixTime + Math.floor(TOTAL_LATENCY_MS / 1000);

        console.log(`    Getting price at exit time...`);
        const ourExitPrice = await getPriceAtTime(token, ourExitTimeSec);

        simulation.walletSellTime = matchingSell.blockUnixTime;
        simulation.ourExitTime = ourExitTimeSec;
        simulation.walletSellPrice = matchingSell.priceUsd;
        simulation.ourExitPrice = ourExitPrice;

        // Calculate P&L
        if (buy.priceUsd > 0 && matchingSell.priceUsd > 0) {
          simulation.walletPnlPercent = ((matchingSell.priceUsd - buy.priceUsd) / buy.priceUsd) * 100;
        }

        if (ourEntryPrice && ourExitPrice && ourEntryPrice > 0) {
          simulation.ourPnlPercent = ((ourExitPrice - ourEntryPrice) / ourEntryPrice) * 100;
          simulation.ourPnlAfterFees = simulation.ourPnlPercent - ROUND_TRIP_FEE_PERCENT;
          simulation.status = "closed";
        } else {
          simulation.status = "no_exit_data";
        }
      } else {
        // No sell found - check current price for open position
        console.log(`    No sell found, checking current price...`);
        const currentPrice = await getCurrentPrice(token);
        if (currentPrice && ourEntryPrice && ourEntryPrice > 0) {
          simulation.ourExitPrice = currentPrice;
          simulation.ourPnlPercent = ((currentPrice - ourEntryPrice) / ourEntryPrice) * 100;
          simulation.ourPnlAfterFees = simulation.ourPnlPercent - ROUND_TRIP_FEE_PERCENT;
        }
        simulation.status = "open";
      }

      simulations.push(simulation);
    }
  }

  return simulations;
}

async function main() {
  console.log("=== Historical Backtest Simulation ===\n");
  console.log("Parameters:");
  console.log(`  Detection latency: ${DETECTION_LATENCY_MS}ms`);
  console.log(`  Price fetch latency: ${PRICE_FETCH_LATENCY_MS}ms`);
  console.log(`  Total latency: ${TOTAL_LATENCY_MS}ms`);
  console.log(`  Round-trip fees: ${ROUND_TRIP_FEE_PERCENT}%`);

  if (!BIRDEYE_API_KEY) {
    console.error("\nERROR: BIRDEYE_API_KEY not set");
    process.exit(1);
  }

  const allSimulations: SimulatedTrade[] = [];

  for (const wallet of WALLETS_TO_BACKTEST) {
    const sims = await simulateWalletTrades(wallet);
    allSimulations.push(...sims);
  }

  // Generate report
  console.log("\n" + "=".repeat(80));
  console.log("BACKTEST RESULTS");
  console.log("=".repeat(80));

  const closed = allSimulations.filter(s => s.status === "closed");
  const open = allSimulations.filter(s => s.status === "open");
  const noData = allSimulations.filter(s => s.status === "no_exit_data");

  console.log(`\nTotal simulated trades: ${allSimulations.length}`);
  console.log(`  Closed (with P&L): ${closed.length}`);
  console.log(`  Open (no sell yet): ${open.length}`);
  console.log(`  No price data: ${noData.length}`);

  if (closed.length > 0) {
    // Wallet's actual P&L
    const walletPnls = closed
      .filter(s => s.walletPnlPercent !== null)
      .map(s => s.walletPnlPercent!);
    const avgWalletPnl = walletPnls.reduce((a, b) => a + b, 0) / walletPnls.length;

    // Our simulated P&L
    const ourPnls = closed
      .filter(s => s.ourPnlPercent !== null)
      .map(s => s.ourPnlPercent!);
    const avgOurPnl = ourPnls.reduce((a, b) => a + b, 0) / ourPnls.length;

    // Our P&L after fees
    const ourPnlsAfterFees = closed
      .filter(s => s.ourPnlAfterFees !== null)
      .map(s => s.ourPnlAfterFees!);
    const avgOurPnlAfterFees = ourPnlsAfterFees.reduce((a, b) => a + b, 0) / ourPnlsAfterFees.length;

    // Win rate
    const winners = ourPnlsAfterFees.filter(p => p > 0).length;
    const winRate = (winners / ourPnlsAfterFees.length) * 100;

    console.log("\n--- P&L Comparison ---");
    console.log(`Wallet's avg P&L: ${avgWalletPnl >= 0 ? "+" : ""}${avgWalletPnl.toFixed(2)}%`);
    console.log(`Our avg P&L (with latency): ${avgOurPnl >= 0 ? "+" : ""}${avgOurPnl.toFixed(2)}%`);
    console.log(`Our avg P&L (after fees): ${avgOurPnlAfterFees >= 0 ? "+" : ""}${avgOurPnlAfterFees.toFixed(2)}%`);
    console.log(`Win rate (after fees): ${winRate.toFixed(1)}%`);

    // Edge decay
    const edgeDecay = avgWalletPnl - avgOurPnlAfterFees;
    console.log(`\nEdge decay (wallet P&L - our P&L): ${edgeDecay.toFixed(2)}%`);

    console.log("\n--- Individual Trades ---");
    for (const sim of closed) {
      const walletPnl = sim.walletPnlPercent?.toFixed(2) || "?";
      const ourPnl = sim.ourPnlAfterFees?.toFixed(2) || "?";
      const emoji = (sim.ourPnlAfterFees || 0) >= 0 ? "✅" : "❌";
      console.log(`${emoji} ${sim.token.slice(0, 12)}... Wallet: ${walletPnl}% → Us: ${ourPnl}%`);
    }
  }

  if (open.length > 0) {
    console.log("\n--- Open Positions (unrealized) ---");
    for (const sim of open) {
      const unrealizedPnl = sim.ourPnlAfterFees?.toFixed(2) || "?";
      console.log(`📊 ${sim.token.slice(0, 12)}... Unrealized: ${unrealizedPnl}%`);
    }
  }

  // Verdict
  console.log("\n" + "=".repeat(80));
  console.log("VERDICT");
  console.log("=".repeat(80));

  if (closed.length === 0) {
    console.log("\n⚠️  NOT ENOUGH DATA");
    console.log("No closed trades found. Need more historical data or different wallets.");
  } else {
    const avgOurPnlAfterFees = closed
      .filter(s => s.ourPnlAfterFees !== null)
      .map(s => s.ourPnlAfterFees!)
      .reduce((a, b) => a + b, 0) / closed.length;

    if (avgOurPnlAfterFees > 0) {
      console.log("\n✅ POSITIVE EXPECTED VALUE");
      console.log(`Following these wallets with ${TOTAL_LATENCY_MS}ms latency = +${avgOurPnlAfterFees.toFixed(2)}% avg`);
      console.log("Recommendation: Continue to Phase 1 paper trading");
    } else {
      console.log("\n❌ NEGATIVE EXPECTED VALUE");
      console.log(`Following these wallets with ${TOTAL_LATENCY_MS}ms latency = ${avgOurPnlAfterFees.toFixed(2)}% avg`);
      console.log("Recommendation: Find better wallets or reduce latency");
    }
  }

  // Save report
  const report = {
    generated_at: new Date().toISOString(),
    parameters: {
      detection_latency_ms: DETECTION_LATENCY_MS,
      price_fetch_latency_ms: PRICE_FETCH_LATENCY_MS,
      total_latency_ms: TOTAL_LATENCY_MS,
      round_trip_fee_percent: ROUND_TRIP_FEE_PERCENT,
    },
    wallets_tested: WALLETS_TO_BACKTEST,
    tokens_checked: BAGS_TOKENS.length,
    summary: {
      total_trades: allSimulations.length,
      closed_trades: closed.length,
      open_trades: open.length,
      no_data_trades: noData.length,
    },
    simulations: allSimulations,
  };

  await Bun.write("reports/backtest_results.json", JSON.stringify(report, null, 2));
  console.log("\nReport saved to reports/backtest_results.json");
}

main().catch(console.error);
