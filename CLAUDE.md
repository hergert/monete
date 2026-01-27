# Claude Rules

## Rules

1. **Only commit when explicitly asked** — single line message, no body, no Co-Authored-By
2. **Verify before done** — run `just test` and `just dev-validate`
3. **Minimal changes** — smallest diff that solves the problem
4. **No speculative work** — only what the task demands
5. **Fix root cause** — don't patch symptoms
6. **Ask when uncertain** — don't interpret ambiguous requests broadly
7. **Test behavior, not implementation** — tests should verify what code does, not how it does it

## Security

- Private keys NEVER in code or git
- Use environment variables for all secrets
- `.env` in `.gitignore`
- Separate wallet for trading (not personal)
- Transaction simulation before real executes
- No secrets in logs or error messages

## Quick Commands

```bash
just                      # list all commands
just test-helius          # test Helius RPC
just test-db              # test Postgres
just get-tx <sig>         # get transaction
just save-tx <sig> <name> # save tx to data/
just slot                 # current Solana slot
just env-check            # verify env vars set
```

## Living Documents

### docs/TODO.md — Work Tracker + Journal

Update when:
- Starting a session (where we left off)
- Making decisions (log reasoning)
- Completing work (move items, add learnings)
- Hitting blockers (document what's stuck)

Structure:
- **Current Focus**: What we're doing now
- **Backlog**: Tasks by phase
- **Done**: Completed with dates
- **Journal**: Append entries at bottom

### docs/PLAN.md — Strategy + Architecture

The authoritative plan. Update only when strategy changes.
