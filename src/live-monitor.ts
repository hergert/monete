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
  token?: string;
  side?: "buy" | "sell";
  signalPrice?: number;
  ourEntryTime?: number;
  ourEntryPrice?: number;
  latencyMs: number;
  slippageBps?: number;
  status: "pending" | "entered" | "skipped" | "failed";
  reason?: string;
}

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
  try {
    const response = await fetch(
      `https://public-api.birdeye.so/defi/price?address=${mint}`,
      {
        headers: {
          "X-API-KEY": process.env.BIRDEYE_API_KEY || "",
          "x-chain": "solana",
        },
      }
    );
    const json = await response.json() as any;
    return json.data?.value || null;
  } catch {
    return null;
  }
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

  // Create paper trade for Bags-related activity (any type, not just SWAP)
  // Helius often classifies swaps as UNKNOWN
  if (parsed.isBagsRelated) {
    // Look for BAGS token in the programs list
    const bagsToken = parsed.programs.find(p => p.endsWith("BAGS"));
    const tokenToTrack = bagsToken || parsed.tokenMint;

    const paperTrade: PaperTrade = {
      id: `pt_${Date.now()}`,
      walletSignal: wallet,
      signalTime: detectedAt,
      token: tokenToTrack,
      side: parsed.side || "buy",
      latencyMs: trade.latencyMs || 0,
      status: "pending",
    };

    paperTrades.push(paperTrade);
    log(`   📝 BAGS Paper trade: ${paperTrade.id}`);
    log(`      Token: ${tokenToTrack || "unknown"}`);
    log(`      Signal latency: ${trade.latencyMs || "?"}ms`);
  } else if (parsed.tokenMint?.endsWith("BAGS")) {
    // Token mint ends in BAGS but wasn't detected via programs
    const paperTrade: PaperTrade = {
      id: `pt_${Date.now()}`,
      walletSignal: wallet,
      signalTime: detectedAt,
      token: parsed.tokenMint,
      side: parsed.side || "buy",
      latencyMs: trade.latencyMs || 0,
      status: "pending",
    };

    paperTrades.push(paperTrade);
    log(`   📝 BAGS Paper trade (suffix): ${paperTrade.id}`);
    log(`      Token: ${parsed.tokenMint}`);
    log(`      Signal latency: ${trade.latencyMs || "?"}ms`);
  }

  // Print current stats
  if (totalDetections % 5 === 0) {
    printStats();
  }
}

function printStats() {
  log("\n📊 Current Stats:");
  log(`   Total detections: ${totalDetections}`);
  log(`   Avg latency: ${totalDetections > 0 ? (totalLatencyMs / totalDetections).toFixed(0) : 0}ms`);
  log(`   Min latency: ${minLatencyMs === Infinity ? "N/A" : minLatencyMs + "ms"}`);
  log(`   Max latency: ${maxLatencyMs === 0 ? "N/A" : maxLatencyMs + "ms"}`);
  log(`   Paper trades: ${paperTrades.length}`);
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

  log(`\nPaper trades: ${paperTrades.length}`);
  for (const pt of paperTrades) {
    log(`  - ${pt.id}: ${pt.status} (latency: ${pt.latencyMs}ms)`);
  }

  log(`\nDetected transactions:`);
  for (const t of detectedTrades.slice(-10)) {
    log(`  - ${t.signature.slice(0, 20)}... type=${t.type} latency=${t.latencyMs || "?"}ms`);
  }

  // Save report
  const report = {
    generated_at: new Date().toISOString(),
    wallets_monitored: WATCH_WALLETS,
    total_detections: totalDetections,
    avg_latency_ms: totalDetections > 0 ? totalLatencyMs / totalDetections : null,
    min_latency_ms: minLatencyMs === Infinity ? null : minLatencyMs,
    max_latency_ms: maxLatencyMs === 0 ? null : maxLatencyMs,
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
