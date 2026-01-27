# Monenete Agent Prompt

## Study (in this order)

1. `specs/README.md` — Overview + component map
2. `specs/PROJECT_CONTRACT.md` — **Definition of Done** (source of truth)
3. `IMPLEMENTATION_PLAN.md` — Current work frontier
4. `progress.txt` — What happened in previous iterations
5. `logs/` — Latest iter logs if present

For each task, read the relevant numbered spec:
- `specs/00_data_collection.md` — Fixtures + replay data
- `specs/01_signature_decoder.md` — Bags classifier
- `specs/02_ingestion.md` — Event ingestion
- `specs/03_normalizer_dedupe.md` — Dedupe logic
- `specs/04_wallet_analytics.md` — Wallet scoring
- `specs/05_quote_service.md` — Quote interface
- `specs/06_strategy_engine.md` — Trade decisions
- `specs/07_paper_trading.md` — Position simulation
- `specs/08_e2e_runner.md` — E2E orchestrator

Also reference:
- `docs/PLAN.md` — Business context + architecture
- `docs/TODO.md` — Historical context

---

## Task

Pick the SINGLE most important unchecked item in `IMPLEMENTATION_PLAN.md` and do it.

**Rules**:
- Do not do large refactors
- Follow the spec for that component
- Small, verifiable steps only

---

## Validation (REQUIRED every iteration)

```bash
./scripts/verify.sh
```

This runs: lint → typecheck → test → validate:signature → e2e:replay

---

## Process Rules

After completing a task:

1. **Update IMPLEMENTATION_PLAN.md** — check off completed items
2. **Append to progress.txt**:
   ```
   ## Iteration N - [date]
   - Changed: [what you did]
   - Verify: [pass/fail + key error if fail]
   - Next: [what to do next]
   ```
3. **If verify passes**, commit:
   ```bash
   git add -A && git commit -m "<short message>"
   ```

---

## Autonomy

- You MAY implement missing functionality (but read the spec first)
- You MAY run `docker compose` commands to debug
- You MAY add tests (follow existing patterns)
- You MAY use Helius API to collect fixtures (but fixtures must be committed)

---

## Stuck Rule

If same failure repeats 3 times OR no progress (diffstat unchanged):

1. Write `BLOCKERS.md`:
   - What you tried
   - What failed
   - Smallest human action needed

2. Append to progress.txt:
   ```
   <promise>NEED_HUMAN</promise>
   ```

---

## Completion

Only when `specs/PROJECT_CONTRACT.md` Definition of Done is satisfied:

1. `./scripts/verify.sh` exits 0
2. `reports/final_validation.json` has `status: "PASS"`
3. `bags_signature_v1.json` exists
4. All fixtures committed

Then append to progress.txt:
```
<promise>COMPLETE</promise>
```
