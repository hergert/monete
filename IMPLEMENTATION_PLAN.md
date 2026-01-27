# IMPLEMENTATION_PLAN — Monenete E2E (Ralph)

**Read specs in order**: `specs/README.md` → `specs/PROJECT_CONTRACT.md` → numbered specs

---

## P0 — Repo plumbing (make the loop runnable)

**Spec**: None (infrastructure)

- [ ] Ensure `docker-compose.yml` works (`docker compose up -d db`)
- [ ] Add postgres client dependency (`bun add postgres`)
- [ ] Implement `src/db/index.ts` with connection + query helpers
- [ ] Implement `src/db/migrate.ts` to run migrations
- [ ] Ensure bun scripts work: `lint`, `typecheck`, `test`
- [ ] Ensure `./scripts/verify.sh` runs (may fail, but runs)

**Gate**: `docker compose up -d db` succeeds, `bun run db:migrate` runs

---

## P1 — Data model & DB integrity

**Spec**: `specs/03_normalizer_dedupe.md`

- [ ] Create DB schema with all 7 tables (see spec)
- [ ] Add `UNIQUE(signature, instruction_index)` constraint on `raw_events`
- [ ] Implement `checkDedupeIntegrity()` function
- [ ] Add tests for dedupe logic

**Gate**: `bun test` passes, dedupe constraint enforced

---

## P2 — Signature decoder + signature gate

**Spec**: `specs/01_signature_decoder.md`

- [ ] Implement `extractPrograms(tx)` in `src/signature.ts`
- [ ] Implement `hasDbcInit(tx)` in `src/signature.ts`
- [ ] Implement `isBagsLaunchTx(tx)` in `src/signature.ts`
- [ ] Collect ≥10 Bags fixtures → `data/fixtures/bags/`
- [ ] Collect ≥20 non-Bags DBC fixtures → `data/fixtures/non_bags_dbc/`
- [ ] Implement `bun run validate:signature` → writes `reports/signature_validation.json`
- [ ] Create `bags_signature_v1.json` with rules + test vectors

**Gate**: `bun run validate:signature` exits 0, false_positive_rate ≤ 5%

---

## P3 — Replay ingestion (deterministic E2E backbone)

**Spec**: `specs/02_ingestion.md`, `specs/00_data_collection.md`

- [ ] Define replay event schema (see spec)
- [ ] Implement `src/ingestion/replay.ts`
- [ ] Implement `bun run ingest:replay` command
- [ ] Create `data/replay/events.jsonl` with ≥50 events
- [ ] Integrate with normalizer → writes to `raw_events`, `launches`, `wallet_actions`

**Gate**: `bun run ingest:replay` processes events, DB populated

---

## P4 — Wallet analytics (score wallets)

**Spec**: `specs/04_wallet_analytics.md`

- [ ] Implement wallet feature extraction
- [ ] Implement exclusion rules (deployer, sniper, insufficient, negative edge)
- [ ] Implement EV calculation with confidence bounds
- [ ] Implement `bun run analyze:wallets` → writes `reports/wallet_report.json`
- [ ] Save results to `wallet_scores` table

**Gate**: `reports/wallet_report.json` exists, ≥1 eligible wallet

---

## P5 — Quote service + strategy engine (paper)

**Spec**: `specs/05_quote_service.md`, `specs/06_strategy_engine.md`

- [ ] Implement `StubQuoteService` for replay mode
- [ ] Implement `evaluateStrategy()` with convergence scoring
- [ ] Implement fee-aware position sizing
- [ ] Implement toxicity filter (stub for replay)
- [ ] Log all decisions to `trade_journal` table

**Gate**: Trade journal has entries, decisions are logged

---

## P6 — Paper trading simulation

**Spec**: `specs/07_paper_trading.md`

- [ ] Implement `PaperTrader` class
- [ ] Implement exit rules (TP, SL, timeout)
- [ ] Implement position tracking + PnL calculation
- [ ] Write results to `positions` table
- [ ] Emit `reports/paper_trading_report.json`

**Gate**: Positions created, PnL calculated

---

## P7 — E2E runner + final report

**Spec**: `specs/08_e2e_runner.md`, `specs/PROJECT_CONTRACT.md`

- [ ] Implement full `src/e2e-replay.ts` orchestrator
- [ ] Run all components in sequence
- [ ] Collect all metrics into `reports/final_validation.json`
- [ ] Ensure `./scripts/verify.sh` passes
- [ ] Ensure `./scripts/check_completion.sh` passes

**Gate**: `reports/final_validation.json` has `status: "PASS"`

---

## Completion

When ALL of the following are true:
1. `./scripts/verify.sh` exits 0
2. `reports/final_validation.json` exists with `status: "PASS"`
3. `bags_signature_v1.json` exists
4. All required fixtures committed

Then append to `progress.txt`:
```
<promise>COMPLETE</promise>
```

---

## Optional (NOT part of completion gate)

- [ ] Add live ingestion (`src/ingestion/live.ts`) requiring env keys
- [ ] Add live smoke test commands
- [ ] Add real Jupiter quote service
- [ ] Add real toxicity filter (Helius API)
