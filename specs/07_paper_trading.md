# Spec: Paper Trading Simulator (Component G)

## Purpose
Simulate trades without real execution to validate strategy performance.

## Location
`src/paper/`

---

## Interface

```typescript
export interface PaperPosition {
  position_id: string;
  mint: string;
  entry_ts: Date;
  entry_price: number;
  size_usd: number;
  status: "open" | "closed";
  exit_ts?: Date;
  exit_price?: number;
  pnl_usd?: number;
  pnl_pct?: number;
  exit_reason?: "tp" | "sl" | "trailing" | "timeout";
}

export interface PaperTrader {
  openPosition(params: OpenPositionParams): Promise<PaperPosition>;
  checkExits(currentPrices: Map<string, number>): Promise<PaperPosition[]>;
  getOpenPositions(): Promise<PaperPosition[]>;
  getClosedPositions(): Promise<PaperPosition[]>;
  getSummary(): Promise<PaperTradingSummary>;
}

export interface PaperTradingSummary {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_pnl_usd: number;
  average_pnl_pct: number;
  sharpe_ratio: number;
}
```

---

## Exit Rules

From docs/PLAN.md:

| Exit Type | Trigger | Action |
|-----------|---------|--------|
| Take Profit (TP) | +100% | Sell 50% |
| Stop Loss (SL) | -50% | Sell 100% |
| Trailing Stop | -20% from peak | Sell remaining |
| Timeout | 24h elapsed | Sell 100% |

---

## Implementation

