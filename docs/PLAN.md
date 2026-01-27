# Monenete - Bags.fm Signal Aggregation Bot

## Core Idea

Deploy an on-chain signal aggregation bot that monitors Bags.fm token launches via Helius and scores opportunities using smart money convergence.

**Critical insight**: The edge isn't engineering—it's signal quality. Smart money convergence collapses when latency erases alpha, when "top traders" are actually deployers/bots, or when 2x paper wins don't translate to executable profits.

**Make-or-break validations**:
1. **Signal Replicability**: Can we enter/exit close enough to wallet events to capture edge after latency + slippage?
2. **Wallet List Integrity**: Can we build a wallet set that stays predictive out-of-sample?

## Key Components

### 1. Bags Signature Validation

Bags uses **shared infrastructure** (Meteora DBC for bonding curves, Meteora DAMM v2 for post-migration AMM). Program ID alone creates false positives.

**Multi-factor signature:**
- Meteora DBC program ID (published: `dbcij3...`)
- Instruction: `initialize_virtual_pool_with_spl_token`
- Bags-specific account constraints (identify from tx analysis)
- Fee Share V2 program linkage
- Metadata URI corroboration (weak, spoofable)

**Validation**: Test against false positive set of non-Bags DBC launches.

### 2. Wallet Database with Quality Filtering

Raw leaderboards are dirty inputs (include deployers, sniper bots, wash traders).

**Filtering criteria:**
- Exclude: wallets that frequently create tokens (deployer behavior)
- Exclude: wallets that buy within first 5 seconds across many launches (sniper bots)
- Keep: wallets whose edge is **selection** (buy minutes/hours after launch, still profit)

**Sources** (treat as seeds, then discover from actual trading):
- Birdeye API (requires API key, check quota)
- pump.fun historical data
- Manual extraction from social calls

### 3. Helius Enhanced WebSockets

`TOKEN_MINT` webhook type doesn't reliably catch DBC launches.

**Correct approach:**
- Use `transactionSubscribe` with `accountInclude` filter for Meteora DBC program
- Add `accountRequired` for Bags-specific accounts
- Decode instructions locally using Bags SDK IDLs
- Handle duplicate events (Helius warns about retries)

### 4. Quote-Based Position Sizing

DBC bonding curves ≠ AMM TVL. Can't estimate slippage from "pool liquidity."

**Sizing logic:**
```
quote = get_swap_quote(intended_size)
if quote.price_impact > 2%:
    size_down or skip

# With $500 capital: 2% = $10
position = min(quote_approved_size, 2% of capital)

# Minimum trade constraint (to avoid noise-dominated results)
if position < $10:
    skip (not worth execution costs)
```

### 5. Toxicity / Rug Risk Filter (Pre-Entry)

Fast checks before any entry:
- Mint authority status (must be revoked or null)
- Freeze authority status (must be revoked or null)
- Token concentration (skip if top holder >50%)
- Dev wallet behavior (skip if dev sold >20%)
- LP status (skip if LP unlocked or recently withdrawn)

### 6. Execution Safety

**Toxic token handling:**
- If sell fails twice → mark token as toxic, stop attempting
- Prevents death spirals of retry fees + priority fee wars

**Time-based exit overlay:**
- If not +20% within 30 minutes → exit regardless
- Avoids getting trapped in slow rugs

**Exit failure tracking:**
- Track "% of trades where exit succeeded within 60 seconds"
- This matters more than win rate

### 7. Realistic P&L Simulation

**Entry timing:**
```
entry_time = wallet_buy_time + detection_latency + tx_landing_time
```

