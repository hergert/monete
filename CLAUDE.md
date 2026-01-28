# Monenete - Claude Rules

## What Is This Project?

**Monenete** is a Solana trading bot for **Bags.fm** (a token launchpad like pump.fun).

**Current strategy:** We're testing if "curator wallets" (traders with historically good picks) select tokens that outperform over 6 hours. If yes → real trading. If no → pivot.

**Why this approach:** Copy-trading failed (2.4s latency kills the edge). This strategy ignores timing - we only care if their picks go up over hours, not seconds.

---

## Start Here

**Before doing anything, read these files in order:**

1. `CURRENT_STATUS.md` - What's running now, what we're waiting for, decision criteria
2. `progress.txt` - Full history, failed strategies, learnings, context

These files ARE the project memory. Without reading them, you'll repeat mistakes.

---

## Key Terms

- **Bags.fm** - Token launchpad on Solana. Tokens have 1% creator royalty per trade (2.14% round-trip).
- **Curator wallets** - 12 wallets we identified as "slow traders" with historical positive returns. Listed in `reports/slow_traders.json`.
- **BAGS tokens** - Tokens launched on Bags.fm platform. Detected via Fee Share program on-chain.
- **Signal** - When a curator wallet buys a BAGS token. We log entry price and check returns at +1h, +6h, +24h.
- **Complete signal** - A signal with 6h return data. This is our primary metric.

---

## Journaling (Required)

**Always journal to `progress.txt`:**
- Findings from data analysis
- Ideas and hypotheses
- What worked and what didn't
- Learnings and insights
- Decisions and their rationale

Journal as you go, not just at the end. Future sessions depend on this context.

Format: append with timestamp header like `## 2026-01-28 - [Topic]`

---

## Key Files

| File | Purpose |
|------|---------|
| `src/live-curator-monitor.ts` | The live monitor (runs in tmux) |
| `reports/paper_trades_curator.json` | Collected signal data |
| `reports/slow_traders.json` | The 12 curator wallet addresses |
| `CURRENT_STATUS.md` | Current state and decision criteria |
| `progress.txt` | Full project history and learnings |

---

## Operations

### Check status
```bash
./scripts/curator-status.sh
```

### Is monitor running?
```bash
tmux has-session -t curator 2>/dev/null && echo "Running" || echo "Not running"
```

### Start monitor
```bash
./scripts/start-curator-monitor.sh
```
Requires env vars: `HELIUS_API_KEY`, `BIRDEYE_API_KEY`

### View live output
```bash
tmux attach -t curator
# Detach: Ctrl+B, then D
```

### If monitor crashed
```bash
./scripts/start-curator-monitor.sh
```
Data persists - monitor resumes tracking existing signals.

### Run analysis (when 50+ signals have 6h data)
```bash
./scripts/analyze-curator-results.sh
```

### Debug
```bash
cat reports/paper_trades_curator.json | jq '.summary'
cat reports/paper_trades_curator.json | jq '.trades | length'
```

---

## How the Monitor Works

1. **Detection** - Helius WebSocket watches curator wallets for BAGS token buys
2. **Entry logging** - Fetches current price from Birdeye
3. **Scheduled checks** - Timers for +1h, +6h, +24h price checks
4. **Return calculation** - Net return after 2.14% fees
5. **Persistence** - Writes to `reports/paper_trades_curator.json`

**Interpreting results:**
- Fat-tail distribution expected: big winners (+50-150%) offset losers
- Win rate matters less than average return
- Some tokens lose liquidity → large losses (expected)

---

## Key Learnings (Don't Repeat These)

| What Failed | Why | Lesson |
|-------------|-----|--------|
| Copy-trading | 2.4s latency, traders exit in seconds | Can't win speed game |
| Historical backtest | Birdeye has no minute candles for micro-caps | Use forward paper trading |
| Fee velocity strategy | Lagging indicator, -0.97% avg return | Documented in progress.txt |

**What we know:**
- 2.14% round-trip fees (1% creator royalty per side) - verified empirically
- Curator selection works differently: we use 6h time-based exit, not copying their sells

---

## Working Rules

1. **Smallest diff** - Don't over-engineer
2. **No speculative work** - Only build what's needed now
3. **Verify before commit** - Run `./scripts/verify.sh`
4. **Fix root cause** - Don't patch symptoms
5. **Autonomy > questions** - If uncertain, choose simplest safe assumption and document it

---

## Commits

When:
- `./scripts/verify.sh` passes
- You completed meaningful work

Format:
- Single line message, no body
- No Co-Authored-By
- Never commit secrets

---

## When to Stop and Ask

Signal **NEED_HUMAN** (say it explicitly in your response) when:
- You need credentials you don't have
- You need real data you can't fetch
- Something fails after 3 attempts
- The honest answer requires human judgment

---

## Honesty Principle

You're building a real trading system. Fake data → fake confidence → real losses.

- If an API returns nothing, that's a FAIL, not a placeholder
- Zero signals is SKIPPED, not PASS
- Document negative results - they inform pivots
- A failing experiment that's honest beats a passing one that's fake

---

## Security

- Never commit `.env`, API keys, or keypairs
- No secrets in logs or error messages
