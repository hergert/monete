// DBC Client - Direct bonding curve interaction
// This bypasses Jupiter and trades directly on Meteora DBC

import { Connection, PublicKey } from "@solana/web3.js";
import {
  DynamicBondingCurveClient,
  getPriceFromSqrtPrice,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
import BN from "bn.js";

const HELIUS_RPC =
  process.env.HELIUS_RPC_URL ||
  `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

export interface PoolInfo {
  address: string;
  baseMint: string;
  quoteMint: string;
  isMigrated: boolean;
  migrationProgress: number;
  sqrtPrice: string;
  quoteReserve: string;
  currentPriceInQuote: number | null;
}

export interface SwapQuoteResult {
  amountIn: string;
  amountOut: string;
  minimumAmountOut: string;
  priceImpactBps: number;
  feeAmount: string;
}

export async function getConnection(): Promise<Connection> {
  return new Connection(HELIUS_RPC, "confirmed");
}

export async function getDbcClient(): Promise<DynamicBondingCurveClient> {
  const connection = await getConnection();
  return new DynamicBondingCurveClient(connection, "confirmed");
}

export async function getPoolByMint(baseMint: string): Promise<PoolInfo | null> {
  try {
    const client = await getDbcClient();
    const mintPubkey = new PublicKey(baseMint);

    // Try to find pool by base mint
    const poolAccount = await client.state.getPoolByBaseMint(mintPubkey);

    if (!poolAccount) {
      return null;
    }

    const poolState = poolAccount.account;
    const poolAddress = poolAccount.publicKey.toString();

    // Check if pool has migrated (isMigrated can be number or boolean depending on version)
    const isMigrated = Boolean(poolState.isMigrated);

    // Calculate current price from sqrtPrice
    let currentPriceInQuote: number | null = null;
    if (poolState.sqrtPrice) {
      try {
        // getPriceFromSqrtPrice returns a Decimal, convert to number
        const priceDecimal = getPriceFromSqrtPrice(
          poolState.sqrtPrice,
          6, // base decimals (most meme tokens are 6)
          9 // quote decimals (SOL is 9)
        );
        currentPriceInQuote = Number(priceDecimal);
      } catch (e) {
        console.error("Error calculating price:", e);
      }
    }

    // Get migration progress (0=PreBondingCurve, 1=PostBondingCurve, 2=LockedVesting, 3=CreatedPool)
    const migrationProgress = poolState.migrationProgress || 0;

    // Quote mint is SOL for most pools
    const quoteMint = "So11111111111111111111111111111111111111112";

    return {
      address: poolAddress,
      baseMint: poolState.baseMint?.toString() || baseMint,
      quoteMint,
      isMigrated,
      migrationProgress,
      sqrtPrice: poolState.sqrtPrice?.toString() || "0",
      quoteReserve: poolState.quoteReserve?.toString() || "0",
      currentPriceInQuote,
    };
  } catch (error) {
    console.error(`Error getting pool for ${baseMint}:`, error);
    return null;
  }
}

// Note: For swap quotes, we'd need to use the pool service's swapQuote method
// which requires more parameters. For now, we just expose pool info.
// The actual swapQuote function signature is complex and requires pool config.

// Test function
async function main() {
  const testMints = [
    "7Mxvi7bi5bnjELB4QNzQ4VrQEPeBgPbWwbfwE1ydBAGS",
    "G1DXVVmqJs8Ei79QbK41dpgk2WtXSGqLtx9of7o8BAGS",
    "5arEQv5tGJj8UbhnPrc1WL5KMmijCe4FuexCaEXUBAGS",
  ];

  console.log("=== DBC Client Test ===\n");

  for (const mint of testMints) {
    console.log(`\nTesting mint: ${mint}`);
    const pool = await getPoolByMint(mint);

    if (pool) {
      console.log(`  Pool found: ${pool.address}`);
      console.log(`  Migrated: ${pool.isMigrated}`);
      console.log(`  Migration progress: ${pool.migrationProgress}`);
      console.log(`  Quote reserve: ${pool.quoteReserve} lamports`);
      console.log(
        `  Current price: ${pool.currentPriceInQuote !== null ? `${pool.currentPriceInQuote.toFixed(9)} SOL` : "N/A"}`
      );
    } else {
      console.log(`  No pool found (may be migrated or closed)`);
    }
  }
}

// Run if called directly
if (import.meta.main) {
  main().catch(console.error);
}
