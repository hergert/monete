# TODO

## Current Focus

Phase 0A prep — validate Bags signature before writing any code.

## Backlog

### Phase 0A: Signature Validation
- [ ] Set up Helius account
- [ ] Collect 20+ Bags token addresses from UI
- [ ] Query creation txs, extract program IDs + accounts
- [ ] Identify Bags-specific account constraints
- [ ] Build false positive test set (non-Bags DBC launches)
- [ ] Document final signature spec

### Phase 0B: Wallet Database
- [ ] Research Birdeye API access/pricing
- [ ] Design wallet filtering criteria
- [ ] Build baseline measurement system
- [ ] Set up Helius WebSocket subscription

### Infrastructure (7 Components)
- [ ] A: Ingestion layer (WSS + webhook fallback)
- [ ] B: Event normalizer + dedupe
- [ ] C: Signature decoder → `bags_signature_v1.json`
- [ ] D: Quote service (Jupiter)
- [ ] E: Wallet analytics
- [ ] F: Strategy engine
- [ ] G: Execution + position manager

### Infra Setup
- [ ] VPS provisioning (2-4GB)
- [ ] Docker Compose setup
- [ ] Postgres + schema
- [ ] Grafana/Prometheus

## Done

- [x] Initial plan created (2024-01-27)
- [x] Plan reviewed, execution reality concerns added (2024-01-27)
- [x] Setup checklist created (2024-01-27)
- [x] Execution-grade architecture review (2024-01-27)

---

# Journal

_Append new entries at the bottom. Format: date, what happened, decisions, learnings._

---

## 2024-01-27

**Session: Project Kickoff**

Created initial plan for Bags.fm signal aggregation bot. Went through detailed review process.

**Decisions:**
- Target Bags.fm (not pump.fun) — less competition, uses Meteora DBC
- Phased approach with explicit gates — no capital until validated
- EV-based scoring, not win rate — accounts for execution reality

**Key insights from review:**
1. Bags uses shared infra (Meteora DBC/DAMM) — program ID alone won't work
2. Leaderboard wallets are dirty — need filtering for deployers/snipers
3. "2x in 24h" metric is misleading — need realistic latency simulation
4. Must track exit success rate, not just entries
5. Quote-based sizing, not liquidity estimates

**Open questions:**
- What are the exact Bags-specific account constraints in DBC init?
- What's Birdeye API pricing for leaderboard data?
- What % of Bags launches hit 2x anyway? (baseline)

**Next:**
1. Set up Helius account
2. Start collecting Bags token addresses
3. Begin signature analysis

---

## 2024-01-27 (cont.)

**Session: Execution-Grade Architecture Review**

Deep review of plan with focus on practical execution. Major restructure.

**5 Bugs Fixed:**

1. **Position sizing**: `max($10, min(...))` forced trades when quote said skip. Fixed to skip if <$10.

2. **Toxicity filter**: "Top holder >50%" false-positives on DBC pool authority. Fixed to exclude protocol accounts from holder math.

3. **LP unlock**: Not a concept on pre-migration DBC. Now distinguish pre/post migration checks.

4. **Enhanced WebSockets**: Not free-tier. Added fallback ingestion path (webhooks + backfill).

5. **TOKEN_MINT**: Already knew this was wrong. Confirmed: use `transactionSubscribe`.

**Architecture Defined (7 Components):**
- A: Ingestion (WSS primary, webhook/backfill fallback)
- B: Event normalizer + dedupe (canonical key: sig + instruction_index)
- C: Signature decoder → `bags_signature_v1.json`
- D: Quote service (Jupiter, store all quotes for sim)
- E: Wallet analytics (features + EV scoring)
- F: Strategy engine (deterministic scoring, backtestable)
- G: Execution (Jupiter Trigger/Limit v2 for TP/SL + self-managed trailing)

**Data Model:**
6 tables defined: raw_events, launches, wallet_actions, quotes, positions, wallet_scores

**Infrastructure:**
- VPS 2-4GB, Docker Compose, Postgres, Redis, Grafana
- Two clocks (chain time + system time)
- Idempotency everywhere
- Ping every 60s (Helius timeout)

**Key Insight:**
> Treat exits as a product feature, not just a rule. If exit success drops → disable entries. Active defense, not passive monitoring.

**Next:**
1. Set up accounts (Helius, wallet)
2. Build Phase 0A: signature validation
3. Produce `bags_signature_v1.json` artifact

---

<!-- APPEND NEW ENTRIES ABOVE THIS LINE -->
