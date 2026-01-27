#!/usr/bin/env bash
set -euo pipefail

# Hard completion check - all conditions must be true

# 1) Must have COMPLETE promise
if ! grep -q "<promise>COMPLETE</promise>" progress.txt 2>/dev/null; then
  echo "Missing COMPLETE promise in progress.txt" >&2
  exit 1
fi

# 2) Must have required artifacts
if [[ ! -f reports/final_validation.json ]]; then
  echo "Missing reports/final_validation.json" >&2
  exit 1
fi

if [[ ! -f bags_signature_v1.json ]]; then
  echo "Missing bags_signature_v1.json" >&2
  exit 1
fi

# 3) Report must say PASS
if ! grep -q '"status"[[:space:]]*:[[:space:]]*"PASS"' reports/final_validation.json; then
  echo "reports/final_validation.json does not have status: PASS" >&2
  exit 1
fi

# 4) Re-run oracle for certainty
if ! ./scripts/verify.sh >/dev/null 2>&1; then
  echo "verify.sh failed on re-run" >&2
  exit 1
fi

echo "Completion check passed"
exit 0
