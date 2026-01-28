// Live Curator Monitor v3
// Full implementation of all feedback suggestions:
// - Executable returns at all checkpoints
// - More checkpoints: 15m, 30m, 1h, 6h, 24h
// - Confirmation delay (2 min)
// - Early probation rule (flag if <5% at 15m)
// - Principal-back simulation (track hypothetical locked gains)
// - Conviction weighting (curator buy size)
// - Token age at entry
// - Liquidity stop simulation (track when impact >10%)
// - Market heartbeat (trading activity)

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || "";
const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || "";

// Our curator wallets (from slow_traders.json)
const CURATOR_WALLETS = [
  "FoG4TcYvxy3Ntes3uNtnD6MEp6nJDW8uKngxKzaFSF9P", // 21.0% P&L
  "82zWEWdASgU9jKTbeftUKHrHtmE8c8nLsS1UQzMkECsw", // 16.6% P&L
  "ByAdav8AZd2qnpRoEJCnDLQqwGzRe4yRQzAG2zTjoGV5", // 14.4% P&L
  "D9J2kJeL9uWRcApPht4GCNq5De8NEM4ziMLkBqLtJ8Dn", // 14.1% P&L
  "HZdd11Fothq8Pk86k5kBFbgXuUdr39ALRfJSGozMA3nD", // 12.1% P&L
  "38cxrSEXZJ2JZpDwE8uvZqVWi4e5Rspkq6fK5hvx4Tmx", // 10.5% P&L
  "H9JGaqjUAn9YswMK7NTpwoQwyV1RPoHuVNo56eVi2X9N", // 7.8% P&L
  "3i51cKbLbaKAqvRJdCUaq9hsnvf9kqCfMujNgFj7nRKt", // 7.1% P&L
  "ByCrWXeynHEbEfX21a8hjS7YBygz7rRkNcEYSESdhtB6", // 6.4% P&L
  "APkGv3PxJWbTNc7x5mPGUhNdq95HH4p2qzxBMj3fjYY", // 4.1% P&L
  "GDAtwgeoSik1aAnqPSehe8mgL4fZRhQmYfyxGw5tZ7tX", // 0.1% P&L
  "HydraXoSz7oE3774DoWQQaofKb31Kbn2cbcqG4ShKy85", // 0.1% P&L
];

const ROUND_TRIP_FEES_PCT = 2.14;
const PAPER_TRADES_FILE = "reports/paper_trades_curator.json";
const CONFIRMATION_DELAY_MS = 120_000; // 2 minutes
const TEST_POSITION_SIZE_USD = 50;

// Thresholds from feedback
const PROBATION_THRESHOLD_PCT = 5; // If <5% at 15m, flag as "flat"
const PRINCIPAL_BACK_THRESHOLD_PCT = 50; // Simulate locking principal at +50%
const LIQUIDITY_STOP_IMPACT_BPS = 1000; // 10% impact triggers liquidity stop

// Checkpoint times in seconds
const CHECKPOINTS = {
  "15m": 15 * 60,
  "30m": 30 * 60,
  "1h": 60 * 60,
  "6h": 6 * 60 * 60,
  "24h": 24 * 60 * 60,
};

// Pending signals waiting for confirmation
const pendingSignals = new Map<string, {
  signature: string;
  wallet: string;
  token: string;
  detectedAt: number;
  curatorBuySizeSol?: number;
}>();

interface ExitFeasibility {
  exists: boolean;
  priceImpactBps: number | null;
  executablePrice: number | null;
  executableReturn: number | null;
  timestamp: number;
}

interface Checkpoint {
  price: number | null;
  priceReturn: number | null; // Gross
  netReturn: number | null; // After fees
  exit: ExitFeasibility | null;
  checkedAt: number;
}

interface PaperTrade {
  id: string;
  curator: string;
  token: string;
  tokenName?: string;
  detectedAt: number;
  entryPrice: number;

  // Entry context
  entryContext: {
    curatorBuySizeSol: number | null;
    curatorBuySizeUsd: number | null;
    sellQuoteExistsAtEntry: boolean;
    sellImpactBpsAtEntry: number | null;
    tokenAgeSeconds: number | null;
    tokenCreatedAt: number | null;
  };

  // Checkpoints (15m, 30m, 1h, 6h, 24h)
  checkpoint15m?: Checkpoint;
  checkpoint30m?: Checkpoint;
  checkpoint1h?: Checkpoint;
  checkpoint6h?: Checkpoint;
  checkpoint24h?: Checkpoint;

