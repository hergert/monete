# Monenete — E2E Ralph Contract (Autonomous Build)

This file is the SOURCE OF TRUTH for "done".

## Goal
Deliver a complete, runnable E2E research bot stack that:
- ingests Bags-related events (via replay OR live),
- detects Bags launches,
- records canonical deduped events to Postgres,
- extracts wallet actions,
- produces wallet scores,
- runs a deterministic strategy decision pass,
- runs paper-trading simulation,
- emits a final validation report.

## Hard Requirements (Definition of Done)
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

## Offline / Determinism Rule
The completion gate MUST be satisfiable with:
- no API keys
- no network calls

Live integrations are allowed behind optional commands, but NOT required for PASS.

## Components Required (must exist as code modules)
A) Ingestion
B) Normalizer + Dedupe
C) Signature Decoder (Bags launch classifier)
D) Quote Interface (stub in replay; real impl optional)
E) Wallet Analytics
F) Strategy Engine
G) Paper Trading Simulator (no real signing)

## Data & DB
Must create tables (or equivalent) matching docs/PLAN.md intent:
- raw_events
- launches
- wallet_actions
- quotes
- positions
- wallet_scores
- trade_journal

Exact schemas can be simplified, but names & intent must be preserved.

## Signature Gate
- false_positive_rate <= 5% on replay negative set
- bags_should_match_n >= 10
- non_bags_should_not_match_n >= 20

## Replay Dataset Requirements
Repository must contain:
- `data/replay/events.jsonl` (committed)
- `data/fixtures/bags/*.json` (>=10)
- `data/fixtures/non_bags_dbc/*.json` (>=20)

## Completion Token
When and ONLY when all requirements are satisfied, append:
```
<promise>COMPLETE</promise>
```
to progress.txt
