# Monenete — Ralph E2E Harness

## Run
```bash
chmod +x loop.sh scripts/*.sh
export AGENT_CMD='claude'
./loop.sh
```

## Source of truth
- **Goal/Architecture**: `docs/PLAN.md`
- **Work items**: `TODO.md`
- **Done definition**: `PROMPT.md`

## Loop stops when
- `reports/final_validation.json` has `status: "PASS"`
- `bags_signature_v1.json` exists
- `progress.txt` contains `<promise>COMPLETE</promise>`
- `./scripts/verify.sh` passes

## Why replay
Live chain data is nondeterministic. Replay makes E2E validation stable.

## Where to put bugs
Add to "Known Issues" section in `progress.txt`.

## Manual commands
```bash
docker compose up -d db
./scripts/verify.sh
./scripts/check_completion.sh && echo "DONE" || echo "NOT DONE"
cat PROMPT.md | claude
bun run e2e:replay
```
