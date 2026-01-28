// Live Curator Monitor
// Watches curator wallets for new buys, tracks forward returns in real-time
// This bypasses historical data limitations by collecting data as it happens

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
  "APkGv3PxJWbTNc7x5mPGUhNdnq95HH4p2qzxBMj3fjYY", // 4.1% P&L
  "GDAtwgeoSik1aAnqPSehe8mgL4fZRhQmYfyxGw5tZ7tX", // 0.1% P&L
  "HydraXoSz7oE3774DoWQQaofKb31Kbn2cbcqG4ShKy85", // 0.1% P&L
];

const ROUND_TRIP_FEES_PCT = 2.14;
const PAPER_TRADES_FILE = "reports/paper_trades_curator.json";

interface PaperTrade {
  id: string;
  curator: string;
  token: string;
  tokenName?: string;
  detectedAt: number; // Unix timestamp
  entryPrice: number;
  // Scheduled price checks
  price1h?: number;
  price6h?: number;
  price24h?: number;
  // Calculated returns
  return1h?: number;
  return6h?: number;
  return24h?: number;
  netReturn1h?: number;
  netReturn6h?: number;
  netReturn24h?: number;
  // Metadata
  status: "pending_1h" | "pending_6h" | "pending_24h" | "complete";
  signature?: string;
}

interface PaperTradesData {
  startedAt: string;
  lastUpdatedAt: string;
  totalSignals: number;
  completeSignals: number;
  summary: {
    avgNetReturn1h: number | null;
    avgNetReturn6h: number | null;
    avgNetReturn24h: number | null;
    winRate1h: number | null;
    winRate6h: number | null;
    winRate24h: number | null;
  };
  trades: PaperTrade[];
}

// Rate limiting for Birdeye
let lastBirdeyeRequest = 0;
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

async function getCurrentPrice(token: string): Promise<number | null> {
  try {
    const response = await rateLimitedBirdeyeFetch(
      `https://public-api.birdeye.so/defi/price?address=${token}`
    );
    if (!response.ok) return null;
    const json = await response.json() as any;
    return json.data?.value || null;
  } catch (e) {
    console.log(`  Error getting price for ${token}: ${e}`);
    return null;
  }
}

async function getTokenInfo(token: string): Promise<{ name: string; symbol: string } | null> {
  try {
    const response = await rateLimitedBirdeyeFetch(
      `https://public-api.birdeye.so/defi/token_overview?address=${token}`
    );
    if (!response.ok) return null;
    const json = await response.json() as any;
    return {
      name: json.data?.name || "Unknown",
      symbol: json.data?.symbol || "???",
    };
  } catch (e) {
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
      return await file.json() as PaperTradesData;
    }
  } catch (e) {
    // File doesn't exist or is invalid
  }
  return {
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    totalSignals: 0,
    completeSignals: 0,
    summary: {
      avgNetReturn1h: null,
      avgNetReturn6h: null,
      avgNetReturn24h: null,
      winRate1h: null,
      winRate6h: null,
      winRate24h: null,
    },
    trades: [],
  };
}

async function savePaperTrades(data: PaperTradesData): Promise<void> {
  data.lastUpdatedAt = new Date().toISOString();
  await Bun.write(PAPER_TRADES_FILE, JSON.stringify(data, null, 2));
}

function calculateSummary(trades: PaperTrade[]): PaperTradesData["summary"] {
  const valid1h = trades.filter(t => t.netReturn1h !== undefined);
  const valid6h = trades.filter(t => t.netReturn6h !== undefined);
  const valid24h = trades.filter(t => t.netReturn24h !== undefined);

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
  const winRate = (arr: number[]) => arr.length > 0 ? (arr.filter(x => x > 0).length / arr.length) * 100 : null;

  return {
    avgNetReturn1h: avg(valid1h.map(t => t.netReturn1h!)),
    avgNetReturn6h: avg(valid6h.map(t => t.netReturn6h!)),
    avgNetReturn24h: avg(valid24h.map(t => t.netReturn24h!)),
    winRate1h: winRate(valid1h.map(t => t.netReturn1h!)),
    winRate6h: winRate(valid6h.map(t => t.netReturn6h!)),
    winRate24h: winRate(valid24h.map(t => t.netReturn24h!)),
  };
}

