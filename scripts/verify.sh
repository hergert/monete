#!/usr/bin/env bash
set -euo pipefail

# Basic verification for curator strategy

command -v bun >/dev/null 2>&1 || { echo "bun not found" >&2; exit 2; }

echo "=== Running lint ==="
bun run lint

echo "=== Running typecheck ==="
bun run typecheck

echo "=== All checks passed ==="
