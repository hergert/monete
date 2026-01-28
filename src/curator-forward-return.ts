// Curator Forward Return Backtest
// Question: Do curator wallet buys predict positive forward returns?
// Key insight: We don't need to copy their sells - just measure if their PICKS are good

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || "";
const BIRDEYE_BASE_URL = "https://public-api.birdeye.so";

// Our curator wallets (from slow_traders.json - wallets with >5min hold, multi-token, profitable)
const CURATOR_WALLETS = [
  "FoG4TcYvxy3Ntes3uNtnD6MEp6nJDW8uKngxKzaFSF9P", // 21.0% P&L, 42.5m hold
  "82zWEWdASgU9jKTbeftUKHrHtmE8c8nLsS1UQzMkECsw", // 16.6% P&L, 5.6h hold
  "ByAdav8AZd2qnpRoEJCnDLQqwGzRe4yRQzAG2zTjoGV5", // 14.4% P&L, 1.1h hold
  "D9J2kJeL9uWRcApPht4GCNq5De8NEM4ziMLkBqLtJ8Dn", // 14.1% P&L, 14.4h hold
  "HZdd11Fothq8Pk86k5kBFbgXuUdr39ALRfJSGozMA3nD", // 12.1% P&L, 4.0h hold
  "38cxrSEXZJ2JZpDwE8uvZqVWi4e5Rspkq6fK5hvx4Tmx", // 10.5% P&L, 23.8m hold
  "H9JGaqjUAn9YswMK7NTpwoQwyV1RPoHuVNo56eVi2X9N", // 7.8% P&L, 149.3h hold
  "3i51cKbLbaKAqvRJdCUaq9hsnvf9kqCfMujNgFj7nRKt", // 7.1% P&L, 13.7h hold
  "ByCrWXeynHEbEfX21a8hjS7YBygz7rRkNcEYSESdhtB6", // 6.4% P&L, 4.3h hold
  "APkGv3PxJWbTNc7x5mPGUhNdnq95HH4p2qzxBMj3fjYY", // 4.1% P&L, 2.7h hold
  "GDAtwgeoSik1aAnqPSehe8mgL4fZRhQmYfyxGw5tZ7tX", // 0.1% P&L, 1.8h hold
  "HydraXoSz7oE3774DoWQQaofKb31Kbn2cbcqG4ShKy85", // 0.1% P&L, 3.6h hold
];

// Bags tokens
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

// Parameters
const DETECTION_LATENCY_MS = 2400; // 2.4s observed latency
const ROUND_TRIP_FEES_PCT = 2.14; // Verified fee structure
const PULLBACK_PCT = 1.0; // Entry B: limit order 1% below
const PULLBACK_WINDOW_MIN = 10; // Wait up to 10 min for pullback fill

interface Trade {
  wallet: string;
  token: string;
  side: "buy" | "sell";
  timestamp: number;
  priceUsd: number;
}

interface OHLCVCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Signal {
  curator: string;
  token: string;
  buyTimestamp: number;
  buyPrice: number;
  // Entry A: naive (immediate)
  entryA_price: number | null;
  entryA_timestamp: number;
  // Entry B: pullback (limit order)
  entryB_price: number | null;
  entryB_filled: boolean;
  // Forward returns (from Entry A)
  return1h: number | null;
  return6h: number | null;
  return24h: number | null;
  // Forward returns (from Entry B, if filled)
  returnB_1h: number | null;
  returnB_6h: number | null;
  returnB_24h: number | null;
  // Prices for verification
  price1h: number | null;
  price6h: number | null;
  price24h: number | null;
}

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 550; // Birdeye rate limit

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

async function getTokenTrades(token: string): Promise<Trade[]> {
  try {
    const url = `${BIRDEYE_BASE_URL}/defi/txs/token?address=${token}&tx_type=swap&sort_type=desc&limit=50`;
    const response = await rateLimitedFetch(url);

    if (!response.ok) {
      console.log(`  ⚠️ Failed to fetch trades for ${token.slice(0, 12)}...: ${response.status}`);
      return [];
    }

    const json = await response.json() as any;
    const items = json.data?.items || [];

    return items.map((item: any) => ({
      wallet: item.owner,
      token,
      side: item.side as "buy" | "sell",
      timestamp: item.blockUnixTime,
      priceUsd: item.basePrice || item.tokenPrice || 0,
    }));
  } catch (e) {
    console.log(`  ⚠️ Error fetching trades: ${e}`);
    return [];
  }
}

