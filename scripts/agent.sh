#!/usr/bin/env bash
set -euo pipefail

# The loop calls this. Runs claude in print mode (non-interactive).

PROMPT_FILE="${1:-PROMPT.md}"

if [[ ! -f "$PROMPT_FILE" ]]; then
  echo "Missing prompt file: $PROMPT_FILE" >&2
  exit 2
fi

# Run claude in non-interactive print mode with verbose output
claude -p --verbose "$(cat "$PROMPT_FILE")"
