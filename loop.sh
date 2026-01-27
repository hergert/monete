#!/usr/bin/env bash
set -euo pipefail

# Bounded Ralph loop with per-iteration logs

MAX_ITERS="${MAX_ITERS:-60}"
SLEEP_SEC="${SLEEP_SEC:-1}"
PROMPT_FILE="${PROMPT_FILE:-PROMPT.md}"

mkdir -p logs reports specs scripts data/fixtures/bags data/fixtures/non_bags_dbc data/replay
touch progress.txt

for i in $(seq 1 "$MAX_ITERS"); do
  echo "=== ITERATION $i $(date -Is) ===" | tee -a logs/run.log

  # Run agent (don't crash the loop if agent exits non-zero)
  ./scripts/agent.sh "$PROMPT_FILE" 2>&1 | tee "logs/iter_${i}.agent.txt" || true

  # Run oracle pipeline (capture, don't crash)
  ./scripts/verify.sh >"logs/iter_${i}.verify.txt" 2>&1 || true

  # Capture repo diffstat for "no progress" detection by the agent
  git diff --stat >"logs/iter_${i}.diffstat.txt" 2>/dev/null || true

  # Success condition
  if ./scripts/check_completion.sh 2>/dev/null; then
    echo "COMPLETE at iteration $i" | tee -a logs/run.log
    exit 0
  fi

  # Human needed condition
  if grep -q "<promise>NEED_HUMAN</promise>" progress.txt 2>/dev/null; then
    echo "NEED_HUMAN signaled at iteration $i" | tee -a logs/run.log
    exit 2
  fi

  sleep "$SLEEP_SEC"
done

echo "MAX_ITERS reached without completion" >&2
exit 1
