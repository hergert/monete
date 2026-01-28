// Debug Birdeye trade structure

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || "";

async function main() {
  const mint = "7Mxvi7bi5bnjELB4QNzQ4VrQEPeBgPbWwbfwE1ydBAGS";

  console.log("Fetching trades for", mint);

  const response = await fetch(
    `https://public-api.birdeye.so/defi/txs/token?address=${mint}&tx_type=swap&sort_type=desc&limit=5`,
    {
      headers: {
        "X-API-KEY": BIRDEYE_API_KEY,
        "x-chain": "solana",
      },
    }
  );

  const json = await response.json();
  console.log("\nFull response structure:");
  console.log(JSON.stringify(json, null, 2));
}

main().catch(console.error);
