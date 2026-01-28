// Verify Fees - Analyze actual Bags trades to determine real fee structure
// This answers: "What do fees ACTUALLY cost, not what we assume?"

import { Connection, PublicKey } from "@solana/web3.js";

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || "";
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// Known Bags token with recent activity
const TEST_TOKEN = "ehipS3kn9GUSnEMgtB9RxCNBVfH5gTNRVxNtqFTBAGS";

// Fee Share programs
const FEE_SHARE_V1 = "FEEhPbKVKnco9EXnaY3i4R5rQVUx91wgVfu8qokixywi";
const FEE_SHARE_V2 = "FEE2tBhKAt7shrod19QttSVREUYPiyMzoku1mL1gqVK";

interface FeeAnalysis {
  signature: string;
  tradeType: "buy" | "sell";
  tokenAmount: number;
  solAmount: number;
  solPrice: number;
  tradeValueUsd: number;
  fees: {
    solanaBaseFee: number;
    priorityFee: number;
    creatorRoyalty: number;
    ammFee: number;
    otherFees: number;
    totalFees: number;
    totalFeesUsd: number;
    feePercent: number;
  };
  programsInvolved: string[];
}

async function getRecentTrades(token: string, limit: number = 10): Promise<string[]> {
  // Use Helius to get recent swap transactions for this token
  const url = `https://api.helius.xyz/v0/addresses/${token}/transactions?api-key=${HELIUS_API_KEY}&type=SWAP`;

  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Failed to fetch transactions: ${response.status}`);
    return [];
  }

  const txs = await response.json() as any[];
  return txs.slice(0, limit).map((tx: any) => tx.signature);
}

async function analyzeTransaction(signature: string): Promise<FeeAnalysis | null> {
  // Get parsed transaction from Helius
  const url = `https://api.helius.xyz/v0/transactions/?api-key=${HELIUS_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transactions: [signature] }),
  });

  if (!response.ok) {
    console.error(`Failed to fetch transaction: ${response.status}`);
    return null;
  }

  const data = await response.json() as any[];
  if (!data || data.length === 0) return null;

  const tx = data[0];

  console.log("\n--- RAW TRANSACTION DATA ---");
  console.log(`Signature: ${signature}`);
  console.log(`Type: ${tx.type}`);
  console.log(`Description: ${tx.description}`);
  console.log(`Fee: ${tx.fee} lamports (${(tx.fee / 1e9).toFixed(6)} SOL)`);
  console.log(`Fee Payer: ${tx.feePayer}`);

  // Look for Fee Share program involvement
  const accountKeys = tx.accountData?.map((a: any) => a.account) || [];
  const programsInvolved: string[] = [];

  if (accountKeys.includes(FEE_SHARE_V1)) programsInvolved.push("FeeShare_V1");
  if (accountKeys.includes(FEE_SHARE_V2)) programsInvolved.push("FeeShare_V2");

  console.log(`\nPrograms detected: ${programsInvolved.length > 0 ? programsInvolved.join(", ") : "None (Fee Share)"}`);

  // Analyze native transfers (SOL movements)
  console.log("\n--- NATIVE TRANSFERS (SOL) ---");
  let totalSolIn = 0;
  let totalSolOut = 0;
  const nativeTransfers = tx.nativeTransfers || [];

  for (const transfer of nativeTransfers) {
    const amount = transfer.amount / 1e9;
    const direction = transfer.fromUserAccount === tx.feePayer ? "OUT" : "IN";
    console.log(`  ${direction}: ${amount.toFixed(6)} SOL (${transfer.fromUserAccount?.slice(0, 8)}... → ${transfer.toUserAccount?.slice(0, 8)}...)`);

    if (direction === "OUT") totalSolOut += amount;
    else totalSolIn += amount;
  }

  console.log(`  Total SOL out: ${totalSolOut.toFixed(6)}`);
  console.log(`  Total SOL in: ${totalSolIn.toFixed(6)}`);

  // Analyze token transfers
  console.log("\n--- TOKEN TRANSFERS ---");
  const tokenTransfers = tx.tokenTransfers || [];
  let tokenAmount = 0;
  let tradeType: "buy" | "sell" = "buy";

  for (const transfer of tokenTransfers) {
    console.log(`  ${transfer.mint?.slice(0, 12)}...: ${transfer.tokenAmount} (${transfer.fromUserAccount?.slice(0, 8)}... → ${transfer.toUserAccount?.slice(0, 8)}...)`);

    if (transfer.mint?.endsWith("BAGS")) {
      tokenAmount = transfer.tokenAmount;
      // If we're receiving tokens, it's a buy
      tradeType = transfer.toUserAccount === tx.feePayer ? "buy" : "sell";
    }
  }

  // Calculate fees
  const baseFee = tx.fee / 1e9; // Convert lamports to SOL

  // Try to identify fee components from account changes
  console.log("\n--- ACCOUNT CHANGES ---");
  const accountData = tx.accountData || [];
  let feeShareAmount = 0;

  for (const acc of accountData) {
    if (acc.nativeBalanceChange && acc.nativeBalanceChange !== 0) {
      const change = acc.nativeBalanceChange / 1e9;
      const sign = change > 0 ? "+" : "";
      console.log(`  ${acc.account?.slice(0, 12)}...: ${sign}${change.toFixed(6)} SOL`);

      // Look for fee recipients (positive balance changes that aren't the trader)
      if (change > 0 && acc.account !== tx.feePayer) {
        // This could be a fee recipient
        if (acc.account?.startsWith("FEE") || programsInvolved.length > 0) {
          feeShareAmount += change;
        }
      }
    }
  }

  // Estimate trade value
  const netSolMovement = Math.abs(totalSolOut - totalSolIn);
  const estimatedSolPrice = 125; // Approximate current SOL price
  const tradeValueUsd = netSolMovement * estimatedSolPrice;

  // Calculate fee percentage
  const totalFeeSol = baseFee + feeShareAmount;
  const feePercent = netSolMovement > 0 ? (totalFeeSol / netSolMovement) * 100 : 0;

  console.log("\n--- FEE ANALYSIS ---");
  console.log(`Trade type: ${tradeType}`);
  console.log(`Token amount: ${tokenAmount}`);
  console.log(`Net SOL movement: ${netSolMovement.toFixed(6)} SOL (~$${tradeValueUsd.toFixed(2)})`);
  console.log(`Base tx fee: ${baseFee.toFixed(6)} SOL`);
  console.log(`Fee Share amount: ${feeShareAmount.toFixed(6)} SOL`);
  console.log(`Total fees: ${totalFeeSol.toFixed(6)} SOL`);
  console.log(`Fee percentage: ${feePercent.toFixed(2)}%`);

  return {
    signature,
    tradeType,
    tokenAmount,
    solAmount: netSolMovement,
    solPrice: estimatedSolPrice,
    tradeValueUsd,
    fees: {
      solanaBaseFee: baseFee,
      priorityFee: 0, // Would need to parse instructions to get this
      creatorRoyalty: feeShareAmount,
      ammFee: 0, // Embedded in swap, hard to separate
      otherFees: 0,
      totalFees: totalFeeSol,
      totalFeesUsd: totalFeeSol * estimatedSolPrice,
      feePercent,
    },
    programsInvolved,
  };
}

