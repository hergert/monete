#!/usr/bin/env bash
set -euo pipefail

# Goal-driven development loop
# Each iteration: run verify → agent reads context and picks most important task → verify again

MAX_ITERS="${MAX_ITERS:-60}"
SLEEP_SEC="${SLEEP_SEC:-1}"
PROMPT_FILE="${PROMPT_FILE:-PROMPT.md}"
REPORT_FILE="reports/verify_status.json"

# Handle Ctrl+C gracefully
trap 'echo ""; echo "Interrupted by user"; exit 130' INT

mkdir -p logs reports data/fixtures/bags data/fixtures/non_bags_dbc data/fixtures/wallet_actions data/fixtures/quotes data/fixtures/holders data/replay
touch progress.txt

for i in $(seq 1 "$MAX_ITERS"); do
  echo ""
  echo "═══════════════════════════════════════════════════════"
  echo "  ITERATION $i  $(date '+%Y-%m-%dT%H:%M:%S')"
  echo "═══════════════════════════════════════════════════════"
  echo "ITERATION $i started at $(date '+%Y-%m-%dT%H:%M:%S')" >> logs/run.log

  # Run verification BEFORE agent - so agent knows what's broken
  echo ""
  echo "▶ Running verification report..."
  ./scripts/verify_report.sh "$REPORT_FILE" 2>&1 | tee "logs/iter_${i}.verify.txt" || true

  # Check if already complete
  if [[ -f "$REPORT_FILE" ]] && grep -q '"failed": 0' "$REPORT_FILE" 2>/dev/null; then
    echo ""
    echo "════════════════════════════════════════"
    echo "  ✓ ALL GATES PASS - COMPLETE at iteration $i"
    echo "════════════════════════════════════════"
    # Append COMPLETE promise if not already there
    if ! grep -q "<promise>COMPLETE</promise>" progress.txt 2>/dev/null; then
      echo "" >> progress.txt
      echo "<promise>COMPLETE</promise>" >> progress.txt
    fi
    exit 0
  fi

  # Show status for human (agent decides for itself)
  if [[ -f "$REPORT_FILE" ]]; then
    failed_count=$(grep -o '"failed": [0-9]*' "$REPORT_FILE" | cut -d' ' -f2)
    echo ""
    echo "📊 Status: $failed_count gates failing"
  fi

  # Run agent - it reads PLAN.md, TODO.md, verify_status.json and decides what's most important
  echo ""
  echo "▶ Running agent..."
  claude -p "$(cat "$PROMPT_FILE")" \
    --output-format stream-json \
    --verbose \
    2>&1 | tee "logs/iter_${i}.json" | ITERATION="$i" python3 scripts/log_filter.py || true
  echo "✓ Agent finished."

  # Capture what changed
  git diff --stat > "logs/iter_${i}.diffstat.txt" 2>/dev/null || true

  # Human needed condition
  if grep -q "<promise>NEED_HUMAN</promise>" progress.txt 2>/dev/null; then
    echo ""
    echo "════════════════════════════════════════"
    echo "  ⚠ NEED_HUMAN signaled at iteration $i"
    echo "════════════════════════════════════════"
    cat "logs/iter_${i}.verify.txt" | grep -A1 "FIRST FAILURE" || true
    exit 2
  fi

  echo ""
  echo "→ Continuing to iteration $((i + 1))..."
  sleep "$SLEEP_SEC"
done

echo "MAX_ITERS reached without completion" >&2
exit 1
