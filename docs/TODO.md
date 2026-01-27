# TODO / Journal

## 2024-01-27: Initial Plan Review

### What We Learned

The original plan had solid structure (gates, fallbacks, phased approach) but several assumptions needed correction:

**1. Bags Signature Discovery**
- Original: Discover factory pattern from scratch
- Correction: Bags uses Meteora DBC/DAMM (shared infra), so program ID alone isn't enough
- Action: Use multi-factor signature (Bags-specific accounts + Fee Share program + metadata corroboration)

**2. Helius Monitoring**
- Original: Assumed TOKEN_MINT webhook catches launches
- Correction: TOKEN_MINT doesn't cover all minting; need Enhanced WebSockets
- Action: Use `transactionSubscribe` with `accountInclude` filters, decode locally with Bags SDK IDLs

**3. Wallet Database Quality**
- Original: Scrape leaderboards → use as smart money
- Correction: Leaderboards include deployers, sniper bots, wash traders
- Action: Filter out speed-based edge wallets, keep only selection-based edge

**4. Win Rate Metric**
- Original: "2x in 24h = win"
- Correction: Doesn't reflect execution reality (latency, fill price, exit rules)
- Action: Simulate with realistic entry timing, quote-based fills, actual exit rules

**5. Sample Size**
- Original: 10 wallets >40% win rate
- Correction: Statistically weak, overfitting risk
- Action: Require N≥20 signals per wallet, use Bayesian smoothing, compare to baseline

**6. Liquidity Model**
- Original: 0.5% of pool liquidity
- Correction: DBC bonding curve ≠ AMM TVL
- Action: Use real swap quotes to determine price impact, not estimated "liquidity"

### Key Insight

> The edge isn't engineering—it's signal quality. Smart money convergence collapses when you can't replicate their timing or their edge is insider/deployer behavior.

---

---

## 2024-01-27: Execution Reality Review (Part 2)

### MEV / Sandwiching / Landing Reliability

The plan didn't price in real execution friction:
- Sandwich attacks on popular launches
- Copy-trading bots front-running signals
- Priority fee bidding wars
- Failed tx retries and costs
- Duplicate webhook events (Helius warns about this)
- "Can't exit" scenarios: LP pulled, migration events, pool paused

### New Safeguards Required

**1. Toxic Token Handling**
- If sell fails twice → mark token as toxic, stop attempting
- Prevents death spirals of retry fees

**2. Time-Based Exit Overlay**
- "If not +X% within Y minutes, exit anyway"
- Avoids getting trapped in slow rugs

**3. Exit Success KPI**
- Track "% of trades where exit was possible within Z seconds"
- This matters more than win rate

### Phase Feasibility Notes

**Phase 0A**: Can be cleaner—use published program IDs directly, add false positive test set of non-Bags DBC launches

**Phase 0B**: Wallet sources are fragile. Treat Birdeye/pump.fun as seeds, then discover new wallets from actual Bags trading

**Phase 1**: Must simulate detection + execution delay + fees + priority fees, or paper results will be overstated

**Phase 2 Sizing Math Error**:
- With $500 capital, 2% = $10, not $30
- `min(X, Y, $30)` caps at $30, doesn't set minimum
- Need separate minimum-trade constraint if $30 is floor

### Toxicity/Rug Risk Filters (Pre-Entry)

Fast checks before any entry:
- Mint authority status (revoked?)
- Freeze authority status (revoked?)
- Token concentration (top holders %)
- Dev wallet sell detection
- Sudden LP withdrawals / migration events

### KPIs to Track Weekly

Beyond win rate:
1. Median time: launch → detection
2. Median time: signal → buy lands
3. % exits that succeed within N seconds
4. Realized slippage vs expected slippage
5. EV per trade and per day
6. Maximum adverse excursion (MAE) distribution
7. % of -50% stops hit

### Make-or-Break Validations

Two things determine success:

1. **Signal Replicability**: Can we enter/exit close enough to wallet events to capture edge after latency + slippage?

2. **Wallet List Integrity**: Can we build a wallet set that stays predictive out-of-sample (not just insiders/deployers)?

---

## Next Steps

- [x] Update PLAN.md with corrected phases
- [ ] Define concrete Bags signature (DBC program + Bags accounts + Fee Share)
- [ ] Research Helius Enhanced WebSockets setup
- [ ] Design wallet filtering criteria (exclude deployers/snipers)
- [ ] Build realistic P&L simulation model
- [ ] Determine baseline win rate for Bags launches
- [ ] Add toxicity filter module
- [ ] Add time-based exit rules
- [ ] Add toxic token tracking
- [ ] Fix position sizing math (min vs floor)
- [ ] Define KPI tracking system
