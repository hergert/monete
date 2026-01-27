# Phase 0A — Signature Lab (Ralph Experiment)

## Objective
Build a reproducible, testable signature classifier for "Bags launch" transactions.

## Definition: Bags Launch (v1)
A transaction matches iff:
- Fee Share V1 program is present:
  `FEEhPbKVKnco9EXnaY3i4R5rQVUx91wgVfu8qokixywi`
- Meteora DBC program is present:
  `dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN`
- AND the tx contains the DBC init instruction used for virtual pool initialization.
  Implementation may detect via:
  - instruction discriminator (preferred), OR
  - a stable instruction pattern validated on fixtures.

DBC alone must NOT match.

## Deliverables (hard requirements)
1. `bags_signature_v1.json` exists and is valid JSON.
2. `reports/signature_validation.json` exists and includes:
   - `bags_should_match_n`
   - `non_bags_should_not_match_n`
   - `false_positive_rate`
3. A CLI command:
   - `bun run validate:signature`
   - Must write `reports/signature_validation.json`
   - Must exit 0 only if gate passes, non-zero otherwise
4. Offline unit tests (deterministic):
   - `data/fixtures/bags/*.json` (positive fixtures)
   - `data/fixtures/non_bags_dbc/*.json` (negative fixtures)

## Gate
- `false_positive_rate` <= 0.05
- `bags_should_match_n` >= 10
- `non_bags_should_not_match_n` >= 20

## Offline Rule
The final gate MUST run without API keys or network calls.
Online collection scripts are allowed ONLY to generate fixtures that are then committed.

## Suggested UX (recommended)
- `bun run sig:check <path-to-tx-json>` prints "MATCH"/"NO_MATCH" + reason codes.
