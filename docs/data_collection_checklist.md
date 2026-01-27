# Data Collection Checklist (Real Fixtures Only)

Purpose: collect real on-chain data for replay, validation, and evaluation. No synthetic or stub data is allowed.

## Required Artifacts
- `data/fixtures/bags/*.json` (>= 10) Bags launch txs (must include Fee Share V1)
- `data/fixtures/non_bags_dbc/*.json` (>= 20) DBC launches without Fee Share V1
- `data/fixtures/wallet_actions/*.json` (>= 50) real buy/sell events
- `data/fixtures/quotes/*.json` (>= 50) real Jupiter quote snapshots
- `data/fixtures/holders/*.json` (>= bags count) real holder snapshots
- `data/fixtures/manifest.json` (metadata for every fixture)
- `data/fixtures/provenance.md` (how data was collected)

## Collection Steps (Minimal)
1) Bags launch fixtures
   - Find Bags launches (Fee Share V1 program present).
   - Fetch full transaction JSON (include `transaction` and `meta`).
   - Save as `data/fixtures/bags/bags_XX.json`.

2) Non-Bags DBC fixtures
   - Find DBC launches without Fee Share V1.
   - Fetch full transaction JSON.
   - Save as `data/fixtures/non_bags_dbc/non_bags_XX.json`.

3) Wallet actions
   - For Bags mints, collect real buy/sell txs from wallets.
   - Each file must include: `wallet`, `mint`, `action`, `slot`, `block_time`, `signature`.
   - Save as `data/fixtures/wallet_actions/action_XX.json`.

4) Quote snapshots
   - Capture real Jupiter quotes near each wallet action timestamp.
   - Required fields: `mint`, `in_amount`, `slippage_bps`, `expected_out`, `price_impact_bps`, `ts`.
   - Save as `data/fixtures/quotes/quote_XX.json`.

5) Holder snapshots
   - For each Bags mint, capture a holder snapshot at or near launch time.
   - Required fields: `mint`, `largest_accounts`, `excluded_accounts`, `ts`.
   - Save as `data/fixtures/holders/holders_<mint>.json`.

## Manifest + Provenance
6) Update `data/fixtures/manifest.json`
   - One entry per fixture with: `type`, `filename`, `signature`, `slot`, `block_time`, `mint` (if applicable).

7) Update `data/fixtures/provenance.md`
   - Record provider, method, timestamps, and any filters used.
   - Note whether data was collected via script or manual steps.

## Validation Checklist
- All fixture files are valid JSON.
- Bags fixtures include Fee Share V1 program.
- Non-Bags fixtures do not include Fee Share V1.
- Every replay event maps to a real signature from fixtures.
- `reports/data_provenance.json` matches `docs/data_provenance_schema.json`.
