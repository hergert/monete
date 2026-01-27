# Monenete - Bags.fm Signal Aggregation Bot

## Core Idea

Deploy an on-chain signal aggregation bot that monitors Bags.fm token launches via Helius and scores opportunities using smart money convergence.

**Critical insight**: The edge isn't engineering—it's signal quality. Smart money convergence collapses when latency erases alpha, when "top traders" are actually deployers/bots, or when 2x paper wins don't translate to executable profits.

**Make-or-break validations**:
1. **Signal Replicability**: Can we enter/exit close enough to wallet events to capture edge after latency + slippage?
2. **Wallet List Integrity**: Can we build a wallet set that stays predictive out-of-sample?

---

## Architecture: 7 Components

### A. Ingestion Layer
Real-time tx stream from Helius.

**Primary** (low-latency): Enhanced WebSockets `transactionSubscribe`
- `accountInclude` for DBC program (OR filter)
- `accountRequired` for Bags-specific accounts (AND filter)
- Subscribe at `processed` for speed, confirm at `confirmed` for truth

**Fallback** (reliability/cost):
- Helius webhooks (with idempotency—duplicates happen)
- Periodic backfill job (poll recent signatures)

**Note**: Enhanced WebSockets require Business/Professional plan. Design for fallback.

### B. Event Normalizer + Dedupe
Raw tx → canonical event stream.

**Canonical key**: `(signature, instruction_index)`

**Dedupe rule**: Ignore if key exists. Critical for accurate wallet stats.

### C. Signature Decoder
Answer: "Is this a Bags launch?"

**Multi-factor signature**:
- Meteora DBC program ID
- Instruction: `initialize_virtual_pool_with_spl_token`
- Bags-specific account constraints (the real differentiator)
- Fee Share config linkage (strong filter—required for Bags launches)

**Deliverable**: `bags_signature_v1.json`
```json
{
  "version": "1",
  "program_ids": ["..."],
  "instruction_discriminators": ["..."],
  "required_account_positions": {...},
  "test_vectors": {
    "should_match": ["sig1", "sig2"],
    "should_not_match": ["sig3", "sig4"]
  }
}
```

### D. Market Data + Quote Service
Truth for slippage/impact.

**Interface**:
```
get_quote(token, in_amount, slippage_bps) → {
  expected_out,
  price_impact_bps,
  route,
  min_out
}
```

**Store all quotes** — becomes historical simulation dataset.

**Skip signal**: If token not routable, no reliable execution path.

### E. Wallet Analytics
Produce list of wallets with replicable edge.

**Features to compute per wallet**:
- `is_deployer_like`: count of token creations
- `is_sniper_like`: % of buys within 5s of launch
- `holding_half_life`: median time to first sell
- `trade_frequency`: signals/day

**Output**:
- `ev_per_signal` (realistic latency + quotes + exits)
- `ev_lower_bound` (confidence bound)
- `signals_n`
- `status` (eligible / excluded)

### F. Strategy Engine
Convergence → decision.

**Scoring** (deterministic, backtestable):
```
convergence_score = sum(wallet_weight for wallets buying within window)
wallet_weight = clamp(ev_lower_bound, 0, cap)
```

**Entry requires all**:
- `score ≥ threshold`
- Toxicity filter pass
- Quote impact ≤ 2%
- `position ≥ $10`

### G. Execution + Position Manager

**Entry**: Jupiter swap

**Exit options**:
1. Jupiter Trigger/Limit v2 for TP/SL (OCO behavior—one triggers, other cancels)
   - Reduces "bot must be online 24/7" risk
2. Self-managed (poll quotes + fire swaps)
   - Better for trailing stops
   - More infra complexity

**Hybrid approach**: Trigger/Limit for hard SL + initial TP, self-managed for trailing.

**Circuit breakers**:
- Per-token: sell fails twice → mark toxic
- Global: 5 sell failures in 10 min → disable new entries

---

## Data Model

### Tables

**raw_events**
- `id`, `source`, `signature`, `slot`, `instruction_index`
- `received_at`, `payload_json`

**launches**
- `mint`, `launch_signature`, `launch_slot`, `detected_at`
- `is_bags`, `signature_version`
- `dbc_pool_address`, `pool_authority`, `fee_share_config`
- `is_migrated`

**wallet_actions**
- `wallet`, `mint`, `action`, `slot`, `ts_chain`
- `amount_in`, `amount_out`, `tx_signature`

**quotes**
- `mint`, `ts`, `in_amount_usd`, `price_impact_bps`
- `expected_out`, `route_json`

**positions**
- `position_id`, `mint`
- `entry_ts`, `entry_sig`, `entry_price`, `size_usd`
- `exit_ts`, `exit_sig`, `exit_price`
- `pnl_usd`, `pnl_pct`, `exit_reason`

**wallet_scores**
- `wallet`, `window_start`, `window_end`
- `signals_n`, `ev_mean`, `ev_lower_bound`
- `sniper_score`, `deployer_score`, `status`

---

## Position Sizing (Fixed)

**Bug in previous version**: `max($10, min(...))` forces trades even when quote says skip.

**Correct logic**:
```
position = min(quote_approved_size, 0.02 * capital)
if position < $10:
    skip  # Not worth execution costs
```

This keeps the impact gate consistent.

---

## Toxicity Filter (Fixed)

**Bug in previous version**: "Top holder >50%" false-positives on DBC pool authority.

