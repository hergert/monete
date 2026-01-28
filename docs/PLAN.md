# Monenete - Bags.fm Signal Aggregation Bot

## Core Idea

Deploy an on-chain signal aggregation bot that monitors Bags.fm token launches via Helius and scores opportunities using smart money convergence.

**Critical insight**: The edge isn't engineering—it's signal quality. Smart money convergence collapses when latency erases alpha, when "top traders" are actually deployers/bots, or when 2x paper wins don't translate to executable profits.

**Make-or-break validations**:
1. **Signal Replicability**: Can we enter/exit close enough to wallet events to capture edge after latency + slippage?
2. **Wallet List Integrity**: Can we build a wallet set that stays predictive out-of-sample?

---

## Success Definition (Net, Not Gross)

This project is only "successful" if it achieves **positive net expected value** after:
- all swap fees and slippage
- priority fees / tips (entry + exit)
- infrastructure costs (Helius plan, VPS, optional data providers)

### Economics Gate (before paying for higher infra tiers)

Before upgrading to paid streaming (Enhanced WSS / LaserStream tiers), we must show:
- Projected monthly net P&L (based on Phase 1 EV/trade × expected trades/month)
  is at least **2× the monthly infra cost**
- Or, if infra is required for latency, then **capital must be scaled** so infra cost is
  < 10% of expected monthly gross edge.

If this gate fails, we remain on the lowest-cost infra and accept slower latency,
or we pause/pivot strategy.

---

## Latency Budget and Kill Criteria

We define two latency measures:

1. **Detection latency**:
   - `t_detect = received_at - chain_block_time` (approx)
   - `slot_gap = detected_slot - tx_slot` (more reliable)

2. **End-to-end execution latency**:
   - `t_exec = our_fill_time - smart_wallet_buy_time`
   - This includes detection + quote + tx build + broadcast + landing

### Budget targets (Phase 1/2)
- Median `t_detect` <= 2s OR median `slot_gap` <= 2 slots
- Median `t_exec` <= 15s for "fast" mode; <= 40s in "cheap" mode
- P95 `t_exec` must be tracked; if P95 exceeds target by 2× for 2 days, pause new entries

### Kill criterion
If measured EV per trade turns negative AND median `t_exec` is above budget,
we treat it as "latency killed the edge" and stop trading until infra is improved
or strategy is adjusted.

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

### Ingestion Modes (Cost vs Latency)

**Mode A — Free/Cheap** (research + early Phase 1):
- Standard Solana WebSockets (logsSubscribe / signatureSubscribe) to detect DBC activity
- On event, fetch full tx via RPC and decode
- Pros: low cost
- Cons: extra latency (fetch step), risk of missing bursts if processing blocks

**Mode B — Low-latency** (if economics justify):
- Enhanced WebSockets `transactionSubscribe` with:
  - `transactionDetails: "full"`
  - `maxSupportedTransactionVersion: 0`
  - tight `accountInclude` + `accountRequired` filters
- Must implement ping (10-min inactivity timer) + reconnect logic

**Mode C — Reliability/Replay** (optional upgrade path):
- LaserStream SDK with slot replay + backfill on reconnect
- Only if Mode B misses events or costs become predictable via data tiers

### B. Event Normalizer + Dedupe
Raw tx → canonical event stream.

**Canonical key**: `(signature, instruction_index)`

**Dedupe rule**: Ignore if key exists. Critical for accurate wallet stats.

### C. Signature Decoder
Answer: "Is this a Bags launch?"

**Deliverable**: `bags_signature_v1.json`

We maintain this file with:

- `program_ids`:
  - DBC: `dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN`
  - DAMM v2: `cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG`
  - Fee Share V2: `FEE2tBhKAt7shrod19QttSVREUYPiyMzoku1mL1gqVK` (current, primary)
  - Fee Share V1: `FEEhPbKVKnco9EXnaY3i4R5rQVUx91wgVfu8qokixywi` (legacy)
