# Spec: Data Collection (Fixtures + Replay Dataset)

## Purpose
Provide the offline test data required for deterministic validation.

## Why This Matters
The Ralph loop must validate without network calls. All test data must be committed to the repo.

---

## Required Datasets

### 1. Bags Launch Fixtures (`data/fixtures/bags/`)

**Minimum**: 10 files

**What they are**: Raw Solana transaction JSON for confirmed Bags.fm token launches.

**How to identify a Bags launch**:
- Transaction contains Fee Share V1 program: `FEEhPbKVKnco9EXnaY3i4R5rQVUx91wgVfu8qokixywi`
- Transaction contains Meteora DBC program: `dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN`
- Contains a DBC `initialize_virtual_pool_with_spl_token` instruction

**File format**: `bags_<nn>.json` (e.g., `bags_01.json`, `bags_02.json`)

**Collection method**:
```bash
# Option A: Find tokens on bags.fm, get their launch signatures
# 1. Go to bags.fm, find a token
# 2. Find its creation transaction signature
# 3. Fetch and save:
just get-tx <signature> > data/fixtures/bags/bags_01.json

# Option B: Monitor Fee Share V1 program for recent activity
just get-sigs FEEhPbKVKnco9EXnaY3i4R5rQVUx91wgVfu8qokixywi 20
# Then fetch each transaction
```

**Validation**: Each file must be valid JSON with `result.transaction` present.

---

### 2. Non-Bags DBC Fixtures (`data/fixtures/non_bags_dbc/`)

**Minimum**: 20 files

**What they are**: Raw Solana transaction JSON for Meteora DBC launches that are NOT from Bags.fm.

**How to identify**:
- Transaction contains Meteora DBC program: `dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN`
- Transaction does NOT contain Fee Share V1 program
- Contains a DBC init instruction

**File format**: `non_bags_<nn>.json`

**Collection method**:
```bash
# Get recent DBC program activity
just get-sigs dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN 50

# For each signature, fetch and check if it lacks Fee Share V1
just get-tx <signature> | jq '.result.transaction.message.accountKeys | map(select(. == "FEEhPbKVKnco9EXnaY3i4R5rQVUx91wgVfu8qokixywi")) | length'
# If output is 0, it's a non-Bags DBC tx
```

**Validation**: Each file must be valid JSON, must NOT contain Fee Share V1 program.

---

### 3. Replay Events (`data/replay/events.jsonl`)

**Format**: JSON Lines (one JSON object per line)

**What it contains**: A sequence of events that exercise the full pipeline:
- Launch events (Bags and non-Bags)
- Wallet action events (buys, sells)
- Quote snapshots (for paper trading)

**Schema** (each line):
```json
{
  "type": "launch" | "wallet_action" | "quote",
  "timestamp": "2024-01-27T12:00:00Z",
  "signature": "...",
  "slot": 12345678,
  "instruction_index": 0,
  "data": { ... type-specific payload ... }
}
```

**Launch event data**:
```json
{
  "type": "launch",
  "data": {
    "mint": "...",
    "is_bags": true,
    "pool_address": "...",
    "creator": "..."
  }
}
```

**Wallet action event data**:
```json
{
  "type": "wallet_action",
  "data": {
    "wallet": "...",
    "mint": "...",
    "action": "buy" | "sell",
    "amount_in": 1000000,
    "amount_out": 500000
  }
}
```

**Quote event data**:
```json
{
  "type": "quote",
  "data": {
    "mint": "...",
    "in_amount_usd": 10.0,
    "expected_out": 1000000,
    "price_impact_bps": 50
  }
}
```

**Minimum requirements**:
- At least 10 Bags launch events
- At least 20 non-Bags DBC events (for false positive testing)
- At least 30 wallet action events
- At least 20 quote events

---

## Collection Scripts

The agent MAY implement collection scripts that use Helius API:

### `bun run collect:bags-fixtures`
- Fetches recent Fee Share V1 transactions
- Saves valid Bags launches to `data/fixtures/bags/`
- Requires `HELIUS_API_KEY` env var

### `bun run collect:non-bags-fixtures`
- Fetches recent DBC transactions without Fee Share V1
- Saves to `data/fixtures/non_bags_dbc/`
- Requires `HELIUS_API_KEY` env var

### `bun run build:replay-dataset`
- Reads fixtures
- Generates synthetic wallet actions and quotes
- Writes `data/replay/events.jsonl`
- Can run offline using existing fixtures

**Important**: Collection scripts are optional helpers. The fixtures themselves must be committed.

---

## Verification

```bash
# Check fixture counts
ls data/fixtures/bags/*.json | wc -l        # Must be >= 10
ls data/fixtures/non_bags_dbc/*.json | wc -l # Must be >= 20

# Check replay dataset
wc -l data/replay/events.jsonl              # Should have sufficient events

# Validate JSON
for f in data/fixtures/bags/*.json; do jq . "$f" > /dev/null && echo "OK: $f"; done
for f in data/fixtures/non_bags_dbc/*.json; do jq . "$f" > /dev/null && echo "OK: $f"; done
```

---

## Notes for Human

If the agent gets stuck collecting fixtures (network issues, rate limits), it should:
1. Write what it tried to `BLOCKERS.md`
2. Append `<promise>NEED_HUMAN</promise>` to progress.txt
3. Human can manually collect fixtures and commit them

The agent can then resume with the committed fixtures.
