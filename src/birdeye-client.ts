// Birdeye API Client - Real market data
// Free tier: 30k requests/month, 1 rps

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || "";
const BIRDEYE_BASE_URL = "https://public-api.birdeye.so";

interface BirdeyeResponse<T> {
  success: boolean;
  data: T;
}

export interface OHLCVCandle {
  unixTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TopTrader {
  owner: string;
  trade: number;
  tradeBuy: number;
  tradeSell: number;
  volume: number;
  volumeBuy: number;
  volumeSell: number;
  tags?: string[];
}

export interface WalletPnL {
  address: string;
  tokenAddress: string;
  realizedProfit: number;
  unrealizedProfit: number;
  totalProfit: number;
  buyAmount: number;
  sellAmount: number;
  buyCount: number;
  sellCount: number;
  avgBuyPrice: number;
  avgSellPrice: number;
}

export interface TokenTrade {
  signature: string;
  blockUnixTime: number;
  source: string;
  owner: string;
  side: "buy" | "sell";
  amount: number;
  price: number;
  volumeUsd: number;
  fee?: number;
}

async function birdeyeFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
  const url = new URL(`${BIRDEYE_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "X-API-KEY": BIRDEYE_API_KEY,
        "x-chain": "solana",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Birdeye API error ${response.status}: ${text}`);
      return null;
    }

    const json = (await response.json()) as BirdeyeResponse<T>;
    if (!json.success) {
      console.error("Birdeye API returned success=false");
      return null;
    }

    return json.data;
  } catch (error) {
    console.error(`Birdeye fetch error: ${error}`);
    return null;
  }
}

// Get historical OHLCV data for a token
export async function getOHLCV(
  tokenAddress: string,
  timeFrom: number,
  timeTo: number,
  interval: "1m" | "5m" | "15m" | "1H" | "4H" | "1D" = "1H"
): Promise<OHLCVCandle[] | null> {
  const data = await birdeyeFetch<{ items: OHLCVCandle[] }>("/defi/ohlcv", {
    address: tokenAddress,
    type: interval,
    time_from: timeFrom.toString(),
    time_to: timeTo.toString(),
  });

  return data?.items || null;
}

// Get top traders for a token
export async function getTopTraders(
  tokenAddress: string,
  timeFrame: "1h" | "4h" | "24h" = "24h",
  limit: number = 10
): Promise<TopTrader[] | null> {
  const data = await birdeyeFetch<{ items: TopTrader[] }>("/defi/v2/tokens/top_traders", {
    address: tokenAddress,
    time_frame: timeFrame,
    sort_by: "volume",
    sort_type: "desc",
    limit: limit.toString(),
  });

  return data?.items || null;
}

// Get token trades (can filter by wallet)
export async function getTokenTrades(
  tokenAddress: string,
  options: {
    owner?: string;
    txType?: "swap" | "all";
    limit?: number;
    beforeTime?: number;
  } = {}
): Promise<TokenTrade[] | null> {
  const params: Record<string, string> = {
    address: tokenAddress,
    tx_type: options.txType || "swap",
    limit: (options.limit || 50).toString(),
  };

  if (options.owner) params.owner = options.owner;
  if (options.beforeTime) params.before_time = options.beforeTime.toString();

  const data = await birdeyeFetch<{ items: TokenTrade[] }>("/defi/v3/token/txs", params);

  return data?.items || null;
}

// Get wallet P&L for specific tokens
export async function getWalletPnL(
  walletAddress: string,
  tokenAddresses: string[]
): Promise<WalletPnL[] | null> {
  // Note: This endpoint has strict rate limits (5 rps)
  const params: Record<string, string> = {
    wallet: walletAddress,
  };

  // Add token addresses as comma-separated
  if (tokenAddresses.length > 0) {
    params.token_addresses = tokenAddresses.slice(0, 50).join(",");
  }

  const data = await birdeyeFetch<{ items: WalletPnL[] }>("/wallet/v2/pnl", params);

  return data?.items || null;
}

// Get current token price
export async function getTokenPrice(tokenAddress: string): Promise<number | null> {
  const data = await birdeyeFetch<{ value: number }>("/defi/price", {
    address: tokenAddress,
  });

  return data?.value || null;
}

// Check if API key is configured
export function hasApiKey(): boolean {
  return BIRDEYE_API_KEY.length > 0;
}

// Test function
async function main() {
  console.log("=== Birdeye Client Test ===\n");

  if (!hasApiKey()) {
    console.log("WARNING: No BIRDEYE_API_KEY set. Some endpoints may fail.");
    console.log("Get a free key at: https://bds.birdeye.so\n");
  }

  const testMint = "7Mxvi7bi5bnjELB4QNzQ4VrQEPeBgPbWwbfwE1ydBAGS";

  // Test 1: Get current price (works without key for some endpoints)
  console.log("1. Testing price endpoint...");
  const price = await getTokenPrice(testMint);
  console.log(`   Price: ${price !== null ? `$${price}` : "FAILED (need API key?)"}`);

  // Test 2: Get top traders
  console.log("\n2. Testing top traders endpoint...");
  const traders = await getTopTraders(testMint, "24h", 5);
  if (traders) {
    console.log(`   Found ${traders.length} top traders:`);
    for (const t of traders.slice(0, 3)) {
      console.log(`   - ${t.owner.slice(0, 8)}... volume: ${t.volume}, trades: ${t.trade}`);
    }
  } else {
    console.log("   FAILED (need API key?)");
  }

  // Test 3: Get recent trades
  console.log("\n3. Testing token trades endpoint...");
  const trades = await getTokenTrades(testMint, { limit: 5 });
  if (trades) {
    console.log(`   Found ${trades.length} recent trades:`);
    for (const t of trades.slice(0, 3)) {
      console.log(`   - ${t.side} ${t.amount.toFixed(2)} @ $${t.price.toFixed(6)} by ${t.owner.slice(0, 8)}...`);
    }
  } else {
    console.log("   FAILED (need API key?)");
  }
}

if (import.meta.main) {
  main().catch(console.error);
}
