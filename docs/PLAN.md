# Monenete - Bags.fm Signal Aggregation Bot

## Core Idea

Deploy an on-chain signal aggregation bot that discovers Bags.fm's contract patterns empirically (not assumed), monitors token launches via Helius, and scores opportunities using smart money convergence. The edge is methodological: we validate every assumption during a zero-risk discovery phase before committing capital, and we have explicit fallback paths when data sources fail.

## Key Components

1. **Contract Discovery Engine** - Before any trading: scrape Bags.fm's UI to capture 20+ token addresses, trace their creation transactions backward to identify the deployer program(s). Validate pattern against 50+ tokens. If Bags.fm uses multiple factories, map all of them.

2. **Multi-Source Wallet Database with Quality Fallbacks** - Primary: Birdeye "top traders" leaderboard (free, Solana-native). Secondary: pump.fun historical leaderboard addresses. Tertiary: manual extraction from Twitter/Telegram calls that performed well. Explicit fallback: if <20 quality wallets after Week 1, extend observation to Week 2 before proceeding.

3. **Platform-Specific Log Signature Identification** - Bags.fm tokens will share common program IDs, instruction discriminators, or metadata patterns (e.g., URI domain in token metadata). Document the exact signature during discovery phase. Test against pump.fun/moonshot deploys to confirm differentiation.

4. **Liquidity-Aware Position Sizing** - Query pool liquidity before entry. Max position = 0.5% of pool liquidity OR 2% of capital, whichever is smaller. This caps slippage at ~2% for entries and ensures exits are feasible.

5. **Tiered Confidence Entry with Liquidity Checks** - Tier A: 2+ tracked wallets + pool liquidity >$20k → 2% position. Tier B: 1 wallet + liquidity >$10k → 1% position. Skip: liquidity <$5k regardless of signals.

## How It Works

### Phase 0A: Contract Discovery (Days 1-3, no capital risk)

1. Visit Bags.fm, collect 20+ token mint addresses from recent launches
2. For each token: query Helius for creation transaction, extract program ID and instruction pattern
3. Identify common factory contract(s) and instruction discriminator
4. Validate: check 50+ historical Bags.fm tokens share this pattern
5. Cross-check: confirm pump.fun tokens do NOT match this pattern (differentiation test)
6. Document: "Bags.fm deploy signature = Program X + Instruction discriminator Y + Metadata URI contains bags.fm"
7. **Gate**: If pattern cannot be reliably identified, pivot to pump.fun (better documented) or pause project

### Phase 0B: Wallet Database Bootstrap (Days 4-10)

1. Scrape Birdeye "top traders" page for Solana memecoins → extract 30 addresses
2. Query pump.fun historical data (if available) or scrape leaderboard → extract 20 addresses
3. Manual: find 10 Twitter/Telegram accounts known for early memecoin calls, trace their on-chain wallets
4. Deploy Helius webhook using discovered Bags.fm signature
5. Run passive observation: log all tracked wallet interactions with new Bags.fm tokens
6. After 7 days: calculate win rate per wallet (token hit 2x within 24h = win)
7. **Quality threshold**: Need ≥10 wallets with >40% win rate to proceed. If not met: extend observation 7 more days. If still not met after Day 17: reduce threshold to 30% OR pivot to pump.fun ecosystem.

### Phase 1: Paper Trading with Liquidity Logging (Days 11-24)

1. On each new Bags.fm token: log pool liquidity at T+0, T+5min, T+1hr
2. Simulate entries per tiered system, but add liquidity constraint
3. Track hypothetical P&L including 2% slippage assumption
4. **Success gate**: >35% win rate on Tier A+B combined signals, positive expected value after slippage

### Phase 2: Micro-Capital Live (Day 25+)

1. Initial capital allocation: $500 (minimum from GOAL.md range)
2. Position sizing: min(0.5% pool liquidity, 2% capital, $30)
3. Execute only Tier A and B signals that pass liquidity check
4. Exit: 50% at 2x, remainder at 30% trailing stop from peak
5. Hard stop: -50% per position
6. **Weekly review**: If win rate <30% for 2 weeks, halt live trading, return to observation mode

### Adaptation Loop

- Weekly: recalculate wallet win rates, demote <30%, promote new high performers
- Monthly: if overall strategy ROI <0% for month, reduce position sizes by 50% and tighten to Tier A only

## Risk Mitigations

### Bags.fm Token Factory Contract Address Unknown
The plan now starts with an explicit contract discovery phase (Phase 0A) before any monitoring begins. We empirically identify the factory pattern by tracing backward from known Bags.fm tokens, not by assuming we know the address. The discovery phase includes a differentiation test against pump.fun to confirm we can distinguish platforms. If we cannot identify a reliable pattern after 3 days of investigation, we have an explicit pivot path (use pump.fun instead, which has better-documented infrastructure).

### Smart Wallet Public Data Sources May Be Stale or Paywalled
Primary source is now Birdeye's top traders leaderboard, which is free, Solana-native, and actively maintained. Secondary source is pump.fun leaderboards (same ecosystem, similar signal quality). Tertiary is manual extraction from social calls. We avoid Arkham/Nansen as primary sources since they're often paywalled or Ethereum-focused. Explicit fallback: if quality threshold isn't met after extended observation, we either lower the bar (30% instead of 40% win rate) or pivot to pump.fun where more public data exists.

### Exit Strategy Math Doesn't Account for Liquidity
Position sizing is now liquidity-constrained: max position = min(0.5% of pool liquidity, 2% of capital). For a $10k liquidity pool, max position = $50. This ensures entry slippage <2% and exit at 2x is feasible. The tiered system now includes liquidity minimums: Tier A requires >$20k liquidity, Tier B requires >$10k. Pools <$5k are automatically skipped regardless of wallet signals. Paper trading phase explicitly logs liquidity at multiple timestamps to validate these thresholds empirically.

### Minimum Viable Wallet List Quality Threshold
Explicit gate added: need ≥10 wallets with >40% win rate after Week 1 observation. If not met: extend observation 7 more days. If still not met by Day 17: either reduce threshold to 30% (accepting lower edge) or pivot to pump.fun ecosystem where wallet signal quality may be better due to higher volume. This prevents the strategy from launching on poor data.

### How to Distinguish Bags.fm Deploys from Other Solana Token Deploys
Phase 0A explicitly documents the signature before proceeding. Expected signature components: (1) specific program ID for Bags.fm factory, (2) instruction discriminator in the deploy call, (3) token metadata URI containing "bags.fm" domain. We validate against 50+ known Bags.fm tokens AND confirm pump.fun/moonshot tokens don't match. This differentiation is a hard gate—we don't proceed to monitoring until we can reliably filter.