**Correct logic**:
1. Identify protocol accounts from DBC init (pool authority, vault accounts)
2. Exclude protocol accounts from holder math
3. Check: `largest_non_protocol_holder < 50%`

**Pre-migration vs Post-migration**:
- Pre-migration: Check curve/pool state integrity (no "LP unlock" concept)
- Post-migration (DAMM v2): Evaluate pool + LP ownership/lock

**Full toxicity checks**:
- Mint authority revoked or null
- Freeze authority revoked or null
- Non-protocol concentration <50%
- Dev wallet hasn't sold >20%
- No sudden LP withdrawals / migration events

---

## Infrastructure

### V1 Production Stack
- 1 VPS (2-4GB RAM)
- Docker Compose
- Postgres (not SQLite—need concurrency, indexing, analytics)
- Redis (optional queue/cache)
- Grafana/Prometheus (metrics)

### Services
- `ingestor` — WSS client
- `processor` — decode + scoring
- `executor` — trades + exits
- `db` — Postgres
- `metrics` — Grafana stack

### Operational Requirements
- Ping every 60s (Helius 10-min inactivity timer)
- Reconnect with backoff
- Backfill recent slots on reconnect (cover gaps)
- Idempotency everywhere (webhooks duplicate, reconnects replay)

### Two Clocks
Always store both:
- `slot` + `blockTime` (chain time)
- `received_at` (system time)

Latency KPIs require both.

### Cost Considerations
- Enhanced WebSockets metered on newer plans
- Keep filters tight (`accountRequired` as soon as Bags constraints known)
- Track streaming volume as cost driver

---

## How It Works

### Phase 0A: Signature Validation (Days 1-3)

**Build output**: `bags_signature_v1.json`

1. Use published Bags program IDs (DBC, DAMM, Fee Share) as starting point
2. Collect 20+ token mint addresses from Bags.fm UI
3. For each token: query Helius for creation tx
4. Decode using Bags SDK IDLs
5. Identify Bags-specific account positions in DBC init
6. Note Fee Share config linkage pattern
7. Validate against 50+ historical Bags tokens
8. **Build false positive test set**: 20+ non-Bags Meteora DBC launches
9. **Gate**: <5% false positive rate

### Phase 0B: Wallet Database + Baseline (Days 4-14)

**Build output**: Wallet edge report

1. Source 60 candidate wallets (Birdeye / pump.fun / social)
2. Compute wallet features: `is_deployer_like`, `is_sniper_like`, etc.
3. Deploy Helius WebSocket with validated signature
4. **Establish baseline**:
   - What % of Bags launches hit 2x? (null hypothesis)
   - What % are rugs? (toxicity rate)
5. Run passive observation: log wallet actions
6. Discover new wallets from profitable trading
7. After 10 days: calculate per-wallet EV with realistic simulation
8. **Gate**: ≥15 wallets with EV lower bound >0, each with ≥20 signals

### Phase 1: Paper Trading (Days 15-28)

**Build output**: Paper trading report + go/no-go decision

1. On each Bags launch:
   - Run toxicity filter
   - Log prices at T+0, T+40s, T+5m, T+30m, T+1h, T+24h
   - Get and store swap quotes
2. Simulate entries with realistic fills
3. Simulate exits with actual rules
4. **Gate**:
   - Positive EV after costs
   - Sharpe >1.0
   - ≥50 simulated trades
   - Exit success rate >80%

### Phase 2: Micro-Capital Live (Day 29+)

**Build output**: Live safety + weekly reports

1. Capital: $500
2. Position sizing: `min(quote_approved, 2% capital)`, skip if <$10
3. Pre-entry: wallet signal + quote impact + toxicity
4. Exits via Jupiter Trigger/Limit v2 + self-managed trailing
5. Circuit breakers active
6. **Weekly review**: EV negative 2 weeks → halt

### Adaptation Loop

- Weekly: recalculate wallet EV, demote/promote
- Monthly: if ROI <0%, reduce size 50%
- Quarterly: re-validate Bags signature

---

## KPIs

**Latency**:
- Median launch → detection
- Median signal → buy lands
- P95 detection latency

**Execution**:
- % exits succeed within 60s
- Realized vs expected slippage
- Priority fee spend

**Performance**:
- EV per trade/day
- Win rate (secondary)
- MAE distribution
- % of -50% stops hit
- Sharpe (rolling 2-week)

**Quality**:
- Wallet signal decay
- Baseline drift
- Toxicity filter hit rate

**Operational defense** (active, not just monitoring):
- Exit success drops → disable new entries
- Slippage spikes → tighten max impact
- Sell failures → auto-raise priority fee (bounded) or stop

---

## Risk Mitigations

### Enhanced WebSockets Cost
Not free-tier. Design fallback ingestion (webhooks + backfill). Track streaming volume.

### DBC Pool Authority as Top Holder
Exclude protocol accounts from concentration math. Identify from DBC init.

### Pre-Migration vs Post-Migration
Different mechanics. Pre-migration has no "LP unlock." Check curve state integrity.

### MEV / Sandwiching
Circuit breakers, time-based exits, quote-based sizing, slippage tracking.

### Leaderboard Wallet Quality
Feature-based filtering. Exclude deployers/snipers. Discover wallets from actual trading.

### Idempotency
Webhooks duplicate. Reconnects replay. Canonical key dedupe everywhere.
