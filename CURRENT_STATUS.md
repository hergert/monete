# Current Status - Monenete Project

**Last Updated:** 2026-01-28 19:15 UTC
**Status:** LIVE PAPER TRADING - DATA COLLECTION PHASE

---

## What We're Doing

Testing if **curator wallets** (slow traders with historical positive returns) pick tokens that outperform over 6 hours.

**The question:** Do these wallets have selection skill?

**If yes:** Real trading with small positions
**If no:** Pivot to partner-fee business model

---

## Current Results (2026-01-28 19:15 UTC)

| Metric | Value |
|--------|-------|
| Signals collected | 14 |
| With 1h data | 10 |
| **Avg net return at 1h** | **+21.0%** |
| **Win rate at 1h** | **70%** |

**Distribution:**
- 4 big winners (+45% to +155%)
- 3 breakeven (~0%)
- 3 losers (-24% to -74%)

**Key insight:** Fat-tail distribution. Big winners drive the average.

---

## What We're Waiting For

1. **6h data** - First checks in ~4 hours
2. **More signals** - Target 50+ for statistical significance
3. **Curator diversity** - All signals from 1 curator so far (need 12)

---

## Observations So Far

1. **Edge appears real** - +21% avg at 1h is strong
2. **Liquidity death** - Some tokens lose liquidity within hours
3. **Outliers matter** - One +155% winner significantly impacts average
4. **Too early to conclude** - Need more data

---

## What's Running

A **tmux session** named `curator` is monitoring 12 curator wallets for BAGS token buys.

```bash
# Check if running
tmux has-session -t curator && echo "Running" || echo "Not running"

# Start if not running
./scripts/start-curator-monitor.sh

# Quick status
./scripts/curator-status.sh

# View live output
tmux attach -t curator
```

---

## What We're Waiting For

**Goal:** Accumulate 50+ curator buy signals with forward return data.

**Current progress:** Check with `./scripts/curator-status.sh`

**Timeline:** 1-2 weeks depending on curator activity.

**What happens automatically:**
1. Monitor detects curator BAGS token buy via Helius WebSocket
2. Logs entry price from Birdeye
3. Checks price at +1h, +6h, +24h
4. Calculates net returns (after 2.14% fees)
5. Updates `reports/paper_trades_curator.json`

---

## Decision Criteria

When we have **50+ signals with 6h data**, run:
```bash
./scripts/analyze-curator-results.sh
```

**If 95% CI lower bound > 0%:**
→ Proceed to real trading with small positions ($10-50)

**If mean > 0% but CI includes 0:**
→ Continue paper trading, need more data

**If mean ≤ 0%:**
→ Pivot to partner-fee business model

---

## Key Files

| File | Purpose |
|------|---------|
| `reports/paper_trades_curator.json` | Live paper trade data |
| `src/live-curator-monitor.ts` | The monitoring script |
| `progress.txt` | Full project history and learnings |
| `scripts/curator-status.sh` | Quick status check |
| `scripts/analyze-curator-results.sh` | Statistical analysis |

---

## The 12 Curator Wallets Being Monitored

These are "slow traders" with historical positive returns:

1. `FoG4TcYvxy3N...` - 21.0% historical P&L
2. `82zWEWdASgU9...` - 16.6% historical P&L
3. `ByAdav8AZd2q...` - 14.4% historical P&L
4. `D9J2kJeL9uWR...` - 14.1% historical P&L
5. `HZdd11Fothq8...` - 12.1% historical P&L
6. `38cxrSEXZJ2J...` - 10.5% historical P&L
7. `H9JGaqjUAn9Y...` - 7.8% historical P&L
8. `3i51cKbLbaKA...` - 7.1% historical P&L
9. `ByCrWXeynHEb...` - 6.4% historical P&L
10. `APkGv3PxJWbT...` - 4.1% historical P&L
11. `GDAtwgeoSik1...` - 0.1% historical P&L
12. `HydraXoSz7oE...` - 0.1% historical P&L

---

## Why This Strategy

**Previous strategies failed:**
- Copy trading: 2.4s latency kills edge
- Creator claims: Only 2 data points, inconclusive
- Fee velocity: Lagging indicator, -0.97% avg return

**This strategy is different:**
- We don't copy their exits, we use our own (6h time-based)
- Latency is irrelevant for 6h holds (2.4s = 0.01% of hold time)
- We test if curators have **selection skill**, not execution speed

**The question:** Do these wallets pick tokens that outperform over 6h?

---

## If Something Breaks

**Monitor crashed:**
```bash
./scripts/start-curator-monitor.sh
```

**Need to check data:**
```bash
cat reports/paper_trades_curator.json | jq '.summary'
```

**Env vars missing:**
```bash
# Make sure these are set before starting
export HELIUS_API_KEY=your_key
export BIRDEYE_API_KEY=your_key
```

**Want to restart fresh:**
```bash
tmux kill-session -t curator
rm reports/paper_trades_curator.json
./scripts/start-curator-monitor.sh
```

---

## Context for New Agents

Read these files in order:
1. This file (`CURRENT_STATUS.md`) - What's happening now
2. `progress.txt` - Full history and learnings (long but comprehensive)
3. `reports/paper_trades_curator.json` - Current data

The user's goal: Build a profitable Bags.fm trading bot. We've tested multiple strategies and are now validating "curator selection" - following wallets that historically picked good tokens.

---

## Next Actions (When Data is Ready)

1. Run `./scripts/analyze-curator-results.sh`
2. If positive edge confirmed:
   - Build execution module (Jupiter swap)
   - Add position sizing based on Kelly criterion
   - Start with $10-50 positions
3. If no edge:
   - Document findings
   - Pivot to partner-fee business model (earn fees by helping creators launch)