async function getOHLCV(token: string, timeFrom: number, timeTo: number): Promise<OHLCVCandle[]> {
  try {
    // Use 1-minute candles for precision
    const url = `${BIRDEYE_BASE_URL}/defi/ohlcv?address=${token}&type=1m&time_from=${timeFrom}&time_to=${timeTo}`;
    const response = await rateLimitedFetch(url);

    if (!response.ok) {
      return [];
    }

    const json = await response.json() as any;
    const items = json.data?.items || [];

    return items.map((item: any) => ({
      time: item.unixTime,
      open: item.o,
      high: item.h,
      low: item.l,
      close: item.c,
    }));
  } catch (e) {
    return [];
  }
}

async function getPriceAtTime(token: string, timestamp: number): Promise<number | null> {
  const candles = await getOHLCV(token, timestamp - 60, timestamp + 60);
  if (candles.length === 0) return null;

  // Find nearest candle
  let nearest = candles[0];
  let minDiff = Math.abs(candles[0].time - timestamp);
  for (const c of candles) {
    const diff = Math.abs(c.time - timestamp);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = c;
    }
  }
  return nearest.close;
}

async function checkPullbackFill(token: string, afterTimestamp: number, targetPrice: number): Promise<{ filled: boolean; fillPrice: number | null }> {
  // Get OHLCV for next 10 minutes
  const candles = await getOHLCV(token, afterTimestamp, afterTimestamp + PULLBACK_WINDOW_MIN * 60);

  for (const candle of candles) {
    if (candle.low <= targetPrice) {
      // Price dipped to our limit order - we got filled
      return { filled: true, fillPrice: targetPrice };
    }
  }

  return { filled: false, fillPrice: null };
}

function calculateReturn(entryPrice: number, exitPrice: number | null): number | null {
  if (!exitPrice || entryPrice === 0) return null;
  return ((exitPrice - entryPrice) / entryPrice) * 100;
}

function calculateNetReturn(grossReturn: number | null): number | null {
  if (grossReturn === null) return null;
  return grossReturn - ROUND_TRIP_FEES_PCT;
}

