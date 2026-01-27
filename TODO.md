# TODO — Monenete

## How to Use This File
- Pick the FIRST unchecked item
- Do ONLY that item
- Verify it works
- Check it off
- Journal in progress.txt
- Repeat

## Legend
- [ ] Task to do
- [x] Done
- [GATE] Stop and evaluate before continuing
- [OPTIONAL] Not required for completion
- [NEEDS: X] Requires X to be done first

---

## Phase 0: Foundation (make the loop runnable)

### 0.1 Docker + Database
- [x] Verify docker is installed: `docker --version`
- [x] Create docker-compose.yml with postgres service
- [x] Run `docker compose up -d db` successfully
- [x] Verify DB is ready: `docker compose exec db pg_isready`

### 0.2 Project Setup
- [x] Verify bun is installed: `bun --version`
- [x] Initialize package.json if missing: `bun init -y`
- [ ] Add postgres dependency: `bun add postgres`
- [x] Create src/ directory structure

### 0.3 Database Connection
- [ ] Create src/db/index.ts with connection helper
- [ ] Verify connection works: `bun run src/db/index.ts` prints "connected"

### 0.4 Migrations
- [x] Create src/db/migrate.ts (exists but needs postgres client)
- [ ] Add postgres dependency and implement DB connection in migrate.ts
- [ ] Run migrations: `bun run src/db/migrate.ts`
- [ ] Verify tables exist: `\dt` shows 7 tables

### 0.5 Scripts
- [x] Create scripts/verify.sh (can fail, but runs)
- [x] Make executable: `chmod +x scripts/*.sh`
- [x] Run: `./scripts/verify.sh` executes without "not found" errors

[GATE] Phase 0 complete when:
- `docker compose up -d db` succeeds
- `bun run src/db/migrate.ts` runs without error
- `./scripts/verify.sh` runs (may fail checks, but executes)

---

## Phase 1: Data Collection (gather test fixtures)

### 1.1 Directory Structure
- [x] Create data/fixtures/bags/ directory
- [x] Create data/fixtures/non_bags_dbc/ directory
- [x] Create data/replay/ directory

### 1.2 Bags Fixtures (10 required)
[NEEDS: Helius API key OR manually collected files]

Method A (with API):
- [ ] Create scripts/collect-bags.ts
- [ ] Fetch 10+ transactions from Fee Share V1 program
- [ ] Save to data/fixtures/bags/bags_01.json through bags_10.json
- [ ] Verify: `ls data/fixtures/bags/*.json | wc -l` >= 10

Method B (manual):
- [ ] Document in progress.txt: "Need human to collect Bags fixtures"
- [ ] Add `<promise>NEED_HUMAN</promise>` if blocked

### 1.3 Non-Bags DBC Fixtures (20 required)
- [ ] Fetch 20+ DBC transactions WITHOUT Fee Share V1
- [ ] Save to data/fixtures/non_bags_dbc/non_bags_01.json etc
- [ ] Verify: `ls data/fixtures/non_bags_dbc/*.json | wc -l` >= 20

### 1.4 Verify Fixtures
- [ ] All JSON files are valid: `for f in data/fixtures/**/*.json; do jq . "$f" > /dev/null; done`
- [ ] Bags fixtures contain Fee Share V1 program
- [ ] Non-Bags fixtures do NOT contain Fee Share V1 program

[GATE] Phase 1 complete when:
- 10+ Bags fixtures committed
- 20+ non-Bags fixtures committed
- All valid JSON

---

## Phase 2: Signature Detection

### 2.1 Constants
- [x] Create src/constants.ts with program IDs (in src/signature.ts):
  - BAGS_FEE_SHARE_V1 = "FEEhPbKVKnco9EXnaY3i4R5rQVUx91wgVfu8qokixywi"
  - METEORA_DBC = "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN"

### 2.2 Program Extraction
- [x] Create src/signature.ts (exists with stubs)
- [ ] Implement extractPrograms(tx) → Set<string>
- [ ] Test: extractPrograms on a Bags fixture returns Fee Share V1

### 2.3 DBC Init Detection
- [ ] Implement hasDbcInit(tx) → boolean
- [ ] Test: hasDbcInit on a Bags fixture returns true

### 2.4 Bags Classifier
- [ ] Implement isBagsLaunchTx(tx) → { match: boolean, reasons: string[] }
- [ ] Rule: match = hasFeeShareV1 AND hasDbc AND hasDbcInit

### 2.5 Validation Script
- [x] Create src/validate-signature.ts (exists)
- [ ] Run against all fixtures (needs fixtures first)
- [ ] Calculate false positive rate
- [ ] Write reports/signature_validation.json

### 2.6 Signature Artifact
- [ ] Create bags_signature_v1.json with:
  - programs
  - rules
  - test_vectors (signatures from fixtures)
  - validation results

[GATE] Phase 2 complete when:
- All Bags fixtures match
- False positive rate <= 5%
- bags_signature_v1.json exists

---

## Phase 3: Replay Ingestion

