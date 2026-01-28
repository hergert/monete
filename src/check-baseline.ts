// Check Baseline - Are Bags tokens profitable at all?
// This answers: "If you bought every Bags token, what would happen?"

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || "";

const BAGS_TOKENS = [
  "7Mxvi7bi5bnjELB4QNzQ4VrQEPeBgPbWwbfwE1ydBAGS",
  "G1DXVVmqJs8Ei79QbK41dpgk2WtXSGqLtx9of7o8BAGS",
  "5arEQv5tGJj8UbhnPrc1WL5KMmijCe4FuexCaEXUBAGS",
  "2ZhzUhaPm8L9g6iUF1LegbjFHJyXdEXahi8R4eQhBAGS",
  "78a6Cbggc2axnGQyuM5iA91oN1Qt93M95NswhhzPBAGS",
  "ArhUyCSWvDKD7tXcTcgTaYxBkDZiFVkmxzyZXmUJBAGS",
  "ehipS3kn9GUSnEMgtB9RxCNBVfH5gTNRVxNtqFTBAGS",
  "H5hygVvXiYxk2a3BVtjiqcDJK8TdHTB5u5U1fXEuBAGS",
  "FFEjZnvY1tqHyBAMBPE1DHoEmQWLmxjhvvDs4TaRBAGS",
  "k9BKDF8x9Y6nBbGVL938yPT33h4zo8p8GTsi4wJBAGS",
  "CdyjsXbPs6VamxNk7StU5apXFHAiM7q8FTYAN3rdBAGS",
];

interface TokenStats {
  token: string;
  currentPrice: number | null;
  priceChange24h: number | null;
  volume24h: number | null;
  liquidity: number | null;
  status: "active" | "low_liquidity" | "dead" | "unknown";
}

async function getTokenStats(token: string): Promise<TokenStats> {
  try {
    // Get current price and stats
    const response = await fetch(
      `https://public-api.birdeye.so/defi/token_overview?address=${token}`,
      {
        headers: {
          "X-API-KEY": BIRDEYE_API_KEY,
          "x-chain": "solana",
        },
      }
    );

    if (!response.ok) {
      return {
        token,
        currentPrice: null,
        priceChange24h: null,
        volume24h: null,
        liquidity: null,
        status: "unknown",
      };
    }

    const json = await response.json() as any;
    const data = json.data;

    const currentPrice = data?.price || null;
    const priceChange24h = data?.priceChange24hPercent || null;
    const volume24h = data?.v24hUSD || null;
    const liquidity = data?.liquidity || null;

    // Determine status
    let status: TokenStats["status"] = "active";
    if (!currentPrice || currentPrice === 0) {
      status = "dead";
    } else if (liquidity !== null && liquidity < 100) {
      status = "low_liquidity";
    } else if (volume24h !== null && volume24h < 10) {
      status = "low_liquidity";
    }

    return {
      token,
      currentPrice,
      priceChange24h,
      volume24h,
      liquidity,
      status,
    };
  } catch (e) {
    return {
      token,
      currentPrice: null,
      priceChange24h: null,
      volume24h: null,
      liquidity: null,
      status: "unknown",
    };
  }
}

async function main() {
  console.log("=== Bags Token Baseline Check ===\n");

  if (!BIRDEYE_API_KEY) {
    console.error("ERROR: BIRDEYE_API_KEY not set");
    process.exit(1);
  }

  console.log("Checking health of known Bags tokens...\n");

  const stats: TokenStats[] = [];

  for (const token of BAGS_TOKENS) {
    console.log(`Checking ${token.slice(0, 16)}...`);
    const stat = await getTokenStats(token);
    stats.push(stat);

    // Rate limit
    await new Promise(r => setTimeout(r, 500));
  }

  // Analyze results
  console.log("\n" + "=".repeat(100));
  console.log("BASELINE ANALYSIS");
  console.log("=".repeat(100));

  console.log("\n--- Token Health ---\n");
  console.log(
    "Token".padEnd(20) +
    "Price".padEnd(16) +
    "24h Change".padEnd(14) +
    "Volume 24h".padEnd(14) +
    "Liquidity".padEnd(14) +
    "Status"
  );
  console.log("-".repeat(100));

  for (const s of stats) {
    const price = s.currentPrice ? `$${s.currentPrice.toFixed(8)}` : "N/A";
    const change = s.priceChange24h !== null ? `${s.priceChange24h.toFixed(1)}%` : "N/A";
    const volume = s.volume24h !== null ? `$${s.volume24h.toFixed(0)}` : "N/A";
    const liq = s.liquidity !== null ? `$${s.liquidity.toFixed(0)}` : "N/A";

    const statusEmoji = {
      active: "✅",
      low_liquidity: "⚠️",
      dead: "💀",
      unknown: "❓",
    }[s.status];

    console.log(
      s.token.slice(0, 18).padEnd(20) +
      price.padEnd(16) +
      change.padEnd(14) +
      volume.padEnd(14) +
      liq.padEnd(14) +
      `${statusEmoji} ${s.status}`
    );
  }

  // Summary stats
  const active = stats.filter(s => s.status === "active").length;
  const lowLiq = stats.filter(s => s.status === "low_liquidity").length;
  const dead = stats.filter(s => s.status === "dead").length;
  const unknown = stats.filter(s => s.status === "unknown").length;

  console.log("\n--- Summary ---\n");
  console.log(`Total tokens: ${stats.length}`);
  console.log(`  ✅ Active (tradeable): ${active}`);
  console.log(`  ⚠️ Low liquidity: ${lowLiq}`);
  console.log(`  💀 Dead/rugged: ${dead}`);
  console.log(`  ❓ Unknown: ${unknown}`);

  // Calculate average 24h change for active tokens
  const activeWithChange = stats.filter(s => s.status === "active" && s.priceChange24h !== null);
  if (activeWithChange.length > 0) {
    const avgChange = activeWithChange.reduce((sum, s) => sum + (s.priceChange24h || 0), 0) / activeWithChange.length;
    console.log(`\nAvg 24h change (active tokens): ${avgChange.toFixed(1)}%`);
  }

  // Verdict
  console.log("\n" + "=".repeat(60));
  console.log("BASELINE VERDICT");
  console.log("=".repeat(60));

  const survivalRate = ((active + lowLiq) / stats.length) * 100;
  console.log(`\nSurvival rate: ${survivalRate.toFixed(0)}% (${active + lowLiq}/${stats.length} still tradeable)`);

  if (dead >= stats.length / 2) {
    console.log("\n❌ NEGATIVE BASELINE");
    console.log(`More than half of Bags tokens are dead/rugged.`);
    console.log("Copy trading on Bags.fm is likely unprofitable.");
    console.log("\nThe fundamental problem: Most tokens go to zero.");
    console.log("Even if you follow 'smart money', you're picking from losers.");
  } else if (active >= stats.length / 2) {
    console.log("\n✅ VIABLE BASELINE");
    console.log("Most tokens are still active.");
    console.log("There may be opportunity if we can identify winners early.");
  } else {
    console.log("\n⚠️ MARGINAL BASELINE");
    console.log("Mixed results - need more data to determine viability.");
  }

  // Save report
  const report = {
    generated_at: new Date().toISOString(),
    tokens_checked: stats.length,
    summary: {
      active,
      low_liquidity: lowLiq,
      dead,
      unknown,
      survival_rate_percent: survivalRate,
    },
    tokens: stats,
  };

  await Bun.write("reports/baseline_check.json", JSON.stringify(report, null, 2));
  console.log("\nReport saved to reports/baseline_check.json");
}

main().catch(console.error);
