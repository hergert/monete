# TODO

## Current Focus

**Research phase** — collect data and understand Bags before writing code.

---

## Backlog

### Research (Before Code)
- [x] Set up Helius account, get API key
- [x] Set up Postgres database (Neon)
- [x] Create justfile with dev commands
- [ ] Collect 20+ Bags token addresses from bags.fm UI
- [ ] Find Bags SDK GitHub repo
- [ ] Document Bags program IDs (DBC, DAMM, Fee Share)
- [ ] Query 3-5 sample creation txs via Helius
- [ ] Analyze tx structure, identify Bags-specific accounts
- [ ] Collect 5-10 non-Bags DBC launches (false positive set)
- [ ] Write `data/signature_research.md` with findings

### Phase 0A: Signature Validation
- [ ] Project scaffolding (Bun + TypeScript)
- [ ] Helius client wrapper
- [ ] Instruction decoder using Bags IDLs
- [ ] Produce `bags_signature_v1.json`
- [ ] Validate <5% false positive rate

### Phase 0B: Wallet Database
- [ ] Research Birdeye API access/pricing
- [ ] Design wallet filtering criteria
- [ ] Build baseline measurement system
- [ ] Set up Helius WebSocket subscription

### Phase 1: Paper Trading
- [ ] Jupiter quote service
- [ ] DB schema from PLAN.md
- [ ] Toxicity filter
- [ ] Simulation engine

### Phase 2: Live Trading
- [ ] Funded wallet ($500 + fees)
- [ ] Execution manager
- [ ] Circuit breakers
- [ ] Helius upgrade if needed

### Infrastructure
- [ ] VPS (2-4GB)
- [ ] Docker Compose
- [ ] Grafana/Prometheus

---

## Done

- [x] Initial plan created (2024-01-27)
- [x] Plan reviewed, execution reality added (2024-01-27)
- [x] Architecture defined: 7 components (2024-01-27)
- [x] Technical decisions: Bun, TypeScript, research-first (2024-01-27)
- [x] Helius account created + tested (2024-01-27)
- [x] Neon Postgres connected + tested (2024-01-27)
- [x] Justfile created (2024-01-27)
- [x] Docs consolidated: PLAN.md + TODO.md (2024-01-27)

---

# Journal

_Append new entries at bottom._

---

## 2024-01-27: Project Kickoff

Created Bags.fm signal aggregation bot plan. Extensive review process.

**Key decisions:**
- Target Bags.fm (not pump.fun) — less competition, uses Meteora DBC
- Phased approach with gates — no capital until validated
- EV-based scoring, not win rate
- Research first, then code

**Key insights from review:**
1. Bags uses shared infra (Meteora DBC/DAMM) — program ID alone won't work
2. Leaderboard wallets are dirty — filter deployers/snipers
3. "2x in 24h" misleading — need realistic latency simulation
4. Track exit success rate, not just entries
5. Quote-based sizing, not liquidity estimates

**5 bugs fixed:**
1. Position sizing: skip if <$10, don't force
2. Toxicity filter: exclude protocol accounts from holder math
3. LP unlock: not a concept on pre-migration DBC
4. Enhanced WebSockets: not free, need fallback
5. TOKEN_MINT: wrong, use `transactionSubscribe`

**Architecture defined (7 components):**
A: Ingestion → B: Normalizer → C: Signature decoder → D: Quote service → E: Wallet analytics → F: Strategy → G: Execution

**Stack:** Bun + TypeScript + Postgres (Neon)

**Infra set up:**
- Helius account: RPC + API tested
- Neon Postgres: connected
- Justfile: dev commands ready

**Open questions:**
- What are exact Bags-specific account constraints in DBC init?
- What's Birdeye API pricing?
- What % of Bags launches hit 2x? (baseline)

**Next:**
1. Collect token addresses from bags.fm
2. Find Bags SDK repo
3. Query sample transactions, analyze structure

---

<!-- APPEND NEW ENTRIES ABOVE THIS LINE -->
