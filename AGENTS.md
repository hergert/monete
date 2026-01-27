# Monenete — Ralph E2E Harness

## Run

```bash
chmod +x loop.sh scripts/*.sh
export AGENT_CMD='claude'   # or your agent runner that reads stdin
./loop.sh
```

## What "done" means

See `specs/PROJECT_CONTRACT.md`.

The loop stops only when:
- `reports/final_validation.json` says `status: "PASS"`
- `bags_signature_v1.json` exists
- `progress.txt` contains `<promise>COMPLETE</promise>`
- `./scripts/verify.sh` passes

## Why replay

Live chain data is nondeterministic (RPC rate limits, changing state, network issues).

Replay makes E2E validation stable so the agent can finish autonomously.

The replay dataset (`data/replay/events.jsonl`) is committed to the repo and contains
all the events needed to exercise the full pipeline.

## Key files

| File | Purpose |
|------|---------|
| `PROMPT.md` | Agent instructions (constant input) |
| `specs/PROJECT_CONTRACT.md` | Source of truth for Definition of Done |
| `IMPLEMENTATION_PLAN.md` | Work frontier (agent checks off items) |
| `progress.txt` | Iteration journal + completion tokens |
| `scripts/verify.sh` | Oracle pipeline |
| `scripts/check_completion.sh` | Hard completion check |
| `loop.sh` | Main loop (60 iterations max) |
| `docker-compose.yml` | Postgres for persistence |

## Manual commands

```bash
# Start DB
docker compose up -d db

# Run verification manually
./scripts/verify.sh

# Check completion status
./scripts/check_completion.sh && echo "DONE" || echo "NOT DONE"

# Run single iteration (no loop)
cat PROMPT.md | claude

# Run E2E replay only
bun run e2e:replay
```

## Stop signals

- `<promise>COMPLETE</promise>` in progress.txt => loop exits 0 (success)
- `<promise>NEED_HUMAN</promise>` in progress.txt => loop exits 2 (stuck)
- 60 iterations without completion => loop exits 1 (timeout)

## Safety

- Never commit secrets (.env, API keys, keypairs)
- The replay dataset must be offline-only (no network calls)
- Review `progress.txt` and `BLOCKERS.md` if loop stops unexpectedly
