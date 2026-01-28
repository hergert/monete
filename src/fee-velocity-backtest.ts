// Fee Velocity Backtest - Test if fee velocity spikes predict positive returns
//
// Thesis: In a high-friction market (2%+ fees), sustained volume is rare.
// High fee velocity = real traders paying real costs = meaningful signal.
//
// This is NOT latency-sensitive - we're measuring trends, not racing.

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || "";

// Our known tokens
const BAGS_TOKENS = [
  "ehipS3kn9GUSnEMgtB9RxCNBVfH5gTNRVxNtqFTBAGS",
  "FFEjZnvY1tqHyBAMBPE1DHoEmQWLmxjhvvDs4TaRBAGS",
  "CdyjsXbPs6VamxNk7StU5apXFHAiM7q8FTYAN3rdBAGS",
  "7Mxvi7bi5bnjELB4QNzQ4VrQEPeBgPbWwbfwE1ydBAGS",
  "BpAiFPCqjvnz7ETKjxr6ZpEKKnGGBE7rNZUU7A7eBAGS",
];

interface Trade {
  timestamp: number;
  side: "buy" | "sell";
  volumeUSD: number;
  priceUSD: number;
}

interface VelocityWindow {
  startTime: number;
  endTime: number;
  volumeUSD: number;
  feeGenerated: number; // volumeUSD * 0.01
  tradeCount: number;
  buyVolume: number;
  sellVolume: number;
  netDirection: "bullish" | "bearish" | "neutral";
  priceAtEnd: number | null;
}

interface VelocitySignal {
  token: string;
  signalTime: number;
  velocity: number;
  velocityMean: number;
  velocityStd: number;
  zScore: number;
  netDirection: "bullish" | "bearish" | "neutral";
  entryPrice: number | null;
  return1h: number | null;
  return6h: number | null;
  return24h: number | null;
  netReturn1h: number | null;
  netReturn6h: number | null;
  netReturn24h: number | null;
}

// Rate limiting
let lastRequest = 0;

