# Spec: E2E Runner

## Purpose
Orchestrate the full pipeline and produce the final validation report.

## Location
`src/e2e-replay.ts`

---

## Command

```bash
bun run e2e:replay
```

---

## What It Does

1. Ensure Postgres is up (`docker compose up -d db`)
2. Run migrations
3. Clear previous run data (optional, for clean state)
4. Replay events from `data/replay/events.jsonl`
5. Run signature validation on fixtures
6. Run wallet analytics
7. Run strategy decisions on replay data
8. Run paper trading simulation
9. Collect all metrics
10. Write `reports/final_validation.json`
11. Exit 0 if PASS, non-zero if FAIL

---

## Final Validation Report

**File**: `reports/final_validation.json`

```json
{
  "status": "PASS" | "FAIL",
  "timestamp": "2024-01-27T12:00:00Z",

  "e2e_replay": {
    "status": "PASS" | "FAIL",
    "events_processed": 100,
    "events_errors": 0,
    "launches_detected": 30,
    "wallet_actions_recorded": 50
  },

  "signature_gate": {
    "status": "PASS" | "FAIL",
    "bags_tested": 10,
    "bags_matched": 10,
    "non_bags_tested": 20,
    "non_bags_matched": 0,
    "false_positive_rate": 0.0
  },

  "db_integrity": {
    "status": "PASS" | "FAIL",
    "dedupe_ok": true,
    "tables_exist": true,
    "row_counts": {
      "raw_events": 100,
      "launches": 30,
      "wallet_actions": 50,
      "quotes": 20,
      "positions": 15,
      "wallet_scores": 10,
      "trade_journal": 30
    }
  },

  "wallet_analytics": {
    "status": "PASS" | "FAIL",
    "total_wallets": 20,
    "eligible_wallets": 8,
    "report_written": true
  },

  "strategy": {
    "status": "PASS" | "FAIL",
    "decisions_logged": 30,
    "trades_triggered": 15,
    "skips": 15
  },

  "paper_trading": {
    "status": "PASS" | "FAIL",
    "trades_simulated": 15,
    "positions_closed": 12,
    "pnl_summary": {
      "total_pnl_usd": 50.25,
      "win_rate": 0.58,
      "sharpe_ratio": 0.9
    }
  }
}
```

---

## Pass Criteria

**Overall PASS** requires ALL components to PASS:

| Component | Pass Condition |
|-----------|---------------|
| `e2e_replay` | `events_processed > 0 && events_errors == 0` |
| `signature_gate` | `false_positive_rate <= 0.05 && bags_tested >= 10 && non_bags_tested >= 20` |
| `db_integrity` | `dedupe_ok == true && tables_exist == true` |
| `wallet_analytics` | `eligible_wallets > 0 && report_written == true` |
| `strategy` | `decisions_logged > 0` |
| `paper_trading` | `trades_simulated > 0` |

---

## Implementation

