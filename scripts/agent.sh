#!/usr/bin/env bash
set -euo pipefail

# The loop calls this. It pipes PROMPT.md into your agent command.

PROMPT_FILE="${1:-PROMPT.md}"
AGENT_CMD="${AGENT_CMD:-claude}"

if [[ ! -f "$PROMPT_FILE" ]]; then
  echo "Missing prompt file: $PROMPT_FILE" >&2
  exit 2
fi

# Agent must read the prompt from stdin
cat "$PROMPT_FILE" | bash -lc "$AGENT_CMD"