async function birdeyeFetch(endpoint: string): Promise<any> {
  const now = Date.now();
  if (now - lastRequest < 2100) {
    await new Promise(r => setTimeout(r, 2100 - (now - lastRequest)));
  }
  lastRequest = Date.now();

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

async function getTokenTrades(token: string, limit: number = 50): Promise<Trade[]> {
  const data = await birdeyeFetch(
    `/defi/txs/token?address=${token}&tx_type=swap&sort_type=desc&limit=${limit}`
  );

  if (!data || !data.items) return [];

  return data.items.map((item: any) => ({
    timestamp: item.blockUnixTime,
    side: item.side as "buy" | "sell",
    volumeUSD: (item.quote?.uiAmount || 0) * (item.quotePrice || 0),
    priceUSD: item.basePrice || item.tokenPrice || 0,
  }));
}

async function getOHLCV(token: string, timeFrom: number, timeTo: number): Promise<{ time: number; close: number }[]> {
  const data = await birdeyeFetch(
    `/defi/ohlcv?address=${token}&type=1H&time_from=${timeFrom}&time_to=${timeTo}`
  );

  if (!data || !data.items) return [];

  return data.items.map((item: any) => ({
    time: item.unixTime,
    close: item.c,
  }));
}

function calculateVelocityWindows(trades: Trade[], windowSizeSeconds: number): VelocityWindow[] {
  if (trades.length === 0) return [];

  // Sort by timestamp ascending
  const sorted = [...trades].sort((a, b) => a.timestamp - b.timestamp);

  const minTime = sorted[0].timestamp;
  const maxTime = sorted[sorted.length - 1].timestamp;

  const windows: VelocityWindow[] = [];

  for (let windowStart = minTime; windowStart < maxTime; windowStart += windowSizeSeconds) {
    const windowEnd = windowStart + windowSizeSeconds;
    const windowTrades = sorted.filter(t => t.timestamp >= windowStart && t.timestamp < windowEnd);

    const volumeUSD = windowTrades.reduce((sum, t) => sum + t.volumeUSD, 0);
    const buyVolume = windowTrades.filter(t => t.side === "buy").reduce((sum, t) => sum + t.volumeUSD, 0);
    const sellVolume = windowTrades.filter(t => t.side === "sell").reduce((sum, t) => sum + t.volumeUSD, 0);

    let netDirection: "bullish" | "bearish" | "neutral" = "neutral";
    if (buyVolume > sellVolume * 1.2) netDirection = "bullish";
    else if (sellVolume > buyVolume * 1.2) netDirection = "bearish";

    // Get price at end of window (last trade in window)
    const lastTrade = windowTrades[windowTrades.length - 1];
    const priceAtEnd = lastTrade?.priceUSD || null;

    windows.push({
      startTime: windowStart,
      endTime: windowEnd,
      volumeUSD,
      feeGenerated: volumeUSD * 0.01, // 1% royalty
      tradeCount: windowTrades.length,
      buyVolume,
      sellVolume,
      netDirection,
      priceAtEnd,
    });
  }

  return windows;
}

function findVelocitySpikes(windows: VelocityWindow[], zScoreThreshold: number = 2.0): {
  window: VelocityWindow;
  zScore: number;
  mean: number;
  std: number;
}[] {
  if (windows.length < 5) return []; // Need enough data for statistics

  // Calculate rolling statistics
  const velocities = windows.map(w => w.feeGenerated);
  const mean = velocities.reduce((a, b) => a + b, 0) / velocities.length;
  const variance = velocities.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / velocities.length;
  const std = Math.sqrt(variance);

  if (std === 0) return []; // No variance = no spikes

  const spikes: { window: VelocityWindow; zScore: number; mean: number; std: number }[] = [];

  for (const window of windows) {
    const zScore = (window.feeGenerated - mean) / std;
    if (zScore >= zScoreThreshold && window.feeGenerated > 0) {
      spikes.push({ window, zScore, mean, std });
    }
  }

  return spikes;
}

async function main() {
  console.log("=== Fee Velocity Backtest ===\n");
  console.log("Question: Do fee velocity spikes predict positive forward returns?\n");
  console.log("Thesis: High fee velocity = real trading = meaningful signal\n");

  if (!BIRDEYE_API_KEY) {
    console.error("ERROR: BIRDEYE_API_KEY not set");
    process.exit(1);
  }

  const ROUND_TRIP_FEES = 0.0214; // 2.14% verified
  const WINDOW_SIZE_SECONDS = 3600; // 1 hour windows
  const Z_SCORE_THRESHOLD = 1.5; // Lower threshold due to small sample

  const allSignals: VelocitySignal[] = [];

  for (const token of BAGS_TOKENS) {
    console.log(`\nAnalyzing ${token.slice(0, 12)}...`);

    // Get recent trades
    const trades = await getTokenTrades(token, 50);
    console.log(`  Trades fetched: ${trades.length}`);

    if (trades.length < 10) {
      console.log(`  Insufficient trades for analysis`);
      continue;
    }

    // Calculate velocity windows
    const windows = calculateVelocityWindows(trades, WINDOW_SIZE_SECONDS);
    console.log(`  Time windows: ${windows.length}`);

    // Find velocity spikes
    const spikes = findVelocitySpikes(windows, Z_SCORE_THRESHOLD);
    console.log(`  Velocity spikes (z>${Z_SCORE_THRESHOLD}): ${spikes.length}`);

    if (spikes.length === 0) {
      console.log(`  No significant velocity spikes found`);
      continue;
    }

    // Get OHLCV for forward returns
    const minTime = Math.min(...trades.map(t => t.timestamp));
    const maxTime = Math.max(...trades.map(t => t.timestamp)) + 86400; // +24h buffer
    const ohlcv = await getOHLCV(token, minTime, maxTime);
    console.log(`  OHLCV candles: ${ohlcv.length}`);

    // Analyze each spike
    for (const spike of spikes) {
      const signalTime = spike.window.endTime;
      const entryPrice = spike.window.priceAtEnd;

      if (!entryPrice) continue;

      // Find prices at future times
      const findPrice = (targetTime: number): number | null => {
        const candle = ohlcv.find(c => Math.abs(c.time - targetTime) < 3600);
        return candle?.close || null;
      };

      const price1h = findPrice(signalTime + 3600);
      const price6h = findPrice(signalTime + 21600);
      const price24h = findPrice(signalTime + 86400);

      const calcReturn = (exitPrice: number | null): number | null => {
        if (!exitPrice || !entryPrice) return null;
        return ((exitPrice - entryPrice) / entryPrice) * 100;
      };

      const return1h = calcReturn(price1h);
      const return6h = calcReturn(price6h);
      const return24h = calcReturn(price24h);

      const netReturn = (gross: number | null): number | null => {
        if (gross === null) return null;
        return gross - (ROUND_TRIP_FEES * 100);
      };

      const signal: VelocitySignal = {
        token,
        signalTime,
        velocity: spike.window.feeGenerated,
        velocityMean: spike.mean,
        velocityStd: spike.std,
        zScore: spike.zScore,
        netDirection: spike.window.netDirection,
        entryPrice,
        return1h,
        return6h,
        return24h,
        netReturn1h: netReturn(return1h),
        netReturn6h: netReturn(return6h),
        netReturn24h: netReturn(return24h),
      };

      allSignals.push(signal);

      console.log(`  Signal at ${new Date(signalTime * 1000).toISOString()}`);
      console.log(`    z-score: ${spike.zScore.toFixed(2)}, direction: ${spike.window.netDirection}`);
      console.log(`    Entry: $${entryPrice.toFixed(10)}`);
      console.log(`    Returns: 1h=${return1h?.toFixed(1) || "N/A"}%, 24h=${return24h?.toFixed(1) || "N/A"}%`);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("BACKTEST RESULTS");
  console.log("=".repeat(70));

  console.log(`\nTotal tokens analyzed: ${BAGS_TOKENS.length}`);
  console.log(`Total velocity signals: ${allSignals.length}`);

  if (allSignals.length === 0) {
    console.log("\n❌ No velocity spikes found across tokens.");
    console.log("This could mean:");
    console.log("  1. Tokens have low/steady volume (no spikes)");
    console.log("  2. Z-score threshold is too high");
    console.log("  3. 50 trade limit misses historical spikes");
    return;
  }

  // Filter by direction
  const bullishSignals = allSignals.filter(s => s.netDirection === "bullish");
  const bearishSignals = allSignals.filter(s => s.netDirection === "bearish");
  const neutralSignals = allSignals.filter(s => s.netDirection === "neutral");

  console.log(`\nSignals by direction:`);
  console.log(`  Bullish: ${bullishSignals.length}`);
  console.log(`  Bearish: ${bearishSignals.length}`);
  console.log(`  Neutral: ${neutralSignals.length}`);

  // Calculate statistics
  const avgReturn = (signals: VelocitySignal[], getter: (s: VelocitySignal) => number | null): number | null => {
    const valid = signals.filter(s => getter(s) !== null);
    if (valid.length === 0) return null;
    return valid.reduce((sum, s) => sum + (getter(s) || 0), 0) / valid.length;
  };

  const winRate = (signals: VelocitySignal[], getter: (s: VelocitySignal) => number | null): number | null => {
    const valid = signals.filter(s => getter(s) !== null);
    if (valid.length === 0) return null;
    const winners = valid.filter(s => (getter(s) || 0) > 0).length;
    return (winners / valid.length) * 100;
  };

  console.log("\n--- All Signals ---");
  console.log("Time    | Signals | Avg Net Return | Win Rate | Verdict");
  console.log("-".repeat(65));

  const printRow = (label: string, signals: VelocitySignal[], getter: (s: VelocitySignal) => number | null) => {
    const valid = signals.filter(s => getter(s) !== null);
    const avg = avgReturn(signals, getter);
    const win = winRate(signals, getter);
    const verdict = avg !== null && avg > 0 ? "✓ POSITIVE" : avg !== null ? "✗ NEGATIVE" : "N/A";
    console.log(
      `${label.padEnd(7)} | ${valid.length.toString().padEnd(7)} | ${avg !== null ? `${avg.toFixed(1)}%`.padEnd(14) : "N/A".padEnd(14)} | ${win !== null ? `${win.toFixed(0)}%`.padEnd(8) : "N/A".padEnd(8)} | ${verdict}`
    );
  };

  printRow("1h", allSignals, s => s.netReturn1h);
  printRow("6h", allSignals, s => s.netReturn6h);
  printRow("24h", allSignals, s => s.netReturn24h);

  // Bullish-only signals (the real test)
  if (bullishSignals.length > 0) {
    console.log("\n--- Bullish Direction Only (buy > sell volume) ---");
    console.log("Time    | Signals | Avg Net Return | Win Rate | Verdict");
    console.log("-".repeat(65));
    printRow("1h", bullishSignals, s => s.netReturn1h);
    printRow("6h", bullishSignals, s => s.netReturn6h);
    printRow("24h", bullishSignals, s => s.netReturn24h);
  }

  // Individual signals
  console.log("\n--- Individual Signals ---");
  for (const signal of allSignals) {
    console.log(`\n${signal.token.slice(0, 16)}... @ ${new Date(signal.signalTime * 1000).toISOString()}`);
    console.log(`  z-score: ${signal.zScore.toFixed(2)}, direction: ${signal.netDirection}`);
    console.log(`  Entry: $${signal.entryPrice?.toFixed(10)}`);
    console.log(`  Net returns: 1h=${signal.netReturn1h?.toFixed(1) || "N/A"}%, 6h=${signal.netReturn6h?.toFixed(1) || "N/A"}%, 24h=${signal.netReturn24h?.toFixed(1) || "N/A"}%`);
  }

  // Final verdict
  console.log("\n" + "=".repeat(70));
  console.log("VERDICT");
  console.log("=".repeat(70));

  const allAvg24h = avgReturn(allSignals, s => s.netReturn24h);
  const bullishAvg24h = avgReturn(bullishSignals, s => s.netReturn24h);

  if (bullishSignals.length >= 3 && bullishAvg24h !== null && bullishAvg24h > 0) {
    console.log("\n✓ BULLISH VELOCITY SIGNALS SHOW POSITIVE EDGE");
    console.log(`  Average 24h net return (bullish only): ${bullishAvg24h.toFixed(1)}%`);
    console.log("  Fee velocity + direction filter appears predictive.");
    console.log("\n  Next step: Paper trade with bullish velocity signals.");
  } else if (allSignals.length >= 3 && allAvg24h !== null && allAvg24h > 0) {
    console.log("\n✓ ALL VELOCITY SIGNALS SHOW POSITIVE EDGE");
    console.log(`  Average 24h net return: ${allAvg24h.toFixed(1)}%`);
    console.log("  Fee velocity appears predictive even without direction filter.");
  } else if (allSignals.length < 3) {
    console.log("\n? INSUFFICIENT DATA");
    console.log(`  Only ${allSignals.length} signals found.`);
    console.log("  Need more trades or lower z-score threshold.");
  } else {
    console.log("\n✗ NO CLEAR EDGE FROM FEE VELOCITY");
    console.log(`  Average 24h net return: ${allAvg24h?.toFixed(1) || "N/A"}%`);
    console.log("  Fee velocity does not predict positive returns.");
    console.log("\n  Consider: Pivot to partner-fee business model.");
  }

  // Save report
  const report = {
    generated_at: new Date().toISOString(),
    parameters: {
      window_size_seconds: WINDOW_SIZE_SECONDS,
      z_score_threshold: Z_SCORE_THRESHOLD,
      round_trip_fees_pct: ROUND_TRIP_FEES * 100,
    },
    summary: {
      tokens_analyzed: BAGS_TOKENS.length,
      total_signals: allSignals.length,
      bullish_signals: bullishSignals.length,
      bearish_signals: bearishSignals.length,
      neutral_signals: neutralSignals.length,
      all_avg_return_24h: allAvg24h,
      bullish_avg_return_24h: bullishAvg24h,
      all_win_rate_24h: winRate(allSignals, s => s.netReturn24h),
      bullish_win_rate_24h: winRate(bullishSignals, s => s.netReturn24h),
    },
    signals: allSignals,
  };

  await Bun.write("reports/fee_velocity_backtest.json", JSON.stringify(report, null, 2));
  console.log("\nReport saved to reports/fee_velocity_backtest.json");
}

main().catch(console.error);