- `launch_match` rules:
  1. tx contains Fee Share V2 program (primary Bags differentiator)
  2. tx contains DBC instruction discriminator for `initialize_virtual_pool_with_spl_token`
  3. DBC alone is NOT sufficient (shared Meteora infra, causes false positives)
- `denylist` rules:
  - known non-Bags DBC patterns (false positive vectors)
- `test_vectors`:
  - `should_match`: [signatures...]
  - `should_not_match`: [signatures...]

**Gate**: <5% false positives on non-Bags DBC test set.

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

### Execution Transport

Broadcast transactions using the most reliable transport available:
- Prefer Helius Sender when live trading (improves landing success; sends to Helius and Jito in parallel)
- Fall back to standard sendTransaction only if Sender is unavailable

### Exit Automation (Reduce "bot must be online" risk)

Use Jupiter Limit v2 / Trigger-based exits where feasible:
- Place TP and SL conditions in one order when supported (OCO behavior: one triggers, other cancels)
- Keep trailing stop self-managed for the remaining portion if needed

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

**trade_journal** (required for every decision)
- `id`, `created_at`
- `launch`: `{ mint, slot, detected_at, signature_version }`
- `wallets`: `[{ wallet, weight, ev_lower_bound, action_time }]`
- `toxicity`: `{ checks..., protocol_accounts_excluded: [...] }`
- `quote`: `{ in_amount, expected_out, price_impact_bps, route_hash }`
- `economics`: `{ total_cost_usd_est, cost_pct }`
- `decision`: `{ action (TRADE|SKIP), score, threshold, reason_codes: [...] }`
- `outcome` (filled post-trade): `{ entry_sig, exit_sig, pnl_usd, pnl_pct }`

This enables post-mortems and prevents "we think we know why" failures.

---

## Position Sizing (Fee-Aware)

**Bug in previous version**: `max($10, min(...))` forces trades even when quote says skip.

### Fee-Aware Minimum Trade Size

We estimate all-in fees in USD:
- entry tx fee + tip + priority fee
- exit tx fee + tip + priority fee
- expected slippage cost (from quote impact)

**Rules**:
1. Require `total_cost_usd <= 1% of position_usd` (default)
2. Therefore: `position_usd >= total_cost_usd / 0.01`
3. Also enforce absolute minimum `position_usd >= $10`

**Sizing logic**:
```
max_by_capital = 0.02 * capital
min_by_fees = total_cost_usd / 0.01
position = min(quote_approved_size, max_by_capital)
if position < max(min_by_fees, $10):
    skip  # Fees would eat the edge
```

If we cannot satisfy both under 2% capital sizing, we skip the trade.

**Note**: Helius Sender has a minimum tip; if used, include in cost calculation.

---

## Toxicity Filter (Fixed)

**Bug in previous version**: "Top holder >50%" false-positives on DBC pool authority.

**Formal spec**:
1. Parse DBC `initialize_virtual_pool_with_spl_token` instruction
2. Extract protocol accounts: pool authority, quote vault, base vault, fee receiver
3. Query token holders via Helius `getTokenLargestAccounts`
4. Exclude all protocol accounts from holder list
5. Check: `largest_non_protocol_holder < 50%`

**Protocol account identification** (from DBC init):
- Account index 0: pool authority (PDA)
- Account index 7: quote vault
- Account index 8: base vault
- Fee Share config accounts (linked via Fee Share program)

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

## Economics Gate

**Rule**: Infra spend must be justified by expected monthly EV.

With $500 capital:
- Max monthly infra spend: 10% of expected monthly profit
- If EV not proven, use free tier only
- Upgrade only when paper trading shows clear profitability

**Helius tier decision tree**:
1. Start with Free tier (1M credits/mo, 10 RPS)
2. Standard WebSocket streaming is free
3. Enhanced WSS requires Business+ and is metered (3 credits per 0.1MB)
4. Upgrade only if: `monthly_EV > (tier_cost * 10)`

**Cost tracking**:
- Log all API credits consumed
- Track streaming data volume
- Weekly cost vs realized PnL review

---

## Infrastructure

