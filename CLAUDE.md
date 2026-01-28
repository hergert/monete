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

## Quick Commands

```bash
./scripts/verify.sh          # lint + typecheck
./scripts/curator-status.sh  # paper trade status
./scripts/start-curator-monitor.sh  # start monitor
./scripts/analyze-curator-results.sh  # statistical analysis
```

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