```typescript
// src/e2e-replay.ts
import { execSync } from "child_process";
import { existsSync, writeFileSync, mkdirSync } from "fs";
import { db, runMigrations, checkIntegrity } from "./db";
import { runReplay } from "./ingestion/replay";
import { normalize } from "./normalizer";
import { runSignatureValidation } from "./validate-signature";
import { computeAllWalletScores } from "./wallet/analytics";
import { evaluateStrategy } from "./strategy";
import { PaperTrader } from "./paper/trader";

async function main() {
  console.log("=== E2E Replay Runner ===\n");

  // Ensure reports directory
  if (!existsSync("reports")) mkdirSync("reports", { recursive: true });

  // 1. Ensure DB is up
  console.log("1. Ensuring database is up...");
  try {
    execSync("docker compose up -d db", { stdio: "inherit" });
    // Wait for postgres to be ready
    await waitForPostgres();
  } catch (e) {
    return fail("db_startup_failed", e);
  }

  // 2. Run migrations
  console.log("\n2. Running migrations...");
  try {
    await runMigrations();
  } catch (e) {
    return fail("migration_failed", e);
  }

  // 3. Replay ingestion
  console.log("\n3. Replaying events...");
  let replayResult;
  try {
    replayResult = await runReplayIngestion();
  } catch (e) {
    return fail("replay_failed", e);
  }

  // 4. Signature validation
  console.log("\n4. Running signature validation...");
  let signatureResult;
  try {
    signatureResult = await runSignatureValidation();
  } catch (e) {
    return fail("signature_validation_failed", e);
  }

  // 5. DB integrity check
  console.log("\n5. Checking database integrity...");
  let integrityResult;
  try {
    integrityResult = await checkIntegrity();
  } catch (e) {
    return fail("integrity_check_failed", e);
  }

  // 6. Wallet analytics
  console.log("\n6. Computing wallet scores...");
  let walletResult;
  try {
    walletResult = await runWalletAnalytics();
  } catch (e) {
    return fail("wallet_analytics_failed", e);
  }

  // 7. Strategy evaluation
  console.log("\n7. Running strategy evaluation...");
  let strategyResult;
  try {
    strategyResult = await runStrategyEvaluation();
  } catch (e) {
    return fail("strategy_failed", e);
  }

  // 8. Paper trading
  console.log("\n8. Running paper trading simulation...");
  let paperResult;
  try {
    paperResult = await runPaperTrading();
  } catch (e) {
    return fail("paper_trading_failed", e);
  }

  // Build final report
  const report = {
    timestamp: new Date().toISOString(),
    e2e_replay: {
      status: replayResult.events_errors === 0 ? "PASS" : "FAIL",
      ...replayResult
    },
    signature_gate: {
      status: signatureResult.gate_passed ? "PASS" : "FAIL",
      ...signatureResult
    },
    db_integrity: {
      status: integrityResult.dedupe_ok && integrityResult.tables_exist ? "PASS" : "FAIL",
      ...integrityResult
    },
    wallet_analytics: {
      status: walletResult.eligible_wallets > 0 ? "PASS" : "FAIL",
      ...walletResult
    },
    strategy: {
      status: strategyResult.decisions_logged > 0 ? "PASS" : "FAIL",
      ...strategyResult
    },
    paper_trading: {
      status: paperResult.trades_simulated > 0 ? "PASS" : "FAIL",
      ...paperResult
    },
    status: "FAIL"  // Will update below
  };

  // Determine overall status
  const allPass =
    report.e2e_replay.status === "PASS" &&
    report.signature_gate.status === "PASS" &&
    report.db_integrity.status === "PASS" &&
    report.wallet_analytics.status === "PASS" &&
    report.strategy.status === "PASS" &&
    report.paper_trading.status === "PASS";

  report.status = allPass ? "PASS" : "FAIL";

  // Write report
  writeFileSync("reports/final_validation.json", JSON.stringify(report, null, 2));
  console.log("\n" + JSON.stringify(report, null, 2));

  if (report.status === "PASS") {
    console.log("\n✅ E2E PASSED");
    process.exit(0);
  } else {
    console.log("\n❌ E2E FAILED");
    process.exit(1);
  }
}

function fail(reason: string, error: unknown): never {
  const report = {
    status: "FAIL",
    timestamp: new Date().toISOString(),
    error: {
      reason,
      message: error instanceof Error ? error.message : String(error)
    }
  };
  writeFileSync("reports/final_validation.json", JSON.stringify(report, null, 2));
  console.error(`\n❌ E2E FAILED: ${reason}`);
  process.exit(1);
}

main().catch(e => fail("uncaught_error", e));
```

---

## Helper Functions

Each component should have a function that returns structured results:

```typescript
// runReplayIngestion() returns:
interface ReplayResult {
  events_processed: number;
  events_errors: number;
  launches_detected: number;
  wallet_actions_recorded: number;
}

// runSignatureValidation() returns:
interface SignatureResult {
  bags_tested: number;
  bags_matched: number;
  non_bags_tested: number;
  non_bags_matched: number;
  false_positive_rate: number;
  gate_passed: boolean;
}

// checkIntegrity() returns:
interface IntegrityResult {
  dedupe_ok: boolean;
  tables_exist: boolean;
  row_counts: Record<string, number>;
}

// etc.
```

---

## Tests

```typescript
describe("e2e runner", () => {
  test("produces valid report structure", async () => {
    // Run e2e:replay in test mode
    // Check that reports/final_validation.json exists
    // Check that it has all required fields
  });
});
```

---

## Completion Gate

The Ralph loop checks completion via `scripts/check_completion.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Must have COMPLETE promise
grep -q "<promise>COMPLETE</promise>" progress.txt

# Must have artifacts
test -f reports/final_validation.json
test -f bags_signature_v1.json

# Report must say PASS
grep -q '"status"[[:space:]]*:[[:space:]]*"PASS"' reports/final_validation.json

# Oracle must still pass
./scripts/verify.sh >/dev/null 2>&1
```

Only when `e2e:replay` produces `status: "PASS"` can the agent write the COMPLETE token.