**Fill price:** Simulated quote at entry_time (not wallet's price)

**Costs included:**
- Base transaction fee
- Priority fee (use observed median from similar txs)
- Quote slippage

**Exit rules:** 50% at 2x, trailing stop, time stop, hard stop

**Scoring:** Expected value per signal with confidence bounds

## How It Works

### Phase 0A: Signature Validation (Days 1-3)

1. Use published Bags program IDs (DBC, DAMM, Fee Share) as starting point
2. Collect 20+ token mint addresses from Bags.fm UI
3. For each token: query Helius for creation tx, decode using Bags SDK IDLs
4. Identify Bags-specific account positions in DBC init instruction
5. Validate signature against 50+ historical Bags tokens
6. **Build false positive test set**: Collect 20+ non-Bags Meteora DBC launches
7. **Differentiation test**: Confirm <5% false positive rate
8. Document exact signature specification
9. **Gate**: If false positive rate >5%, refine constraints or pause

### Phase 0B: Wallet Database + Baseline (Days 4-14)

1. Source 60 candidate wallets from Birdeye API / pump.fun / social
2. **Filter out non-replicable edge:**
   - Query each wallet's token creation history → exclude frequent deployers
   - Analyze timing of buys → exclude consistent first-5-second buyers
3. Deploy Helius WebSocket with validated Bags signature
4. **Establish baseline**: Track ALL Bags launches, measure:
   - What % hit 2x within 24h? (null hypothesis)
   - What % are rugs/honeypots? (toxicity rate)
5. Run passive observation: log tracked wallet interactions
6. **Discover new wallets**: Add wallets seen trading profitably on Bags tokens
7. After 10 days: calculate per-wallet metrics using **realistic simulation**:
   - Entry = wallet buy + 30s detection + 10s tx landing (40s latency)
   - Fill = price at entry time + estimated slippage
   - Exit = apply actual exit rules
   - Metric = EV per signal with Wilson confidence interval
8. **Quality threshold**:
   - Need ≥15 wallets with positive EV (lower confidence bound > 0)
   - Each wallet needs ≥20 signals for validity
   - Wallet edge must exceed baseline by >10%
9. If not met: extend 7 more days. If still not met by Day 21: pivot to pump.fun

### Phase 1: Paper Trading with Full Simulation (Days 15-28)

1. On each new Bags token:
   - Run toxicity filter (mint/freeze authority, concentration, dev wallet)
   - Log price at T+0, T+40s (simulated entry), T+5min, T+30min, T+1hr, T+24hr
   - Get swap quote for intended position size
2. Simulate entries:
   - Apply tiered system + quote-based sizing
   - Include priority fee estimates
   - Apply time-based exit overlay
3. Track hypothetical P&L with **realistic fills and exits**
4. **Success gate**:
   - Positive EV after all simulated costs
   - Sharpe ratio >1.0
   - Sample size ≥50 simulated trades
   - Exit success rate >80% (could exit within 60s when needed)

### Phase 2: Micro-Capital Live (Day 29+)

1. Initial capital: $500
2. Position sizing: max($10, min(quote_approved, 2% capital))
3. Pre-entry checks:
   - Wallet tier threshold (≥1 quality wallet)
   - Quote price impact <2%
   - Toxicity filter passes
4. Exit strategy:
   - 50% at 2x
   - Remainder: 30% trailing stop from peak
   - Time stop: exit if not +20% within 30 min
   - Hard stop: -50% per position
5. **Toxic token rule**: If sell fails twice → mark toxic, stop attempts
6. **Weekly review**: If EV negative for 2 weeks, halt and return to observation

### Adaptation Loop

- Weekly: recalculate wallet EV, demote negative-EV wallets, add new candidates
- Monthly: if portfolio ROI <0%, reduce position sizes 50% and tighten criteria
- Quarterly: re-validate Bags signature (platform may change infra)

## KPIs to Track

**Latency metrics:**
- Median time: launch → our detection
- Median time: signal → our buy lands
- P95 detection latency (worst case matters)

**Execution metrics:**
- % exits that succeed within 60 seconds
- Realized slippage vs expected slippage
- Priority fee spend per trade

**Performance metrics:**
- EV per trade and per day
- Win rate (secondary to EV)
- Maximum adverse excursion (MAE) distribution
- % of -50% stops hit
- Sharpe ratio (rolling 2-week)

**Quality metrics:**
- Wallet signal decay (are wallets staying predictive?)
- Baseline drift (is overall Bags launch quality changing?)
- Toxicity filter hit rate (how many skipped?)

## Risk Mitigations

### MEV / Sandwiching / Priority Fee Wars
Popular launches attract sandwich attacks and copy-trading bots. Mitigations:
- Toxic token rule prevents death spirals
- Time-based exits prevent slow-rug traps
- Quote-based sizing adapts to volatile moments
- Track realized vs expected slippage to detect MEV drain

### Bags Uses Shared Infrastructure
Signature uses multi-factor validation with explicit false positive testing against non-Bags DBC launches.

### Leaderboard Wallets Include Deployers/Bots
Explicit filtering: exclude frequent token creators and first-second buyers. Supplement with wallets discovered from actual profitable trading.

### Win Rate Doesn't Reflect Execution Reality
Replaced with EV simulation including latency, priority fees, and realistic exit rules. Confidence bounds prevent promoting lucky wallets.

### Sample Size Too Small
Require ≥20 signals per wallet, ≥50 paper trades before live. Compare against baseline to ensure edge is real.

### Can't Exit Scenarios
Track exit success rate as core KPI. Time-based exits prevent getting trapped. Toxic token marking prevents retry death spirals.

### Birdeye API Costs
Treat as seed source only. Discover wallets organically from observed trading. Fallback to pump.fun or manual sourcing.
