// Helius Wallet Analyzer - Extract trading history from on-chain data
// Uses Helius to get transaction history and parse swap events

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || "";
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// DBC Program ID
const DBC_PROGRAM = "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN";

interface WalletTrade {
  signature: string;
  slot: number;
  blockTime: number;
  mint: string;
  side: "buy" | "sell";
  tokenAmount: number;
  solAmount: number;
  pricePerToken: number; // SOL per token
}

interface WalletStats {
  wallet: string;
  trades: WalletTrade[];
  totalBuySol: number;
  totalSellSol: number;
  totalBuyTokens: number;
  totalSellTokens: number;
  realizedPnlSol: number;
  unrealizedTokens: number;
  avgBuyPrice: number;
  avgSellPrice: number;
  tradeCount: number;
}

interface HeliusRpcResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: { code: number; message: string };
}

async function heliusFetch<T>(endpoint: string, body: object): Promise<T | null> {
  try {
    const response = await fetch(HELIUS_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: endpoint,
        params: body,
      }),
    });

    const json = (await response.json()) as HeliusRpcResponse<T>;
    if (json.error) {
      console.error(`Helius error: ${JSON.stringify(json.error)}`);
      return null;
    }
    return json.result || null;
  } catch (e) {
    console.error(`Helius fetch error: ${e}`);
    return null;
  }
}

// Get transaction signatures for a wallet
async function getWalletSignatures(
  wallet: string,
  limit: number = 100
): Promise<{ signature: string; slot: number; blockTime: number }[]> {
  const result = await heliusFetch<
    { signature: string; slot: number; blockTime: number }[]
  >("getSignaturesForAddress", [wallet, { limit }]);

  return result || [];
}

