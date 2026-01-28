# Claude Rules (Monenete)

## Core Principle: Honest Work

You're building a real trading system. Fake data leads to fake confidence leads to real losses.

## What Honesty Looks Like

**On data:**
- If an API returns nothing, that's a FAIL, not a placeholder
- If you can't get real quotes, document the blocker, don't synthesize
- All data in `reports/paper_trades_curator.json` is from real API calls

**On metrics:**
- Zero signals is SKIPPED, not PASS
- A failing experiment that's honest is better than a passing one that's fake
- Document negative results - they inform pivots

**On blockers:**
- If you need something you don't have, stop and say so
- "I need a Helius API key" is a valid stopping point
- NEED_HUMAN is not failure, it's honesty

## Context: You're Part of a Chain

Previous work exists in:
- `CURRENT_STATUS.md` - what's running, what we're waiting for
- `progress.txt` - what was done, what worked, what blocked
- `git log` - what was committed
- `reports/` - paper trade results

Read these. Learn from them. Don't repeat mistakes.

## When to Stop

Stop and signal NEED_HUMAN when:
- You need credentials you don't have
- You need real data you can't fetch
- Something should work but doesn't after 3 attempts
- The honest answer is "this requires human judgment"

## Working Rules

1. **Smallest diff** that solves the problem
2. **No speculative work** — don't over-engineer
3. **Verify before claiming progress** — run `./scripts/verify.sh` when changing code
4. **Fix root cause** — don't patch symptoms
5. **Autonomy > questions** — if uncertain, choose the simplest safe assumption and document it

## Commits

Commit when:
- `./scripts/verify.sh` passes (lint + typecheck)
- You completed meaningful work

Commit format:
- single line message, no body
- no Co-Authored-By
- never commit secrets

## Security

- Never commit `.env`, API keys, or keypairs
- No secrets in logs or error messages

## Current Strategy: Curator Selection

**The question:** Do curator wallets (slow traders with historical positive returns) pick tokens that outperform over 6 hours?

**Key files:**
- `src/live-curator-monitor.ts` - the live monitor
- `reports/paper_trades_curator.json` - collected data
- `reports/slow_traders.json` - the 12 curator wallets

**Decision criteria:**
- 50+ signals with 6h data
- 95% CI lower bound > 0% → proceed to real trading
- Mean > 0% but CI includes 0 → continue paper trading
- Mean ≤ 0% → pivot

---

## Operations Guide

### Check if monitor is running
```bash
tmux has-session -t curator 2>/dev/null && echo "Running" || echo "Not running"
```

### Quick status check
```bash
./scripts/curator-status.sh
```
Shows: signal count, pending trades, time to next 6h check, 1h performance stats.

### Start the monitor
```bash
./scripts/start-curator-monitor.sh
```
This creates a tmux session named `curator`. Requires env vars:
- `HELIUS_API_KEY` - for wallet activity detection via WebSocket
- `BIRDEYE_API_KEY` - for real-time token pricing

### View live monitor output
```bash
tmux attach -t curator
# Detach with: Ctrl+B, then D
```

### If monitor crashed
```bash
# Check why it stopped
tmux has-session -t curator 2>/dev/null || ./scripts/start-curator-monitor.sh
```
Data persists in `reports/paper_trades_curator.json` - monitor resumes tracking existing signals.

### When ready for analysis (50+ signals with 6h data)
```bash
./scripts/analyze-curator-results.sh
```

### Restart fresh (lose all data)
```bash
tmux kill-session -t curator 2>/dev/null
rm reports/paper_trades_curator.json
./scripts/start-curator-monitor.sh
```

---

## How the Monitor Works

1. **Detection**: Helius WebSocket watches 12 curator wallets for BAGS token buys
2. **Entry logging**: On buy detection, fetches current price from Birdeye
3. **Scheduled checks**: Sets timers for +1h, +6h, +24h price checks
4. **Return calculation**: Computes net return after 2.14% round-trip fees
5. **Persistence**: Writes to `reports/paper_trades_curator.json` after each update

### What "complete" means
A signal is complete when it has 6h data. The 24h check is optional context.

### Interpreting results
- **Fat-tail distribution expected**: Big winners (+50-150%) offset losers
- **Win rate less important than average**: A 40% win rate can be profitable if winners are big
- **Liquidity death**: Some tokens lose liquidity within hours - these show as large losses

---

## Key Learnings (Don't Repeat These Mistakes)

1. **Copy-trading doesn't work**: 2.4s latency kills the edge when traders exit in seconds
2. **Historical OHLCV not available**: Birdeye doesn't have minute candles for micro-caps, use forward paper trading
3. **2.14% round-trip fees**: 1% creator royalty per side, verified empirically
4. **Curator selection is different**: We don't copy exits, we use 6h time-based exit. Latency irrelevant.

---

## Quick Commands

```bash
# Operations
tmux has-session -t curator && echo "Running" || echo "Not running"
./scripts/curator-status.sh
./scripts/start-curator-monitor.sh
./scripts/analyze-curator-results.sh

# Development
./scripts/verify.sh          # lint + typecheck
git status && git log --oneline -5

# Debug
cat reports/paper_trades_curator.json | jq '.summary'
cat reports/paper_trades_curator.json | jq '.trades | length'
```
