#!/usr/bin/env bash
set -euo pipefail

# The loop oracle - agent must make this pass

command -v bun >/dev/null 2>&1 || { echo "bun not found" >&2; exit 2; }
command -v docker >/dev/null 2>&1 || { echo "docker not found" >&2; exit 2; }

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

echo "=== All checks passed ==="