### V1 Production Stack
- 1 VPS (2-4GB RAM)
- Docker Compose
- Postgres (not SQLite—need concurrency, indexing, analytics)
- Redis (optional queue/cache)
- Axiom (metrics + dashboards, free tier: 500GB/month)

### Services
- `ingestor` — WSS client
- `processor` — decode + scoring
- `executor` — trades + exits
- `db` — Postgres
- `metrics` — Axiom SDK (no separate service needed)

### Operational Requirements
- Ping every 60s (Helius 10-min inactivity timer)
- Reconnect with backoff
- Backfill recent slots on reconnect (cover gaps)
- Idempotency everywhere (webhooks duplicate, reconnects replay)

---

## Metrics Architecture

### Why Axiom (not Grafana/Prometheus)
- No infrastructure to manage (fully managed SaaS)
- 500GB/month free tier (more than enough)
- Simple SDK: `axiom.ingest()` from bot code
- Built-in dashboards (no separate Grafana)
- APL queries for all KPIs (percentiles, aggregations, Sharpe)

### Data Flow
```
Bot code
  ├── Circuit breaker: in-memory counter (milliseconds)
  ├── Trade journal: Postgres (backup + backtesting)
  └── Metrics: axiom.ingest() (async, fire-and-forget)
                    ↓
              Axiom Cloud
                    ↓
         Dashboards + Alerts + Historical queries
```

### What Goes Where

| Data | Destination | Why |
|------|-------------|-----|
| Circuit breaker state | In-memory / Postgres | Needs <10ms response |
| Trade journal (full) | Postgres | Backtesting, SQL queries |
| Metrics events | Axiom | Dashboards, alerts, KPIs |

### Axiom Events Schema

**trade_signal**
- `_time`, `mint`, `score`, `wallet_count`, `t_detect_ms`

**trade_entered**
- `_time`, `mint`, `size_usd`, `quote_impact_bps`, `entry_price`

**trade_exited**
- `_time`, `mint`, `pnl_usd`, `pnl_pct`, `t_exec_ms`, `exit_reason`, `slippage_bps`

**circuit_breaker**
- `_time`, `trigger`, `reason`, `value`

### Circuit Breaker (Local, Not Axiom)

Circuit breakers need millisecond response — cannot use API calls.

```typescript
// In-memory tracking
let recentFailures: number[] = []

function checkCircuitBreaker(): boolean {
  const tenMinAgo = Date.now() - 10 * 60 * 1000
  recentFailures = recentFailures.filter(t => t > tenMinAgo)
  return recentFailures.length < 5
}

function recordFailure() {
  recentFailures.push(Date.now())
  // Also send to Axiom for dashboard (async, non-blocking)
  axiom.ingest('circuit_breaker', [{ trigger: 'exit_failed', count: recentFailures.length }])
}
```

---

## Technical Decisions (Locked)

### A. Ingestion Strategy: Don't pay for speed until proven needed

Given $500 starting capital:
- **Phase 0A/0B/1**: Use Mode A (cheap) and measure latency
- **Only upgrade** if Phase 1 shows EV is positive AND latency sensitivity is proven
- Avoid building a Ferrari to deliver pizza

### B. Streaming Payload Size

Enhanced `transactionSubscribe` supports `transactionDetails: full|signatures|accounts|none`.
Full transactions = more data metering + more CPU.

- **Phase 0A**: Use `full` (needed for reverse engineering)
- **Later**: If cost is high, explore `signatures` + fast `getTransaction` fetch
- Benchmark EV impact before switching

### C. Wallet Action Detection: Subscribe to wallets, not the whole chain

For convergence, we only need to know what our wallet set is doing:
- Subscribe to eligible wallets' transactions
- Detect interactions with newly launched mints/pools
- **Massively cheaper** than capturing all pool swaps

### D. Token-2022: Toxic by default

Bags DAMM v2 supports SPL and Token-2022 flows.
Token-2022 can include extensions (transfer fees, permanent delegates, etc.).

**Rule**: If mint is Token-2022 and we haven't implemented extension checks → **skip**

Add Token-2022 support later as a planned upgrade.

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

