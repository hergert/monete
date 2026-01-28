// Live Wallet Monitor - Real-time tracking of profitable wallets
// This is the REAL validation - can we detect and follow fast enough?

import { Connection, PublicKey } from "@solana/web3.js";

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || "";
const HELIUS_WS_URL = `wss://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// Our profitable wallets to monitor
const WATCH_WALLETS = [
  "5zf7uryG7jXMEnKvSM2WmmHcJu3Q2fXBpUjZkE7XC2Xr", // 45.9% P&L
  "gasTzr94Pmp4Gf8vknQnqxeYxdgwFjbgdJa4msYRpnB",  // 18.0% P&L
];

// Bags program IDs for filtering
const BAGS_FEE_SHARE_V1 = "FEEhPbKVKnco9EXnaY3i4R5rQVUx91wgVfu8qokixywi";
const METEORA_DBC = "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN";
const METEORA_DAMM_V2 = "cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG";

// All Bags-related programs (include DAMM for migrated tokens)
const BAGS_PROGRAMS = [BAGS_FEE_SHARE_V1, METEORA_DBC, METEORA_DAMM_V2];

interface DetectedTrade {
  wallet: string;
  signature: string;
  slot: number;
  detectedAt: number; // our detection time
  blockTime?: number; // chain time
  latencyMs?: number; // detection latency
  type: "unknown" | "swap" | "transfer";
  programs: string[];
}

interface PaperTrade {
  id: string;
  walletSignal: string;
  signalTime: number;
  token: string;
  side: "buy" | "sell";
  signalPriceUsd: number | null;
  ourEntryTime: number;
  ourEntryPriceUsd: number | null;
  latencyMs: number;
  // For closed positions
  exitTime?: number;
  exitPriceUsd?: number;
  pnlPercent?: number;
  pnlAfterFeesPercent?: number;
  status: "open" | "closed" | "failed";
  reason?: string;
}

interface OpenPosition {
  token: string;
  wallet: string;
  entryTime: number;
  entryPriceUsd: number;
  paperTradeId: string;
}

// Track open positions by token
const openPositions: Map<string, OpenPosition> = new Map();

// Swap fee estimate (0.3% per swap, so 0.6% round trip)
const SWAP_FEE_PERCENT = 0.3;

// State
const detectedTrades: DetectedTrade[] = [];
const paperTrades: PaperTrade[] = [];
let wsConnection: WebSocket | null = null;
let isRunning = false;

// Metrics
let totalDetections = 0;
let totalLatencyMs = 0;
let minLatencyMs = Infinity;
let maxLatencyMs = 0;

function log(msg: string) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

// Parse transaction to understand what happened
async function parseTransaction(signature: string): Promise<{
  type: string;
  programs: string[];
  isBagsRelated: boolean;
  tokenMint?: string;
  side?: "buy" | "sell";
  solAmount?: number;
}> {
  try {
    const response = await fetch(
      `https://api.helius.xyz/v0/transactions/?api-key=${HELIUS_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: [signature] }),
      }
    );

    const txs = await response.json() as any[];
    if (!txs || txs.length === 0) {
      return { type: "unknown", programs: [], isBagsRelated: false };
    }

    const tx = txs[0];
    const type = tx.type || "unknown";
    const programs = tx.accountData?.map((a: any) => a.account) || [];

    // Check if Bags-related (any of the Bags programs)
    const isBagsRelated = programs.some((p: string) =>
      BAGS_PROGRAMS.includes(p)
    );

    // Extract token info from swap
    let tokenMint: string | undefined;
    let side: "buy" | "sell" | undefined;
    let solAmount: number | undefined;

    if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
      const SOL_MINT = "So11111111111111111111111111111111111111112";

      for (const transfer of tx.tokenTransfers) {
        if (transfer.mint !== SOL_MINT && transfer.mint) {
          tokenMint = transfer.mint;
        }
        if (transfer.mint === SOL_MINT) {
          solAmount = transfer.tokenAmount;
          // If receiving SOL, it's a sell; if sending SOL, it's a buy
          // This is approximate - would need more context for accuracy
        }
      }
    }

    // Try to determine side from native transfers
    if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
      const wallet = WATCH_WALLETS.find(w =>
        tx.nativeTransfers.some((t: any) => t.fromUserAccount === w || t.toUserAccount === w)
      );
      if (wallet) {
        const sentSol = tx.nativeTransfers
          .filter((t: any) => t.fromUserAccount === wallet)
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
        const receivedSol = tx.nativeTransfers
          .filter((t: any) => t.toUserAccount === wallet)
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

        if (sentSol > receivedSol) {
          side = "buy"; // Sent SOL, likely buying a token
          solAmount = (sentSol - receivedSol) / 1e9; // Convert lamports to SOL
        } else if (receivedSol > sentSol) {
          side = "sell"; // Received SOL, likely selling a token
          solAmount = (receivedSol - sentSol) / 1e9;
        }
      }
    }

    return { type, programs, isBagsRelated, tokenMint, side, solAmount };
  } catch (e) {
    return { type: "error", programs: [], isBagsRelated: false };
  }
}

