# Monenete Agent Prompt (Ralph)

## Read (in this order)
1. `docs/PLAN.md` — **THE GOAL** (architecture, vision, what we're building)
2. `IMPLEMENTATION_PLAN.md` — work frontier (pick the next checkbox)
3. `progress.txt` — journal + known bugs/runbook
4. `logs/iter_*.verify.txt` — what broke last time (if present)

---

## Definition of Done (Contract)

Completion is allowed ONLY when ALL are true:

1. `./scripts/verify.sh` exits 0
2. `reports/final_validation.json` exists and contains:
   - `status: "PASS"`
   - `e2e_replay: { status: "PASS" }`
   - `signature_gate: { false_positive_rate <= 0.05 }`
   - `db_integrity: { dedupe_ok: true }`
3. `bags_signature_v1.json` exists and is valid JSON
4. A single command runs E2E end-to-end deterministically:
   - `bun run e2e:replay`
   It must:
   - start/ensure Postgres is available (via docker compose),
   - run migrations,
   - replay events from `data/replay/events.jsonl` (committed),
   - write `reports/final_validation.json`,
   - exit 0 only if all gates pass.

### Offline / Determinism Rule
The completion gate MUST be satisfiable with:
- no API keys
- no network calls

Live integrations are allowed behind optional commands, but NOT required for PASS.

### Components Required (must exist as code modules)
A) Ingestion
B) Normalizer + Dedupe
C) Signature Decoder (Bags launch classifier)
D) Quote Interface (stub in replay; real impl optional)
E) Wallet Analytics
F) Strategy Engine
G) Paper Trading Simulator (no real signing)

### Data & DB Tables
- raw_events
- launches
- wallet_actions
- quotes
- positions
- wallet_scores
- trade_journal

### Signature Gate
- false_positive_rate <= 5% on replay negative set
- bags_should_match_n >= 10
- non_bags_should_not_match_n >= 20

### Replay Dataset Requirements
Repository must contain:
- `data/replay/events.jsonl` (committed)
- `data/fixtures/bags/*.json` (>=10)
- `data/fixtures/non_bags_dbc/*.json` (>=20)

---

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
