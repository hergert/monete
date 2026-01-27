# Monenete Agent Prompt (Ralph)

## Read (in this order)
1. `specs/PROJECT_CONTRACT.md` — binding contract / Definition of Done
2. `IMPLEMENTATION_PLAN.md` — work frontier (pick the next checkbox)
3. `progress.txt` — what happened in previous iterations
4. `docs/ISSUES.md` — known bugs / runbook
5. `logs/iter_*.verify.txt` — what broke last time (if present)

Optional: `docs/PLAN.md` for architecture details.

## Task
Pick the SINGLE most important unchecked item in `IMPLEMENTATION_PLAN.md` and do it.
Do not do large refactors.

## Validation (REQUIRED)
After changes, run:
```bash
./scripts/verify.sh
```

## Update rules
- Check off completed items in `IMPLEMENTATION_PLAN.md` (this is how the loop "remembers").
- Append 5–10 lines to `progress.txt` each iteration:
  - what you changed
  - verify result (pass/fail + first error)
  - next most important item

## Bugs / issues
If you find a bug, add an entry to `docs/ISSUES.md` with:
- symptoms
- reproduction
- suspected cause
- next step

## Git
If `./scripts/verify.sh` passes AND you completed a plan checkbox:
```bash
git add -A && git commit -m "<short, specific message>"
```

Do NOT push unless explicitly instructed.

## Stuck rule
If the same failure repeats 3 iterations in a row OR no progress (diffstat unchanged):
1. Write `BLOCKERS.md` (what you tried, what failed, smallest human action)
2. Append: `<promise>NEED_HUMAN</promise>` to `progress.txt`

## Completion
Only when `specs/PROJECT_CONTRACT.md` DoD is satisfied:
append `<promise>COMPLETE</promise>` to `progress.txt`