  // Legacy fields for compatibility
  price1h?: number;
  netReturn1h?: number;
  exit1h?: ExitFeasibility;

  // Probation rule
  probation?: {
    flaggedAsFlat: boolean; // <5% at 15m
    wouldHaveCut: boolean; // If we applied early exit
    missedGain?: number; // What we would have missed
  };

  // Principal-back simulation
  principalBack?: {
    triggeredAt?: number; // When hit +50%
    triggeredPrice?: number;
    lockedReturn?: number; // What we locked in
    moonbagReturn?: number; // What remainder would have made
    combinedReturn?: number; // Blended return
  };

  // Liquidity tracking
  liquidity: {
    exitStatus: "exitable" | "unexitable" | "degraded" | "unknown";
    firstUnexitableAt?: number;
    firstDegradedAt?: number; // When impact >10%
    wouldHaveExitedAt?: number; // Liquidity stop trigger time
    wouldHaveExitedReturn?: number; // Return if we exited then
  };

  // Market activity
  marketActivity?: {
    lastTradeAt?: number;
    tradesIn15m?: number;
  };

  // Metadata
  status: "pending_15m" | "pending_30m" | "pending_1h" | "pending_6h" | "pending_24h" | "complete";
  signature?: string;
}

interface PaperTradesData {
  startedAt: string;
  lastUpdatedAt: string;
  version: string;
  totalSignals: number;
  completeSignals: number;
  summary: {
    // Price returns
    avgNetReturn1h: number | null;
    avgNetReturn6h: number | null;
    avgNetReturn24h: number | null;
    winRate1h: number | null;
    winRate6h: number | null;

    // Executable returns
    avgExecReturn1h: number | null;
    exitFeasibleRate1h: number | null;

    // Liquidity
    unexitableCount: number;
    degradedCount: number;

    // Probation
    flatAt15mCount: number;
    probationWouldHaveSavedCount: number;

    // Principal-back
    principalBackTriggeredCount: number;
    avgPrincipalBackReturn: number | null;

    // Conviction
    avgCuratorBuySizeUsd: number | null;
  };
  trades: PaperTrade[];
}

// Rate limiting
let lastBirdeyeRequest = 0;
let lastJupiterRequest = 0;

async function rateLimitedBirdeyeFetch(url: string): Promise<Response> {
  const now = Date.now();
  if (now - lastBirdeyeRequest < 500) {
    await new Promise(r => setTimeout(r, 500 - (now - lastBirdeyeRequest)));
  }
  lastBirdeyeRequest = Date.now();
  return fetch(url, {
    headers: {
      "X-API-KEY": BIRDEYE_API_KEY,
      "x-chain": "solana",
    },
  });
}

async function rateLimitedJupiterFetch(url: string): Promise<Response> {
  const now = Date.now();
  if (now - lastJupiterRequest < 200) {
    await new Promise(r => setTimeout(r, 200 - (now - lastJupiterRequest)));
  }
  lastJupiterRequest = Date.now();
  return fetch(url);
}

async function getCurrentPrice(token: string): Promise<number | null> {
  try {
    const response = await rateLimitedBirdeyeFetch(
      `https://public-api.birdeye.so/defi/price?address=${token}`
    );
    if (!response.ok) return null;
    const json = await response.json() as any;
    return json.data?.value || null;
  } catch (e) {
    console.log(`  Error getting price: ${e}`);
    return null;
  }
}

async function getSolPrice(): Promise<number | null> {
  try {
    const response = await rateLimitedBirdeyeFetch(
      `https://public-api.birdeye.so/defi/price?address=So11111111111111111111111111111111111111112`
    );
    if (!response.ok) return null;
    const json = await response.json() as any;
    return json.data?.value || null;
  } catch {
    return null;
  }
}

