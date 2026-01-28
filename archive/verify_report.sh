#!/usr/bin/env bash
# Verification report generator - runs ALL checks, outputs JSON report
# POSIX-compatible (no associative arrays)

set -u

REPORT_FILE="${1:-reports/verify_status.json}"
mkdir -p "$(dirname "$REPORT_FILE")"

# Temp file for collecting gate results
GATES_JSON=$(mktemp)
echo "{" > "$GATES_JSON"

passed=0
failed=0
skipped=0
first_failure=""
first_error=""
gates_started=false

add_gate() {
  local name="$1"
  local status="$2"
  local error="${3:-}"

  # Add comma separator if not first
  if $gates_started; then
    echo "," >> "$GATES_JSON"
  fi
  gates_started=true

  # Escape error for JSON
  error_escaped=$(echo "$error" | tr '\n' ' ' | sed 's/"/\\"/g' | cut -c1-200)

  if [[ -n "$error" ]]; then
    echo -n "  \"$name\": { \"status\": \"$status\", \"error\": \"$error_escaped\" }" >> "$GATES_JSON"
  else
    echo -n "  \"$name\": { \"status\": \"$status\" }" >> "$GATES_JSON"
  fi
}

check_gate() {
  local name="$1"
  local cmd="$2"
  local skip_reason="${3:-}"

  if [[ -n "$skip_reason" ]]; then
    add_gate "$name" "SKIP" "$skip_reason"
    ((skipped++))
    echo "⏭️  $name: SKIP ($skip_reason)"
    return 0
  fi

  echo -n "🔍 $name: "
  local output
  if output=$(eval "$cmd" 2>&1); then
    add_gate "$name" "PASS" ""
    ((passed++))
    echo "PASS"
    return 0
  else
    add_gate "$name" "FAIL" "$output"
    ((failed++))
    echo "FAIL"
    echo "   → ${output:0:100}"
    if [[ -z "$first_failure" ]]; then
      first_failure="$name"
      first_error="${output:0:200}"
    fi
    return 1
  fi
}

require_count() {
  local dir="$1"
  local min="$2"
  local count
  count=$(find "$dir" -maxdepth 1 -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$count" -lt "$min" ]]; then
    echo "have $count, need $min"
    return 1
  fi
  return 0
}

echo "═══════════════════════════════════════════════════════"
echo "  VERIFICATION REPORT  $(date '+%Y-%m-%dT%H:%M:%S')"
echo "═══════════════════════════════════════════════════════"
echo ""

# Track gate statuses for dependencies
migrations_ok=false
fixtures_ok=false

# === Infrastructure ===
echo "## Infrastructure"
check_gate "docker_installed" "command -v docker >/dev/null"
check_gate "bun_installed" "command -v bun >/dev/null"
check_gate "docker_db_running" "docker compose ps db --format '{{.Status}}' 2>/dev/null | grep -q 'Up'"
check_gate "postgres_ready" "docker compose exec -T db pg_isready -U monenete >/dev/null 2>&1"
echo ""

# === Code Quality ===
echo "## Code Quality"
check_gate "typecheck" "bun run typecheck"
check_gate "lint" "bun run lint"
check_gate "tests" "bun test"
echo ""

# === Database ===
echo "## Database"
if check_gate "migrations" "bun run db:migrate"; then
  migrations_ok=true
fi
echo ""

# === Fixtures ===
echo "## Fixtures"
check_gate "fixtures_bags_dir" "test -d data/fixtures/bags"
check_gate "fixtures_non_bags_dir" "test -d data/fixtures/non_bags_dbc"

bags_ok=false
non_bags_ok=false

if check_gate "fixtures_bags_count" "require_count data/fixtures/bags 10"; then
  bags_ok=true
fi
if check_gate "fixtures_non_bags_count" "require_count data/fixtures/non_bags_dbc 20"; then
  non_bags_ok=true
fi

check_gate "fixtures_wallet_actions" "require_count data/fixtures/wallet_actions 50"
check_gate "fixtures_quotes" "require_count data/fixtures/quotes 50"
check_gate "fixtures_holders" "require_count data/fixtures/holders 10"
check_gate "fixtures_manifest" "test -f data/fixtures/manifest.json"
check_gate "fixtures_provenance" "test -f data/fixtures/provenance.md"

if $bags_ok && $non_bags_ok; then
  fixtures_ok=true
fi
echo ""

# === Signature Detection ===
echo "## Signature Detection"
if $fixtures_ok; then
  check_gate "signature_validation" "bun run validate:signature"
  check_gate "signature_artifact" "test -f bags_signature_v1.json"
else
  check_gate "signature_validation" "" "needs fixtures first"
  check_gate "signature_artifact" "" "needs signature_validation"
fi
echo ""

# === E2E Pipeline ===
echo "## E2E Pipeline"
if $migrations_ok && $fixtures_ok; then
  check_gate "e2e_replay" "bun run e2e:replay"
  check_gate "final_validation_exists" "test -f reports/final_validation.json"
  if [[ -f reports/final_validation.json ]]; then
    check_gate "final_validation_pass" "grep -q '\"status\".*\"PASS\"' reports/final_validation.json"
  else
    check_gate "final_validation_pass" "" "needs final_validation to exist"
  fi
else
  check_gate "e2e_replay" "" "needs migrations + fixtures"
  check_gate "final_validation_exists" "" "needs e2e_replay"
  check_gate "final_validation_pass" "" "needs final_validation"
fi
echo ""

# === Summary ===
echo "═══════════════════════════════════════════════════════"
echo "  SUMMARY: $passed passed, $failed failed, $skipped skipped"
if [[ -n "$first_failure" ]]; then
  echo "  FIRST FAILURE: $first_failure"
  echo "  ERROR: ${first_error:0:80}"
fi
echo "═══════════════════════════════════════════════════════"

# === Generate JSON Report ===
echo "" >> "$GATES_JSON"
echo "}" >> "$GATES_JSON"

{
  echo "{"
  echo "  \"timestamp\": \"$(date -u '+%Y-%m-%dT%H:%M:%SZ')\","
  echo "  \"summary\": {"
  echo "    \"passed\": $passed,"
  echo "    \"failed\": $failed,"
  echo "    \"skipped\": $skipped,"
  if [[ -n "$first_failure" ]]; then
    first_error_json=$(echo "$first_error" | tr '\n' ' ' | sed 's/"/\\"/g')
    echo "    \"first_failure\": \"$first_failure\","
    echo "    \"first_error\": \"$first_error_json\""
  else
    echo "    \"first_failure\": null,"
    echo "    \"first_error\": null"
  fi
  echo "  },"
  echo "  \"gates\": $(cat "$GATES_JSON")"
  echo "}"
} > "$REPORT_FILE"

rm -f "$GATES_JSON"

echo ""
echo "Report: $REPORT_FILE"

# Exit code: 0 if all pass, 1 if any fail
[[ $failed -eq 0 ]]
