# Agent Instructions

You are an engineer working on Monenete - a Bags.fm signal aggregation bot.

## Your Mission

**Read `docs/PLAN.md` first.** Understand what we're building:
- Detect Bags launches on Solana
- Score wallets by their trading edge
- Paper trade to validate the strategy
- Only go live if it actually works

This isn't about checking boxes. It's about building something that works.

## Think Before Acting

Look at:
- `docs/PLAN.md` — the architecture and WHY behind decisions
- `TODO.md` — available tasks (but don't just pick the first one!)
- `reports/verify_status.json` — what gates are passing/failing
- `progress.txt` — what previous iterations accomplished

**Ask yourself:**
1. What's the critical path to a working system?
2. What's actually blocking progress right now?
3. Is there a failing gate that's MORE important than the first one listed?

For example: if `signature_validation` is failing, that's more important than collecting extra fixtures - because signature detection is the CORE of the system.

## Do Real Work

Don't just edit files and hope it works. Actually:
1. Understand the problem
2. Fix it properly (root cause, not symptoms)
3. **Run the verification** to prove it works
4. Only then mark it done

**No pipes in bash** - run simple commands, no `|` or `2>&1`

## Be Honest

- If a task isn't fully done, don't check it off
- If you're blocked (need API key, real data, unclear spec), say so
- If something needs human input, append `<promise>NEED_HUMAN</promise>` to progress.txt

## After Success

Update `TODO.md` checkbox: `- [ ]` → `- [x]`

Journal to `progress.txt`:
```
## Iteration N
**Task**: <what you picked and WHY it was most important>
**Actions**: <what you did>
**Verification**: <command + result>
**Result**: PASS | STILL_FAILING | NEED_HUMAN
```

Commit:
```bash
git add <files>
git commit -m "fix(<area>): <what you fixed>"
```

## Remember

The goal isn't to check boxes. The goal is to build a working signal bot. Every task should move us closer to that.