async function getSellQuote(token: string, amountUsd: number): Promise<ExitFeasibility> {
  const now = Math.floor(Date.now() / 1000);
  try {
    const price = await getCurrentPrice(token);
    if (!price) {
      return { exists: false, priceImpactBps: null, executablePrice: null, executableReturn: null, timestamp: now };
    }

    const tokenAmount = amountUsd / price;
    const SOL_MINT = "So11111111111111111111111111111111111111112";

    // Note: quote-api.jup.ag/v6 was deprecated Oct 2025, now using lite-api.jup.ag/swap/v1
    const response = await rateLimitedJupiterFetch(
      `https://lite-api.jup.ag/swap/v1/quote?inputMint=${token}&outputMint=${SOL_MINT}&amount=${Math.floor(tokenAmount * 1e9)}&slippageBps=100`
    );

    if (!response.ok) {
      return { exists: false, priceImpactBps: null, executablePrice: null, executableReturn: null, timestamp: now };
    }

    const quote = await response.json() as any;
    if (!quote.outAmount) {
      return { exists: false, priceImpactBps: null, executablePrice: null, executableReturn: null, timestamp: now };
    }

    const outAmountSol = parseInt(quote.outAmount) / 1e9;
    const priceImpactBps = quote.priceImpactPct ? Math.round(parseFloat(quote.priceImpactPct) * 100) : null;

    const solPrice = await getSolPrice();
    const executableUsd = outAmountSol * (solPrice || 150);
    const executablePrice = executableUsd / tokenAmount;

    return {
      exists: true,
      priceImpactBps,
      executablePrice,
      executableReturn: null,
      timestamp: now,
    };
  } catch (e) {
    console.log(`  Error getting sell quote: ${e}`);
    return { exists: false, priceImpactBps: null, executablePrice: null, executableReturn: null, timestamp: now };
  }
}

async function getTokenInfo(token: string): Promise<{ name: string; symbol: string; createdAt?: number } | null> {
  try {
    const response = await rateLimitedBirdeyeFetch(
      `https://public-api.birdeye.so/defi/token_overview?address=${token}`
    );
    if (!response.ok) return null;
    const json = await response.json() as any;
    return {
      name: json.data?.name || "Unknown",
      symbol: json.data?.symbol || "???",
      createdAt: json.data?.createdAt ? Math.floor(new Date(json.data.createdAt).getTime() / 1000) : undefined,
    };
  } catch {
    return null;
  }
}

async function getTokenTradeActivity(token: string): Promise<{ lastTradeAt?: number; recentTrades?: number } | null> {
  try {
    const response = await rateLimitedBirdeyeFetch(
      `https://public-api.birdeye.so/defi/txs/token?address=${token}&limit=10`
    );
    if (!response.ok) return null;
    const json = await response.json() as any;
    const txs = json.data?.items || [];
    if (txs.length === 0) return null;

    const now = Math.floor(Date.now() / 1000);
    const lastTradeAt = txs[0]?.blockUnixTime;
    const recentTrades = txs.filter((t: any) => (now - t.blockUnixTime) < 900).length; // Trades in 15m

    return { lastTradeAt, recentTrades };
  } catch {
    return null;
  }
}

function isBagsToken(mint: string): boolean {
  return mint.endsWith("BAGS");
}

async function loadPaperTrades(): Promise<PaperTradesData> {
  try {
    const file = Bun.file(PAPER_TRADES_FILE);
    if (await file.exists()) {
      const data = await file.json() as PaperTradesData;
      // Ensure new fields exist
      if (!data.version) data.version = "3";
      if (!data.summary.degradedCount) data.summary.degradedCount = 0;
      if (!data.summary.flatAt15mCount) data.summary.flatAt15mCount = 0;
      if (!data.summary.probationWouldHaveSavedCount) data.summary.probationWouldHaveSavedCount = 0;
      if (!data.summary.principalBackTriggeredCount) data.summary.principalBackTriggeredCount = 0;
      return data;
    }
  } catch (e) {
    console.log(`  Error loading paper trades: ${e}`);
  }
  return {
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    version: "3",
    totalSignals: 0,
    completeSignals: 0,
    summary: {
      avgNetReturn1h: null,
      avgNetReturn6h: null,
      avgNetReturn24h: null,
      winRate1h: null,
      winRate6h: null,
      avgExecReturn1h: null,
      exitFeasibleRate1h: null,
      unexitableCount: 0,
      degradedCount: 0,
      flatAt15mCount: 0,
      probationWouldHaveSavedCount: 0,
      principalBackTriggeredCount: 0,
      avgPrincipalBackReturn: null,
      avgCuratorBuySizeUsd: null,
    },
    trades: [],
  };
}

async function savePaperTrades(data: PaperTradesData): Promise<void> {
  data.lastUpdatedAt = new Date().toISOString();
  await Bun.write(PAPER_TRADES_FILE, JSON.stringify(data, null, 2));
}

