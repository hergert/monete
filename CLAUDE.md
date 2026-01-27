# Claude Rules

## Rules

1. **Only commit when explicitly asked** — single line message, no body, no Co-Authored-By
2. **Verify before done** — run `just test` and `just dev-validate`
3. **Minimal changes** — smallest diff that solves the problem
4. **No speculative work** — only what the task demands
5. **Fix root cause** — don't patch symptoms
6. **Ask when uncertain** — don't interpret ambiguous requests broadly
7. **Test behavior, not implementation** — tests should verify what code does, not how it does it

## Living Documents

### docs/TODO.md — Project Journal

This is the **living document** for tracking progress across sessions. Update it when:
- Starting a new session (add context of where we left off)
- Making design decisions (log the reasoning)
- Completing work (move items, add learnings)
- Hitting blockers (document what's stuck and why)

Structure:
- **Current Focus**: What we're working on right now (update each session)
- **Backlog**: Prioritized list of upcoming work
- **Done**: Completed items with date
- **Journal**: Chronological log — **append new entries at bottom**

Journal entry format:
```
## YYYY-MM-DD

**Session: Brief title**

What happened. Decisions made. Learnings.

**Next:** What to do next session.

---
```

Keep the top sections lean. The journal grows — that's fine.

### docs/PLAN.md — Strategy Document

The authoritative plan. Update only when strategy changes, not for tactical updates.