async function checkPendingTrades(data: PaperTradesData): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  let updated = false;

  for (const trade of data.trades) {
    if (trade.status === "complete") continue;

    const age = now - trade.detectedAt;

    // Check 1h mark
    if (trade.status === "pending_1h" && age >= 3600) {
      console.log(`  Checking 1h price for ${trade.token.slice(0, 12)}...`);
      const price = await getCurrentPrice(trade.token);
      if (price) {
        trade.price1h = price;
        trade.return1h = ((price - trade.entryPrice) / trade.entryPrice) * 100;
        trade.netReturn1h = trade.return1h - ROUND_TRIP_FEES_PCT;
        trade.status = "pending_6h";
        updated = true;
        console.log(`    1h: ${trade.return1h.toFixed(2)}% gross, ${trade.netReturn1h.toFixed(2)}% net`);
      }
    }

    // Check 6h mark
    if (trade.status === "pending_6h" && age >= 21600) {
      console.log(`  Checking 6h price for ${trade.token.slice(0, 12)}...`);
      const price = await getCurrentPrice(trade.token);
      if (price) {
        trade.price6h = price;
        trade.return6h = ((price - trade.entryPrice) / trade.entryPrice) * 100;
        trade.netReturn6h = trade.return6h - ROUND_TRIP_FEES_PCT;
        trade.status = "pending_24h";
        updated = true;
        console.log(`    6h: ${trade.return6h.toFixed(2)}% gross, ${trade.netReturn6h.toFixed(2)}% net`);
      }
    }

    // Check 24h mark
    if (trade.status === "pending_24h" && age >= 86400) {
      console.log(`  Checking 24h price for ${trade.token.slice(0, 12)}...`);
      const price = await getCurrentPrice(trade.token);
      if (price) {
        trade.price24h = price;
        trade.return24h = ((price - trade.entryPrice) / trade.entryPrice) * 100;
        trade.netReturn24h = trade.return24h - ROUND_TRIP_FEES_PCT;
        trade.status = "complete";
        data.completeSignals++;
        updated = true;
        console.log(`    24h: ${trade.return24h.toFixed(2)}% gross, ${trade.netReturn24h.toFixed(2)}% net`);
        console.log(`    ✓ Trade complete`);
      }
    }
  }

  if (updated) {
    data.summary = calculateSummary(data.trades);
    await savePaperTrades(data);
  }
}