function calculateSummary(trades: PaperTrade[]): PaperTradesData["summary"] {
  const with1h = trades.filter(t => t.checkpoint1h?.netReturn !== undefined);
  const with6h = trades.filter(t => t.checkpoint6h?.netReturn !== undefined);
  const with24h = trades.filter(t => t.checkpoint24h?.netReturn !== undefined);

  const exec1h = trades.filter(t => t.checkpoint1h?.exit?.executableReturn !== undefined);
  const feasible1h = trades.filter(t => t.checkpoint1h?.exit !== undefined);

  const unexitable = trades.filter(t => t.liquidity.exitStatus === "unexitable");
  const degraded = trades.filter(t => t.liquidity.exitStatus === "degraded");

  const flatAt15m = trades.filter(t => t.probation?.flaggedAsFlat);
  const probationSaved = trades.filter(t =>
    t.probation?.flaggedAsFlat &&
    t.checkpoint6h?.netReturn !== undefined &&
    t.checkpoint6h?.netReturn !== null &&
    t.checkpoint6h.netReturn < 0
  );

  const principalBackTriggered = trades.filter(t => t.principalBack?.triggeredAt);
  const withBuySize = trades.filter(t => t.entryContext.curatorBuySizeUsd);

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
  const winRate = (arr: number[]) => arr.length > 0 ? (arr.filter(x => x > 0).length / arr.length) * 100 : null;

  return {
    avgNetReturn1h: avg(with1h.map(t => t.checkpoint1h!.netReturn!)),
    avgNetReturn6h: avg(with6h.map(t => t.checkpoint6h!.netReturn!)),
    avgNetReturn24h: avg(with24h.map(t => t.checkpoint24h!.netReturn!)),
    winRate1h: winRate(with1h.map(t => t.checkpoint1h!.netReturn!)),
    winRate6h: winRate(with6h.map(t => t.checkpoint6h!.netReturn!)),
    avgExecReturn1h: avg(exec1h.map(t => t.checkpoint1h!.exit!.executableReturn!)),
    exitFeasibleRate1h: feasible1h.length > 0
      ? (feasible1h.filter(t => t.checkpoint1h!.exit!.exists).length / feasible1h.length) * 100
      : null,
    unexitableCount: unexitable.length,
    degradedCount: degraded.length,
    flatAt15mCount: flatAt15m.length,
    probationWouldHaveSavedCount: probationSaved.length,
    principalBackTriggeredCount: principalBackTriggered.length,
    avgPrincipalBackReturn: avg(principalBackTriggered.map(t => t.principalBack!.combinedReturn!).filter(x => x !== undefined)),
    avgCuratorBuySizeUsd: avg(withBuySize.map(t => t.entryContext.curatorBuySizeUsd!)),
  };
}

async function checkCheckpoint(
  trade: PaperTrade,
  checkpointName: keyof typeof CHECKPOINTS,
  now: number
): Promise<Checkpoint | null> {
  const targetAge = CHECKPOINTS[checkpointName];
  const age = now - trade.detectedAt;

  if (age < targetAge) return null;

  console.log(`  Checking ${checkpointName} for ${trade.token.slice(0, 12)}...`);

  const price = await getCurrentPrice(trade.token);
  if (!price) {
    console.log(`    Could not get price`);
    return null;
  }

  const priceReturn = ((price - trade.entryPrice) / trade.entryPrice) * 100;
  const netReturn = priceReturn - ROUND_TRIP_FEES_PCT;

  const exitCheck = await getSellQuote(trade.token, TEST_POSITION_SIZE_USD);

  // Calculate executable return
  if (exitCheck.exists && exitCheck.executablePrice) {
    exitCheck.executableReturn = ((exitCheck.executablePrice - trade.entryPrice) / trade.entryPrice) * 100 - ROUND_TRIP_FEES_PCT;
  } else if (!exitCheck.exists) {
    exitCheck.executableReturn = -100;
  }

  // Update liquidity status
  if (!exitCheck.exists && trade.liquidity.exitStatus !== "unexitable") {
    trade.liquidity.exitStatus = "unexitable";
    trade.liquidity.firstUnexitableAt = now;
  } else if (exitCheck.exists && exitCheck.priceImpactBps && exitCheck.priceImpactBps > LIQUIDITY_STOP_IMPACT_BPS) {
    if (trade.liquidity.exitStatus === "exitable") {
      trade.liquidity.exitStatus = "degraded";
      trade.liquidity.firstDegradedAt = now;
      trade.liquidity.wouldHaveExitedAt = now;
      trade.liquidity.wouldHaveExitedReturn = exitCheck.executableReturn ?? undefined;
      console.log(`    ⚠️ LIQUIDITY DEGRADED (${exitCheck.priceImpactBps}bps > ${LIQUIDITY_STOP_IMPACT_BPS}bps)`);
    }
  }

  console.log(`    Price: ${netReturn.toFixed(2)}% | Exec: ${exitCheck.executableReturn?.toFixed(2) || 'N/A'}% | Impact: ${exitCheck.priceImpactBps || 'N/A'}bps`);

  return {
    price,
    priceReturn,
    netReturn,
    exit: exitCheck,
    checkedAt: now,
  };
}

