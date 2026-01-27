# Spec: Quote Service (Component D)

## Purpose
Get swap quotes for tokens to estimate execution prices and slippage.

## Location
`src/quote/`

---

## Interface

```typescript
export interface QuoteRequest {
  mint: string;
  in_amount_usd: number;
  slippage_bps?: number;  // default: 100 (1%)
}

export interface QuoteResult {
  mint: string;
  in_amount_usd: number;
  expected_out: number;
  price_impact_bps: number;
  min_out: number;
  route_hash: string;  // Hash of route for logging
  timestamp: Date;
  source: "jupiter" | "stub";
}

export interface QuoteService {
  getQuote(request: QuoteRequest): Promise<QuoteResult | null>;
}
```

---

## Modes

### Stub Mode (Required for E2E)

Returns deterministic quotes based on replay data.

```typescript
export class StubQuoteService implements QuoteService {
  private quotes: Map<string, QuoteResult[]>;

  constructor(quotesFile: string) {
    // Load quotes from replay data
    this.quotes = loadQuotesFromFile(quotesFile);
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResult | null> {
    const mintQuotes = this.quotes.get(request.mint);
    if (!mintQuotes || mintQuotes.length === 0) {
      return null;  // Token not routable
    }

    // Return the first matching quote (simplified)
    const quote = mintQuotes[0];
    return {
      ...quote,
      in_amount_usd: request.in_amount_usd,
      timestamp: new Date()
    };
  }
}
```

### Live Mode (Optional)

Uses Jupiter API for real quotes.

```typescript
export class JupiterQuoteService implements QuoteService {
  async getQuote(request: QuoteRequest): Promise<QuoteResult | null> {
    // Convert USD to SOL amount (simplified)
    const inAmountLamports = usdToLamports(request.in_amount_usd);

    const response = await fetch(
      `https://quote-api.jup.ag/v6/quote?` +
      `inputMint=So11111111111111111111111111111111111111112&` +
      `outputMint=${request.mint}&` +
      `amount=${inAmountLamports}&` +
      `slippageBps=${request.slippage_bps ?? 100}`
    );

    if (!response.ok) return null;

    const data = await response.json();
    // Transform Jupiter response to QuoteResult
    return transformJupiterQuote(data);
  }
}
```

---

## Quote Storage

All quotes should be stored for backtesting:

```sql
CREATE TABLE quotes (
  id SERIAL PRIMARY KEY,
  mint TEXT NOT NULL,
  ts TIMESTAMPTZ DEFAULT NOW(),
  in_amount_usd NUMERIC,
  price_impact_bps INT,
  expected_out NUMERIC,
  route_json JSONB
);
```

```typescript
async function storeQuote(quote: QuoteResult): Promise<void> {
  await db.query(
    `INSERT INTO quotes (mint, ts, in_amount_usd, price_impact_bps, expected_out, route_json)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [quote.mint, quote.timestamp, quote.in_amount_usd, quote.price_impact_bps, quote.expected_out, JSON.stringify({ hash: quote.route_hash })]
  );
}
```

---

## Skip Signal

A quote returning `null` means the token is not routable. The strategy should **skip** the signal.

```typescript
const quote = await quoteService.getQuote({ mint, in_amount_usd: 10 });
if (!quote) {
  logDecision({ action: "SKIP", reason: "not_routable", mint });
  return;
}
```

---

## Replay Quote Format

In `data/replay/events.jsonl`, quote events look like:

```json
{
  "type": "quote",
  "timestamp": "2024-01-27T10:00:00Z",
  "signature": "",
  "slot": 0,
  "instruction_index": 0,
  "data": {
    "mint": "abc...",
    "in_amount_usd": 10.0,
    "expected_out": 1000000,
    "price_impact_bps": 50,
    "route_hash": "stub"
  }
}
```

The stub quote service loads these and returns them when requested.

---

## Tests

```typescript
describe("quote service", () => {
  test("stub returns quote for known mint", async () => {
    const service = new StubQuoteService("data/replay/events.jsonl");
    const quote = await service.getQuote({ mint: "known_mint", in_amount_usd: 10 });
    expect(quote).not.toBeNull();
  });

  test("stub returns null for unknown mint", async () => {
    const service = new StubQuoteService("data/replay/events.jsonl");
    const quote = await service.getQuote({ mint: "unknown_mint", in_amount_usd: 10 });
    expect(quote).toBeNull();
  });
});
```
