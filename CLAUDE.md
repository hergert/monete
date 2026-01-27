# Claude Rules

## Rules

1. **Only commit when explicitly asked** — single line message, no body, no Co-Authored-By
2. **Verify before done** — run `just test` and `just dev-validate`
3. **Minimal changes** — smallest diff that solves the problem
4. **No speculative work** — only what the task demands
5. **Fix root cause** — don't patch symptoms
6. **Ask when uncertain** — don't interpret ambiguous requests broadly
7. **Test behavior, not implementation** — tests should verify what code does, not how it does it
