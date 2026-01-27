# Claude Rules (Monenete)

## Priority of truth
1. `specs/PROJECT_CONTRACT.md` defines "done" (hard gates).
2. `IMPLEMENTATION_PLAN.md` defines "what to do next" (frontier).
3. `docs/TODO.md` is human backlog + journal (context, not authority).
4. `docs/PLAN.md` is architecture reference (rarely changed).

## Working rules
1. **Smallest diff** that advances the next unchecked plan item.
2. **No speculative work** — if it's not in the contract or plan, don't build it.
3. **Verify before claiming progress** — run `./scripts/verify.sh` when changing code paths.
4. **Fix root cause** — don't patch symptoms.
5. **Autonomy > questions** — if uncertain, choose the simplest safe assumption and document it in `docs/ISSUES.md` or `docs/TODO.md`.

## Ralph harness exception (commits)
Commits are allowed when BOTH are true:
- `./scripts/verify.sh` passes
- you completed at least one checkbox item in `IMPLEMENTATION_PLAN.md`

Commit format:
- single line message, no body
- no Co-Authored-By
- never commit secrets

## Security
- Never commit `.env`, API keys, or keypairs.
- No secrets in logs or error messages.
- Offline E2E must not require network calls.

## Quick commands
```bash
./scripts/verify.sh
./scripts/check_completion.sh
bun run validate:signature
bun run e2e:replay
```
