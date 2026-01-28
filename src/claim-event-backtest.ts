// Claim Event Backtest - Test if creator claim events predict positive returns
// This is the "Creator Awakening" strategy validation

const BAGS_API_KEY = process.env.BAGS_API_KEY || "";
const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || "";

// Our known tokens
const BAGS_TOKENS = [
  "7Mxvi7bi5bnjELB4QNzQ4VrQEPeBgPbWwbfwE1ydBAGS",
  "G1DXVVmqJs8Ei79QbK41dpgk2WtXSGqLtx9of7o8BAGS",
  "5arEQv5tGJj8UbhnPrc1WL5KMmijCe4FuexCaEXUBAGS",
  "ehipS3kn9GUSnEMgtB9RxCNBVfH5gTNRVxNtqFTBAGS",
  "FFEjZnvY1tqHyBAMBPE1DHoEmQWLmxjhvvDs4TaRBAGS",
  "CdyjsXbPs6VamxNk7StU5apXFHAiM7q8FTYAN3rdBAGS",
  "4TnX4sagctNgaN8pWr12LxcHQadiU8adLjm7AobWBAGS",
  "8hAQzGAmSBnha8bDbudVuQozMRiidAqZyhkWjYxGBAGS",
  "BpAiFPCqjvnz7ETKjxr6ZpEKKnGGBE7rNZUU7A7eBAGS",
];

interface ClaimEvent {
  wallet: string;
  isCreator: boolean;
  amount: string;
  signature: string;
  timestamp: number;
}

interface BacktestTrade {
  token: string;
  claimTimestamp: number;
  claimAmount: number;
  entryTimestamp: number;
  entryPrice: number | null;
  exit1h: { price: number | null; returnPct: number | null };
  exit6h: { price: number | null; returnPct: number | null };
  exit24h: { price: number | null; returnPct: number | null };
  netReturn1h: number | null; // After 2.14% fees
  netReturn6h: number | null;
  netReturn24h: number | null;
}

// Rate limiting
let lastBagsRequest = 0;
let lastBirdeyeRequest = 0;

async function bagsApiFetch(endpoint: string): Promise<any> {
  const now = Date.now();
  if (now - lastBagsRequest < 100) {
    await new Promise(r => setTimeout(r, 100 - (now - lastBagsRequest)));
  }
  lastBagsRequest = Date.now();

  const response = await fetch(`https://public-api-v2.bags.fm/api/v1${endpoint}`, {
    headers: { "x-api-key": BAGS_API_KEY },
  });

  if (!response.ok) {
    throw new Error(`Bags API error: ${response.status}`);
  }

  const json = await response.json() as any;
  if (!json.success) {
    throw new Error(`Bags API error: ${json.error}`);
  }

  return json.response;
}

async function birdeyeFetch(endpoint: string): Promise<any> {
  const now = Date.now();
  if (now - lastBirdeyeRequest < 500) {
    await new Promise(r => setTimeout(r, 500 - (now - lastBirdeyeRequest)));
  }
  lastBirdeyeRequest = Date.now();

  const response = await fetch(`https://public-api.birdeye.so${endpoint}`, {
    headers: {
      "X-API-KEY": BIRDEYE_API_KEY,
      "x-chain": "solana",
    },
  });

  if (!response.ok) {
    return null;
  }

  const json = await response.json() as any;
  return json.data;
}

async function getClaimEvents(tokenMint: string): Promise<ClaimEvent[]> {
  try {
    // Get all claim events for this token
    const data = await bagsApiFetch(
      `/fee-share/token/claim-events?tokenMint=${tokenMint}&mode=time&from=0&to=9999999999`
    );
    return data.events || [];
  } catch (e) {
    console.log(`  Error getting claim events: ${e}`);
    return [];
  }
}

async function getLifetimeFees(tokenMint: string): Promise<number> {
  try {
    const data = await bagsApiFetch(`/token-launch/lifetime-fees?tokenMint=${tokenMint}`);
    return parseInt(data) || 0;
  } catch (e) {
    return 0;
  }
}

async function getClaimStats(tokenMint: string): Promise<{ wallet: string; totalClaimed: string }[]> {
  try {
    const data = await bagsApiFetch(`/token-launch/claim-stats?tokenMint=${tokenMint}`);
    return data || [];
  } catch (e) {
    return [];
  }
}

async function getPriceAtTime(tokenMint: string, timestampSec: number): Promise<number | null> {
  try {
    // Use 1-minute OHLCV data
    const timeFrom = timestampSec - 60;
    const timeTo = timestampSec + 60;
    const data = await birdeyeFetch(
      `/defi/ohlcv?address=${tokenMint}&type=1m&time_from=${timeFrom}&time_to=${timeTo}`
    );

    if (!data || !data.items || data.items.length === 0) {
      return null;
    }

    // Return the close price of the nearest candle
    return data.items[0].c || null;
  } catch (e) {
    return null;
  }
}

