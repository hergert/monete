// Debug DBC pool structure

import { Connection, PublicKey } from "@solana/web3.js";
import { DynamicBondingCurveClient } from "@meteora-ag/dynamic-bonding-curve-sdk";

const HELIUS_RPC =
  process.env.HELIUS_RPC_URL ||
  `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

async function main() {
  const connection = new Connection(HELIUS_RPC, "confirmed");
  const client = new DynamicBondingCurveClient(connection, "confirmed");

  const mint = "7Mxvi7bi5bnjELB4QNzQ4VrQEPeBgPbWwbfwE1ydBAGS";
  const mintPubkey = new PublicKey(mint);

  console.log("Looking for pool by base mint:", mint);

  const poolAccount = await client.state.getPoolByBaseMint(mintPubkey);

  if (poolAccount) {
    console.log("\n=== Pool Account Structure ===");
    console.log("publicKey:", poolAccount.publicKey?.toString());
    console.log("\nAccount keys:");
    console.log(Object.keys(poolAccount));

    if (poolAccount.account) {
      console.log("\nAccount.account keys:");
      console.log(Object.keys(poolAccount.account));
    }

    // Try to inspect deeply
    console.log("\n=== Full poolAccount (JSON) ===");
    console.log(JSON.stringify(poolAccount, (key, value) => {
      if (typeof value === 'bigint') return value.toString();
      if (value instanceof PublicKey) return value.toString();
      if (value?.toNumber) return value.toNumber();
      return value;
    }, 2).slice(0, 3000));
  } else {
    console.log("No pool found");
  }
}

main().catch(console.error);