async function checkPendingTrades(data: PaperTradesData): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  let updated = false;

  for (const trade of data.trades) {
    if (trade.status === "complete") continue;

    const age = now - trade.detectedAt;

    // Check 15m
    if (trade.status === "pending_15m" && age >= CHECKPOINTS["15m"]) {
      const checkpoint = await checkCheckpoint(trade, "15m", now);
      if (checkpoint) {
        trade.checkpoint15m = checkpoint;

        // Probation rule: flag if <5% at 15m
        if (checkpoint.netReturn !== null && checkpoint.netReturn < PROBATION_THRESHOLD_PCT) {
          trade.probation = {
            flaggedAsFlat: true,
            wouldHaveCut: true,
          };
          console.log(`    📋 PROBATION: Flat at 15m (${checkpoint.netReturn.toFixed(1)}% < ${PROBATION_THRESHOLD_PCT}%)`);
        } else {
          trade.probation = { flaggedAsFlat: false, wouldHaveCut: false };
        }

        trade.status = "pending_30m";
        updated = true;
      }
    }

    // Check 30m
    if (trade.status === "pending_30m" && age >= CHECKPOINTS["30m"]) {
      const checkpoint = await checkCheckpoint(trade, "30m", now);
      if (checkpoint) {
        trade.checkpoint30m = checkpoint;

        // Check for principal-back trigger
        if (checkpoint.netReturn !== null && checkpoint.netReturn >= PRINCIPAL_BACK_THRESHOLD_PCT && !trade.principalBack?.triggeredAt) {
          trade.principalBack = {
            triggeredAt: now,
            triggeredPrice: checkpoint.price!,
            lockedReturn: checkpoint.netReturn * 0.65, // 65% sold to recover principal
          };
          console.log(`    💰 PRINCIPAL-BACK: Would trigger at +${checkpoint.netReturn.toFixed(1)}%`);
        }

        trade.status = "pending_1h";
        updated = true;
      }
    }

    // Check 1h
    if (trade.status === "pending_1h" && age >= CHECKPOINTS["1h"]) {
      const checkpoint = await checkCheckpoint(trade, "1h", now);
      if (checkpoint) {
        trade.checkpoint1h = checkpoint;

        // Legacy compatibility
        trade.price1h = checkpoint.price || undefined;
        trade.netReturn1h = checkpoint.netReturn || undefined;
        trade.exit1h = checkpoint.exit || undefined;

        // Update probation outcome
        if (trade.probation?.flaggedAsFlat && checkpoint.netReturn !== null) {
          trade.probation.missedGain = checkpoint.netReturn - (trade.checkpoint15m?.netReturn || 0);
        }

        // Check principal-back
        if (checkpoint.netReturn !== null && checkpoint.netReturn >= PRINCIPAL_BACK_THRESHOLD_PCT && !trade.principalBack?.triggeredAt) {
          trade.principalBack = {
            triggeredAt: now,
            triggeredPrice: checkpoint.price!,
            lockedReturn: checkpoint.netReturn * 0.65,
          };
          console.log(`    💰 PRINCIPAL-BACK: Would trigger at +${checkpoint.netReturn.toFixed(1)}%`);
        }

        trade.status = "pending_6h";
        updated = true;
      }
    }

    // Check 6h
    if (trade.status === "pending_6h" && age >= CHECKPOINTS["6h"]) {
      const checkpoint = await checkCheckpoint(trade, "6h", now);
      if (checkpoint) {
        trade.checkpoint6h = checkpoint;

        // Calculate principal-back final return if triggered
        if (trade.principalBack?.triggeredAt && checkpoint.netReturn !== null) {
          trade.principalBack.moonbagReturn = checkpoint.netReturn * 0.35; // 35% moonbag
          trade.principalBack.combinedReturn = trade.principalBack.lockedReturn! + trade.principalBack.moonbagReturn;
          console.log(`    💰 PRINCIPAL-BACK result: ${trade.principalBack.combinedReturn.toFixed(1)}% (locked: ${trade.principalBack.lockedReturn!.toFixed(1)}% + moonbag: ${trade.principalBack.moonbagReturn.toFixed(1)}%)`);
        }

        // Update probation final outcome
        if (trade.probation?.flaggedAsFlat && checkpoint.netReturn !== null) {
          const wouldHaveSaved = checkpoint.netReturn < 0;
          if (wouldHaveSaved) {
            console.log(`    📋 PROBATION would have saved: avoided ${checkpoint.netReturn.toFixed(1)}% loss`);
          }
        }

        trade.status = "pending_24h";
        updated = true;
      }
    }

    // Check 24h
    if (trade.status === "pending_24h" && age >= CHECKPOINTS["24h"]) {
      const checkpoint = await checkCheckpoint(trade, "24h", now);
      if (checkpoint) {
        trade.checkpoint24h = checkpoint;
        trade.status = "complete";
        data.completeSignals++;
        console.log(`    ✓ Trade complete`);
        updated = true;
      }
    }

    // Update market activity periodically
    if (age > 300 && (!trade.marketActivity || now - (trade.marketActivity.lastTradeAt || 0) > 300)) {
      const activity = await getTokenTradeActivity(trade.token);
      if (activity) {
        trade.marketActivity = {
          lastTradeAt: activity.lastTradeAt,
          tradesIn15m: activity.recentTrades,
        };
      }
    }
  }

  if (updated) {
    data.summary = calculateSummary(data.trades);
    await savePaperTrades(data);
  }
}