async function main() {
  console.log("=== Fee Verification ===\n");
  console.log("Goal: Determine ACTUAL fee structure from real Bags trades\n");

  if (!HELIUS_API_KEY) {
    console.error("ERROR: HELIUS_API_KEY not set");
    process.exit(1);
  }

  // Get recent trades
  console.log(`Fetching recent trades for ${TEST_TOKEN.slice(0, 12)}...`);
  const signatures = await getRecentTrades(TEST_TOKEN, 5);
  console.log(`Found ${signatures.length} recent trades\n`);

  if (signatures.length === 0) {
    console.log("No trades found. Trying alternative method...");

    // Try getting any transaction involving the token
    const connection = new Connection(HELIUS_RPC, "confirmed");
    const tokenPubkey = new PublicKey(TEST_TOKEN);
    const sigs = await connection.getSignaturesForAddress(tokenPubkey, { limit: 5 });

    for (const sig of sigs) {
      signatures.push(sig.signature);
    }

    console.log(`Found ${signatures.length} transactions via RPC\n`);
  }

  // Analyze each trade
  const analyses: FeeAnalysis[] = [];

  for (const sig of signatures) {
    console.log("\n" + "=".repeat(80));
    const analysis = await analyzeTransaction(sig);
    if (analysis) {
      analyses.push(analysis);
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 500));
  }

  // Summary
  console.log("\n" + "=".repeat(80));
  console.log("FEE VERIFICATION SUMMARY");
  console.log("=".repeat(80));

  if (analyses.length === 0) {
    console.log("\nNo trades could be analyzed.");
    console.log("This might mean:");
    console.log("  1. Token has no recent activity");
    console.log("  2. Helius API format changed");
    console.log("  3. Need different analysis approach");
    return;
  }

  const avgFeePercent = analyses.reduce((sum, a) => sum + a.fees.feePercent, 0) / analyses.length;
  const buys = analyses.filter(a => a.tradeType === "buy");
  const sells = analyses.filter(a => a.tradeType === "sell");

  console.log(`\nTransactions analyzed: ${analyses.length}`);
  console.log(`  Buys: ${buys.length}`);
  console.log(`  Sells: ${sells.length}`);
  console.log(`\nAverage fee per trade: ${avgFeePercent.toFixed(2)}%`);
  console.log(`Estimated round-trip fee: ${(avgFeePercent * 2).toFixed(2)}%`);

  // Compare to our assumption
  const assumedFee = 2.6;
  const actualFee = avgFeePercent * 2;

  console.log("\n--- COMPARISON TO ASSUMPTION ---");
  console.log(`Our assumption: ${assumedFee}% round-trip`);
  console.log(`Actual (estimated): ${actualFee.toFixed(2)}% round-trip`);

  if (actualFee > assumedFee * 1.2) {
    console.log(`\n⚠️ FEES ARE HIGHER THAN ASSUMED`);
    console.log(`This reduces profitability of marginal wallets.`);
  } else if (actualFee < assumedFee * 0.8) {
    console.log(`\n✓ FEES ARE LOWER THAN ASSUMED`);
    console.log(`This improves profitability estimates.`);
  } else {
    console.log(`\n✓ FEES ARE CLOSE TO ASSUMPTION`);
  }

  // Save report
  const report = {
    generated_at: new Date().toISOString(),
    token_analyzed: TEST_TOKEN,
    transactions_analyzed: analyses.length,
    summary: {
      avg_fee_per_trade_percent: avgFeePercent,
      estimated_round_trip_percent: avgFeePercent * 2,
      assumed_round_trip_percent: assumedFee,
      fee_difference_percent: actualFee - assumedFee,
    },
    trades: analyses,
  };

  await Bun.write("reports/fee_verification.json", JSON.stringify(report, null, 2));
  console.log("\nReport saved to reports/fee_verification.json");
}

main().catch(console.error);
