#!/usr/bin/env bash
set -euo pipefail

# Optional Claude Code stop hook for "internal Ralph"
# If COMPLETE promise is present, stop. Otherwise continue.

if grep -q "<promise>COMPLETE</promise>" progress.txt 2>/dev/null; then
  exit 0
fi

echo "Not complete. Read progress.txt + logs, run ./scripts/verify.sh, update IMPLEMENTATION_PLAN.md, continue." >&2
exit 2