async function main() {
  console.log("=== Claim Event Backtest ===\n");
  console.log("Question: Do creator claim events predict positive forward returns?\n");

  if (!BAGS_API_KEY) {
    console.error("ERROR: BAGS_API_KEY not set");
    process.exit(1);
  }

  if (!BIRDEYE_API_KEY) {
    console.error("ERROR: BIRDEYE_API_KEY not set");
    process.exit(1);
  }

  const allTrades: BacktestTrade[] = [];
  const ROUND_TRIP_FEES = 0.0214; // 2.14% verified

  for (const token of BAGS_TOKENS) {
    console.log(`\nAnalyzing ${token.slice(0, 12)}...`);

    // Get claim events
    const events = await getClaimEvents(token);
    console.log(`  Total claim events: ${events.length}`);

    // Filter for creator claims only
    const creatorClaims = events.filter(e => e.isCreator === true);
    console.log(`  Creator claims: ${creatorClaims.length}`);

    if (creatorClaims.length === 0) {
      console.log(`  No creator claims found`);

      // Check unclaimed fees (powder keg status)
      const lifetimeFees = await getLifetimeFees(token);
      const claimStats = await getClaimStats(token);
      const totalClaimed = claimStats.reduce((sum, c) => sum + parseInt(c.totalClaimed || "0"), 0);
      const unclaimed = lifetimeFees - totalClaimed;
      const unclaimedSol = unclaimed / 1e9;

      if (unclaimedSol > 0.1) {
        console.log(`  ⚡ POWDER KEG: ${unclaimedSol.toFixed(2)} SOL unclaimed`);
      }
      continue;
    }

    // Get first creator claim
    const sortedClaims = creatorClaims.sort((a, b) => a.timestamp - b.timestamp);
    const firstCreatorClaim = sortedClaims[0];

    console.log(`  First creator claim: ${new Date(firstCreatorClaim.timestamp * 1000).toISOString()}`);
    console.log(`    Amount: ${(parseInt(firstCreatorClaim.amount) / 1e9).toFixed(4)} SOL`);

    // Simulate entry 5 minutes after claim
    const entryTimestamp = firstCreatorClaim.timestamp + 300; // +5 min
    const entryPrice = await getPriceAtTime(token, entryTimestamp);

    if (!entryPrice) {
      console.log(`  Could not get entry price`);
      continue;
    }

    console.log(`  Entry price (t+5min): $${entryPrice.toFixed(10)}`);

    // Get exit prices at 1h, 6h, 24h
    const exit1hPrice = await getPriceAtTime(token, entryTimestamp + 3600);
    const exit6hPrice = await getPriceAtTime(token, entryTimestamp + 21600);
    const exit24hPrice = await getPriceAtTime(token, entryTimestamp + 86400);

    const calcReturn = (exitPrice: number | null, entryPrice: number): number | null => {
      if (!exitPrice) return null;
      return ((exitPrice - entryPrice) / entryPrice) * 100;
    };

    const return1h = calcReturn(exit1hPrice, entryPrice);
    const return6h = calcReturn(exit6hPrice, entryPrice);
    const return24h = calcReturn(exit24hPrice, entryPrice);

    // Net returns after fees
    const netReturn = (gross: number | null): number | null => {
      if (gross === null) return null;
      return gross - (ROUND_TRIP_FEES * 100);
    };

    const trade: BacktestTrade = {
      token,
      claimTimestamp: firstCreatorClaim.timestamp,
      claimAmount: parseInt(firstCreatorClaim.amount) / 1e9,
      entryTimestamp,
      entryPrice,
      exit1h: { price: exit1hPrice, returnPct: return1h },
      exit6h: { price: exit6hPrice, returnPct: return6h },
      exit24h: { price: exit24hPrice, returnPct: return24h },
      netReturn1h: netReturn(return1h),
      netReturn6h: netReturn(return6h),
      netReturn24h: netReturn(return24h),
    };

    allTrades.push(trade);

    console.log(`  Returns: 1h=${return1h?.toFixed(1) || "N/A"}%, 6h=${return6h?.toFixed(1) || "N/A"}%, 24h=${return24h?.toFixed(1) || "N/A"}%`);
    console.log(`  Net (after 2.14% fees): 1h=${trade.netReturn1h?.toFixed(1) || "N/A"}%, 6h=${trade.netReturn6h?.toFixed(1) || "N/A"}%, 24h=${trade.netReturn24h?.toFixed(1) || "N/A"}%`);
  }

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("BACKTEST RESULTS");
  console.log("=".repeat(70));

  console.log(`\nTotal tokens analyzed: ${BAGS_TOKENS.length}`);
  console.log(`Tokens with creator claims: ${allTrades.length}`);

  if (allTrades.length === 0) {
    console.log("\n❌ No creator claims found in any token.");
    console.log("This strategy cannot be backtested with current data.");
    console.log("\nPossible reasons:");
    console.log("  1. Creators haven't claimed yet (powder keg opportunity?)");
    console.log("  2. isCreator flag not set correctly in data");
    console.log("  3. Sample is too small");
    return;
  }

  // Calculate statistics
  const validTrades1h = allTrades.filter(t => t.netReturn1h !== null);
  const validTrades6h = allTrades.filter(t => t.netReturn6h !== null);
  const validTrades24h = allTrades.filter(t => t.netReturn24h !== null);

  const avgReturn = (trades: BacktestTrade[], getter: (t: BacktestTrade) => number | null): number | null => {
    const valid = trades.filter(t => getter(t) !== null);
    if (valid.length === 0) return null;
    return valid.reduce((sum, t) => sum + (getter(t) || 0), 0) / valid.length;
  };

  const winRate = (trades: BacktestTrade[], getter: (t: BacktestTrade) => number | null): number | null => {
    const valid = trades.filter(t => getter(t) !== null);
    if (valid.length === 0) return null;
    const winners = valid.filter(t => (getter(t) || 0) > 0).length;
    return (winners / valid.length) * 100;
  };

  console.log("\n--- Performance Summary ---");
  console.log("\nTime    | Trades | Avg Return | Win Rate | Verdict");
  console.log("-".repeat(60));

  const printRow = (label: string, trades: BacktestTrade[], getter: (t: BacktestTrade) => number | null) => {
    const avg = avgReturn(trades, getter);
    const win = winRate(trades, getter);
    const verdict = avg !== null && avg > 0 ? "✓ POSITIVE" : avg !== null ? "✗ NEGATIVE" : "N/A";
    console.log(
      `${label.padEnd(7)} | ${trades.length.toString().padEnd(6)} | ${avg !== null ? `${avg.toFixed(1)}%`.padEnd(10) : "N/A".padEnd(10)} | ${win !== null ? `${win.toFixed(0)}%`.padEnd(8) : "N/A".padEnd(8)} | ${verdict}`
    );
  };

  printRow("1h", validTrades1h, t => t.netReturn1h);
  printRow("6h", validTrades6h, t => t.netReturn6h);
  printRow("24h", validTrades24h, t => t.netReturn24h);

  // Individual trades
  console.log("\n--- Individual Trades ---");
  for (const trade of allTrades) {
    console.log(`\n${trade.token.slice(0, 16)}...`);
    console.log(`  Claim: ${new Date(trade.claimTimestamp * 1000).toISOString()}`);
    console.log(`  Entry: $${trade.entryPrice?.toFixed(10)}`);
    console.log(`  1h: ${trade.netReturn1h?.toFixed(1) || "N/A"}% net`);
    console.log(`  6h: ${trade.netReturn6h?.toFixed(1) || "N/A"}% net`);
    console.log(`  24h: ${trade.netReturn24h?.toFixed(1) || "N/A"}% net`);
  }

  // Final verdict
  console.log("\n" + "=".repeat(70));
  console.log("VERDICT");
  console.log("=".repeat(70));

  const avg24h = avgReturn(validTrades24h, t => t.netReturn24h);
  if (avg24h !== null && avg24h > 0) {
    console.log("\n✓ STRATEGY SHOWS POSITIVE EDGE");
    console.log(`  Average 24h net return: ${avg24h.toFixed(1)}%`);
    console.log("  Creator claim events appear to predict positive returns.");
    console.log("\n  Next step: Run live paper trading with this signal.");
  } else if (avg24h !== null) {
    console.log("\n✗ STRATEGY SHOWS NEGATIVE OR NEUTRAL");
    console.log(`  Average 24h net return: ${avg24h.toFixed(1)}%`);
    console.log("  Creator claim events do NOT predict positive returns.");
    console.log("\n  Consider: Pivot to partner-fee business model.");
  } else {
    console.log("\n? INSUFFICIENT DATA");
    console.log("  Not enough trades with price data to conclude.");
    console.log("\n  Consider: Expand token universe or wait for more claims.");
  }

  // Save report
  const report = {
    generated_at: new Date().toISOString(),
    parameters: {
      entry_delay_seconds: 300,
      round_trip_fees_pct: ROUND_TRIP_FEES * 100,
      exit_horizons: ["1h", "6h", "24h"],
    },
    summary: {
      tokens_analyzed: BAGS_TOKENS.length,
      tokens_with_creator_claims: allTrades.length,
      avg_net_return_1h: avgReturn(validTrades1h, t => t.netReturn1h),
      avg_net_return_6h: avgReturn(validTrades6h, t => t.netReturn6h),
      avg_net_return_24h: avgReturn(validTrades24h, t => t.netReturn24h),
      win_rate_1h: winRate(validTrades1h, t => t.netReturn1h),
      win_rate_6h: winRate(validTrades6h, t => t.netReturn6h),
      win_rate_24h: winRate(validTrades24h, t => t.netReturn24h),
    },
    trades: allTrades,
  };

  await Bun.write("reports/claim_event_backtest.json", JSON.stringify(report, null, 2));
  console.log("\nReport saved to reports/claim_event_backtest.json");
}

main().catch(console.error);