// Get parsed transaction - Helius enhanced
async function getParsedTransaction(signature: string): Promise<any | null> {
  // Use Helius parsed transaction API
  try {
    const response = await fetch(
      `https://api.helius.xyz/v0/transactions/?api-key=${HELIUS_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: [signature] }),
      }
    );

    const json = (await response.json()) as any[];
    if (Array.isArray(json) && json.length > 0) {
      return json[0];
    }
    return null;
  } catch (e) {
    return null;
  }
}

// Parse a transaction for DBC swap events
function parseDbcSwap(tx: any, targetWallet: string): WalletTrade | null {
  if (!tx || tx.transactionError) return null;

  // Look for token transfers that indicate a swap
  const tokenTransfers = tx.tokenTransfers || [];
  const nativeTransfers = tx.nativeTransfers || [];

  // Find relevant transfers involving our wallet
  let tokenIn: { mint: string; amount: number } | null = null;
  let tokenOut: { mint: string; amount: number } | null = null;
  let solIn = 0;
  let solOut = 0;

  for (const transfer of tokenTransfers) {
    if (transfer.fromUserAccount === targetWallet) {
      tokenOut = { mint: transfer.mint, amount: transfer.tokenAmount };
    }
    if (transfer.toUserAccount === targetWallet) {
      tokenIn = { mint: transfer.mint, amount: transfer.tokenAmount };
    }
  }

  for (const transfer of nativeTransfers) {
    if (transfer.fromUserAccount === targetWallet) {
      solOut += transfer.amount / 1e9; // Convert lamports to SOL
    }
    if (transfer.toUserAccount === targetWallet) {
      solIn += transfer.amount / 1e9;
    }
  }

  // Determine if this is a buy or sell
  // Buy: SOL out, token in
  // Sell: token out, SOL in
  const isBuy = solOut > 0 && tokenIn && tokenIn.mint !== "So11111111111111111111111111111111111111112";
  const isSell = solIn > 0 && tokenOut && tokenOut.mint !== "So11111111111111111111111111111111111111112";

  if (isBuy && tokenIn) {
    return {
      signature: tx.signature,
      slot: tx.slot,
      blockTime: tx.timestamp,
      mint: tokenIn.mint,
      side: "buy",
      tokenAmount: tokenIn.amount,
      solAmount: solOut,
      pricePerToken: tokenIn.amount > 0 ? solOut / tokenIn.amount : 0,
    };
  }

  if (isSell && tokenOut) {
    return {
      signature: tx.signature,
      slot: tx.slot,
      blockTime: tx.timestamp,
      mint: tokenOut.mint,
      side: "sell",
      tokenAmount: tokenOut.amount,
      solAmount: solIn,
      pricePerToken: tokenOut.amount > 0 ? solIn / tokenOut.amount : 0,
    };
  }

  return null;
}

// Analyze a wallet's trading history for specific tokens
export async function analyzeWallet(
  wallet: string,
  targetMints: string[] = [],
  maxTxs: number = 100
): Promise<WalletStats> {
  console.log(`\nAnalyzing wallet: ${wallet}`);

  const signatures = await getWalletSignatures(wallet, maxTxs);
  console.log(`  Found ${signatures.length} recent transactions`);

  const trades: WalletTrade[] = [];

  // Process in batches to avoid rate limits
  for (let i = 0; i < Math.min(signatures.length, maxTxs); i++) {
    const sig = signatures[i];
    if (!sig) continue;
    const tx = await getParsedTransaction(sig.signature);

    if (tx) {
      const trade = parseDbcSwap(tx, wallet);
      if (trade) {
        // Filter by target mints if specified
        if (targetMints.length === 0 || targetMints.includes(trade.mint)) {
          trades.push(trade);
        }
      }
    }

    // Rate limit: max 10 req/sec for free tier
    if (i % 10 === 9) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(`  Found ${trades.length} trades`);

  // Calculate stats
  let totalBuySol = 0;
  let totalSellSol = 0;
  let totalBuyTokens = 0;
  let totalSellTokens = 0;

  for (const trade of trades) {
    if (trade.side === "buy") {
      totalBuySol += trade.solAmount;
      totalBuyTokens += trade.tokenAmount;
    } else {
      totalSellSol += trade.solAmount;
      totalSellTokens += trade.tokenAmount;
    }
  }

  const realizedPnlSol = totalSellSol - totalBuySol;
  const unrealizedTokens = totalBuyTokens - totalSellTokens;
  const avgBuyPrice = totalBuyTokens > 0 ? totalBuySol / totalBuyTokens : 0;
  const avgSellPrice = totalSellTokens > 0 ? totalSellSol / totalSellTokens : 0;

  return {
    wallet,
    trades,
    totalBuySol,
    totalSellSol,
    totalBuyTokens,
    totalSellTokens,
    realizedPnlSol,
    unrealizedTokens,
    avgBuyPrice,
    avgSellPrice,
    tradeCount: trades.length,
  };
}

// Calculate EV for a wallet based on their trades
export function calculateWalletEV(stats: WalletStats): {
  evMean: number;
  evStd: number;
  evLowerBound: number;
  sampleSize: number;
} {
  if (stats.trades.length < 2) {
    return { evMean: 0, evStd: 0, evLowerBound: 0, sampleSize: 0 };
  }

  // Group trades by token to calculate per-trade P&L
  const tradesByMint = new Map<string, WalletTrade[]>();
  for (const trade of stats.trades) {
    const existing = tradesByMint.get(trade.mint) || [];
    existing.push(trade);
    tradesByMint.set(trade.mint, existing);
  }

  // Calculate P&L per token
  const pnls: number[] = [];
  for (const [mint, mintTrades] of tradesByMint) {
    let buyTotal = 0;
    let sellTotal = 0;

    for (const trade of mintTrades) {
      if (trade.side === "buy") buyTotal += trade.solAmount;
      else sellTotal += trade.solAmount;
    }

    // Only count if there were both buys and sells
    if (buyTotal > 0 && sellTotal > 0) {
      const pnlPct = (sellTotal - buyTotal) / buyTotal;
      pnls.push(pnlPct);
    }
  }

  if (pnls.length === 0) {
    return { evMean: 0, evStd: 0, evLowerBound: 0, sampleSize: 0 };
  }

  // Calculate mean and std
  const mean = pnls.reduce((a, b) => a + b, 0) / pnls.length;
  const variance =
    pnls.reduce((sum, val) => sum + (val - mean) ** 2, 0) / pnls.length;
  const std = Math.sqrt(variance);

  // 95% confidence lower bound: mean - 1.96 * (std / sqrt(n))
  const lowerBound = mean - 1.96 * (std / Math.sqrt(pnls.length));

  return {
    evMean: mean,
    evStd: std,
    evLowerBound: lowerBound,
    sampleSize: pnls.length,
  };
}

// Test function
async function main() {
  console.log("=== Helius Wallet Analyzer ===\n");

  if (!HELIUS_API_KEY) {
    console.error("ERROR: HELIUS_API_KEY not set");
    process.exit(1);
  }

  // Test with wallets from our fixtures
  const testWallets = [
    "96p335d8qFRGfPg5We2STFkd5GPvNtjCBSjF1rXZMACM", // Has 10 actions
    "2g94mHPwYSDursfdtdVYb5yuSvkZmLaBqMacBVZacuz8",
    "G7c65icc4wG6wEvxDBGThWwkTAbm7yK9eVafim3Jzp8B",
  ];

  // Target mints from our Bags fixtures
  const targetMints = [
    "7Mxvi7bi5bnjELB4QNzQ4VrQEPeBgPbWwbfwE1ydBAGS",
    "G1DXVVmqJs8Ei79QbK41dpgk2WtXSGqLtx9of7o8BAGS",
    "5arEQv5tGJj8UbhnPrc1WL5KMmijCe4FuexCaEXUBAGS",
  ];

  for (const wallet of testWallets) {
    const stats = await analyzeWallet(wallet, targetMints, 50);

    console.log(`\n=== Stats for ${wallet.slice(0, 8)}... ===`);
    console.log(`  Total trades: ${stats.tradeCount}`);
    console.log(`  Total buy SOL: ${stats.totalBuySol.toFixed(4)}`);
    console.log(`  Total sell SOL: ${stats.totalSellSol.toFixed(4)}`);
    console.log(`  Realized P&L: ${stats.realizedPnlSol.toFixed(4)} SOL`);
    console.log(`  Avg buy price: ${stats.avgBuyPrice.toFixed(9)} SOL/token`);
    console.log(`  Avg sell price: ${stats.avgSellPrice.toFixed(9)} SOL/token`);

    const ev = calculateWalletEV(stats);
    console.log(`\n  EV Analysis:`);
    console.log(`    Mean: ${(ev.evMean * 100).toFixed(2)}%`);
    console.log(`    Std: ${(ev.evStd * 100).toFixed(2)}%`);
    console.log(`    Lower bound (95%): ${(ev.evLowerBound * 100).toFixed(2)}%`);
    console.log(`    Sample size: ${ev.sampleSize} tokens`);
  }
}

if (import.meta.main) {
  main().catch(console.error);
}
