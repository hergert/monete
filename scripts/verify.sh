#!/usr/bin/env bash
set -euo pipefail

# The loop oracle - agent must make this pass

command -v bun >/dev/null 2>&1 || { echo "bun not found" >&2; exit 2; }
command -v docker >/dev/null 2>&1 || { echo "docker not found" >&2; exit 2; }

require_file() {
  local path="$1"
  if [ ! -f "$path" ]; then
    echo "missing required file: $path" >&2
    exit 3
  fi
}

require_dir() {
  local path="$1"
  if [ ! -d "$path" ]; then
    echo "missing required directory: $path" >&2
    exit 3
  fi
}

# Start DB for integration/e2e checks (idempotent)
echo "=== Ensuring DB is up ==="
docker compose up -d db

# Wait for postgres to be ready
echo "=== Waiting for postgres ==="
for i in {1..30}; do
  if docker compose exec -T db pg_isready -U monenete >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

# Fast feedback first
echo "=== Running lint ==="
bun run lint

echo "=== Running typecheck ==="
bun run typecheck

echo "=== Running tests ==="
bun test

# Gates
echo "=== Running validate:signature ==="
bun run validate:signature

echo "=== Running e2e:replay ==="
bun run e2e:replay

echo "=== Checking data provenance ==="
require_file data/fixtures/manifest.json
require_file data/fixtures/provenance.md
require_dir data/fixtures/bags
require_dir data/fixtures/non_bags_dbc
require_dir data/fixtures/wallet_actions
require_dir data/fixtures/quotes
require_dir data/fixtures/holders
require_file reports/data_provenance.json

bags_count=$(find data/fixtures/bags -maxdepth 1 -name "*.json" | wc -l | tr -d ' ')
non_bags_count=$(find data/fixtures/non_bags_dbc -maxdepth 1 -name "*.json" | wc -l | tr -d ' ')
wallet_actions_count=$(find data/fixtures/wallet_actions -maxdepth 1 -name "*.json" | wc -l | tr -d ' ')
quotes_count=$(find data/fixtures/quotes -maxdepth 1 -name "*.json" | wc -l | tr -d ' ')
holders_count=$(find data/fixtures/holders -maxdepth 1 -name "*.json" | wc -l | tr -d ' ')

if [ "$bags_count" -lt 10 ]; then echo "bags fixtures < 10" >&2; exit 4; fi
if [ "$non_bags_count" -lt 20 ]; then echo "non-bags fixtures < 20" >&2; exit 4; fi
if [ "$wallet_actions_count" -lt 50 ]; then echo "wallet_actions fixtures < 50" >&2; exit 4; fi
if [ "$quotes_count" -lt 50 ]; then echo "quotes fixtures < 50" >&2; exit 4; fi
if [ "$holders_count" -lt 10 ]; then echo "holders fixtures < bags count" >&2; exit 4; fi

bun -e '
  const fs = require("fs");
  const data = JSON.parse(fs.readFileSync("reports/data_provenance.json", "utf8"));
  const requiredKeys = ["schema_version","generated_at","fixtures_real","sources","fixtures","checks"];
  for (const k of requiredKeys) {
    if (data[k] === undefined) {
      console.error("data_provenance missing key:", k);
      process.exit(5);
    }
  }
  if (data.schema_version !== 1) {
    console.error("data_provenance schema_version must be 1");
    process.exit(5);
  }
  if (data.fixtures_real !== true) {
    console.error("data_provenance fixtures_real must be true");
    process.exit(5);
  }
  if (!Array.isArray(data.sources) || data.sources.length === 0) {
    console.error("data_provenance sources must be non-empty array");
    process.exit(5);
  }
  if (data.checks?.no_synthetic !== true) {
    console.error("data_provenance checks.no_synthetic must be true");
    process.exit(5);
  }
'

echo "=== Checking final_validation data_provenance ==="
require_file reports/final_validation.json
bun -e '
  const fs = require("fs");
  const data = JSON.parse(fs.readFileSync("reports/final_validation.json", "utf8"));
  if (!data.data_provenance) {
    console.error("final_validation missing data_provenance");
    process.exit(6);
  }
  if (data.data_provenance.fixtures_real !== true) {
    console.error("final_validation.data_provenance.fixtures_real must be true");
    process.exit(6);
  }
'

echo "=== All checks passed ==="
