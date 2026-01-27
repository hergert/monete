# Monenete Specifications

## Quick Reference

| Spec | Component | Purpose |
|------|-----------|---------|
| [PROJECT_CONTRACT.md](./PROJECT_CONTRACT.md) | — | **Definition of Done** (source of truth) |
| [00_data_collection.md](./00_data_collection.md) | — | Fixtures + replay dataset requirements |
| [01_signature_decoder.md](./01_signature_decoder.md) | C | Bags launch classifier |
| [02_ingestion.md](./02_ingestion.md) | A | Event ingestion (replay + live) |
| [03_normalizer_dedupe.md](./03_normalizer_dedupe.md) | B | Dedupe + canonical format |
| [04_wallet_analytics.md](./04_wallet_analytics.md) | E | Wallet scoring |
| [05_quote_service.md](./05_quote_service.md) | D | Swap quotes |
| [06_strategy_engine.md](./06_strategy_engine.md) | F | Trade decisions |
| [07_paper_trading.md](./07_paper_trading.md) | G | Position simulation |
| [08_e2e_runner.md](./08_e2e_runner.md) | — | E2E orchestrator |

## Reading Order

1. **Start with**: `PROJECT_CONTRACT.md` — understand what "done" means
2. **Then**: `00_data_collection.md` — understand what data you need
3. **Then**: Read component specs in order (01 → 08)

## Component Map

```
┌─────────────────────────────────────────────────────────────┐
│                      DATA COLLECTION                        │
│   specs/00_data_collection.md                               │
│   ─────────────────────────────────────────                 │
│   data/fixtures/bags/*.json       (≥10 files)               │
│   data/fixtures/non_bags_dbc/*.json (≥20 files)             │
│   data/replay/events.jsonl                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  A. INGESTION              specs/02_ingestion.md            │
│     src/ingestion/replay.ts                                 │
│     src/ingestion/live.ts (optional)                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  B. NORMALIZER + DEDUPE    specs/03_normalizer_dedupe.md    │
│     src/normalizer.ts                                       │
│     Dedupe key: (signature, instruction_index)              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  C. SIGNATURE DECODER      specs/01_signature_decoder.md    │
│     src/signature.ts                                        │
│     bags_signature_v1.json                                  │
└─────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│  D. QUOTE SERVICE        │  │  E. WALLET ANALYTICS     │
│  specs/05_quote_service  │  │  specs/04_wallet_analytics│
│  src/quote/              │  │  src/wallet/             │
└──────────────────────────┘  └──────────────────────────┘
              │                           │
              └─────────────┬─────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  F. STRATEGY ENGINE        specs/06_strategy_engine.md      │
│     src/strategy/                                           │
│     Convergence scoring + trade decisions                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  G. PAPER TRADING          specs/07_paper_trading.md        │
│     src/paper/                                              │
│     Position simulation + PnL                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  E2E RUNNER                specs/08_e2e_runner.md           │
│     src/e2e-replay.ts                                       │
│     reports/final_validation.json                           │
└─────────────────────────────────────────────────────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `bags_signature_v1.json` | Signature rules + test vectors |
| `reports/signature_validation.json` | Signature gate results |
| `reports/wallet_report.json` | Wallet scoring results |
| `reports/paper_trading_report.json` | Paper trading results |
| `reports/final_validation.json` | **E2E result (PASS/FAIL)** |

## Database Tables

| Table | Purpose |
|-------|---------|
| `raw_events` | All ingested events |
| `launches` | Detected token launches |
| `wallet_actions` | Wallet buys/sells |
| `quotes` | Stored swap quotes |
| `positions` | Paper/real positions |
| `wallet_scores` | Computed wallet metrics |
| `trade_journal` | Every decision logged |