// Get current quote for a token (for paper trading)
async function getCurrentPrice(mint: string): Promise<number | null> {
  const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || "";

  if (!BIRDEYE_API_KEY) {
    log("   ⚠️  BIRDEYE_API_KEY not set - cannot get price");
    return null;
  }

  try {
    const response = await fetch(
      `https://public-api.birdeye.so/defi/price?address=${mint}`,
      {
        headers: {
          "X-API-KEY": BIRDEYE_API_KEY,
          "x-chain": "solana",
        },
      }
    );

    if (!response.ok) {
      log(`   ⚠️  Price fetch failed: ${response.status}`);
      return null;
    }

    const json = await response.json() as any;
    const price = json.data?.value;

    if (price && price > 0) {
      return price;
    }
    return null;
  } catch (e) {
    log(`   ⚠️  Price fetch error: ${e}`);
    return null;
  }
}

// Calculate P&L for a closed position
function calculatePnL(entryPrice: number, exitPrice: number): { pnlPercent: number; pnlAfterFees: number } {
  const pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100;
  // Subtract fees: entry swap + exit swap
  const pnlAfterFees = pnlPercent - (SWAP_FEE_PERCENT * 2);
  return { pnlPercent, pnlAfterFees };
}

// Handle detected wallet activity
async function onWalletActivity(wallet: string, signature: string, slot: number) {
  const detectedAt = Date.now();
  totalDetections++;

  log(`🔔 Activity detected for ${wallet.slice(0, 8)}...`);
  log(`   Signature: ${signature}`);
  log(`   Slot: ${slot}`);

  // Parse the transaction
  const parsed = await parseTransaction(signature);

  const trade: DetectedTrade = {
    wallet,
    signature,
    slot,
    detectedAt,
    type: parsed.type as any,
    programs: parsed.programs,
  };

  // Get block time for latency calculation
  try {
    const connection = new Connection(HELIUS_RPC_URL);
    const blockTime = await connection.getBlockTime(slot);
    if (blockTime) {
      trade.blockTime = blockTime * 1000; // convert to ms
      trade.latencyMs = detectedAt - trade.blockTime;

      // Update metrics
      totalLatencyMs += trade.latencyMs;
      minLatencyMs = Math.min(minLatencyMs, trade.latencyMs);
      maxLatencyMs = Math.max(maxLatencyMs, trade.latencyMs);

      log(`   Latency: ${trade.latencyMs}ms`);
    }
  } catch (e) {
    log(`   Could not get block time`);
  }

  log(`   Type: ${trade.type}`);
  log(`   Bags-related: ${parsed.isBagsRelated}`);
  if (parsed.tokenMint) {
    log(`   Token: ${parsed.tokenMint.slice(0, 12)}...`);
  }
  if (parsed.side) {
    log(`   Side: ${parsed.side.toUpperCase()} ${parsed.solAmount?.toFixed(4) || "?"} SOL`);
  }

  detectedTrades.push(trade);

  // Only trade actual BAGS tokens (mints that end in "BAGS")
  // Look for BAGS token in programs list or token mint
  const bagsTokenFromPrograms = parsed.programs.find(p => p.endsWith("BAGS"));
  const bagsTokenFromMint = parsed.tokenMint?.endsWith("BAGS") ? parsed.tokenMint : null;
  const token = bagsTokenFromPrograms || bagsTokenFromMint;

  if (!token) {
    // Not a BAGS token trade, skip paper trading
    // (Even if Bags programs are involved, we only want to trade BAGS tokens themselves)
    return;
  }

  log(`   🎯 BAGS token detected: ${token.slice(0, 16)}...`);

  const side = parsed.side || "buy"; // Default to buy if unclear

  // HANDLE BUY SIGNAL - Open a new position
  if (side === "buy") {
    // Check if we already have a position in this token
    if (openPositions.has(token)) {
      log(`   ⏭️  Already have position in ${token.slice(0, 12)}...`);
      return;
    }

    // Get current price to simulate our entry
    log(`   💰 Fetching entry price...`);
    const entryPrice = await getCurrentPrice(token);
    const entryTime = Date.now();

    const paperTrade: PaperTrade = {
      id: `pt_${Date.now()}`,
      walletSignal: wallet,
      signalTime: detectedAt,
      token,
      side: "buy",
      signalPriceUsd: null, // We don't know their exact price
      ourEntryTime: entryTime,
      ourEntryPriceUsd: entryPrice,
      latencyMs: trade.latencyMs || 0,
      status: entryPrice ? "open" : "failed",
      reason: entryPrice ? undefined : "Could not get entry price",
    };

    paperTrades.push(paperTrade);

    if (entryPrice) {
      // Track the open position
      openPositions.set(token, {
        token,
        wallet,
        entryTime,
        entryPriceUsd: entryPrice,
        paperTradeId: paperTrade.id,
      });

      log(`   📈 OPENED POSITION: ${paperTrade.id}`);
      log(`      Token: ${token}`);
      log(`      Entry price: $${entryPrice.toFixed(8)}`);
      log(`      Signal latency: ${trade.latencyMs || "?"}ms`);
      log(`      Price fetch delay: ${entryTime - detectedAt}ms`);
    } else {
      log(`   ❌ FAILED to open position - no price available`);
    }
  }

  // HANDLE SELL SIGNAL - Close an existing position
  if (side === "sell") {
    const position = openPositions.get(token);

    if (!position) {
      log(`   ⏭️  SELL signal but no open position for ${token.slice(0, 12)}...`);
      return;
    }

    // Get current price to simulate our exit
    log(`   💰 Fetching exit price...`);
    const exitPrice = await getCurrentPrice(token);
    const exitTime = Date.now();

    // Find the original paper trade
    const originalTrade = paperTrades.find(pt => pt.id === position.paperTradeId);

    if (originalTrade && exitPrice) {
      const { pnlPercent, pnlAfterFees } = calculatePnL(position.entryPriceUsd, exitPrice);

      // Update the paper trade
      originalTrade.exitTime = exitTime;
      originalTrade.exitPriceUsd = exitPrice;
      originalTrade.pnlPercent = pnlPercent;
      originalTrade.pnlAfterFeesPercent = pnlAfterFees;
      originalTrade.status = "closed";

      // Remove from open positions
      openPositions.delete(token);

      const emoji = pnlAfterFees >= 0 ? "✅" : "❌";
      log(`   ${emoji} CLOSED POSITION: ${originalTrade.id}`);
      log(`      Token: ${token}`);
      log(`      Entry: $${position.entryPriceUsd.toFixed(8)}`);
      log(`      Exit:  $${exitPrice.toFixed(8)}`);
      log(`      P&L: ${pnlPercent >= 0 ? "+" : ""}${pnlPercent.toFixed(2)}%`);
      log(`      P&L after fees: ${pnlAfterFees >= 0 ? "+" : ""}${pnlAfterFees.toFixed(2)}%`);
      log(`      Hold time: ${((exitTime - position.entryTime) / 1000).toFixed(1)}s`);
    } else {
      log(`   ⚠️  Could not close position - ${exitPrice ? "trade not found" : "no exit price"}`);
    }
  }

  // Print current stats
  if (totalDetections % 5 === 0) {
    printStats();
  }
}