## Development Setup

### Stack
- **Runtime**: Bun
- **Language**: TypeScript
- **Database**: Postgres (Neon)
- **Approach**: Research first, then code

### External Services
| Service | URL | Notes |
|---------|-----|-------|
| Helius | https://helius.dev | Free: 1M credits/mo, 10 RPS, 1 sendTx/sec |
| Birdeye | https://birdeye.so | API key required |
| Jupiter | https://station.jup.ag/docs | Free, no key |
| Bags.fm API | https://public-api-v2.bags.fm/api/v1/ | API key from dev.bags.fm, `x-api-key` header |
| Axiom | https://axiom.co | Free: 500GB/month, metrics in preview |

### Bags Program IDs (Mainnet)
| Program | Address |
|---------|---------|
| Meteora DBC | `dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN` |
| Meteora DAMM v2 | `cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG` |
| Fee Share V2 (current) | `FEE2tBhKAt7shrod19QttSVREUYPiyMzoku1mL1gqVK` |
| Fee Share V1 (legacy) | `FEEhPbKVKnco9EXnaY3i4R5rQVUx91wgVfu8qokixywi` |

### Setup Commands
```bash
# Bun + deps (Phase 0A)
curl -fsSL https://bun.sh/install | bash
bun init -y
bun add @solana/web3.js @coral-xyz/anchor helius-sdk

# Jupiter (Phase 1)
bun add @jup-ag/api

# Solana CLI (Phase 2)
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
solana-keygen new --outfile ~/.config/solana/monenete.json
```

### Environment Variables
```bash
# .env (DO NOT COMMIT)
HELIUS_API_KEY=xxx
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=xxx
DB_HOST=xxx
DB_DATABASE=xxx
DB_USER=xxx
DB_PASSWORD=xxx
DB_SSLMODE=require
SOLANA_KEYPAIR_PATH=/path/to/monenete.json  # Phase 2 only
AXIOM_TOKEN=xxx
AXIOM_ORG_ID=xxx  # optional
```

### Data Directory
```
data/
├── bags_tokens.json        # Collected token addresses (gitignored)
├── bags_programs.json      # Program IDs (gitignored)
├── non_bags_dbc.json       # False positive test set (gitignored)
├── signature_research.md   # Findings (tracked)
└── sample_txs/             # Raw transaction JSON (gitignored)
```

---

## Execution Path (Shortest Route to Real Answer)

### Step 1 — Signature Lab (no trading)

**Deliverables**:
- `data/sample_txs/*.json` (raw transactions)
- `data/signature_research.md` (findings)
- `bags_signature_v1.json` with test vectors
- False positive rate measured against non-Bags DBC set

**Token collection method**: Monitor Fee Share V2 program on-chain (Bags API has no "list tokens" endpoint)

**Gate**: <5% false positive rate

### Step 2 — Ingestion + Dedupe + Persistence (plumbing)

**Deliverables**:
- `raw_events` table filling
- Canonical dedupe key working
- Reconnect/backfill behavior tested (force disconnect, verify no gaps)

**Note**: Helius recommends ping + reconnect patterns due to inactivity timer

### Step 3 — Wallet Scoring (using latency + stored quotes)

**Deliverables**:
- Wallet report with:
  - EV mean and EV lower bound
  - Signal count
  - Baseline comparison

**Gate**: ≥15 wallets with EV lower bound > 0, edge > baseline by >10%

### Step 4 — Paper Trading (same code paths as live)

**Deliverables**:
- Paper trades saved as if real
- Trade journal stored
- Fee-aware position size enforced

**Gate**: Net EV positive after estimated tips/priority fees and infra cost assumptions

### Step 5 — Micro-Live (circuit breakers + OCO exits)

**Deliverables**:
- 50+ real trades (or enough to measure degradation)
- Measured realized slippage vs expected
- Exit success rate (in seconds)

**Note**: Use OCO exits (TP+SL) where possible to reduce operational risk

---

## How It Works (Detailed Phases)

### Phase 0A: Signature Validation

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
