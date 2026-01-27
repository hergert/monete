# Monenete — Ralph E2E Harness

## Run
```bash
chmod +x loop.sh scripts/*.sh
export AGENT_CMD='claude'   # agent runner that reads stdin
./loop.sh
```

## Source of truth
- **"Done"** is defined ONLY by: `specs/PROJECT_CONTRACT.md`
- **"What to do next"** lives in: `IMPLEMENTATION_PLAN.md`

## What the loop checks
The loop stops only when:
- `reports/final_validation.json` says `status: "PASS"`
- `bags_signature_v1.json` exists
- `progress.txt` contains `<promise>COMPLETE</promise>`
- `./scripts/verify.sh` passes

## Why replay
Live chain data is nondeterministic.
Replay makes E2E validation stable so the agent can finish autonomously.

## Where to put bugs
Use `docs/ISSUES.md` (symptoms + repro + next steps).

## Manual commands
```bash
docker compose up -d db
./scripts/verify.sh
./scripts/check_completion.sh && echo "DONE" || echo "NOT DONE"
cat PROMPT.md | claude
bun run e2e:replay
```