async function parseTransaction(signature: string): Promise<{ token: string; side: "buy" | "sell"; wallet: string } | null> {
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

    // Look for BAGS token in transfers
    const tokenTransfers = tx.tokenTransfers || [];
    for (const transfer of tokenTransfers) {
      const mint = transfer.mint || "";
      if (!isBagsToken(mint)) continue;

      // Determine if buy or sell based on wallet
      const fromUserAccount = transfer.fromUserAccount || "";
      const toUserAccount = transfer.toUserAccount || "";

      // Check if one of our curators is involved
      for (const curator of CURATOR_WALLETS) {
        if (toUserAccount === curator) {
          return { token: mint, side: "buy", wallet: curator };
        }
        if (fromUserAccount === curator) {
          return { token: mint, side: "sell", wallet: curator };
        }
      }
    }

    // Also check native transfers and swap events
    const nativeTransfers = tx.nativeTransfers || [];
    const events = tx.events || {};

    // If it's a swap event with a BAGS token
    if (events.swap) {
      const swap = events.swap;
      const tokenInputs = swap.tokenInputs || [];
      const tokenOutputs = swap.tokenOutputs || [];

      for (const input of tokenInputs) {
        if (isBagsToken(input.mint)) {
          // Curator is selling BAGS token
          if (CURATOR_WALLETS.includes(swap.nativeInput?.account || "")) {
            return { token: input.mint, side: "sell", wallet: swap.nativeInput.account };
          }
        }
      }

      for (const output of tokenOutputs) {
        if (isBagsToken(output.mint)) {
          // Curator is buying BAGS token
          if (CURATOR_WALLETS.includes(swap.nativeOutput?.account || "") ||
              CURATOR_WALLETS.includes(tx.feePayer || "")) {
            const wallet = CURATOR_WALLETS.find(w =>
              w === swap.nativeOutput?.account || w === tx.feePayer
            );
            if (wallet) {
              return { token: output.mint, side: "buy", wallet };
            }
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

async function handleNewTransaction(signature: string, data: PaperTradesData): Promise<void> {
  const parsed = await parseTransaction(signature);
  if (!parsed) return;
  if (parsed.side !== "buy") return; // Only track buys

  // Check if we already have this trade
  const existingId = `${parsed.wallet}-${parsed.token}-${Math.floor(Date.now() / 60000)}`;
  if (data.trades.some(t => t.id.startsWith(`${parsed.wallet}-${parsed.token}`))) {
    // Might be duplicate or recent trade, skip if within last hour
    const recent = data.trades.find(t =>
      t.curator === parsed.wallet &&
      t.token === parsed.token &&
      (Date.now() / 1000 - t.detectedAt) < 3600
    );
    if (recent) {
      console.log(`  Skipping duplicate trade for ${parsed.token.slice(0, 12)}...`);
      return;
    }
  }

  console.log(`\n🎯 CURATOR BUY DETECTED`);
  console.log(`  Curator: ${parsed.wallet.slice(0, 12)}...`);
  console.log(`  Token: ${parsed.token}`);
  console.log(`  Signature: ${signature}`);

  // Get entry price
  const entryPrice = await getCurrentPrice(parsed.token);
  if (!entryPrice) {
    console.log(`  ⚠️ Could not get entry price, skipping`);
    return;
  }

  // Get token info
  const tokenInfo = await getTokenInfo(parsed.token);

  const trade: PaperTrade = {
    id: `${parsed.wallet}-${parsed.token}-${Date.now()}`,
    curator: parsed.wallet,
    token: parsed.token,
    tokenName: tokenInfo?.name,
    detectedAt: Math.floor(Date.now() / 1000),
    entryPrice,
    status: "pending_1h",
    signature,
  };

  data.trades.push(trade);
  data.totalSignals++;
  await savePaperTrades(data);

  console.log(`  Entry price: $${entryPrice.toFixed(10)}`);
  console.log(`  Token: ${tokenInfo?.name || "Unknown"}`);
  console.log(`  ✓ Paper trade logged, will check at +1h, +6h, +24h`);
}

async function main() {
  console.log("=== Live Curator Monitor ===\n");
  console.log("Watching curator wallets for new BAGS token buys.");
  console.log("Forward returns will be tracked at +1h, +6h, +24h.\n");

  if (!HELIUS_API_KEY) {
    console.error("ERROR: HELIUS_API_KEY not set");
    process.exit(1);
  }

  if (!BIRDEYE_API_KEY) {
    console.error("ERROR: BIRDEYE_API_KEY not set");
    process.exit(1);
  }

  // Load existing paper trades
  let data = await loadPaperTrades();
  console.log(`Loaded ${data.trades.length} existing paper trades`);
  console.log(`  Complete: ${data.completeSignals}`);
  console.log(`  Pending: ${data.trades.length - data.completeSignals}\n`);

  // Check pending trades immediately
  console.log("Checking pending trades for price updates...");
  await checkPendingTrades(data);

  // Print current summary
  if (data.trades.length > 0) {
    console.log("\n--- Current Summary ---");
    const s = data.summary;
    console.log(`Signals: ${data.totalSignals} total, ${data.completeSignals} complete`);
    if (s.avgNetReturn1h !== null) {
      console.log(`1h: ${s.avgNetReturn1h.toFixed(1)}% avg net, ${s.winRate1h?.toFixed(0)}% win rate`);
    }
    if (s.avgNetReturn6h !== null) {
      console.log(`6h: ${s.avgNetReturn6h.toFixed(1)}% avg net, ${s.winRate6h?.toFixed(0)}% win rate`);
    }
    if (s.avgNetReturn24h !== null) {
      console.log(`24h: ${s.avgNetReturn24h.toFixed(1)}% avg net, ${s.winRate24h?.toFixed(0)}% win rate`);
    }
    console.log("");
  }

  // Connect to Helius WebSocket
  console.log(`Connecting to Helius WebSocket...`);
  console.log(`Monitoring ${CURATOR_WALLETS.length} curator wallets\n`);

  const wsUrl = `wss://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("WebSocket connected");

    // Subscribe to all curator wallets
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

      // Handle subscription confirmations
      if (message.result !== undefined) {
        return;
      }

      // Handle log notifications
      if (message.method === "logsNotification") {
        const logs = message.params?.result?.value;
        if (!logs) return;

        const signature = logs.signature;
        if (!signature) return;

        console.log(`Activity detected: ${signature.slice(0, 20)}...`);

        // Reload data in case another process updated it
        data = await loadPaperTrades();

        // Process the transaction
        await handleNewTransaction(signature, data);

        // Check pending trades
        await checkPendingTrades(data);
      }
    } catch (e) {
      // Ignore parse errors
    }
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  ws.onclose = () => {
    console.log("WebSocket closed, reconnecting in 5s...");
    setTimeout(main, 5000);
  };

  // Periodically check pending trades (every 5 minutes)
  setInterval(async () => {
    console.log("\n[Periodic check] Checking pending trades...");
    data = await loadPaperTrades();
    await checkPendingTrades(data);

    // Print current stats
    const s = data.summary;
    console.log(`Stats: ${data.totalSignals} signals, ${data.completeSignals} complete`);
    if (s.avgNetReturn1h !== null) {
      console.log(`  1h: ${s.avgNetReturn1h.toFixed(1)}% net (${s.winRate1h?.toFixed(0)}% win)`);
    }
    console.log("");
  }, 5 * 60 * 1000);

  // Keep process alive
  console.log("Monitor running. Press Ctrl+C to stop.\n");
}

main().catch(console.error);
