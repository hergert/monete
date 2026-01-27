# Spec: Strategy Engine (Component F)

## Purpose
Decide whether to trade based on wallet convergence and other signals.

## Location
`src/strategy/`

---

## Core Concept: Convergence

**Convergence** = multiple high-quality wallets buying the same token within a time window.

```
convergence_score = sum(wallet_weight for each wallet buying within window)
wallet_weight = clamp(ev_lower_bound, 0, cap)
```

---

## Interface

```typescript
export interface StrategyInput {
  mint: string;
  launch_slot: number;
  launch_time: Date;
  wallet_signals: WalletSignal[];
  quote: QuoteResult | null;
  toxicity: ToxicityResult;
}

export interface WalletSignal {
  wallet: string;
  action: "buy";
  action_time: Date;
  ev_lower_bound: number;
  status: "eligible" | "excluded";
}

export interface StrategyDecision {
  action: "TRADE" | "SKIP";
  score: number;
  threshold: number;
  position_size_usd: number;
  reason_codes: string[];
}

export function evaluateStrategy(input: StrategyInput): StrategyDecision;
```

---

## Decision Rules

**TRADE** requires ALL of:
1. `convergence_score >= threshold` (e.g., 0.5)
2. `toxicity.pass === true`
3. `quote !== null` (token is routable)
4. `quote.price_impact_bps <= 200` (2% max impact)
5. `position_size >= $10` (minimum viable trade)

**SKIP** if any condition fails.

---

## Implementation

```typescript
const SCORE_THRESHOLD = 0.5;
const MAX_PRICE_IMPACT_BPS = 200;
const MIN_POSITION_USD = 10;
const WALLET_WEIGHT_CAP = 0.3;

export function evaluateStrategy(input: StrategyInput): StrategyDecision {
  const reasons: string[] = [];

  // Calculate convergence score
  const eligibleSignals = input.wallet_signals.filter(s => s.status === "eligible");
  const score = eligibleSignals.reduce((sum, s) => {
    const weight = Math.min(Math.max(s.ev_lower_bound, 0), WALLET_WEIGHT_CAP);
    return sum + weight;
  }, 0);

  // Check conditions
  const conditions = {
    score_met: score >= SCORE_THRESHOLD,
    toxicity_pass: input.toxicity.pass,
    has_quote: input.quote !== null,
    impact_ok: input.quote ? input.quote.price_impact_bps <= MAX_PRICE_IMPACT_BPS : false,
  };

  if (!conditions.score_met) reasons.push("score_below_threshold");
  if (!conditions.toxicity_pass) reasons.push("toxicity_fail");
  if (!conditions.has_quote) reasons.push("not_routable");
  if (!conditions.impact_ok) reasons.push("high_price_impact");

  // Calculate position size (fee-aware)
  const positionSize = conditions.has_quote
    ? calculatePositionSize(input.quote!)
    : 0;

  if (positionSize < MIN_POSITION_USD) {
    reasons.push("position_too_small");
  }

  const shouldTrade =
    conditions.score_met &&
    conditions.toxicity_pass &&
    conditions.has_quote &&
    conditions.impact_ok &&
    positionSize >= MIN_POSITION_USD;

  return {
    action: shouldTrade ? "TRADE" : "SKIP",
    score,
    threshold: SCORE_THRESHOLD,
    position_size_usd: positionSize,
    reason_codes: reasons
  };
}
```

---

## Position Sizing (Fee-Aware)

From docs/PLAN.md:

```typescript
const CAPITAL_USD = 500;
const MAX_POSITION_PCT = 0.02;  // 2% of capital
const MAX_FEE_PCT = 0.01;       // Fees must be < 1% of position

function calculatePositionSize(quote: QuoteResult): number {
  // Estimate fees (simplified)
  const estimatedFeesUsd = 0.05;  // ~$0.05 for tx fees + tip

  // Max by capital
  const maxByCapital = CAPITAL_USD * MAX_POSITION_PCT;

  // Min by fees (fees must be < 1% of position)
  const minByFees = estimatedFeesUsd / MAX_FEE_PCT;

  // Position must fit both constraints
  const position = Math.min(quote.in_amount_usd, maxByCapital);

  // If position < minByFees, fees would eat the edge
  if (position < Math.max(minByFees, MIN_POSITION_USD)) {
    return 0;  // Signal to skip
  }

  return position;
}
```

---

## Trade Journal

Every decision (TRADE or SKIP) must be logged:

```typescript
interface TradeJournalEntry {
  created_at: Date;
  launch: {
    mint: string;
    slot: number;
    detected_at: Date;
  };
  wallets: WalletSignal[];
  toxicity: ToxicityResult;
  quote: QuoteResult | null;
  economics: {
    total_cost_usd_est: number;
    cost_pct: number;
  };
  decision: StrategyDecision;
}

async function logDecision(entry: TradeJournalEntry): Promise<void> {
  await db.query(
    `INSERT INTO trade_journal (launch_json, wallets_json, toxicity_json, quote_json, economics_json, decision_json)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      JSON.stringify(entry.launch),
      JSON.stringify(entry.wallets),
      JSON.stringify(entry.toxicity),
      JSON.stringify(entry.quote),
      JSON.stringify(entry.economics),
      JSON.stringify(entry.decision)
    ]
  );
}
```

---

## Toxicity Filter (Simplified for Replay)

```typescript
export interface ToxicityResult {
  pass: boolean;
  checks: {
    mint_authority_revoked: boolean;
    freeze_authority_revoked: boolean;
    concentration_ok: boolean;
  };
}

// For replay, use stub that always passes
export function checkToxicity(mint: string): ToxicityResult {
  return {
    pass: true,
    checks: {
      mint_authority_revoked: true,
      freeze_authority_revoked: true,
      concentration_ok: true
    }
  };
}
```

---

## Tests

```typescript
describe("strategy engine", () => {
  test("TRADE when all conditions met", () => {
    const input = createStrategyInput({
      wallet_signals: [
        { wallet: "a", ev_lower_bound: 0.3, status: "eligible" },
        { wallet: "b", ev_lower_bound: 0.25, status: "eligible" }
      ],
      quote: { price_impact_bps: 50 },
      toxicity: { pass: true }
    });

    const decision = evaluateStrategy(input);
    expect(decision.action).toBe("TRADE");
  });

  test("SKIP when score below threshold", () => {
    const input = createStrategyInput({
      wallet_signals: [
        { wallet: "a", ev_lower_bound: 0.1, status: "eligible" }
      ],
      quote: { price_impact_bps: 50 },
      toxicity: { pass: true }
    });

    const decision = evaluateStrategy(input);
    expect(decision.action).toBe("SKIP");
    expect(decision.reason_codes).toContain("score_below_threshold");
  });

  test("SKIP when toxicity fails", () => {
    const input = createStrategyInput({
      wallet_signals: [
        { wallet: "a", ev_lower_bound: 0.5, status: "eligible" }
      ],
      quote: { price_impact_bps: 50 },
      toxicity: { pass: false }
    });

    const decision = evaluateStrategy(input);
    expect(decision.action).toBe("SKIP");
    expect(decision.reason_codes).toContain("toxicity_fail");
  });
});
```
