# Monenete Agent Prompt (Ralph)

## Read (in this order)
1. `docs/PLAN.md` — **THE GOAL** (architecture, vision, what we're building)
2. `TODO.md` — work items (pick the next unchecked box)
3. `progress.txt` — journal + known bugs/runbook
4. `logs/iter_*.verify.txt` — what broke last time (if present)

---

## Definition of Done

Completion is allowed ONLY when ALL are true:

1. `./scripts/verify.sh` exits 0
2. `reports/final_validation.json` exists and contains:
   - `status: "PASS"`
   - `e2e_replay: { status: "PASS" }`
   - `signature_gate: { false_positive_rate <= 0.05 }`
   - `db_integrity: { dedupe_ok: true }`
3. `bags_signature_v1.json` exists and is valid JSON
4. A single command (`bun run e2e:replay`) runs E2E deterministically

### Offline / Determinism Rule
The completion gate MUST be satisfiable with no API keys and no network calls.

### Replay Dataset Requirements
- `data/replay/events.jsonl` (committed)
- `data/fixtures/bags/*.json` (>=10)
- `data/fixtures/non_bags_dbc/*.json` (>=20)

---

## Task
Pick the SINGLE most important unchecked item in `TODO.md` and do it.
Do not do large refactors.

## Validation (REQUIRED)
After changes, run:
```bash
./scripts/verify.sh
```

## Update rules
- Check off completed items in `TODO.md`
- Append 5–10 lines to `progress.txt` each iteration:
  - what you changed
  - verify result (pass/fail + first error)
  - next most important item

## Bugs / issues
Add to the "Known Issues" section in `progress.txt`.

## Git
If `./scripts/verify.sh` passes AND you completed a checkbox:
```bash
git add -A && git commit -m "<short, specific message>"
```

Do NOT push unless explicitly instructed.

## Stuck rule
If the same failure repeats 3 iterations OR no progress:
1. Write `BLOCKERS.md` (what you tried, what failed, smallest human action)
2. Append: `<promise>NEED_HUMAN</promise>` to `progress.txt`

## Completion
When Definition of Done is satisfied, append to `progress.txt`:
```
<promise>COMPLETE</promise>
```
