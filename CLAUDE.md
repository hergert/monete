# Claude Rules (Monenete)

## Core Principle: Honest Work

You're building a real trading system. Fake data leads to fake confidence leads to real losses.

## What Honesty Looks Like

**On data:**
- If an API returns nothing, that's a FAIL, not a placeholder
- If you can't get real quotes, document the blocker, don't synthesize
- `fixtures_real: true` means every byte came from the chain

**On metrics:**
- `trades_simulated: 0` with `status: PASS` is a lie
- Zero work is SKIPPED, not PASS
- A failing gate that's honest is better than a passing gate that's fake

**On blockers:**
- If you need something you don't have, stop and say so
- "I need a Helius API key" is a valid stopping point
- NEED_HUMAN is not failure, it's honesty

## What Gaming Looks Like (Don't Do This)

- Creating empty/placeholder files to hit count requirements
- Writing validation that can't fail
- Marking PASS when the real answer is "not tested"
- Claiming `fixtures_real: true` for synthetic data

## Context: You're Part of a Chain

Previous work exists in:
- `progress.txt` - what was done, what worked, what blocked
- `git log` - what was committed
- `reports/` - validation results

Read these. Learn from them. Don't repeat mistakes.

## When to Stop

Stop and signal NEED_HUMAN when:
- You need credentials you don't have
- You need real data you can't fetch
- Something should work but doesn't after 3 attempts
- The honest answer is "this requires human judgment"

## Priority of Truth

1. `specs/PROJECT_CONTRACT.md` defines "done" (hard gates)
2. `IMPLEMENTATION_PLAN.md` defines "what to do next" (frontier)
3. `docs/PLAN.md` is architecture reference (rarely changed)
4. `progress.txt` carries context between sessions

## Working Rules

1. **Smallest diff** that advances the next unchecked plan item
2. **No speculative work** — if it's not in the contract or plan, don't build it
3. **Verify before claiming progress** — run `./scripts/verify.sh` when changing code paths
4. **Fix root cause** — don't patch symptoms
5. **Autonomy > questions** — if uncertain, choose the simplest safe assumption and document it

## Commits

Commits are allowed when BOTH are true:
- `./scripts/verify.sh` passes
- you completed at least one checkbox item in `IMPLEMENTATION_PLAN.md`

Commit format:
- single line message, no body
- no Co-Authored-By
- never commit secrets

## Security

- Never commit `.env`, API keys, or keypairs
- No secrets in logs or error messages
- Offline E2E must not require network calls

## Quick Commands

```bash
./scripts/verify.sh
./scripts/check_completion.sh
bun run validate:signature
bun run e2e:replay
```
