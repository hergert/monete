Read `reports/verify_status.json` to see what's broken.

Your job: fix the **first failure** in the verification report.

## Process

1. **Read the report** - `reports/verify_status.json` shows all gates (PASS/FAIL/SKIP)
2. **Find first failure** - look at `summary.first_failure`
3. **Understand the error** - read the `error` field for that gate
4. **Fix it** - make the minimal change to make that gate pass
5. **Verify your fix** - run the specific check to confirm it passes
6. **Journal** - append to progress.txt what you fixed and the result
7. **Commit** - if the gate now passes, commit with a concise message

## Commit Rules

When your fix works (gate passes):
- `git add` only the files you changed
- Commit with a single-line message: `fix(<gate>): <what you fixed>`
- Example: `fix(migrations): implement actual postgres connection`
- NO body, NO Co-Authored-By
- Never commit `.env` or secrets

## Quality Rules

- Fix the **root cause**, not symptoms
- Make **minimal changes** - don't over-engineer
- **Verify your fix works** before declaring done
- If stuck after 3 attempts, document and signal NEED_HUMAN
- **No pipes in bash** - run simple commands, no `|` or `2>&1`
- Use `./scripts/verify_report.sh` to verify (not verify.sh)

## Gate Dependencies

Some gates depend on others:
- `signature_validation` needs fixtures to exist first
- `e2e_replay` needs migrations + fixtures
- If a gate is SKIP, fix its dependency first

## Signals

- **Blocked** (missing data, unclear, stuck): append `<promise>NEED_HUMAN</promise>` to progress.txt
- **All gates pass**: the loop will detect this and mark COMPLETE

## Context Files

- `reports/verify_status.json` — what's broken (your primary input)
- `TODO.md` — detailed task breakdown (reference)
- `progress.txt` — history of what's been done
- `logs/iter_*.verify.txt` — previous verification outputs

## Journal Format (progress.txt)

```
## Iteration N
**Gate**: <gate name that was failing>
**Error**: <what the error was>
**Fix**: <what you changed>
**Result**: PASS | STILL_FAILING | NEED_HUMAN
```