function printStats() {
  const closed = paperTrades.filter(pt => pt.status === "closed");
  const open = paperTrades.filter(pt => pt.status === "open");

  log("\n📊 Current Stats:");
  log(`   Total detections: ${totalDetections}`);
  log(`   Avg latency: ${totalDetections > 0 ? (totalLatencyMs / totalDetections).toFixed(0) : 0}ms`);
  log(`   Min latency: ${minLatencyMs === Infinity ? "N/A" : minLatencyMs + "ms"}`);
  log(`   Max latency: ${maxLatencyMs === 0 ? "N/A" : maxLatencyMs + "ms"}`);
  log(`   Open positions: ${open.length}`);
  log(`   Closed trades: ${closed.length}`);

  if (closed.length > 0) {
    const avgPnl = closed.reduce((sum, pt) => sum + (pt.pnlAfterFeesPercent || 0), 0) / closed.length;
    log(`   Avg P&L (after fees): ${avgPnl >= 0 ? "+" : ""}${avgPnl.toFixed(2)}%`);
  }
  log("");
}

// Subscribe to wallet activity using Helius WebSocket
function subscribeToWallets() {
  log("Connecting to Helius WebSocket...");

  wsConnection = new WebSocket(HELIUS_WS_URL);

  wsConnection.onopen = () => {
    log("✓ WebSocket connected");

    // Subscribe to each wallet
    for (const wallet of WATCH_WALLETS) {
      const subscribeMsg = {
        jsonrpc: "2.0",
        id: wallet.slice(0, 8),
        method: "logsSubscribe",
        params: [
          { mentions: [wallet] },
          { commitment: "confirmed" }
        ]
      };

      wsConnection!.send(JSON.stringify(subscribeMsg));
      log(`   Subscribed to ${wallet.slice(0, 8)}...`);
    }

    log("\n👀 Monitoring wallets for activity...\n");
    log("Press Ctrl+C to stop and see summary.\n");
  };

  wsConnection.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data.toString());

      // Handle subscription confirmation
      if (data.result !== undefined) {
        return;
      }

      // Handle log notification
      if (data.method === "logsNotification") {
        const result = data.params?.result;
        if (result?.value) {
          const signature = result.value.signature;
          const slot = result.context?.slot;

          // Determine which wallet this is for
          const logs = result.value.logs || [];
          for (const wallet of WATCH_WALLETS) {
            if (logs.some((l: string) => l.includes(wallet))) {
              await onWalletActivity(wallet, signature, slot);
              break;
            }
          }

          // If we can't determine wallet from logs, check all
          if (!logs.some((l: string) => WATCH_WALLETS.some(w => l.includes(w)))) {
            // This is activity that mentions our wallets
            await onWalletActivity(WATCH_WALLETS[0], signature, slot);
          }
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  };

  wsConnection.onerror = (error) => {
    log(`WebSocket error: ${error}`);
  };

  wsConnection.onclose = () => {
    log("WebSocket closed");
    if (isRunning) {
      log("Reconnecting in 5s...");
      setTimeout(subscribeToWallets, 5000);
    }
  };
}