```typescript
export class PaperTrader {
  private positions: Map<string, PaperPosition> = new Map();

  async openPosition(params: OpenPositionParams): Promise<PaperPosition> {
    const position: PaperPosition = {
      position_id: crypto.randomUUID(),
      mint: params.mint,
      entry_ts: params.entry_ts,
      entry_price: params.entry_price,
      size_usd: params.size_usd,
      status: "open"
    };

    this.positions.set(position.position_id, position);
    await this.savePosition(position);

    return position;
  }

  async checkExits(currentPrices: Map<string, number>, currentTime: Date): Promise<PaperPosition[]> {
    const closedPositions: PaperPosition[] = [];

    for (const position of this.positions.values()) {
      if (position.status !== "open") continue;

      const currentPrice = currentPrices.get(position.mint);
      if (!currentPrice) continue;

      const pnl_pct = (currentPrice - position.entry_price) / position.entry_price;

      let exitReason: PaperPosition["exit_reason"] | null = null;

      // Check exit conditions
      if (pnl_pct >= 1.0) {
        exitReason = "tp";  // +100%
      } else if (pnl_pct <= -0.5) {
        exitReason = "sl";  // -50%
      } else if (currentTime.getTime() - position.entry_ts.getTime() > 24 * 60 * 60 * 1000) {
        exitReason = "timeout";  // 24h
      }

      if (exitReason) {
        position.status = "closed";
        position.exit_ts = currentTime;
        position.exit_price = currentPrice;
        position.pnl_pct = pnl_pct;
        position.pnl_usd = position.size_usd * pnl_pct;
        position.exit_reason = exitReason;

        await this.savePosition(position);
        closedPositions.push(position);
      }
    }

    return closedPositions;
  }

  async getSummary(): Promise<PaperTradingSummary> {
    const closed = await this.getClosedPositions();

    if (closed.length === 0) {
      return {
        total_trades: 0,
        winning_trades: 0,
        losing_trades: 0,
        win_rate: 0,
        total_pnl_usd: 0,
        average_pnl_pct: 0,
        sharpe_ratio: 0
      };
    }

    const winning = closed.filter(p => (p.pnl_usd ?? 0) > 0);
    const losing = closed.filter(p => (p.pnl_usd ?? 0) <= 0);
    const totalPnl = closed.reduce((sum, p) => sum + (p.pnl_usd ?? 0), 0);
    const avgPnlPct = closed.reduce((sum, p) => sum + (p.pnl_pct ?? 0), 0) / closed.length;

    // Simplified Sharpe (assuming daily returns)
    const returns = closed.map(p => p.pnl_pct ?? 0);
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const stddev = Math.sqrt(variance);
    const sharpe = stddev > 0 ? mean / stddev : 0;

    return {
      total_trades: closed.length,
      winning_trades: winning.length,
      losing_trades: losing.length,
      win_rate: winning.length / closed.length,
      total_pnl_usd: totalPnl,
      average_pnl_pct: avgPnlPct,
      sharpe_ratio: sharpe
    };
  }

  private async savePosition(position: PaperPosition): Promise<void> {
    await db.query(
      `INSERT INTO positions (position_id, mint, entry_ts, entry_price, size_usd, exit_ts, exit_price, pnl_usd, pnl_pct, exit_reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (position_id) DO UPDATE SET
         exit_ts = EXCLUDED.exit_ts,
         exit_price = EXCLUDED.exit_price,
         pnl_usd = EXCLUDED.pnl_usd,
         pnl_pct = EXCLUDED.pnl_pct,
         exit_reason = EXCLUDED.exit_reason`,
      [position.position_id, position.mint, position.entry_ts, position.entry_price, position.size_usd,
       position.exit_ts, position.exit_price, position.pnl_usd, position.pnl_pct, position.exit_reason]
    );
  }
}
```

---

## Replay Integration

In replay mode, price updates come from the replay dataset:

```typescript
// src/paper/replay-runner.ts
export async function runPaperSimulation(eventsFile: string): Promise<PaperTradingSummary> {
  const trader = new PaperTrader();
  const prices = new Map<string, number>();

  await runReplay({
    eventsFile,
    onEvent: async (event) => {
      if (event.type === "quote") {
        // Update price from quote
        const price = event.data.expected_out / (event.data.in_amount_usd * 1e6);  // Simplified
        prices.set(event.data.mint, price);

        // Check exits
        await trader.checkExits(prices, new Date(event.timestamp));
      }

      if (event.type === "trade_decision" && event.data.action === "TRADE") {
        // Open position
        await trader.openPosition({
          mint: event.data.mint,
          entry_ts: new Date(event.timestamp),
          entry_price: prices.get(event.data.mint) ?? 0,
          size_usd: event.data.position_size_usd
        });
      }
    }
  });

  return trader.getSummary();
}
```

---

## Output Artifact

**File**: `reports/paper_trading_report.json`

```json
{
  "computed_at": "2024-01-27T12:00:00Z",
  "summary": {
    "total_trades": 50,
    "winning_trades": 30,
    "losing_trades": 20,
    "win_rate": 0.6,
    "total_pnl_usd": 125.50,
    "average_pnl_pct": 0.08,
    "sharpe_ratio": 1.2
  },
  "positions": [
    {
      "position_id": "...",
      "mint": "...",
      "entry_ts": "...",
      "exit_ts": "...",
      "pnl_pct": 0.15,
      "exit_reason": "tp"
    }
  ]
}
```

---

## Tests

```typescript
describe("paper trading", () => {
  test("opens position correctly", async () => {
    const trader = new PaperTrader();
    const position = await trader.openPosition({
      mint: "test_mint",
      entry_ts: new Date(),
      entry_price: 1.0,
      size_usd: 10
    });

    expect(position.status).toBe("open");
    expect(position.size_usd).toBe(10);
  });

  test("triggers stop loss at -50%", async () => {
    const trader = new PaperTrader();
    await trader.openPosition({
      mint: "test_mint",
      entry_ts: new Date(),
      entry_price: 1.0,
      size_usd: 10
    });

    const prices = new Map([["test_mint", 0.4]]);  // -60%
    const closed = await trader.checkExits(prices, new Date());

    expect(closed.length).toBe(1);
    expect(closed[0].exit_reason).toBe("sl");
  });

  test("triggers take profit at +100%", async () => {
    const trader = new PaperTrader();
    await trader.openPosition({
      mint: "test_mint",
      entry_ts: new Date(),
      entry_price: 1.0,
      size_usd: 10
    });

    const prices = new Map([["test_mint", 2.1]]);  // +110%
    const closed = await trader.checkExits(prices, new Date());

    expect(closed.length).toBe(1);
    expect(closed[0].exit_reason).toBe("tp");
  });
});
```