async function main() {
  console.log("=== Curator Forward Return Backtest ===\n");
  console.log("Question: Do curator wallet buys predict positive forward returns?\n");
  console.log("Key insight: We measure token performance AFTER curator buys,");
  console.log("using OUR exits (time-based), not copying their sells.\n");

  if (!BIRDEYE_API_KEY) {
    console.error("ERROR: BIRDEYE_API_KEY not set");
    process.exit(1);
  }

  console.log(`Curator wallets: ${CURATOR_WALLETS.length}`);
  console.log(`Tokens to analyze: ${BAGS_TOKENS.length}`);
  console.log(`Detection latency: ${DETECTION_LATENCY_MS}ms`);
  console.log(`Round-trip fees: ${ROUND_TRIP_FEES_PCT}%`);
  console.log(`Pullback entry: ${PULLBACK_PCT}% below, ${PULLBACK_WINDOW_MIN}min window\n`);

  // Step 1: Collect all trades and find curator buys
  console.log("Step 1: Finding curator buy signals...\n");

  const curatorBuys: Trade[] = [];
  const curatorSet = new Set(CURATOR_WALLETS);

  for (const token of BAGS_TOKENS) {
    console.log(`  Fetching ${token.slice(0, 16)}...`);
    const trades = await getTokenTrades(token);

    // Find curator buys
    const buys = trades.filter(t => t.side === "buy" && curatorSet.has(t.wallet));
    if (buys.length > 0) {
      console.log(`    Found ${buys.length} curator buys`);
      curatorBuys.push(...buys);
    }
  }

  console.log(`\nTotal curator buy signals: ${curatorBuys.length}`);

  if (curatorBuys.length === 0) {
    console.log("\n❌ No curator buys found in recent data.");
    console.log("This could mean:");
    console.log("  1. Birdeye only returns recent trades (50 per token)");
    console.log("  2. Curators haven't traded recently");
    console.log("  3. Need to expand token list");
    return;
  }

  // Step 2: For each curator buy, measure forward returns
  console.log("\nStep 2: Measuring forward returns for each signal...\n");

  const signals: Signal[] = [];

  for (const buy of curatorBuys) {
    console.log(`  Processing ${buy.wallet.slice(0, 12)}... buy of ${buy.token.slice(0, 12)}...`);

    // Entry A: Naive entry at buy_time + latency
    const entryA_timestamp = buy.timestamp + Math.floor(DETECTION_LATENCY_MS / 1000);
    const entryA_price = await getPriceAtTime(buy.token, entryA_timestamp);

    // Entry B: Pullback entry (1% below current price, 10min window)
    let entryB_price: number | null = null;
    let entryB_filled = false;

    if (entryA_price) {
      const pullbackTarget = entryA_price * (1 - PULLBACK_PCT / 100);
      const pullbackResult = await checkPullbackFill(buy.token, entryA_timestamp, pullbackTarget);
      entryB_filled = pullbackResult.filled;
      entryB_price = pullbackResult.fillPrice;
    }

    // Get forward prices
    const price1h = await getPriceAtTime(buy.token, buy.timestamp + 3600);
    const price6h = await getPriceAtTime(buy.token, buy.timestamp + 21600);
    const price24h = await getPriceAtTime(buy.token, buy.timestamp + 86400);

    // Calculate returns for Entry A
    const return1h = calculateReturn(entryA_price || 0, price1h);
    const return6h = calculateReturn(entryA_price || 0, price6h);
    const return24h = calculateReturn(entryA_price || 0, price24h);

    // Calculate returns for Entry B (if filled)
    let returnB_1h: number | null = null;
    let returnB_6h: number | null = null;
    let returnB_24h: number | null = null;

    if (entryB_filled && entryB_price) {
      returnB_1h = calculateReturn(entryB_price, price1h);
      returnB_6h = calculateReturn(entryB_price, price6h);
      returnB_24h = calculateReturn(entryB_price, price24h);
    }

    signals.push({
      curator: buy.wallet,
      token: buy.token,
      buyTimestamp: buy.timestamp,
      buyPrice: buy.priceUsd,
      entryA_price,
      entryA_timestamp,
      entryB_price,
      entryB_filled,
      return1h,
      return6h,
      return24h,
      returnB_1h,
      returnB_6h,
      returnB_24h,
      price1h,
      price6h,
      price24h,
    });

    console.log(`    Entry A: $${entryA_price?.toFixed(10) || "N/A"}`);
    console.log(`    Entry B: ${entryB_filled ? `$${entryB_price?.toFixed(10)} (filled)` : "NOT FILLED"}`);
    console.log(`    Returns: 1h=${return1h?.toFixed(1) || "N/A"}%, 6h=${return6h?.toFixed(1) || "N/A"}%, 24h=${return24h?.toFixed(1) || "N/A"}%`);
  }

  // Step 3: Calculate statistics
  console.log("\n" + "=".repeat(80));
  console.log("BACKTEST RESULTS");
  console.log("=".repeat(80));

  // Entry A statistics
  const validA_1h = signals.filter(s => s.return1h !== null);
  const validA_6h = signals.filter(s => s.return6h !== null);
  const validA_24h = signals.filter(s => s.return24h !== null);

  const avgReturn = (arr: Signal[], getter: (s: Signal) => number | null): number | null => {
    const valid = arr.filter(s => getter(s) !== null);
    if (valid.length === 0) return null;
    return valid.reduce((sum, s) => sum + (getter(s) || 0), 0) / valid.length;
  };

  const winRate = (arr: Signal[], getter: (s: Signal) => number | null): number | null => {
    const valid = arr.filter(s => getter(s) !== null);
    if (valid.length === 0) return null;
    const netGetter = (s: Signal) => calculateNetReturn(getter(s));
    const winners = valid.filter(s => (netGetter(s) || -999) > 0).length;
    return (winners / valid.length) * 100;
  };

  console.log("\n--- ENTRY A: Naive (immediate entry at detection) ---\n");
  console.log("Horizon | Signals | Avg Gross | Avg Net   | Win Rate | Verdict");
  console.log("-".repeat(70));

  const printRow = (label: string, arr: Signal[], getter: (s: Signal) => number | null) => {
    const avg = avgReturn(arr, getter);
    const avgNet = avg !== null ? avg - ROUND_TRIP_FEES_PCT : null;
    const win = winRate(arr, getter);
    const verdict = avgNet !== null && avgNet > 0 ? "✓ POSITIVE" : avgNet !== null ? "✗ NEGATIVE" : "N/A";
    console.log(
      `${label.padEnd(7)} | ${arr.length.toString().padEnd(7)} | ${avg !== null ? `${avg.toFixed(1)}%`.padEnd(9) : "N/A".padEnd(9)} | ${avgNet !== null ? `${avgNet.toFixed(1)}%`.padEnd(9) : "N/A".padEnd(9)} | ${win !== null ? `${win.toFixed(0)}%`.padEnd(8) : "N/A".padEnd(8)} | ${verdict}`
    );
  };

  printRow("1h", validA_1h, s => s.return1h);
  printRow("6h", validA_6h, s => s.return6h);
  printRow("24h", validA_24h, s => s.return24h);

  // Entry B statistics
  const validB = signals.filter(s => s.entryB_filled);
  const validB_1h = validB.filter(s => s.returnB_1h !== null);
  const validB_6h = validB.filter(s => s.returnB_6h !== null);
  const validB_24h = validB.filter(s => s.returnB_24h !== null);

  console.log("\n--- ENTRY B: Pullback (1% below, 10min window) ---\n");
  console.log(`Signals that filled: ${validB.length}/${signals.length} (${((validB.length/signals.length)*100).toFixed(0)}%)\n`);

  if (validB.length > 0) {
    console.log("Horizon | Signals | Avg Gross | Avg Net   | Win Rate | Verdict");
    console.log("-".repeat(70));
    printRow("1h", validB_1h, s => s.returnB_1h);
    printRow("6h", validB_6h, s => s.returnB_6h);
    printRow("24h", validB_24h, s => s.returnB_24h);
  } else {
    console.log("No pullback entries filled - price never dipped 1% within 10min.");
  }

  // Individual signals
  console.log("\n--- Individual Signals ---\n");
  for (const s of signals) {
    const netReturn1h = calculateNetReturn(s.return1h);
    const netReturn6h = calculateNetReturn(s.return6h);
    console.log(
      `${s.curator.slice(0, 10)}... → ${s.token.slice(0, 10)}... ` +
      `| 1h: ${netReturn1h !== null ? `${netReturn1h.toFixed(1)}%` : "N/A"} ` +
      `| 6h: ${netReturn6h !== null ? `${netReturn6h.toFixed(1)}%` : "N/A"} ` +
      `| Pullback: ${s.entryB_filled ? "✓" : "✗"}`
    );
  }

  // Per-curator breakdown
  console.log("\n--- Per-Curator Performance ---\n");
  const curatorStats = new Map<string, { signals: number; avgNet1h: number[]; avgNet6h: number[] }>();

  for (const s of signals) {
    if (!curatorStats.has(s.curator)) {
      curatorStats.set(s.curator, { signals: 0, avgNet1h: [], avgNet6h: [] });
    }
    const stats = curatorStats.get(s.curator)!;
    stats.signals++;
    if (s.return1h !== null) stats.avgNet1h.push(s.return1h - ROUND_TRIP_FEES_PCT);
    if (s.return6h !== null) stats.avgNet6h.push(s.return6h - ROUND_TRIP_FEES_PCT);
  }

  for (const [curator, stats] of curatorStats) {
    const avg1h = stats.avgNet1h.length > 0
      ? stats.avgNet1h.reduce((a, b) => a + b, 0) / stats.avgNet1h.length
      : null;
    const avg6h = stats.avgNet6h.length > 0
      ? stats.avgNet6h.reduce((a, b) => a + b, 0) / stats.avgNet6h.length
      : null;
    console.log(
      `${curator.slice(0, 12)}... | Signals: ${stats.signals} | ` +
      `Avg Net 1h: ${avg1h !== null ? `${avg1h.toFixed(1)}%` : "N/A"} | ` +
      `Avg Net 6h: ${avg6h !== null ? `${avg6h.toFixed(1)}%` : "N/A"}`
    );
  }

  // Final verdict
  console.log("\n" + "=".repeat(80));
  console.log("VERDICT");
  console.log("=".repeat(80));

  const avgNet6h = avgReturn(validA_6h, s => s.return6h);
  const finalAvgNet = avgNet6h !== null ? avgNet6h - ROUND_TRIP_FEES_PCT : null;
  const finalWinRate = winRate(validA_6h, s => s.return6h);

  if (finalAvgNet !== null && finalAvgNet > 0) {
    console.log("\n✓ CURATOR SELECTION SHOWS POSITIVE EDGE");
    console.log(`  Average 6h net return: ${finalAvgNet.toFixed(1)}%`);
    console.log(`  Win rate: ${finalWinRate?.toFixed(0)}%`);
    console.log("  Curator buys DO predict positive forward returns.");
    console.log("\n  Next step: Live paper trading with these curators.");
  } else if (finalAvgNet !== null) {
    console.log("\n✗ CURATOR SELECTION SHOWS NO EDGE");
    console.log(`  Average 6h net return: ${finalAvgNet.toFixed(1)}%`);
    console.log(`  Win rate: ${finalWinRate?.toFixed(0)}%`);
    console.log("  Curator buys do NOT predict positive forward returns.");
    console.log("\n  Options:");
    console.log("    1. Stricter curator filters (higher historical P&L threshold)");
    console.log("    2. Different exit horizons");
    console.log("    3. Pivot to partner-fee model");
  } else {
    console.log("\n? INSUFFICIENT DATA");
    console.log(`  Only ${signals.length} signals found, ${validA_6h.length} with 6h data.`);
    console.log("  Need more data to conclude.");
    console.log("\n  Options:");
    console.log("    1. Expand token universe");
    console.log("    2. Get more historical trade data");
    console.log("    3. Wait for more curator activity");
  }

  // Save report
  const report = {
    generated_at: new Date().toISOString(),
    parameters: {
      detection_latency_ms: DETECTION_LATENCY_MS,
      round_trip_fees_pct: ROUND_TRIP_FEES_PCT,
      pullback_pct: PULLBACK_PCT,
      pullback_window_min: PULLBACK_WINDOW_MIN,
      curator_count: CURATOR_WALLETS.length,
      token_count: BAGS_TOKENS.length,
    },
    summary: {
      total_signals: signals.length,
      entryA: {
        signals_1h: validA_1h.length,
        signals_6h: validA_6h.length,
        signals_24h: validA_24h.length,
        avg_gross_1h: avgReturn(validA_1h, s => s.return1h),
        avg_gross_6h: avgReturn(validA_6h, s => s.return6h),
        avg_gross_24h: avgReturn(validA_24h, s => s.return24h),
        avg_net_1h: calculateNetReturn(avgReturn(validA_1h, s => s.return1h)),
        avg_net_6h: calculateNetReturn(avgReturn(validA_6h, s => s.return6h)),
        avg_net_24h: calculateNetReturn(avgReturn(validA_24h, s => s.return24h)),
        win_rate_1h: winRate(validA_1h, s => s.return1h),
        win_rate_6h: winRate(validA_6h, s => s.return6h),
        win_rate_24h: winRate(validA_24h, s => s.return24h),
      },
      entryB: {
        signals_filled: validB.length,
        fill_rate: signals.length > 0 ? (validB.length / signals.length) * 100 : 0,
        signals_1h: validB_1h.length,
        signals_6h: validB_6h.length,
        avg_net_1h: calculateNetReturn(avgReturn(validB_1h, s => s.returnB_1h)),
        avg_net_6h: calculateNetReturn(avgReturn(validB_6h, s => s.returnB_6h)),
      },
    },
    signals: signals.map(s => ({
      curator: s.curator,
      token: s.token,
      buyTimestamp: s.buyTimestamp,
      buyPrice: s.buyPrice,
      entryA_price: s.entryA_price,
      entryB_filled: s.entryB_filled,
      entryB_price: s.entryB_price,
      gross_return_1h: s.return1h,
      gross_return_6h: s.return6h,
      gross_return_24h: s.return24h,
      net_return_1h: calculateNetReturn(s.return1h),
      net_return_6h: calculateNetReturn(s.return6h),
      net_return_24h: calculateNetReturn(s.return24h),
    })),
  };

  await Bun.write("reports/curator_forward_return.json", JSON.stringify(report, null, 2));
  console.log("\nReport saved to reports/curator_forward_return.json");
}

main().catch(console.error);
