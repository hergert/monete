# Spec: Wallet Analytics (Component E)

## Purpose
Score wallets based on their historical trading performance to identify "smart money".

## Location
`src/wallet/`

---

## Wallet Features

For each wallet, compute these features:

| Feature | Description | Computation |
|---------|-------------|-------------|
| `signals_n` | Number of trades on Bags tokens | COUNT of wallet_actions |
| `is_deployer_like` | Likely a token deployer | tokens_created > 0 |
| `is_sniper_like` | Buys within 5s of launch | % of buys at T < 5s |
| `holding_half_life` | Median time to first sell | median(sell_time - buy_time) |
| `trade_frequency` | Signals per day | signals_n / active_days |
| `ev_mean` | Average return per trade | mean(pnl_pct) |
| `ev_lower_bound` | Conservative estimate | mean - 1.96 * stderr |

---

## Interface

```typescript
export interface WalletFeatures {
  wallet: string;
  signals_n: number;
  is_deployer_like: boolean;
  is_sniper_like: boolean;
  holding_half_life_seconds: number | null;
  trade_frequency: number;
  ev_mean: number;
  ev_lower_bound: number;
  status: "eligible" | "excluded";
  exclusion_reason: string | null;
}

export async function computeWalletFeatures(wallet: string): Promise<WalletFeatures>;
export async function computeAllWalletScores(): Promise<WalletFeatures[]>;
export async function saveWalletScores(scores: WalletFeatures[]): Promise<void>;
```

---

## Exclusion Rules

A wallet is **excluded** if:

1. **Deployer-like**: Created tokens (likely insider)
2. **Sniper-like**: >50% of buys within 5 seconds of launch (likely bot)
3. **Insufficient data**: `signals_n < 5`
4. **Negative edge**: `ev_lower_bound < 0`

```typescript
function determineStatus(features: Partial<WalletFeatures>): { status: string; reason: string | null } {
  if (features.is_deployer_like) {
    return { status: "excluded", reason: "deployer_like" };
  }
  if (features.is_sniper_like) {
    return { status: "excluded", reason: "sniper_like" };
  }
  if ((features.signals_n ?? 0) < 5) {
    return { status: "excluded", reason: "insufficient_signals" };
  }
  if ((features.ev_lower_bound ?? 0) < 0) {
    return { status: "excluded", reason: "negative_edge" };
  }
  return { status: "eligible", reason: null };
}
```

---

## EV Calculation

**Simplified EV** (for replay/paper trading):

```typescript
function calculateEV(trades: Trade[]): { mean: number; lower_bound: number } {
  if (trades.length === 0) {
    return { mean: 0, lower_bound: 0 };
  }

  const returns = trades.map(t => t.pnl_pct);
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;

  if (trades.length < 2) {
    return { mean, lower_bound: mean * 0.5 };  // Conservative for single trade
  }

  // Standard error
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
  const stderr = Math.sqrt(variance / returns.length);

  // 95% confidence lower bound
  const lower_bound = mean - 1.96 * stderr;

  return { mean, lower_bound };
}
```

---

## Database Schema

```sql
CREATE TABLE wallet_scores (
  id SERIAL PRIMARY KEY,
  wallet TEXT NOT NULL,
  window_start TIMESTAMPTZ,
  window_end TIMESTAMPTZ,
  signals_n INT,
  ev_mean NUMERIC,
  ev_lower_bound NUMERIC,
  sniper_score NUMERIC,
  deployer_score NUMERIC,
  status TEXT,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(wallet, window_start, window_end)
);
```

---

## CLI Command

### `bun run analyze:wallets`

```typescript
async function main() {
  // Get all unique wallets from wallet_actions
  const wallets = await db.query(
    "SELECT DISTINCT wallet FROM wallet_actions"
  );

  const scores: WalletFeatures[] = [];

  for (const { wallet } of wallets.rows) {
    const features = await computeWalletFeatures(wallet);
    scores.push(features);
  }

  await saveWalletScores(scores);

  // Write report
  const report = {
    total_wallets: scores.length,
    eligible_wallets: scores.filter(s => s.status === "eligible").length,
    excluded_wallets: scores.filter(s => s.status === "excluded").length,
    exclusion_reasons: countBy(scores.filter(s => s.exclusion_reason), "exclusion_reason"),
    top_wallets: scores
      .filter(s => s.status === "eligible")
      .sort((a, b) => b.ev_lower_bound - a.ev_lower_bound)
      .slice(0, 10)
  };

  writeFileSync("reports/wallet_report.json", JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
```

---

## Output Artifact

**File**: `reports/wallet_report.json`

```json
{
  "computed_at": "2024-01-27T12:00:00Z",
  "total_wallets": 50,
  "eligible_wallets": 15,
  "excluded_wallets": 35,
  "exclusion_reasons": {
    "deployer_like": 5,
    "sniper_like": 10,
    "insufficient_signals": 15,
    "negative_edge": 5
  },
  "top_wallets": [
    {
      "wallet": "abc...",
      "signals_n": 25,
      "ev_mean": 0.15,
      "ev_lower_bound": 0.08,
      "status": "eligible"
    }
  ]
}
```

---

## Tests

```typescript
describe("wallet analytics", () => {
  test("excludes deployer-like wallets", () => {
    const features = { is_deployer_like: true, signals_n: 100, ev_lower_bound: 0.5 };
    const result = determineStatus(features);
    expect(result.status).toBe("excluded");
    expect(result.reason).toBe("deployer_like");
  });

  test("excludes wallets with insufficient signals", () => {
    const features = { is_deployer_like: false, signals_n: 2, ev_lower_bound: 0.5 };
    const result = determineStatus(features);
    expect(result.status).toBe("excluded");
  });

  test("calculates EV lower bound correctly", () => {
    const trades = [
      { pnl_pct: 0.10 },
      { pnl_pct: 0.20 },
      { pnl_pct: -0.05 },
      { pnl_pct: 0.15 }
    ];
    const ev = calculateEV(trades);
    expect(ev.mean).toBeCloseTo(0.10, 2);
    expect(ev.lower_bound).toBeLessThan(ev.mean);
  });
});
```

---

## Replay Mode Simplifications

For E2E replay validation, wallet analytics can be simplified:

1. Use synthetic wallet action data from `events.jsonl`
2. Assume PnL is provided in the replay data (no need to calculate from prices)
3. Focus on demonstrating the scoring logic works correctly

The goal is to show the pipeline works, not to produce production-quality wallet scores.