### 3.1 Replay Event Schema
- [ ] Define ReplayEvent type in src/types.ts
- [ ] Types: "launch", "wallet_action", "quote"

### 3.2 Build Replay Dataset
- [ ] Create scripts/build-replay.ts
- [ ] Read fixtures, generate synthetic events
- [ ] Write data/replay/events.jsonl
- [ ] Verify: `wc -l data/replay/events.jsonl` >= 50

### 3.3 Replay Reader
- [ ] Create src/ingestion/replay.ts
- [ ] Implement readReplayEvents() → AsyncIterator<ReplayEvent>

### 3.4 Normalizer
- [ ] Create src/normalizer.ts
- [ ] Implement normalizeEvent(event) → CanonicalEvent
- [ ] Handle dedupe key: (signature, instruction_index)

### 3.5 Database Writers
- [ ] Implement insertRawEvent() with ON CONFLICT DO NOTHING
- [ ] Implement insertLaunch()
- [ ] Implement insertWalletAction()
- [ ] Verify dedupe: inserting same event twice doesn't create duplicate

### 3.6 Ingest Command
- [ ] Create src/commands/ingest-replay.ts
- [ ] Add to package.json: "ingest:replay"
- [ ] Run: `bun run ingest:replay`
- [ ] Verify: `SELECT COUNT(*) FROM raw_events` > 0

[GATE] Phase 3 complete when:
- `bun run ingest:replay` succeeds
- Database has events
- Dedupe constraint works

---

## Phase 4: Wallet Analytics

### 4.1 Wallet Feature Extraction
- [ ] Create src/wallet/features.ts
- [ ] Implement computeWalletFeatures(wallet) → WalletFeatures

### 4.2 Exclusion Rules
- [ ] is_deployer_like check
- [ ] is_sniper_like check (>50% buys within 5s)
- [ ] insufficient_signals check (<5 signals)
- [ ] negative_edge check (ev_lower_bound < 0)

### 4.3 EV Calculation
- [ ] Implement calculateEV(trades) → { mean, lower_bound }
- [ ] Use 95% confidence interval

### 4.4 Wallet Scoring Command
- [ ] Create src/commands/analyze-wallets.ts
- [ ] Add to package.json: "analyze:wallets"
- [ ] Run: `bun run analyze:wallets`
- [ ] Write reports/wallet_report.json
- [ ] Save to wallet_scores table

[GATE] Phase 4 complete when:
- reports/wallet_report.json exists
- At least 1 eligible wallet (or document why none)

---

## Phase 5: Strategy + Paper Trading

### 5.1 Quote Service Stub
- [ ] Create src/quote/stub.ts
- [ ] Implement StubQuoteService for replay mode
- [ ] Returns synthetic quotes from replay data

### 5.2 Strategy Engine
- [ ] Create src/strategy/index.ts
- [ ] Implement convergence scoring
- [ ] Implement entry threshold check
- [ ] Implement fee-aware position sizing

### 5.3 Trade Journal
- [ ] Implement logDecision() → writes to trade_journal table
- [ ] Every decision (TRADE or SKIP) must be logged

### 5.4 Paper Trader
- [ ] Create src/paper/index.ts
- [ ] Implement PaperTrader class
- [ ] Track positions with entry/exit
- [ ] Implement exit rules: TP, SL, timeout

### 5.5 Paper Trading Command
- [ ] Create src/commands/paper-trade.ts
- [ ] Add to package.json: "paper:trade"
- [ ] Run: `bun run paper:trade`
- [ ] Write reports/paper_trading_report.json

[GATE] Phase 5 complete when:
- trade_journal has entries
- positions table has entries
- reports/paper_trading_report.json exists

---

## Phase 6: E2E Runner

### 6.1 Orchestrator
- [ ] Create src/e2e-replay.ts
- [ ] Sequence: ensure DB → migrate → ingest → analyze → paper trade → report

### 6.2 Final Validation Report
- [ ] Collect all metrics
- [ ] Write reports/final_validation.json with:
  - status: "PASS" or "FAIL"
  - e2e_replay: { status }
  - signature_gate: { false_positive_rate }
  - db_integrity: { dedupe_ok }

### 6.3 Verify Script
- [ ] Update scripts/verify.sh to check all gates
- [ ] Exit 0 only if all pass

### 6.4 E2E Command
- [ ] Add to package.json: "e2e:replay"
- [ ] Run: `bun run e2e:replay`
- [ ] Verify: exits 0, final_validation.json has status: "PASS"

[GATE] Phase 6 complete when:
- `./scripts/verify.sh` exits 0
- reports/final_validation.json has status: "PASS"
- bags_signature_v1.json exists

---

## Completion

When ALL gates pass:
```
<promise>COMPLETE</promise>
```

---

## Optional (not required)

- [ ] [OPTIONAL] Live ingestion with Helius WebSocket
- [ ] [OPTIONAL] Real Jupiter quote service
- [ ] [OPTIONAL] Real toxicity filter
- [ ] [OPTIONAL] Axiom metrics integration