// Graceful shutdown
function shutdown() {
  isRunning = false;
  log("\n\nShutting down...\n");

  if (wsConnection) {
    wsConnection.close();
  }

  // Print final report
  log("=".repeat(60));
  log("FINAL MONITORING REPORT");
  log("=".repeat(60));

  log(`\nMonitored wallets:`);
  for (const w of WATCH_WALLETS) {
    log(`  - ${w}`);
  }

  log(`\nDetection stats:`);
  log(`  Total detections: ${totalDetections}`);
  log(`  Avg latency: ${totalDetections > 0 ? (totalLatencyMs / totalDetections).toFixed(0) : "N/A"}ms`);
  log(`  Min latency: ${minLatencyMs === Infinity ? "N/A" : minLatencyMs + "ms"}`);
  log(`  Max latency: ${maxLatencyMs === 0 ? "N/A" : maxLatencyMs + "ms"}`);

  // Paper trading summary
  const closedTrades = paperTrades.filter(pt => pt.status === "closed");
  const openTrades = paperTrades.filter(pt => pt.status === "open");
  const failedTrades = paperTrades.filter(pt => pt.status === "failed");

  log(`\n${"=".repeat(60)}`);
  log("PAPER TRADING RESULTS");
  log("=".repeat(60));

  log(`\nTotal paper trades: ${paperTrades.length}`);
  log(`  Open positions: ${openTrades.length}`);
  log(`  Closed positions: ${closedTrades.length}`);
  log(`  Failed: ${failedTrades.length}`);

  if (closedTrades.length > 0) {
    const totalPnl = closedTrades.reduce((sum, pt) => sum + (pt.pnlPercent || 0), 0);
    const totalPnlAfterFees = closedTrades.reduce((sum, pt) => sum + (pt.pnlAfterFeesPercent || 0), 0);
    const avgPnl = totalPnl / closedTrades.length;
    const avgPnlAfterFees = totalPnlAfterFees / closedTrades.length;
    const winners = closedTrades.filter(pt => (pt.pnlAfterFeesPercent || 0) > 0).length;
    const winRate = (winners / closedTrades.length) * 100;

    log(`\nClosed Position Stats:`);
    log(`  Win rate: ${winRate.toFixed(1)}% (${winners}/${closedTrades.length})`);
    log(`  Avg P&L: ${avgPnl >= 0 ? "+" : ""}${avgPnl.toFixed(2)}%`);
    log(`  Avg P&L after fees: ${avgPnlAfterFees >= 0 ? "+" : ""}${avgPnlAfterFees.toFixed(2)}%`);
    log(`  Total P&L: ${totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}%`);
    log(`  Total P&L after fees: ${totalPnlAfterFees >= 0 ? "+" : ""}${totalPnlAfterFees.toFixed(2)}%`);

    log(`\nClosed Trades:`);
    for (const pt of closedTrades) {
      const emoji = (pt.pnlAfterFeesPercent || 0) >= 0 ? "✅" : "❌";
      log(`  ${emoji} ${pt.token?.slice(0, 12)}... ${pt.pnlAfterFeesPercent?.toFixed(2)}% (latency: ${pt.latencyMs}ms)`);
    }
  }

  if (openTrades.length > 0) {
    log(`\nOpen Positions (not yet closed):`);
    for (const pt of openTrades) {
      log(`  📊 ${pt.token?.slice(0, 12)}... entry: $${pt.ourEntryPriceUsd?.toFixed(8) || "?"}`);
    }
  }

  if (failedTrades.length > 0) {
    log(`\nFailed Trades:`);
    for (const pt of failedTrades) {
      log(`  ❌ ${pt.token?.slice(0, 12) || "unknown"}... reason: ${pt.reason || "unknown"}`);
    }
  }

  log(`\nDetected transactions:`);
  for (const t of detectedTrades.slice(-10)) {
    log(`  - ${t.signature.slice(0, 20)}... type=${t.type} latency=${t.latencyMs || "?"}ms`);
  }

  // Calculate summary stats for report
  const closedForReport = paperTrades.filter(pt => pt.status === "closed");
  const pnlStats = closedForReport.length > 0 ? {
    total_closed: closedForReport.length,
    winners: closedForReport.filter(pt => (pt.pnlAfterFeesPercent || 0) > 0).length,
    win_rate: (closedForReport.filter(pt => (pt.pnlAfterFeesPercent || 0) > 0).length / closedForReport.length) * 100,
    avg_pnl_percent: closedForReport.reduce((sum, pt) => sum + (pt.pnlPercent || 0), 0) / closedForReport.length,
    avg_pnl_after_fees_percent: closedForReport.reduce((sum, pt) => sum + (pt.pnlAfterFeesPercent || 0), 0) / closedForReport.length,
    total_pnl_percent: closedForReport.reduce((sum, pt) => sum + (pt.pnlPercent || 0), 0),
    total_pnl_after_fees_percent: closedForReport.reduce((sum, pt) => sum + (pt.pnlAfterFeesPercent || 0), 0),
  } : null;

  // Save report
  const report = {
    generated_at: new Date().toISOString(),
    wallets_monitored: WATCH_WALLETS,
    total_detections: totalDetections,
    avg_latency_ms: totalDetections > 0 ? totalLatencyMs / totalDetections : null,
    min_latency_ms: minLatencyMs === Infinity ? null : minLatencyMs,
    max_latency_ms: maxLatencyMs === 0 ? null : maxLatencyMs,
    paper_trading: {
      total_trades: paperTrades.length,
      open_positions: paperTrades.filter(pt => pt.status === "open").length,
      closed_positions: closedForReport.length,
      failed: paperTrades.filter(pt => pt.status === "failed").length,
      pnl_stats: pnlStats,
    },
    paper_trades: paperTrades,
    recent_detections: detectedTrades.slice(-50),
  };

  Bun.write("reports/live_monitor.json", JSON.stringify(report, null, 2));
  log(`\nReport saved to reports/live_monitor.json`);

  process.exit(0);
}

async function main() {
  log("=== Live Wallet Monitor ===\n");

  if (!HELIUS_API_KEY) {
    log("ERROR: HELIUS_API_KEY not set");
    process.exit(1);
  }

  log("Monitoring wallets:");
  for (const w of WATCH_WALLETS) {
    log(`  - ${w} (profitable trader)`);
  }
  log("");

  // Handle shutdown
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  isRunning = true;
  subscribeToWallets();

  // Keep alive
  while (isRunning) {
    await new Promise(r => setTimeout(r, 1000));
  }
}

main().catch(console.error);
