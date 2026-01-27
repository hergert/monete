# TODO — Monenete

> Architecture and vision: see `docs/PLAN.md`

---

## Phase 0: Foundation

### 0.1 Repo Plumbing
- [ ] Docker Postgres works (`docker compose up -d db`)
- [ ] DB connection and migrations run
- [ ] Lint, typecheck, test scripts work
- [ ] `./scripts/verify.sh` runs (may fail initially)

### 0.2 Data Collection
**Goal**: Collect offline test fixtures for deterministic validation.

**Bags fixtures** (`data/fixtures/bags/`):
- [ ] ≥10 raw transaction JSON files
- [ ] Each is a confirmed Bags.fm launch (has Fee Share V1 + DBC)

**Non-Bags fixtures** (`data/fixtures/non_bags_dbc/`):
- [ ] ≥20 raw transaction JSON files
- [ ] Each uses Meteora DBC but is NOT from Bags.fm

**Why**: The loop must validate without network calls. Fixtures are ground truth.

---

## Phase 1: Signature Detection

### 1.1 Bags Launch Classifier
**Goal**: Reliably detect Bags.fm launches vs other Meteora DBC uses.

**Key insight** (from research):
- Fee Share V1 (`FEEhPbKVKnco9EXnaY3i4R5rQVUx91wgVfu8qokixywi`) is the Bags differentiator
- DBC alone causes false positives (shared Meteora infra)

**Requirements**:
- [ ] Classifier exists that takes a transaction → returns match/no-match
- [ ] Passes on all Bags fixtures
- [ ] False positive rate ≤5% on non-Bags fixtures
- [ ] Output: `bags_signature_v1.json` with rules + test vectors

---

## Phase 2: Data Pipeline

### 2.1 Ingestion
**Goal**: Read events from replay file (offline) or chain (live, optional).

**Requirements**:
- [ ] Replay mode reads `data/replay/events.jsonl`
- [ ] Events written to database
- [ ] Live mode is optional (requires API keys)

### 2.2 Normalization + Dedupe
**Goal**: Ensure each event is recorded exactly once.

**Requirements**:
- [ ] Dedupe key: `(signature, instruction_index)`
- [ ] Duplicate inserts are rejected/ignored
- [ ] All 7 tables exist (raw_events, launches, wallet_actions, quotes, positions, wallet_scores, trade_journal)

---

## Phase 3: Analytics

### 3.1 Wallet Scoring
**Goal**: Identify wallets with replicable edge (not bots, not insiders).

**Exclusion rules**:
- Deployer-like (created tokens)
- Sniper-like (>50% buys within 5s of launch)
- Insufficient data (<5 signals)
- Negative edge (EV lower bound < 0)

**Requirements**:
- [ ] Each wallet gets a score with confidence bounds
- [ ] Output: `reports/wallet_report.json`
- [ ] At least 1 eligible wallet in replay dataset

### 3.2 Quote Service
**Goal**: Get swap quotes for position sizing.

**Requirements**:
- [ ] Stub implementation for replay (returns synthetic quotes)
- [ ] Real implementation optional (Jupiter API)

---

## Phase 4: Strategy + Paper Trading

### 4.1 Strategy Engine
**Goal**: Decide whether to enter a position based on wallet convergence.

**Requirements**:
- [ ] Convergence scoring (sum of wallet weights)
- [ ] Entry threshold
- [ ] Fee-aware position sizing (skip if fees eat edge)
- [ ] All decisions logged to trade_journal

### 4.2 Paper Trading
**Goal**: Simulate positions with realistic exit rules.

**Exit rules**:
- Take profit (TP)
- Stop loss (SL)
- Timeout

**Requirements**:
- [ ] Positions tracked with entry/exit
- [ ] PnL calculated
- [ ] Output: `reports/paper_trading_report.json`

---

## Phase 5: E2E Validation

### 5.1 E2E Runner
**Goal**: Single command runs everything and produces final report.

**Command**: `bun run e2e:replay`

**Must**:
- [ ] Ensure Postgres is running
- [ ] Run migrations
- [ ] Process replay events
- [ ] Run all analytics
- [ ] Run paper trading
- [ ] Write `reports/final_validation.json`

### 5.2 Completion Gate
**All must be true**:
- [ ] `./scripts/verify.sh` exits 0
- [ ] `reports/final_validation.json` has `status: "PASS"`
- [ ] `bags_signature_v1.json` exists
- [ ] Required fixtures committed

---

## Done

When completion gate passes, append to `progress.txt`:
```
<promise>COMPLETE</promise>
```

---

## Optional (not required for completion)

- [ ] Live ingestion with Helius WebSocket
- [ ] Real Jupiter quote service
- [ ] Real toxicity filter (Helius API)
- [ ] Metrics to Axiom
