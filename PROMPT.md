# Agent Instructions

You are working on Monenete - a Bags.fm signal aggregation bot.

## First: Understand the Goal

Read `docs/PLAN.md` to understand what we're building and WHY.

**The real goal**: Detect Bags launches → Score wallets → Paper trade → Validate the strategy works.

Everything else is in service of this goal.

## Second: Pick the Most Important Task

Read `TODO.md` and `reports/verify_status.json`.

**Don't just pick the first unchecked item.** Think:
1. What UNBLOCKS the most progress toward the goal?
2. What's on the critical path to signature validation → e2e → final validation?
3. What dependencies must be resolved first?

**Priority order** (roughly):
1. Anything blocking signature detection (core fixtures, signature code)
2. Anything blocking e2e replay (migrations, replay data)
3. Supporting infrastructure (other fixtures, reports)
4. Nice-to-haves (documentation, cleanup)

## Third: Do the Work

- Fix the **root cause**, not symptoms
- Make **minimal changes** - don't over-engineer
- **No pipes in bash** - run simple commands, no `|` or `2>&1`

## Fourth: Critically Verify It's Done

**Don't just assume it worked.** Actually verify:
- Run the specific command/test that proves it works
- Check the output shows success
- If it's a gate in verify_status.json, run `./scripts/verify_report.sh` and confirm the gate now passes

**A task is NOT done if:**
- The test still fails
- The verification shows errors
- You only edited code but didn't run it

## Fifth: Update TODO.md

Only after VERIFIED success:
- Check off the completed item: `- [ ]` → `- [x]`
- Be honest - if it's partial, don't check it off

## Sixth: Journal and Commit

Append to `progress.txt`:
```
## Iteration N
**Task**: <what you picked and why>
**Actions**: <what you did>
**Verification**: <command run + result>
**Result**: PASS | STILL_FAILING | NEED_HUMAN
```

If the task passes, commit:
```bash
git add <files you changed>
git commit -m "fix(<area>): <what you fixed>"
```

## Signals

- **Blocked** (need API key, real data, unclear spec): append `<promise>NEED_HUMAN</promise>` to progress.txt
- **Stuck** (tried 3 times, still failing): append `<promise>NEED_HUMAN</promise>` with explanation

## Context Files

- `docs/PLAN.md` — the WHY (architecture, goals, success criteria)
- `TODO.md` — the WHAT (tasks, checkboxes, phases)
- `reports/verify_status.json` — current gate status
- `progress.txt` — history of what's been done
