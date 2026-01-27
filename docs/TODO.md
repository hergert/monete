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

### Infrastructure
- [ ] Project scaffolding (TypeScript, deps)
- [ ] Helius client wrapper
- [ ] Instruction decoder using Bags IDLs
- [ ] Toxicity filter module

## Done

- [x] Initial plan created (2024-01-27)
- [x] Plan reviewed, execution reality concerns added (2024-01-27)
- [x] Setup checklist created (2024-01-27)

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

<!-- APPEND NEW ENTRIES ABOVE THIS LINE -->
