# TODO

## Current Focus

**Research phase** — collect data and understand Bags before writing code.

---

## Backlog

### Research (Before Code)
- [x] Set up Helius account, get API key
- [x] Set up Postgres database (Neon)
- [x] Create justfile with dev commands
- [x] Document Bags program IDs (DBC, DAMM, Fee Share) — in PLAN.md
- [x] Find Bags SDK GitHub repo — bagsfm/bags-sdk, IDLs published there
- [x] Find Bags TypeScript SDK — @bagsfm/bags-sdk on npm
- [ ] Decide ingestion Mode A vs Mode B for Phase 0A (cost vs latency)
- [ ] Write Economics Gate spreadsheet (infra cost vs expected monthly EV)
- [ ] Get Bags API key from dev.bags.fm, confirm base URL works
- [ ] Collect 20+ Bags token addresses (use Bags API, faster than UI scraping)
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

- [x] Initial plan created (2026-01-27)
- [x] Plan reviewed, execution reality added (2026-01-27)
- [x] Architecture defined: 7 components (2026-01-27)
- [x] Technical decisions: Bun, TypeScript, research-first (2026-01-27)
- [x] Helius account created + tested (2026-01-27)
- [x] Neon Postgres connected + tested (2026-01-27)
- [x] Justfile created (2026-01-27)
- [x] Docs consolidated: PLAN.md + TODO.md (2026-01-27)
- [x] Comprehensive plan review + spec upgrades (2026-01-27)
- [x] Economics gate, latency budget, trade journal added (2026-01-27)
- [x] Technical decisions locked: Mode A, wallet subscribe, Token-2022 skip (2026-01-27)
- [x] Bags resources documented: API, SDK, program IDs (2026-01-27)

---

# Journal

_Append new entries at bottom._

---

## 2026-01-27: Project Kickoff

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

## 2026-01-27: Plan Review + Spec Upgrades

Comprehensive review applied. Key additions:

**Economics as first-class gate:**
- Success = positive NET EV (after fees, tips, infra)
- Infra upgrade requires 2× monthly cost in projected EV
- Fee-aware position sizing: `total_cost <= 1% of position`

**Latency budget:**
- `t_detect` <= 2s median OR `slot_gap` <= 2 slots
- `t_exec` <= 15s (fast) or 40s (cheap)
- Kill criterion if EV negative + latency above budget

**Technical decisions locked:**
- Mode A (cheap) for Phase 0A/0B/1 — don't pay for speed until proven
- Subscribe to wallets, not whole chain
- Token-2022 = toxic by default until extension parsing added

**New resources confirmed:**
- Bags API: `https://public-api-v2.bags.fm/api/v1/` (key from dev.bags.fm)
- Bags SDK: `bagsfm/bags-sdk` (GitHub), `@bagsfm/bags-sdk` (npm)
- Program IDs hardcoded in PLAN.md

**Trade journal added:**
- Every SKIP/TRADE decision logged with full context
- Enables post-mortems and prevents "we think we know why" failures

**Next:**
1. Get Bags API key from dev.bags.fm
2. Decide ingestion mode (Mode A for now)
3. Write economics spreadsheet
4. Collect tokens via API, start signature lab

---

<!-- APPEND NEW ENTRIES ABOVE THIS LINE -->