async function parseTransaction(signature: string): Promise<{
  token: string;
  side: "buy" | "sell";
  wallet: string;
  amountSol?: number;
} | null> {
  try {
    const response = await fetch(
      `https://api.helius.xyz/v0/transactions/?api-key=${HELIUS_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: [signature] }),
      }
    );

    if (!response.ok) return null;
    const [tx] = await response.json() as any[];
    if (!tx) return null;

    // Extract SOL amount from native transfers
    let amountSol: number | undefined;
    const nativeTransfers = tx.nativeTransfers || [];
    for (const nt of nativeTransfers) {
      if (CURATOR_WALLETS.includes(nt.fromUserAccount)) {
        amountSol = nt.amount / 1e9;
        break;
      }
    }

    // Look for BAGS token in transfers
    const tokenTransfers = tx.tokenTransfers || [];
    for (const transfer of tokenTransfers) {
      const mint = transfer.mint || "";
      if (!isBagsToken(mint)) continue;

      const fromUserAccount = transfer.fromUserAccount || "";
      const toUserAccount = transfer.toUserAccount || "";

      for (const curator of CURATOR_WALLETS) {
        if (toUserAccount === curator) {
          return { token: mint, side: "buy", wallet: curator, amountSol };
        }
        if (fromUserAccount === curator) {
          return { token: mint, side: "sell", wallet: curator };
        }
      }
    }

    // Check swap events
    const events = tx.events || {};
    if (events.swap) {
      const swap = events.swap;
      const tokenOutputs = swap.tokenOutputs || [];

      for (const output of tokenOutputs) {
        if (isBagsToken(output.mint)) {
          const wallet = CURATOR_WALLETS.find(w =>
            w === swap.nativeOutput?.account || w === tx.feePayer
          );
          if (wallet) {
            // Get SOL input amount
            if (swap.nativeInput?.amount) {
              amountSol = swap.nativeInput.amount / 1e9;
            }
            return { token: output.mint, side: "buy", wallet, amountSol };
          }
        }
      }
    }

    return null;
  } catch (e) {
    console.log(`  Error parsing tx: ${e}`);
    return null;
  }
}

async function processConfirmedSignal(
  signal: { signature: string; wallet: string; token: string; detectedAt: number; curatorBuySizeSol?: number },
  data: PaperTradesData
): Promise<void> {
  console.log(`\n✅ CONFIRMING SIGNAL after ${CONFIRMATION_DELAY_MS / 1000}s delay`);
  console.log(`  Token: ${signal.token}`);

  // Verify token is still routable
  const exitCheck = await getSellQuote(signal.token, TEST_POSITION_SIZE_USD);
  if (!exitCheck.exists) {
    console.log(`  ⚠️ Token no longer routable - SKIPPING (landmine avoided)`);
    return;
  }
  console.log(`  ✓ Token still routable (impact: ${exitCheck.priceImpactBps}bps)`);

  // Get current price
  const entryPrice = await getCurrentPrice(signal.token);
  if (!entryPrice) {
    console.log(`  ⚠️ Could not get price - SKIPPING`);
    return;
  }

  // Get token info including creation time
  const tokenInfo = await getTokenInfo(signal.token);
  const now = Math.floor(Date.now() / 1000);

  // Calculate token age
  let tokenAgeSeconds: number | null = null;
  if (tokenInfo?.createdAt) {
    tokenAgeSeconds = now - tokenInfo.createdAt;
  }

  // Calculate curator buy size in USD
  const solPrice = await getSolPrice();
  const curatorBuySizeUsd = signal.curatorBuySizeSol && solPrice
    ? signal.curatorBuySizeSol * solPrice
    : null;

  const trade: PaperTrade = {
    id: `${signal.wallet}-${signal.token}-${Date.now()}`,
    curator: signal.wallet,
    token: signal.token,
    tokenName: tokenInfo?.name,
    detectedAt: now,
    entryPrice,
    entryContext: {
      curatorBuySizeSol: signal.curatorBuySizeSol || null,
      curatorBuySizeUsd,
      sellQuoteExistsAtEntry: exitCheck.exists,
      sellImpactBpsAtEntry: exitCheck.priceImpactBps,
      tokenAgeSeconds,
      tokenCreatedAt: tokenInfo?.createdAt || null,
    },
    liquidity: {
      exitStatus: "exitable",
    },
    status: "pending_15m",
    signature: signal.signature,
  };

  data.trades.push(trade);
  data.totalSignals++;
  await savePaperTrades(data);

  console.log(`  Entry price: $${entryPrice.toFixed(10)}`);
  console.log(`  Token: ${tokenInfo?.name || "Unknown"}`);
  if (tokenAgeSeconds !== null) {
    console.log(`  Token age: ${(tokenAgeSeconds / 3600).toFixed(1)}h`);
  }
  if (curatorBuySizeUsd !== null) {
    console.log(`  Curator buy: $${curatorBuySizeUsd.toFixed(2)} (${signal.curatorBuySizeSol?.toFixed(3)} SOL)`);
  }
  console.log(`  ✓ Paper trade logged (checkpoints: 15m, 30m, 1h, 6h, 24h)`);
}

async function handleNewTransaction(signature: string, data: PaperTradesData): Promise<void> {
  const parsed = await parseTransaction(signature);
  if (!parsed) return;
  if (parsed.side !== "buy") return;

  // Check for duplicates
  const recent = data.trades.find(t =>
    t.curator === parsed.wallet &&
    t.token === parsed.token &&
    (Date.now() / 1000 - t.detectedAt) < 3600
  );
  if (recent) {
    console.log(`  Skipping duplicate for ${parsed.token.slice(0, 12)}...`);
    return;
  }

  const pendingKey = `${parsed.wallet}-${parsed.token}`;
  if (pendingSignals.has(pendingKey)) {
    console.log(`  Signal already pending confirmation`);
    return;
  }

  console.log(`\n🎯 CURATOR BUY DETECTED`);
  console.log(`  Curator: ${parsed.wallet.slice(0, 12)}...`);
  console.log(`  Token: ${parsed.token}`);
  if (parsed.amountSol) {
    console.log(`  Amount: ${parsed.amountSol.toFixed(3)} SOL`);
  }
  console.log(`  ⏳ Waiting ${CONFIRMATION_DELAY_MS / 1000}s for confirmation...`);

  pendingSignals.set(pendingKey, {
    signature,
    wallet: parsed.wallet,
    token: parsed.token,
    detectedAt: Date.now(),
    curatorBuySizeSol: parsed.amountSol,
  });

  setTimeout(async () => {
    const signal = pendingSignals.get(pendingKey);
    if (!signal) return;

    pendingSignals.delete(pendingKey);

    const freshData = await loadPaperTrades();
    await processConfirmedSignal(signal, freshData);
  }, CONFIRMATION_DELAY_MS);
}

async function main() {
  console.log("=== Live Curator Monitor v3 ===\n");
  console.log("Full implementation with all feedback suggestions:\n");
  console.log("  • Checkpoints: 15m, 30m, 1h, 6h, 24h");
  console.log("  • Executable returns (Jupiter quotes)");
  console.log("  • Confirmation delay: 2 minutes");
  console.log("  • Probation rule: flag if <5% at 15m");
  console.log("  • Principal-back simulation: lock at +50%");
  console.log("  • Liquidity stop: flag if impact >10%");
  console.log("  • Conviction: track curator buy size");
  console.log("  • Token age at entry");
  console.log("");

  if (!HELIUS_API_KEY) {
    console.error("ERROR: HELIUS_API_KEY not set");
    process.exit(1);
  }

  if (!BIRDEYE_API_KEY) {
    console.error("ERROR: BIRDEYE_API_KEY not set");
    process.exit(1);
  }

  let data = await loadPaperTrades();
  console.log(`Loaded ${data.trades.length} existing paper trades`);
  console.log(`  Complete: ${data.completeSignals}`);
  console.log(`  Pending: ${data.trades.length - data.completeSignals}`);
  console.log(`  Unexitable: ${data.summary.unexitableCount}`);
  console.log(`  Degraded: ${data.summary.degradedCount}`);
  console.log("");

  console.log("Checking pending trades...");
  await checkPendingTrades(data);

  if (data.trades.length > 0) {
    console.log("\n--- Current Summary ---");
    const s = data.summary;
    console.log(`Signals: ${data.totalSignals} total, ${data.completeSignals} complete`);
    if (s.avgNetReturn1h !== null) {
      console.log(`1h: ${s.avgNetReturn1h.toFixed(1)}% price | ${s.avgExecReturn1h?.toFixed(1) || 'N/A'}% exec | ${s.winRate1h?.toFixed(0)}% win`);
    }
    if (s.avgNetReturn6h !== null) {
      console.log(`6h: ${s.avgNetReturn6h.toFixed(1)}% price | ${s.winRate6h?.toFixed(0)}% win`);
    }
    console.log(`Liquidity: ${s.unexitableCount} unexitable, ${s.degradedCount} degraded`);
    console.log(`Probation: ${s.flatAt15mCount} flat at 15m, ${s.probationWouldHaveSavedCount} would have saved`);
    if (s.avgCuratorBuySizeUsd !== null) {
      console.log(`Avg curator buy: $${s.avgCuratorBuySizeUsd.toFixed(2)}`);
    }
    console.log("");
  }

  console.log(`Connecting to Helius WebSocket...`);
  console.log(`Monitoring ${CURATOR_WALLETS.length} curator wallets\n`);

  const wsUrl = `wss://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("WebSocket connected");

    for (const wallet of CURATOR_WALLETS) {
      const subscribeMsg = {
        jsonrpc: "2.0",
        id: wallet.slice(0, 8),
        method: "logsSubscribe",
        params: [
          { mentions: [wallet] },
          { commitment: "confirmed" },
        ],
      };
      ws.send(JSON.stringify(subscribeMsg));
    }

    console.log("Subscribed to curator wallets");
    console.log("\nWaiting for curator activity...\n");
  };

  ws.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data as string);
      if (message.result !== undefined) return;

      if (message.method === "logsNotification") {
        const logs = message.params?.result?.value;
        if (!logs) return;

        const signature = logs.signature;
        if (!signature) return;

        console.log(`Activity detected: ${signature.slice(0, 20)}...`);

        data = await loadPaperTrades();
        await handleNewTransaction(signature, data);
        await checkPendingTrades(data);
      }
    } catch (e) {
      // Ignore
    }
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  ws.onclose = () => {
    console.log("WebSocket closed, reconnecting in 5s...");
    setTimeout(main, 5000);
  };

  // Check pending trades every 2 minutes (more frequent for 15m/30m checkpoints)
  setInterval(async () => {
    console.log("\n[Periodic check]");
    data = await loadPaperTrades();
    await checkPendingTrades(data);

    const s = data.summary;
    console.log(`Stats: ${data.totalSignals} signals | ${s.unexitableCount} unexitable | ${s.flatAt15mCount} flat@15m`);
    if (s.avgNetReturn1h !== null) {
      console.log(`  1h: ${s.avgNetReturn1h.toFixed(1)}% price / ${s.avgExecReturn1h?.toFixed(1) || 'N/A'}% exec`);
    }
    console.log("");
  }, 2 * 60 * 1000);

  console.log("Monitor running. Press Ctrl+C to stop.\n");
}

main().catch(console.error);
